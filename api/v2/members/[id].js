const { pool, json } = require("../../../lib/server.cjs");
const { ensureSchema } = require("../../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("../../../lib/foundation/authz.cjs");
const { parseRoleCodes } = require("../../../lib/foundation/rbac.cjs");
const { writeAudit, clientIp } = require("../../../lib/foundation/audit.cjs");
const { writeOutbox } = require("../../../lib/foundation/outbox.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return json(res, 405, { error: "method_not_allowed" });
  const session = requireUser(req, res);
  if (!session) return;
  const memberId = String(req.query.id || "");
  try {
    await ensureSchema(pool);
    const ctx = await loadAuthz(pool, session);
    if (!requireOrganization(ctx, res)) return;
    if (!requirePermission(ctx, res, "members.manage")) return;
    const parsed = parseRoleCodes(req.body?.roles);
    if (parsed.error) return json(res, 400, { error: parsed.error });
    const member = await pool.query(
      `SELECT user_id FROM memberships WHERE user_id=$1 AND organization_id=$2`,
      [memberId, ctx.organizationId]
    );
    if (!member.rows[0]) return json(res, 404, { error: "member_not_found" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const before = await client.query(
        `SELECT role_code FROM membership_roles WHERE user_id=$1 AND organization_id=$2`,
        [memberId, ctx.organizationId]
      );
      await client.query(`DELETE FROM membership_roles WHERE user_id=$1 AND organization_id=$2`, [memberId, ctx.organizationId]);
      for (const role of parsed.value) {
        await client.query(
          `INSERT INTO membership_roles(user_id, organization_id, role_code) VALUES ($1,$2,$3)`,
          [memberId, ctx.organizationId, role]
        );
      }
      await writeAudit(client, {
        actorUserId: ctx.userId,
        organizationId: ctx.organizationId,
        action: "membership.role_changed",
        entityType: "membership",
        entityId: memberId,
        before: { roles: before.rows.map((row) => row.role_code) },
        after: { roles: parsed.value },
        ip: clientIp(req),
      });
      await writeOutbox(client, {
        eventType: "MembershipRoleChanged",
        aggregateType: "membership",
        aggregateId: memberId,
        organizationId: ctx.organizationId,
        payload: { roles: parsed.value },
      });
      await client.query("COMMIT");
      return json(res, 200, { memberId, roles: parsed.value });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("v2_member_roles_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
