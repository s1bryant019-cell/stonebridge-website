const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      service_requested,
      secondary_detail,
      full_name,
      patient_name,
      email,
      insurance_info,
      reason
    } = req.body || {};

    if (!full_name || !email || !reason) {
      return res.status(400).json({
        error: "Missing required fields."
      });
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || "info@stonebridgepsychgroup.com";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL ||
      "Stonebridge Website <website@stonebridgepsychgroup.com>";

    const safe = (value) =>
      String(value || "Not provided")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const subject = `Stonebridge Consultation Request — ${safe(full_name)}`;

    const html = `
      <h2>New Stonebridge Consultation Request</h2>

      <p><strong>Service Requested:</strong> ${safe(service_requested)}</p>
      <p><strong>Service Detail:</strong> ${safe(secondary_detail)}</p>
      <p><strong>Full Name:</strong> ${safe(full_name)}</p>
      <p><strong>Proposed Patient Name:</strong> ${safe(patient_name)}</p>
      <p><strong>Email:</strong> ${safe(email)}</p>
      <p><strong>Insurance / Payment:</strong> ${safe(insurance_info)}</p>

      <hr />

      <p><strong>Reason for Inquiry:</strong></p>
      <p>${safe(reason).replace(/\n/g, "<br>")}</p>

      <hr />

      <p style="font-size: 13px; color: #666;">
        This message was submitted through the Stonebridge Psychological Group website consultation form.
      </p>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject,
      html
    });

    return res.status(200).json({
      success: true,
      message: "Consultation request sent."
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      error: "The form could not be sent."
    });
  }
};
