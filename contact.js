import { Resend } from 'resend';

const MAX_FIELD_LENGTH = 2500;

function clean(value = '') {
  return String(value).trim().slice(0, MAX_FIELD_LENGTH);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function labeledText(label, value) {
  return `${label}: ${value || 'Not provided'}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'info@stonebridgepsychgroup.com';
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Stonebridge Website <website@stonebridgepsychgroup.com>';

  if (!resendApiKey) {
    return res.status(500).json({ error: 'Email service is not configured yet. Please email info@stonebridgepsychgroup.com directly.' });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid form submission.' });
    }
  }

  // Honeypot spam field. If filled, quietly return success without sending.
  if (clean(body?.website)) {
    return res.status(200).json({ ok: true });
  }

  const serviceRequested = clean(body?.service_requested);
  const secondaryDetail = clean(body?.secondary_detail);
  const fullName = clean(body?.full_name);
  const patientName = clean(body?.patient_name);
  const email = clean(body?.email);
  const insuranceInfo = clean(body?.insurance_info);
  const reason = clean(body?.reason);

  if (serviceRequested !== 'psychotherapy') {
    return res.status(400).json({ error: 'Stonebridge is currently accepting psychotherapy inquiries only.' });
  }

  if (!fullName || !email || !reason) {
    return res.status(400).json({ error: 'Please complete the required fields before submitting.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const subject = `New psychotherapy inquiry from ${fullName}`;

  const text = [
    'New Stonebridge consultation inquiry',
    '',
    labeledText('Submitted', submittedAt),
    labeledText('Service requested', 'Psychotherapy'),
    labeledText('Format/detail', secondaryDetail),
    labeledText('Full name', fullName),
    labeledText('Proposed patient name', patientName),
    labeledText('Email', email),
    labeledText('Insurance/payment information', insuranceInfo),
    '',
    'Reason for inquiry:',
    reason,
    '',
    'Note: This message was submitted through the Stonebridge website initial inquiry form.'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color:#25303b; line-height:1.55; max-width:720px;">
      <h2 style="margin:0 0 16px; color:#24303b;">New Stonebridge consultation inquiry</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:18px;">
        <tbody>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Submitted</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">${escapeHtml(submittedAt)}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Service requested</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">Psychotherapy</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Format/detail</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">${escapeHtml(secondaryDetail || 'Not provided')}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Full name</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">${escapeHtml(fullName)}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Proposed patient name</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">${escapeHtml(patientName || 'Not provided')}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Email</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd3c7;"><strong>Insurance/payment information</strong></td><td style="padding:8px; border:1px solid #ddd3c7;">${escapeHtml(insuranceInfo || 'Not provided')}</td></tr>
        </tbody>
      </table>
      <h3 style="margin:0 0 8px; color:#24303b;">Reason for inquiry</h3>
      <p style="white-space:pre-wrap; background:#f8f4ef; border:1px solid #ddd3c7; border-radius:12px; padding:14px;">${escapeHtml(reason)}</p>
      <p style="font-size:13px; color:#67737d; margin-top:18px;">This message was submitted through the Stonebridge website initial inquiry form.</p>
    </div>
  `;

  try {
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form email failed:', error);
    return res.status(500).json({ error: 'Something went wrong and the form was not sent. Please email info@stonebridgepsychgroup.com directly.' });
  }
}
