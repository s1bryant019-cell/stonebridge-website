export default function handler(req, res) {
  // Temporary pre-launch shutdown:
  // Do not read, validate, store, log, or transmit submitted form data.
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Retry-After", "86400");

  return res.status(503).json({
    ok: false,
    error:
      "Stonebridge Psychological Group is not currently accepting website inquiries, scheduling consultations, conducting intake reviews, or providing clinical or professional services. Future availability will be posted on the website."
  });
}
