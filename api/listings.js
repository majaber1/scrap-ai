const { pool, json } = require("../lib/server.cjs");
const { ensureSchema } = require("../lib/schema.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "method_not_allowed" });
  if (!process.env.DATABASE_URL) return json(res, 503, { error: "production_not_configured", listings: [] });
  try {
    await ensureSchema(pool);
    const result = await pool.query(
      `SELECT l.id, l.title, l.material, l.quantity, l.unit, l.city, l.indicative_value, l.image_url, l.status, l.created_at, o.name AS seller_name
       FROM scrap_listings l
       JOIN organizations o ON o.id = l.seller_org_id
       WHERE l.status = 'open'
       ORDER BY l.created_at DESC
       LIMIT 100`
    );
    const listings = result.rows.map((listing) => ({
      ...listing,
      image: listing.image_url
        ? (String(listing.image_url).startsWith("http") ? listing.image_url : `/api/media?listing=${listing.id}`)
        : null,
    }));
    return json(res, 200, { listings });
  } catch (error) {
    console.error("listings_error", error);
    return json(res, 500, { error: "server_error", listings: [] });
  }
};
