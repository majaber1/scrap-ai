const { pool, json, setSession } = require("../../lib/server.cjs");
const { ensureSchema } = require("../../lib/schema.cjs");
const { requireUser } = require("../../lib/foundation/authz.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
  const session = requireUser(req, res);
  if (!session) return;
  const organizationId = String(req.body?.organizationId || "");
  try {
    await ensureSchema(pool);
    const membership = await pool.query(
      `SELECT role FROM memberships WHERE user_id=$1 AND organization_id=$2`,
      [session.userId, organizationId]
    );
    if (!membership.rows[0]) return json(res, 404, { error: "membership_not_found" });
    await pool.query(`UPDATE users SET active_organization_id=$2 WHERE id=$1`, [session.userId, organizationId]);
    setSession(res, { userId: session.userId, organizationId, role: membership.rows[0].role });
    return json(res, 200, { activeOrganizationId: organizationId });
  } catch (error) {
    console.error("v2_session_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
