const { pool, json } = require("../../lib/server.cjs");
const { ensureSchema } = require("../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("../../lib/foundation/authz.cjs");
const { parseSiteInput } = require("../../lib/foundation/sites.cjs");
const { writeAudit, clientIp } = require("../../lib/foundation/audit.cjs");
const { writeOutbox } = require("../../lib/foundation/outbox.cjs");

module.exports = async function handler(req, res) {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    await ensureSchema(pool);
    const ctx = await loadAuthz(pool, session);
    if (!requireOrganization(ctx, res)) return;
    if (req.method === "GET") {
      if (!requirePermission(ctx, res, "site.read")) return;
      const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 20));
      const result = await pool.query(
        `SELECT id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at
         FROM sites WHERE organization_id=$1 ORDER BY created_at DESC LIMIT $2`,
        [ctx.organizationId, limit]
      );
      return json(res, 200, { sites: result.rows });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    if (!requirePermission(ctx, res, "site.create")) return;
    const parsed = parseSiteInput(req.body || {});
    if (parsed.error) return json(res, 400, { error: parsed.error });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const created = await client.query(
        `INSERT INTO sites(organization_id, name, site_type, city, region, address_text, latitude, longitude, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at`,
        [ctx.organizationId, parsed.value.name, parsed.value.siteType, parsed.value.city, parsed.value.region, parsed.value.addressText, parsed.value.latitude, parsed.value.longitude, parsed.value.active]
      );
      await writeAudit(client, {
        actorUserId: ctx.userId,
        organizationId: ctx.organizationId,
        action: "site.created",
        entityType: "site",
        entityId: created.rows[0].id,
        after: created.rows[0],
        ip: clientIp(req),
      });
      await writeOutbox(client, {
        eventType: "SiteCreated",
        aggregateType: "site",
        aggregateId: created.rows[0].id,
        organizationId: ctx.organizationId,
        payload: { name: created.rows[0].name, siteType: created.rows[0].site_type },
      });
      await client.query("COMMIT");
      return json(res, 201, { site: created.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("v2_sites_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
