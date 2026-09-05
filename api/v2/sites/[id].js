const { pool, json } = require("../../../lib/server.cjs");
const { ensureSchema } = require("../../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("../../../lib/foundation/authz.cjs");
const { parseSiteInput } = require("../../../lib/foundation/sites.cjs");
const { writeAudit, clientIp } = require("../../../lib/foundation/audit.cjs");
const { writeOutbox } = require("../../../lib/foundation/outbox.cjs");

module.exports = async function handler(req, res) {
  const session = requireUser(req, res);
  if (!session) return;
  const id = String(req.query.id || "");
  try {
    await ensureSchema(pool);
    const ctx = await loadAuthz(pool, session);
    if (!requireOrganization(ctx, res)) return;
    const found = await pool.query(
      `SELECT id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at
       FROM sites WHERE id=$1 AND organization_id=$2`,
      [id, ctx.organizationId]
    );
    if (!found.rows[0]) return json(res, 404, { error: "site_not_found" });
    if (req.method === "GET") {
      if (!requirePermission(ctx, res, "site.read")) return;
      return json(res, 200, { site: found.rows[0] });
    }
    if (req.method !== "PATCH") return json(res, 405, { error: "method_not_allowed" });
    if (!requirePermission(ctx, res, "site.update")) return;
    const parsed = parseSiteInput({ ...found.rows[0], siteType: found.rows[0].site_type, addressText: found.rows[0].address_text, ...req.body });
    if (parsed.error) return json(res, 400, { error: parsed.error });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const updated = await client.query(
        `UPDATE sites SET name=$3, site_type=$4, city=$5, region=$6, address_text=$7, latitude=$8, longitude=$9, active=$10, updated_at=now()
         WHERE id=$1 AND organization_id=$2
         RETURNING id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at`,
        [id, ctx.organizationId, parsed.value.name, parsed.value.siteType, parsed.value.city, parsed.value.region, parsed.value.addressText, parsed.value.latitude, parsed.value.longitude, parsed.value.active]
      );
      if (!updated.rows[0]) {
        await client.query("ROLLBACK");
        return json(res, 404, { error: "site_not_found" });
      }
      await writeAudit(client, {
        actorUserId: ctx.userId,
        organizationId: ctx.organizationId,
        action: "site.updated",
        entityType: "site",
        entityId: id,
        before: found.rows[0],
        after: updated.rows[0],
        ip: clientIp(req),
      });
      await writeOutbox(client, {
        eventType: "SiteUpdated",
        aggregateType: "site",
        aggregateId: id,
        organizationId: ctx.organizationId,
        payload: { name: updated.rows[0].name },
      });
      await client.query("COMMIT");
      return json(res, 200, { site: updated.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("v2_site_item_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
