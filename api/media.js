const { pool, json } = require("../lib/server.cjs");
const { ensureSchema } = require("../lib/schema.cjs");
const { configured, sign } = require("../lib/r2.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "method_not_allowed" });
  const listingId = String(req.query?.listing || "");
  if (!/^[0-9a-f-]{36}$/i.test(listingId)) return json(res, 400, { error: "invalid_listing" });
  if (!process.env.DATABASE_URL || !configured()) return json(res, 404, { error: "not_found" });
  try {
    await ensureSchema(pool);
    const result = await pool.query(
      "SELECT image_url FROM scrap_listings WHERE id = $1 AND status = 'open' LIMIT 1",
      [listingId]
    );
    const key = String(result.rows[0]?.image_url || "");
    if (!key.startsWith("organizations/") || key.includes("..")) return json(res, 404, { error: "not_found" });
    res.setHeader("Cache-Control", "private, max-age=60");
    res.setHeader("Location", sign(key, "GET", 300));
    res.status(302).end();
  } catch (error) {
    console.error("media_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
