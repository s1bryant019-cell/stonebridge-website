export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      website,
      service,
      serviceRequested,
      psychotherapyFormat,
      fullName,
      name,
      patientName,
      proposedPatientName,
      email,
      insurance,
      insurancePayment,
      reason,
      message
    } = req.body || {};

    // Honeypot spam protection
    if (website) {
      return res.status(200).json({ ok: true });
    }

    const senderName = fullName || name || "";
    const senderEmail = email || "";
    const requestedService = serviceRequested || service || "psychotherapy";
    const patient = patientName || proposedPatientName || "";
    const paymentInfo = insurance || insurancePayment || "";
    const inquiryReason = reason || message || "";

    const isWaitlistInquiry = String(requestedService)
      .toLowerCase()
      .includes("waitlist");

    if (!senderName || !senderEmail || !inquiryReason) {
      return res.status(400).json({
        error: "Missing required fields."
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || "info@stonebridgepsychgroup.com";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL ||
      "Stonebridge Website <onboarding@resend.dev>";

    if (!resendApiKey) {
      return res.status(500).json({
        error: "Missing RESEND_API_KEY environment variable."
      });
    }

    const emailBody = `
${isWaitlistInquiry ? "New waitlist inquiry" : "New consultation request"} from the Stonebridge website.

Service requested:
${requestedService}

Format:
${psychotherapyFormat || "Not specified"}

Full name:
${senderName}

Proposed patient name:
${patient || "Not provided"}

Email:
${senderEmail}

Insurance / payment information:
${paymentInfo || "Not provided"}

Reason for seeking psychotherapy:
${inquiryReason}

---
This message was submitted through the Stonebridge Psychological Group website.
`;

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
          ? "Stonebridge waitlist inquiry"
          : "Stonebridge consultation request",
        text: emailBody
      })
    });

    const resendResult = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error("Resend error:", resendResult);
      return res.status(500).json({
        error:
          resendResult?.message ||
          "The form could not be sent. Please email info@stonebridgepsychgroup.com or call (773) 417-1688."
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);

    return res.status(500).json({
      error:
        "The form could not be sent. Please email info@stonebridgepsychgroup.com or call (773) 417-1688."
    });
  }
}
