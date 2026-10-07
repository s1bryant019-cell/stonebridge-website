import crypto from "node:crypto";
import {
  getRequestBody,
  insertSecureRecord,
  isSyntheticPreviewSubmission,
  isValidDateOfBirth,
  isValidEmail,
  normalize,
  normalizePhone,
  productionPhiGateReady,
  retentionConfigured,
  sameOriginRequest,
  secureStoreConfigured,
  sendGenericSecureQueueNotice
} from "./_secure-intake.js";

const MAX_LENGTHS = {
  fullName: 120,
  email: 254,
  serviceRequested: 120,
  psychotherapyFormat: 120,
  insurancePreference: 160,
  reason: 4000,
  website: 200,
  phone: 50,
  preferredContact: 40,
  preferredClinician: 120,
  generalAvailability: 500,
  landingSource: 120
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!sameOriginRequest(req)) {
    return res.status(403).json({ error: "Request origin not allowed." });
  }

  try {
    const body = getRequestBody(req);
    if (normalize(body.website, MAX_LENGTHS.website)) {
      return res.status(200).json({ ok: true });
    }

    const inquiryType = normalize(body.inquiryType, 40).toLowerCase();
    const serviceRequested = normalize(
      body.serviceRequested || body.service || "",
      MAX_LENGTHS.serviceRequested
    );
    const psychotherapyFormat = normalize(
      body.psychotherapyFormat || "Telehealth psychotherapy",
      MAX_LENGTHS.psychotherapyFormat
    );
    const fullName = normalize(
      body.fullName || body.name || "",
      MAX_LENGTHS.fullName
    );
    const dateOfBirth = normalize(body.dateOfBirth || "", 10);
    const email = normalize(body.email, MAX_LENGTHS.email).toLowerCase();
    const phone = normalizePhone(body.phone);
    const preferredContact = normalize(
      body.preferredContact || "",
      MAX_LENGTHS.preferredContact
    );
    const preferredClinician = normalize(
      body.preferredClinician || "",
      MAX_LENGTHS.preferredClinician
    );
    const generalAvailability = normalize(
      body.generalAvailability || "",
      MAX_LENGTHS.generalAvailability
    );
    const landingSource = normalize(
      body.landingSource || "",
      MAX_LENGTHS.landingSource
    );
    const insurancePreference = normalize(
      body.insurancePreference || body.insurance || "",
      MAX_LENGTHS.insurancePreference
    );
    const reason = normalize(
      body.reason || body.message || "",
      MAX_LENGTHS.reason
    );

    const fieldErrors = {};
    if (!fullName) fieldErrors.fullName = "Enter your full name.";
    if (!isValidDateOfBirth(dateOfBirth)) {
      fieldErrors.dateOfBirth = "Enter a valid date of birth.";
    }
    if (!isValidEmail(email)) {
      fieldErrors.email = "Enter a valid email address.";
    }
    if (!phone) fieldErrors.phone = "Enter your phone number.";
    if (!serviceRequested) {
      fieldErrors.serviceRequested = "Choose what you’re reaching out about.";
    }
    if (!reason) {
      fieldErrors.reason = "Tell us briefly what you’re reaching out about.";
    }

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({
        error: "Review the highlighted fields.",
        fieldErrors
      });
    }

    const preview = isSyntheticPreviewSubmission({ name: fullName, email });

    if ((process.env.VERCEL_ENV || "") !== "production" && !preview) {
      return res.status(400).json({
        error:
          "Preview accepts synthetic test identities only. Use a name beginning with Test or Preview and an @example.com email address."
      });
    }

    if (!preview) {
      if (!productionPhiGateReady()) {
        return res.status(503).json({
          error:
            "The secure consultation workflow is not enabled for production yet. Please call Stonebridge for assistance."
        });
      }
      if (!secureStoreConfigured() || !retentionConfigured()) {
        return res.status(503).json({
          error:
            "The secure consultation workflow is not fully configured. Please call Stonebridge for assistance."
        });
      }

      await insertSecureRecord("consultation_requests", {
        id: crypto.randomUUID(),
        submitted_at: new Date().toISOString(),
        inquiry_type: inquiryType || "consultation",
        full_name: fullName,
        date_of_birth: dateOfBirth,
        email,
        phone,
        preferred_contact: preferredContact || null,
        service_requested: serviceRequested,
        psychotherapy_format: psychotherapyFormat || null,
        preferred_clinician: preferredClinician || null,
        general_availability: generalAvailability || null,
        insurance_preference: insurancePreference || null,
        reason,
        landing_source: landingSource || null,
        operational_status: "pending_review"
      });

      await sendGenericSecureQueueNotice();
    }

    return res.status(200).json({ ok: true, preview });
  } catch (error) {
    console.error("Contact API error", {
      code: error?.message || "UNKNOWN"
    });
    return res.status(500).json({
      error:
        "The form could not be submitted securely. Please call (773) 417-1688 for assistance."
    });
  }
}
