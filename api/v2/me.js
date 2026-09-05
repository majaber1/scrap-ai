const { pool, json } = require("../../lib/server.cjs");
const { ensureSchema } = require("../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization } = require("../../lib/foundation/authz.cjs");
const { navigationForSegment, individualUx } = require("../../lib/foundation/segments.cjs");
const { mapVisualEstimateToTaxonomy } = require("../../lib/foundation/taxonomy-map.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "method_not_allowed" });
  const session = requireUser(req, res);
  if (!session) return;
  try {
    await ensureSchema(pool);
    const ctx = await loadAuthz(pool, session);
    if (!requireOrganization(ctx, res)) return;
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.active_organization_id,
              o.id organization_id, o.name organization_name, o.kind, o.customer_segment
       FROM users u
       JOIN organizations o ON o.id = $2
       WHERE u.id = $1`,
      [ctx.userId, ctx.organizationId]
    );
    const row = result.rows[0];
    if (!row) return json(res, 404, { error: "user_not_found" });
    const latest = await pool.query(
      `SELECT result FROM ai_analyses WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [ctx.organizationId]
    );
    const taxonomyCandidate = latest.rows[0] ? mapVisualEstimateToTaxonomy(latest.rows[0].result) : null;
    return json(res, 200, {
      user: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
      },
      organization: {
        id: row.organization_id,
        name: row.organization_name,
        customerSegment: row.customer_segment,
        legacyKind: row.kind,
      },
      activeOrganizationId: row.active_organization_id || row.organization_id,
      roles: ctx.roles,
      permissions: [...ctx.permissions],
      platformAdmin: ctx.platformAdmin,
      navigation: navigationForSegment(row.customer_segment),
      individualUx: individualUx(row.customer_segment),
      needsOnboarding: row.customer_segment === "UNKNOWN",
      taxonomyCandidate,
    });
  } catch (error) {
    console.error("v2_me_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
