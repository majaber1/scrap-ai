const { pool, requireSession, json } = require("../lib/server.cjs");
const { ensureSchema } = require("../lib/schema.cjs");
const { normalizeMaterial } = require("../lib/materials.cjs");
const { loadAuthz, requirePermission } = require("../lib/foundation/authz.cjs");
const UNITS = new Set(["kg", "ton", "piece"]);

function text(value, max) {
  return String(value || "").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  try {
    await ensureSchema(pool);
    const ctx = await loadAuthz(pool, session);
    if (req.method === "GET") {
      const [listings, offers, pickups] = await Promise.all([
        pool.query(
          `SELECT l.*, o.name seller_name FROM scrap_listings l
           JOIN organizations o ON o.id = l.seller_org_id
           WHERE l.status = 'open' OR l.seller_org_id = $1
           ORDER BY l.created_at DESC`,
          [session.organizationId]
        ),
        pool.query(
          `SELECT f.*, l.seller_org_id, l.title, o.name buyer_name FROM offers f
           JOIN scrap_listings l ON l.id = f.listing_id
           JOIN organizations o ON o.id = f.buyer_org_id
           WHERE f.buyer_org_id = $1 OR l.seller_org_id = $1
           ORDER BY f.created_at DESC`,
          [session.organizationId]
        ),
        pool.query(
          `SELECT p.*, l.title FROM pickups p
           JOIN scrap_listings l ON l.id = p.listing_id
           JOIN offers f ON f.id = p.offer_id
           WHERE l.seller_org_id = $1 OR f.buyer_org_id = $1
           ORDER BY p.created_at DESC`,
          [session.organizationId]
        )
      ]);
      return json(res, 200, { listings: listings.rows, offers: offers.rows, pickups: pickups.rows });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    const action = String(req.body?.action || "");
    const body = req.body || {};

    if (action === "createListing") {
      if (!requirePermission(ctx, res, "listing.create")) return;
      const title = text(body.title, 120);
      const material = normalizeMaterial(body.material);
      const city = text(body.city, 80);
      const unit = UNITS.has(body.unit) ? body.unit : "kg";
      const quantity = body.quantity === null || body.quantity === "" || body.quantity === undefined ? null : Number(body.quantity);
      const indicativeValue = body.indicativeValue === null || body.indicativeValue === "" || body.indicativeValue === undefined ? null : Number(body.indicativeValue);
      if (title.length < 2) return json(res, 400, { error: "title_required" });
      if (city.length < 2) return json(res, 400, { error: "city_required" });
      if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) return json(res, 400, { error: "invalid_quantity" });
      if (indicativeValue !== null && (!Number.isFinite(indicativeValue) || indicativeValue < 0)) return json(res, 400, { error: "invalid_value" });
      const result = await pool.query(
        `INSERT INTO scrap_listings(seller_org_id, title, material, quantity, unit, city, indicative_value, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [session.organizationId, title, material, quantity, unit, city, indicativeValue, body.imageUrl || null]
      );
      return json(res, 201, { listing: result.rows[0] });
    }

    if (action === "submitOffer") {
      if (!requirePermission(ctx, res, "offer.create")) return;
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) return json(res, 400, { error: "invalid_amount" });
      const existing = await pool.query(
        `SELECT id FROM offers WHERE listing_id = $1 AND buyer_org_id = $2 AND status = 'submitted' LIMIT 1`,
        [body.listingId, session.organizationId]
      );
      if (existing.rows[0]) return json(res, 409, { error: "offer_already_submitted" });
      const result = await pool.query(
        `INSERT INTO offers(listing_id, buyer_org_id, amount)
         SELECT id, $1, $3 FROM scrap_listings
         WHERE id = $2 AND seller_org_id <> $1 AND status = 'open'
         RETURNING *`,
        [session.organizationId, body.listingId, amount]
      );
      if (!result.rows[0]) return json(res, 400, { error: "listing_unavailable" });
      return json(res, 201, { offer: result.rows[0] });
    }

    if (action === "acceptOffer") {
      if (!requirePermission(ctx, res, "listing.manage_own")) return;
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const accepted = await client.query(
          `UPDATE offers f SET status = 'accepted'
           FROM scrap_listings l
           WHERE f.id = $1 AND f.listing_id = l.id AND l.seller_org_id = $2 AND f.status = 'submitted'
           RETURNING f.*`,
          [body.offerId, session.organizationId]
        );
        if (!accepted.rows[0]) {
          await client.query("ROLLBACK");
          return json(res, 404, { error: "offer_not_found" });
        }
        const listingId = accepted.rows[0].listing_id;
        await client.query(
          `UPDATE offers SET status = 'declined' WHERE listing_id = $1 AND id <> $2 AND status = 'submitted'`,
          [listingId, accepted.rows[0].id]
        );
        await client.query(`UPDATE scrap_listings SET status = 'pickup' WHERE id = $1`, [listingId]);
        const pickup = await client.query(
          `INSERT INTO pickups(listing_id, offer_id, scheduled_at, address_text) VALUES ($1,$2,$3,$4) RETURNING *`,
          [listingId, accepted.rows[0].id, body.scheduledAt || null, body.address || null]
        );
        await client.query("COMMIT");
        return json(res, 200, { offer: accepted.rows[0], pickup: pickup.rows[0] });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return json(res, 400, { error: "invalid_action" });
  } catch (error) {
    console.error("workflow_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
