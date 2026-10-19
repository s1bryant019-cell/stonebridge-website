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
    fullName, email, phone, preferredContact, preferredClinician, availability, service,
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

  const gatewayUrl = process.env.STONEBRIDGE_CONSULTATION_DELIVERY_URL;
  const gatewayToken = process.env.STONEBRIDGE_CONSULTATION_DELIVERY_TOKEN;
  if (!gatewayUrl || !gatewayToken) return result(503, false);

  let parsedUrl;
  try {
    parsedUrl = new URL(gatewayUrl);
    if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
      return result(503, false);
    }
  } catch {
    return result(503, false);
  }

  try {
    // The approved gateway must return HTTP 2xx and {"delivered":true} ONLY
    // after confirming receipt into Stonebridge's secure intake destination.
    // A queued/accepted-only acknowledgment must NOT be translated to delivered.
    const upstream = await fetch(parsedUrl.toString(), {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: {
        "Authorization": "Bearer " + gatewayToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ type: "consultation-request", ...fields }),
      signal: AbortSignal.timeout(10000)
    });
    if (!upstream.ok) return result(502, false);
    const receipt = await upstream.json();
    if (receipt && receipt.delivered === true) return result(200, true);
    return result(502, false);
  } catch {
    // Never expose gateway errors, email addresses, or sensitive details to clients/logs.
    return result(502, false);
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
}
