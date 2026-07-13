const MAX_LENGTHS = {
  fullName: 120,
  email: 254,
  serviceRequested: 120,
  psychotherapyFormat: 120,
  insurancePreference: 160,
  reason: 4000,
  website: 200
};

function normalize(value, maxLength) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);
}

function getRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = getRequestBody(req);

    const website = normalize(body.website, MAX_LENGTHS.website);

    // Quietly accept honeypot submissions so bots do not learn the filter.
    if (website) {
      return res.status(200).json({ ok: true });
    }

    const inquiryType = normalize(body.inquiryType, 40).toLowerCase();
    const requestedService = normalize(
      body.serviceRequested || body.service || "",
      MAX_LENGTHS.serviceRequested
    );
    const psychotherapyFormat = normalize(
      body.psychotherapyFormat || "Telehealth psychotherapy",
      MAX_LENGTHS.psychotherapyFormat
    );
    const senderName = normalize(
      body.fullName || body.name || "",
      MAX_LENGTHS.fullName
    );
    const senderEmail = normalize(body.email, MAX_LENGTHS.email).toLowerCase();
    const paymentPreference = normalize(
      body.insurancePreference || body.insurance || body.insurancePayment || "",
      MAX_LENGTHS.insurancePreference
    );
    const inquiryReason = normalize(
      body.reason || body.message || "",
      MAX_LENGTHS.reason
    );

    const isWaitlistInquiry =
      inquiryType === "waitlist" || /waitlist/i.test(requestedService);

    if (!senderName || !senderEmail || !requestedService || !inquiryReason) {
      return res.status(400).json({
        error: "Please complete all required fields."
      });
    }

    if (!isValidEmail(senderEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address."
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail =
      process.env.CONTACT_TO_EMAIL || "info@stonebridgepsychgroup.com";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL ||
      "Stonebridge Website <onboarding@resend.dev>";

    if (!resendApiKey) {
      console.error("Contact API configuration error: RESEND_API_KEY is missing.");
      return res.status(500).json({
        error:
          "The form could not be sent. Please email info@stonebridgepsychgroup.com or call (773) 417-1688."
      });
    }

    const inquiryLabel = isWaitlistInquiry
      ? "waitlist inquiry"
      : "consultation request";

    const emailBody = `New ${inquiryLabel} from the Stonebridge website.

Inquiry type:
${inquiryLabel}

Service requested:
${requestedService}

Format:
${psychotherapyFormat || "Not specified"}

Full name:
${senderName}

Email:
${senderEmail}

Insurance / payment preference:
${paymentPreference || "Not provided"}

Brief note:
${inquiryReason}

---
This message was submitted through the Stonebridge Psychological Group website.`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: senderEmail,
        subject: isWaitlistInquiry
          ? `Stonebridge waitlist inquiry — ${requestedService}`
          : `Stonebridge consultation request — ${requestedService}`,
        text: emailBody
      })
    });

    const resendResult = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error("Resend delivery error:", {
        status: resendResponse.status,
        name: resendResult?.name,
        message: resendResult?.message
      });

      return res.status(502).json({
        error:
          "The form could not be sent. Please email info@stonebridgepsychgroup.com or call (773) 417-1688."
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error?.message || error);

    return res.status(500).json({
      error:
        "The form could not be sent. Please email info@stonebridgepsychgroup.com or call (773) 417-1688."
    });
  }
}
