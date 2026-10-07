import {
  deleteExpiredSecureRecords,
  secureStoreConfigured
} from "./_secure-intake.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const expected = process.env.CRON_SECRET;
  const authorization = req.headers?.authorization || "";
  if (!expected || authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  if (!secureStoreConfigured()) {
    return res.status(503).json({ error: "Secure intake storage is not configured." });
  }

  try {
    const deleted = await deleteExpiredSecureRecords(new Date());
    return res.status(200).json({ ok: true, deleted });
  } catch (error) {
    console.error("Secure intake retention job failed", {
      code: error?.message || "UNKNOWN"
    });
    return res.status(500).json({ error: "Retention job failed." });
  }
}
