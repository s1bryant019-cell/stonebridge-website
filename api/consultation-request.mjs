// Vercel server-side handler. Do not log request bodies, headers, or provider responses.
// The configured delivery gateway must be approved for Stonebridge's healthcare use.
const LIMIT = 8192;
const HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff"
};

function result(status, delivered) {
  return new Response(JSON.stringify({ delivered }), { status, headers: HEADERS });
}

function optionalString(value, max) {
  return typeof value === "string" && value.length <= max ? value.trim() : null;
}

function validClickId(value) {
  return value === undefined || (
    typeof value === "string" &&
    value.length <= 500 &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

async function readSmallBody(request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (declaredLength > LIMIT) return null;

  const reader = request.body && request.body.getReader();
  if (!reader) return null;
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > LIMIT) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks.map(chunk => Buffer.from(chunk))).toString("utf8"));
  } catch {
    return null;
  }
}

function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  // Honeypot: a nonempty value indicates automated form completion.
  if (body.website !== "") return null;

  const fullName = optionalString(body.fullName, 120);
  const email = optionalString(body.email, 254);
  const phone = optionalString(body.phone, 50);
  const preferredContact = optionalString(body.preferredContact, 20);
  const preferredClinician = optionalString(body.preferredClinician, 120);
  const availability = optionalString(body.availability, 300);
  const service = optionalString(body.service ?? "", 32);
  if (!["", "teen-group"].includes(service)) return null;
  if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if ([phone, preferredContact, preferredClinician, availability].some(x => x === null)) return null;
  if (preferredContact && !["Email", "Phone"].includes(preferredContact)) return null;
  if (![body.gclid, body.gbraid, body.wbraid].every(validClickId)) return null;
  if ([fullName, email, phone, preferredClinician, availability].some(x => /[\u0000-\u001f\u007f]/.test(x))) return null;

  return {
    fullName, email, phone, preferredContact, preferredClinician, availability,
    ...(service ? { service } : {}),
    attribution: {
      gclid: body.gclid || "",
      gbraid: body.gbraid || "",
      wbraid: body.wbraid || ""
    }
  };
}

export async function POST(request) {
  // Same-origin requests only. No cross-origin advertising or analytics receivers.
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return result(403, false);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return result(415, false);
  }

  const fields = validate(await readSmallBody(request));
  if (!fields) return result(422, false);

  // Restore the practice's already-configured Resend notification integration.
  // Send only contact/scheduling fields. Never send advertising identifiers,
  // URL parameters, clinical screening answers, or arbitrary narrative.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) return result(503, false);

  const lines = [
    "New consultation request through the Stonebridge website.",
    "",
    "Name: " + fields.fullName,
    "Email: " + fields.email
  ];
  if (fields.phone) lines.push("Phone: " + fields.phone);
  if (fields.preferredContact) lines.push("Preferred contact: " + fields.preferredContact);
  if (fields.preferredClinician) lines.push("Clinician preference: " + fields.preferredClinician);
  if (fields.availability) lines.push("Best times to reach: " + fields.availability);
  if (fields.service === "teen-group") lines.push("Inquiry: The Lobby");
  lines.push("", "This notification is for administrative consultation follow-up only.");

  try {
    const upstream = await fetch("https://api.resend.com/emails", {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "New Stonebridge consultation request",
        reply_to: fields.email,
        text: lines.join("\n")
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!upstream.ok) return result(502, false);
    const receipt = await upstream.json();
    // A Resend id confirms provider acceptance, not inbox delivery.
    if (typeof receipt?.id === "string" && receipt.id.length > 0) {
      return new Response(JSON.stringify({ submitted: true }), { status: 200, headers: HEADERS });
    }
    return result(502, false);
  } catch {
    // Never expose email contents, credentials, or provider responses to logs.
    return result(502, false);
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
}
