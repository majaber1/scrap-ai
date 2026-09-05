const { pool, json } = require("../../lib/server.cjs");
const { ensureSchema } = require("../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("../../lib/foundation/authz.cjs");
const { parseRoleCodes } = require("../../lib/foundation/rbac.cjs");
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
      if (!requirePermission(ctx, res, "members.read")) return;
      const result = await pool.query(
        `SELECT u.id, u.email, u.full_name, m.role legacy_role,
                COALESCE(array_agg(mr.role_code) FILTER (WHERE mr.role_code IS NOT NULL), '{}') AS roles
         FROM memberships m
         JOIN users u ON u.id = m.user_id
         LEFT JOIN membership_roles mr ON mr.user_id = m.user_id AND mr.organization_id = m.organization_id
         WHERE m.organization_id = $1
         GROUP BY u.id, u.email, u.full_name, m.role
         ORDER BY u.created_at`,
        [ctx.organizationId]
      );
      return json(res, 200, { members: result.rows });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    if (!requirePermission(ctx, res, "members.manage")) return;
    const email = String(req.body?.email || "").trim().toLowerCase();
    const parsed = parseRoleCodes(req.body?.roles || req.body?.role || "VIEWER");
    if (!email.includes("@")) return json(res, 400, { error: "invalid_email" });
    if (parsed.error) return json(res, 400, { error: parsed.error });
    const user = await pool.query(`SELECT id, email, full_name FROM users WHERE email=$1`, [email]);
    if (!user.rows[0]) return json(res, 404, { error: "user_not_found" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO memberships(user_id, organization_id, role) VALUES ($1,$2,'member') ON CONFLICT DO NOTHING`,
        [user.rows[0].id, ctx.organizationId]
      );
      for (const role of parsed.value) {
        await client.query(
          `INSERT INTO membership_roles(user_id, organization_id, role_code) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [user.rows[0].id, ctx.organizationId, role]
        );
      }
      await writeAudit(client, {
        actorUserId: ctx.userId,
        organizationId: ctx.organizationId,
        action: "membership.created",
        entityType: "membership",
        entityId: user.rows[0].id,
        after: { userId: user.rows[0].id, roles: parsed.value },
        ip: clientIp(req),
      });
      await writeOutbox(client, {
        eventType: "MembershipRoleChanged",
        aggregateType: "membership",
        aggregateId: user.rows[0].id,
        organizationId: ctx.organizationId,
        payload: { roles: parsed.value },
      });
      await client.query("COMMIT");
      return json(res, 201, { member: { ...user.rows[0], roles: parsed.value } });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("v2_members_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
