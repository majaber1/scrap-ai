const { pool, json } = require("../../lib/server.cjs");
const { ensureSchema } = require("../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("../../lib/foundation/authz.cjs");
const { orgPatchSchema } = require("../../lib/foundation/validate.cjs");
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
      if (!requirePermission(ctx, res, "org.read")) return;
      const result = await pool.query(
        `SELECT id, name, kind, customer_segment, created_at FROM organizations WHERE id=$1`,
        [ctx.organizationId]
      );
      return json(res, 200, { organization: result.rows[0] || null });
    }
    if (req.method !== "PATCH") return json(res, 405, { error: "method_not_allowed" });
    if (!requirePermission(ctx, res, "org.manage")) return;
    const parsed = orgPatchSchema.safeParse(req.body || {});
    if (!parsed.success) return json(res, 400, { error: "invalid_organization_patch" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const before = await client.query(`SELECT id, name, customer_segment FROM organizations WHERE id=$1 FOR UPDATE`, [ctx.organizationId]);
      if (!before.rows[0]) {
        await client.query("ROLLBACK");
        return json(res, 404, { error: "organization_not_found" });
      }
      const name = parsed.data.name || before.rows[0].name;
      const segment = parsed.data.customerSegment || before.rows[0].customer_segment;
      const after = await client.query(
        `UPDATE organizations SET name=$2, customer_segment=$3 WHERE id=$1 RETURNING id, name, kind, customer_segment, created_at`,
        [ctx.organizationId, name, segment]
      );
      if (parsed.data.customerSegment) {
        await writeAudit(client, {
          actorUserId: ctx.userId,
          organizationId: ctx.organizationId,
          action: "organization.segment.confirmed",
          entityType: "organization",
          entityId: ctx.organizationId,
          before: before.rows[0],
          after: after.rows[0],
          ip: clientIp(req),
        });
        await writeOutbox(client, {
          eventType: "OrganizationSegmentConfirmed",
          aggregateType: "organization",
          aggregateId: ctx.organizationId,
          organizationId: ctx.organizationId,
          payload: { customerSegment: segment },
        });
      }
      await client.query("COMMIT");
      return json(res, 200, { organization: after.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("v2_organization_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
