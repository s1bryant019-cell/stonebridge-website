const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return String(value || "Not provided")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const {
      service_requested,
      secondary_detail,
      full_name,
      patient_name,
      email,
      insurance_info,
      reason
    } = body;

    if (!full_name || !email || !reason) {
      return res.status(400).json({
        error: "Please complete the required fields."
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address."
      });
    }

    if (service_requested !== "psychotherapy") {
      return res.status(400).json({
        error:
          "Stonebridge is currently accepting psychotherapy inquiries only. Psychological assessment and forensic services are not currently available for new requests."
      });
    }

    const toEmail =
      process.env.CONTACT_TO_EMAIL || "info@stonebridgepsychgroup.com";

    const fromEmail =
      process.env.CONTACT_FROM_EMAIL ||
      "Stonebridge Website <website@stonebridgepsychgroup.com>";

    const safeFullName = escapeHtml(full_name);
    const safeEmail = escapeHtml(email);
    const safeService = escapeHtml(service_requested);
    const safeDetail = escapeHtml(secondary_detail);
    const safePatientName = escapeHtml(patient_name);
    const safeInsurance = escapeHtml(insurance_info);
    const safeReason = escapeHtml(reason).replace(/\n/g, "<br>");

    const subject = `Stonebridge Consultation Request — ${safeFullName}`;

    const html = `
      <h2>New Stonebridge Consultation Request</h2>

      <p><strong>Service Requested:</strong> ${safeService}</p>
      <p><strong>Service Detail:</strong> ${safeDetail}</p>
      <p><strong>Full Name:</strong> ${safeFullName}</p>
      <p><strong>Proposed Patient Name:</strong> ${safePatientName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Insurance / Payment:</strong> ${safeInsurance}</p>

      <hr />

      <p><strong>Reason for Inquiry:</strong></p>
      <p>${safeReason}</p>

      <hr />

      <p style="font-size: 13px; color: #666;">
        This message was submitted through the Stonebridge Psychological Group website consultation form.
        This form is intended for initial, non-emergency inquiries only.
      </p>
    `;

    const text = `
New Stonebridge Consultation Request

Service Requested: ${service_requested || "Not provided"}
Service Detail: ${secondary_detail || "Not provided"}
Full Name: ${full_name || "Not provided"}
Proposed Patient Name: ${patient_name || "Not provided"}
Email: ${email || "Not provided"}
Insurance / Payment: ${insurance_info || "Not provided"}

Reason for Inquiry:
${reason || "Not provided"}

This message was submitted through the Stonebridge Psychological Group website consultation form.
This form is intended for initial, non-emergency inquiries only.
    `;

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject,
      html,
      text
    });

    return res.status(200).json({
      success: true,
      message: "Consultation request sent."
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      error:
        "The form could not be sent. Please email info@stonebridgepsychgroup.com directly."
    });
  }
};
