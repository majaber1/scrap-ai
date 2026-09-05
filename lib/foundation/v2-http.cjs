const { pool, json, setSession } = require("../server.cjs");
const { ensureSchema } = require("../schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("./authz.cjs");
const { navigationForSegment, individualUx } = require("./segments.cjs");
const { mapVisualEstimateToTaxonomy } = require("./taxonomy-map.cjs");
const { orgPatchSchema } = require("./validate.cjs");
const { writeAudit, clientIp } = require("./audit.cjs");
const { writeOutbox } = require("./outbox.cjs");
const { parseSiteInput } = require("./sites.cjs");
const { parseRoleCodes } = require("./rbac.cjs");
const { handlePhase2 } = require("../modules/ai/phase2-http.cjs");

function partsOf(req) {
  const url = String(req.url || "").split("?")[0];
  const fromUrl = url.replace(/^\/api\/v2\/?/, "").replace(/^\//, "").split("/").filter(Boolean);
  const raw = req.query.path;
  const fromQuery = Array.isArray(raw) ? raw.map(String) : raw ? String(raw).split("/").filter(Boolean) : [];
  const parts = fromUrl.length >= fromQuery.length ? fromUrl : fromQuery;
  if (url.includes("/v2/ai") && parts[0] !== "ai") return ["ai", ...parts];
  if (url.includes("/v2/pricing") && parts[0] !== "pricing") return ["pricing", ...parts];
  if (url.includes("/v2/matching") && parts[0] !== "matching") return ["matching", ...parts];
  return parts;
}

async function handleV2(req, res) {
  const parts = partsOf(req);
  const session = await requireUser(req, res);
  if (!session) return;
  await ensureSchema(pool);
  const ctx = await loadAuthz(pool, session);
  if (!requireOrganization(ctx, res)) return;
  const head = parts[0] || "";
  if (head === "me" && req.method === "GET") return me(ctx, res);
  if (head === "organization") return organization(req, res, ctx);
  if (head === "sites" && parts[1]) return siteItem(req, res, ctx, parts[1]);
  if (head === "sites") return sites(req, res, ctx);
  if (head === "materials" && req.method === "GET") return materials(res, ctx);
  if (head === "members" && parts[1]) return memberItem(req, res, ctx, parts[1]);
  if (head === "members") return members(req, res, ctx);
  if (head === "session" && req.method === "POST") return switchOrg(req, res, session);
  const phase2 = await handlePhase2(req, res, ctx, parts);
  if (phase2 !== false) return;
  return json(res, 404, { error: "not_found" });
}

async function me(ctx, res) {
  const result = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.active_organization_id,
            o.id organization_id, o.name organization_name, o.kind, o.customer_segment
     FROM users u JOIN organizations o ON o.id = $2 WHERE u.id = $1`,
    [ctx.userId, ctx.organizationId]
  );
  const row = result.rows[0];
  if (!row) return json(res, 404, { error: "user_not_found" });
  const latest = await pool.query(`SELECT result FROM ai_analyses WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 1`, [ctx.organizationId]);
  return json(res, 200, {
    user: { id: row.id, email: row.email, fullName: row.full_name },
    organization: { id: row.organization_id, name: row.organization_name, customerSegment: row.customer_segment, legacyKind: row.kind },
    activeOrganizationId: row.active_organization_id || row.organization_id,
    roles: ctx.roles,
    permissions: [...ctx.permissions],
    platformAdmin: ctx.platformAdmin,
    navigation: navigationForSegment(row.customer_segment),
    individualUx: individualUx(row.customer_segment),
    needsOnboarding: row.customer_segment === "UNKNOWN",
    taxonomyCandidate: latest.rows[0] ? mapVisualEstimateToTaxonomy(latest.rows[0].result) : null,
  });
}

async function organization(req, res, ctx) {
  if (req.method === "GET") {
    if (!requirePermission(ctx, res, "org.read")) return;
    const result = await pool.query(`SELECT id, name, kind, customer_segment, created_at FROM organizations WHERE id=$1`, [ctx.organizationId]);
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
    if (!before.rows[0]) { await client.query("ROLLBACK"); return json(res, 404, { error: "organization_not_found" }); }
    const name = parsed.data.name || before.rows[0].name;
    const segment = parsed.data.customerSegment || before.rows[0].customer_segment;
    const after = await client.query(`UPDATE organizations SET name=$2, customer_segment=$3 WHERE id=$1 RETURNING id, name, kind, customer_segment, created_at`, [ctx.organizationId, name, segment]);
    if (parsed.data.customerSegment) {
      await writeAudit(client, { actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "organization.segment.confirmed", entityType: "organization", entityId: ctx.organizationId, before: before.rows[0], after: after.rows[0], ip: clientIp(req) });
      await writeOutbox(client, { eventType: "OrganizationSegmentConfirmed", aggregateType: "organization", aggregateId: ctx.organizationId, organizationId: ctx.organizationId, payload: { customerSegment: segment } });
    }
    await client.query("COMMIT");
    return json(res, 200, { organization: after.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

async function sites(req, res, ctx) {
  if (req.method === "GET") {
    if (!requirePermission(ctx, res, "site.read")) return;
    const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 20));
    const result = await pool.query(`SELECT id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at FROM sites WHERE organization_id=$1 ORDER BY created_at DESC LIMIT $2`, [ctx.organizationId, limit]);
    return json(res, 200, { sites: result.rows });
  }
  if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
  if (!requirePermission(ctx, res, "site.create")) return;
  const parsed = parseSiteInput(req.body || {});
  if (parsed.error) return json(res, 400, { error: parsed.error });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = await client.query(`INSERT INTO sites(organization_id, name, site_type, city, region, address_text, latitude, longitude, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at`, [ctx.organizationId, parsed.value.name, parsed.value.siteType, parsed.value.city, parsed.value.region, parsed.value.addressText, parsed.value.latitude, parsed.value.longitude, parsed.value.active]);
    await writeAudit(client, { actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "site.created", entityType: "site", entityId: created.rows[0].id, after: created.rows[0], ip: clientIp(req) });
    await writeOutbox(client, { eventType: "SiteCreated", aggregateType: "site", aggregateId: created.rows[0].id, organizationId: ctx.organizationId, payload: { name: created.rows[0].name, siteType: created.rows[0].site_type } });
    await client.query("COMMIT");
    return json(res, 201, { site: created.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

async function siteItem(req, res, ctx, id) {
  const found = await pool.query(`SELECT id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at FROM sites WHERE id=$1 AND organization_id=$2`, [id, ctx.organizationId]);
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
    const updated = await client.query(`UPDATE sites SET name=$3, site_type=$4, city=$5, region=$6, address_text=$7, latitude=$8, longitude=$9, active=$10, updated_at=now() WHERE id=$1 AND organization_id=$2 RETURNING id, organization_id, name, site_type, city, region, address_text, latitude, longitude, active, created_at, updated_at`, [id, ctx.organizationId, parsed.value.name, parsed.value.siteType, parsed.value.city, parsed.value.region, parsed.value.addressText, parsed.value.latitude, parsed.value.longitude, parsed.value.active]);
    if (!updated.rows[0]) { await client.query("ROLLBACK"); return json(res, 404, { error: "site_not_found" }); }
    await writeAudit(client, { actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "site.updated", entityType: "site", entityId: id, before: found.rows[0], after: updated.rows[0], ip: clientIp(req) });
    await writeOutbox(client, { eventType: "SiteUpdated", aggregateType: "site", aggregateId: id, organizationId: ctx.organizationId, payload: { name: updated.rows[0].name } });
    await client.query("COMMIT");
    return json(res, 200, { site: updated.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

async function materials(res, ctx) {
  if (!requirePermission(ctx, res, "material.read")) return;
  const families = await pool.query(`SELECT id, code, label_ar, label_en, active, sort_order FROM material_families WHERE active=true ORDER BY sort_order`);
  const materialsRows = await pool.query(`SELECT m.id, m.family_id, m.code, m.label_ar, m.label_en, m.inspection_guidance_ar, m.inspection_guidance_en, f.code family_code FROM materials m JOIN material_families f ON f.id=m.family_id WHERE m.active=true ORDER BY m.label_en`);
  const grades = await pool.query(`SELECT g.id, g.material_id, g.code, g.label_ar, g.label_en FROM material_grades g WHERE g.active=true`);
  const aliases = await pool.query(`SELECT a.material_id, a.alias, a.locale FROM material_aliases a`);
  return json(res, 200, { families: families.rows, materials: materialsRows.rows, grades: grades.rows, aliases: aliases.rows });
}

async function members(req, res, ctx) {
  if (req.method === "GET") {
    if (!requirePermission(ctx, res, "members.read")) return;
    const result = await pool.query(`SELECT u.id, u.email, u.full_name, m.role legacy_role, COALESCE(array_agg(mr.role_code) FILTER (WHERE mr.role_code IS NOT NULL), '{}') AS roles FROM memberships m JOIN users u ON u.id = m.user_id LEFT JOIN membership_roles mr ON mr.user_id = m.user_id AND mr.organization_id = m.organization_id WHERE m.organization_id = $1 GROUP BY u.id, u.email, u.full_name, m.role ORDER BY u.created_at`, [ctx.organizationId]);
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
    await client.query(`INSERT INTO memberships(user_id, organization_id, role) VALUES ($1,$2,'member') ON CONFLICT DO NOTHING`, [user.rows[0].id, ctx.organizationId]);
    for (const role of parsed.value) {
      await client.query(`INSERT INTO membership_roles(user_id, organization_id, role_code) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [user.rows[0].id, ctx.organizationId, role]);
    }
    await writeAudit(client, { actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "membership.created", entityType: "membership", entityId: user.rows[0].id, after: { userId: user.rows[0].id, roles: parsed.value }, ip: clientIp(req) });
    await writeOutbox(client, { eventType: "MembershipRoleChanged", aggregateType: "membership", aggregateId: user.rows[0].id, organizationId: ctx.organizationId, payload: { roles: parsed.value } });
    await client.query("COMMIT");
    return json(res, 201, { member: { ...user.rows[0], roles: parsed.value } });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

async function memberItem(req, res, ctx, memberId) {
  if (req.method !== "PATCH") return json(res, 405, { error: "method_not_allowed" });
  if (!requirePermission(ctx, res, "members.manage")) return;
  const parsed = parseRoleCodes(req.body?.roles);
  if (parsed.error) return json(res, 400, { error: parsed.error });
  const member = await pool.query(`SELECT user_id FROM memberships WHERE user_id=$1 AND organization_id=$2`, [memberId, ctx.organizationId]);
  if (!member.rows[0]) return json(res, 404, { error: "member_not_found" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await client.query(`SELECT role_code FROM membership_roles WHERE user_id=$1 AND organization_id=$2`, [memberId, ctx.organizationId]);
    await client.query(`DELETE FROM membership_roles WHERE user_id=$1 AND organization_id=$2`, [memberId, ctx.organizationId]);
    for (const role of parsed.value) {
      await client.query(`INSERT INTO membership_roles(user_id, organization_id, role_code) VALUES ($1,$2,$3)`, [memberId, ctx.organizationId, role]);
    }
    await writeAudit(client, { actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "membership.role_changed", entityType: "membership", entityId: memberId, before: { roles: before.rows.map((row) => row.role_code) }, after: { roles: parsed.value }, ip: clientIp(req) });
    await writeOutbox(client, { eventType: "MembershipRoleChanged", aggregateType: "membership", aggregateId: memberId, organizationId: ctx.organizationId, payload: { roles: parsed.value } });
    await client.query("COMMIT");
    return json(res, 200, { memberId, roles: parsed.value });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

async function switchOrg(req, res, session) {
  const organizationId = String(req.body?.organizationId || "");
  const membership = await pool.query(`SELECT role FROM memberships WHERE user_id=$1 AND organization_id=$2`, [session.userId, organizationId]);
  if (!membership.rows[0]) return json(res, 404, { error: "membership_not_found" });
  await pool.query(`UPDATE users SET active_organization_id=$2 WHERE id=$1`, [session.userId, organizationId]);
  setSession(res, { userId: session.userId, organizationId, role: membership.rows[0].role });
  return json(res, 200, { activeOrganizationId: organizationId });
}

module.exports = { handleV2 };
