const { pool, hashPassword, verifyPassword, setSession, clearSession, session, json } = require("../lib/server.cjs");
const { ensureSchema } = require("../lib/schema.cjs");
const { ensureMembershipRoles } = require("../lib/foundation/rbac.cjs");
const { writeAudit, clientIp } = require("../lib/foundation/audit.cjs");

const userSelect = `SELECT u.id,u.email,u.full_name,o.id organization_id,o.name organization_name,o.kind,o.customer_segment,m.role
         FROM users u JOIN memberships m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id`;

module.exports = async function handler(req, res) {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) return json(res, 503, { error: "production_not_configured" });
  try {
    await ensureSchema(pool);
    if (req.method === "GET") {
      const current = session(req);
      if (!current) return json(res, 200, { user: null });
      const result = await pool.query(
        `${userSelect}
         WHERE u.id=$1 LIMIT 1`, [current.userId]
      );
      return json(res, 200, { user: result.rows[0] || null });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    const action = String(req.body?.action || "");
    if (action === "logout") {
      const current = session(req);
      if (current) {
        try {
          await writeAudit(pool, {
            actorUserId: current.userId,
            organizationId: current.organizationId,
            action: "user.logout",
            entityType: "user",
            entityId: current.userId,
            ip: clientIp(req),
          });
        } catch (error) {
          console.error("logout_audit_failed", error);
        }
      }
      clearSession(res);
      return json(res, 200, { ok: true });
    }
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email.includes("@") || password.length < 8) return json(res, 400, { error: "invalid_credentials_format" });
    if (action === "login") {
      const result = await pool.query(
        `SELECT u.id,u.email,u.full_name,u.password_hash,o.id organization_id,o.name organization_name,o.kind,o.customer_segment,m.role
         FROM users u JOIN memberships m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id
         WHERE u.email=$1 LIMIT 1`, [email]
      );
      const user = result.rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) {
        console.error("auth_failure", { reason: "invalid_credentials" });
        return json(res, 401, { error: "invalid_credentials" });
      }
      await pool.query("UPDATE users SET active_organization_id=$2 WHERE id=$1", [user.id, user.organization_id]);
      await ensureMembershipRoles(pool, user.id, user.organization_id, user.role);
      setSession(res, { userId: user.id, organizationId: user.organization_id, role: user.role });
      try {
        await writeAudit(pool, {
          actorUserId: user.id,
          organizationId: user.organization_id,
          action: "user.login",
          entityType: "user",
          entityId: user.id,
          ip: clientIp(req),
        });
      } catch (error) {
        console.error("login_audit_failed", error);
      }
      delete user.password_hash;
      return json(res, 200, { user });
    }
    if (action !== "register") return json(res, 400, { error: "invalid_action" });
    const fullName = String(req.body?.fullName || "").trim();
    const organizationName = String(req.body?.organizationName || "").trim();
    const kind = String(req.body?.kind || "company").trim();
    if (fullName.length < 2 || organizationName.length < 2) return json(res, 400, { error: "missing_profile" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const org = await client.query("INSERT INTO organizations(name,kind,customer_segment) VALUES($1,$2,'UNKNOWN') RETURNING id,name,kind,customer_segment", [organizationName, kind]);
      const user = await client.query("INSERT INTO users(email,password_hash,full_name,active_organization_id) VALUES($1,$2,$3,$4) RETURNING id,email,full_name", [email, hashPassword(password), fullName, org.rows[0].id]);
      await client.query("INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,$3)", [user.rows[0].id, org.rows[0].id, "owner"]);
      await ensureMembershipRoles(client, user.rows[0].id, org.rows[0].id, "owner");
      await writeAudit(client, {
        actorUserId: user.rows[0].id,
        organizationId: org.rows[0].id,
        action: "user.login",
        entityType: "user",
        entityId: user.rows[0].id,
        metadata: { source: "register" },
        ip: clientIp(req),
      });
      await client.query("COMMIT");
      setSession(res, { userId: user.rows[0].id, organizationId: org.rows[0].id, role: "owner" });
      return json(res, 201, { user: { ...user.rows[0], organization_id: org.rows[0].id, organization_name: org.rows[0].name, kind, customer_segment: org.rows[0].customer_segment, role: "owner" } });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") return json(res, 409, { error: "email_exists" });
      throw error;
    } finally { client.release(); }
  } catch (error) {
    console.error("auth_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
