const LEGACY_TO_ROLES = {
  owner: ["ORG_OWNER", "SELLER", "BUYER"],
  admin: ["ORG_ADMIN", "SELLER", "BUYER"],
  seller: ["SELLER"],
  buyer: ["BUYER"],
  factory: ["BUYER"],
  both: ["SELLER", "BUYER"],
};

const ASSIGNABLE_ORG_ROLES = new Set([
  "ORG_OWNER", "ORG_ADMIN", "SELLER", "BUYER", "SITE_MANAGER", "PROCUREMENT",
  "FINANCE", "APPROVER", "LOGISTICS", "WEIGHBRIDGE", "VIEWER", "REQUESTER", "REVIEWER", "AUDITOR",
]);

function legacyRoles(membershipRole) {
  return LEGACY_TO_ROLES[String(membershipRole || "").toLowerCase()] || ["VIEWER"];
}

function parseRoleCodes(value) {
  const list = Array.isArray(value) ? value : [value];
  const roles = [...new Set(list.map((item) => String(item || "").trim().toUpperCase()).filter(Boolean))];
  if (!roles.length) return { error: "roles_required" };
  if (roles.some((role) => !ASSIGNABLE_ORG_ROLES.has(role))) return { error: "invalid_role" };
  if (roles.includes("PLATFORM_ADMIN") || roles.includes("PLATFORM_SUPPORT")) return { error: "platform_role_forbidden" };
  return { value: roles };
}

async function loadPermissionSet(db, userId, organizationId) {
  const result = await db.query(
    `SELECT DISTINCT rp.permission_code
     FROM membership_roles mr
     JOIN role_permissions rp ON rp.role_code = mr.role_code
     JOIN roles r ON r.code = mr.role_code
     WHERE mr.user_id = $1 AND mr.organization_id = $2 AND r.scope <> 'platform'`,
    [userId, organizationId]
  );
  return new Set(result.rows.map((row) => row.permission_code));
}

async function loadOrgRoles(db, userId, organizationId) {
  const result = await db.query(
    `SELECT role_code FROM membership_roles WHERE user_id=$1 AND organization_id=$2`,
    [userId, organizationId]
  );
  return result.rows.map((row) => row.role_code);
}

async function isPlatformAdmin(db, userId) {
  const result = await db.query(
    `SELECT 1 FROM platform_roles pr
     JOIN roles r ON r.code = pr.role_code
     WHERE pr.user_id=$1 AND r.scope='platform' AND pr.role_code='PLATFORM_ADMIN' LIMIT 1`,
    [userId]
  );
  return Boolean(result.rows[0]);
}

async function ensureMembershipRoles(db, userId, organizationId, membershipRole) {
  const roles = legacyRoles(membershipRole);
  for (const role of roles) {
    await db.query(
      `INSERT INTO membership_roles(user_id, organization_id, role_code) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [userId, organizationId, role]
    );
  }
}

module.exports = {
  LEGACY_TO_ROLES,
  ASSIGNABLE_ORG_ROLES,
  legacyRoles,
  parseRoleCodes,
  loadPermissionSet,
  loadOrgRoles,
  isPlatformAdmin,
  ensureMembershipRoles,
};
