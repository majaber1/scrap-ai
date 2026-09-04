const { pool, hashPassword, verifyPassword, setSession, clearSession, session, json } = require("../lib/server.cjs");
const { ensureSchema } = require("../lib/schema.cjs");

module.exports = async function handler(req, res) {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) return json(res, 503, { error: "production_not_configured" });
  try {
    await ensureSchema(pool);
    if (req.method === "GET") {
      const current = session(req);
      if (!current) return json(res, 200, { user: null });
      const result = await pool.query(
        `SELECT u.id,u.email,u.full_name,o.id organization_id,o.name organization_name,o.kind,m.role
         FROM users u JOIN memberships m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id
         WHERE u.id=$1 LIMIT 1`, [current.userId]
      );
      return json(res, 200, { user: result.rows[0] || null });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    const action = String(req.body?.action || "");
    if (action === "logout") { clearSession(res); return json(res, 200, { ok: true }); }
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email.includes("@") || password.length < 8) return json(res, 400, { error: "invalid_credentials_format" });
    if (action === "login") {
      const result = await pool.query(
        `SELECT u.id,u.email,u.full_name,u.password_hash,o.id organization_id,o.name organization_name,o.kind,m.role
         FROM users u JOIN memberships m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id
         WHERE u.email=$1 LIMIT 1`, [email]
      );
      const user = result.rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) return json(res, 401, { error: "invalid_credentials" });
      setSession(res, { userId: user.id, organizationId: user.organization_id, role: user.role });
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
      const org = await client.query("INSERT INTO organizations(name,kind) VALUES($1,$2) RETURNING id,name,kind", [organizationName, kind]);
      const user = await client.query("INSERT INTO users(email,password_hash,full_name) VALUES($1,$2,$3) RETURNING id,email,full_name", [email, hashPassword(password), fullName]);
      await client.query("INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,$3)", [user.rows[0].id, org.rows[0].id, "owner"]);
      await client.query("COMMIT");
      setSession(res, { userId: user.rows[0].id, organizationId: org.rows[0].id, role: "owner" });
      return json(res, 201, { user: { ...user.rows[0], organization_id: org.rows[0].id, organization_name: org.rows[0].name, kind, role: "owner" } });
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
