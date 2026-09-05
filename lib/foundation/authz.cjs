const { requireSession, json } = require("../server.cjs");
const { loadPermissionSet, loadOrgRoles, isPlatformAdmin } = require("./rbac.cjs");

async function requireUser(req, res) {
  return requireSession(req, res);
}

async function loadAuthz(db, session) {
  const organizationId = session.organizationId;
  const userId = session.userId;
  const [permissions, roles, platformAdmin] = await Promise.all([
    loadPermissionSet(db, userId, organizationId),
    loadOrgRoles(db, userId, organizationId),
    isPlatformAdmin(db, userId),
  ]);
  return {
    userId,
    organizationId,
    legacyRole: session.role,
    roles,
    permissions,
    platformAdmin,
  };
}

function requireOrganization(ctx, res) {
  if (!ctx?.organizationId) {
    json(res, 401, { error: "authentication_required" });
    return false;
  }
  return true;
}

function requirePermission(ctx, res, permission) {
  if (!ctx.permissions.has(permission)) {
    console.error("tenant_authorization_failed", { permission, organizationId: ctx.organizationId, userId: ctx.userId });
    json(res, 403, { error: "forbidden", permission });
    return false;
  }
  return true;
}

function requirePlatformRole(ctx, res) {
  if (!ctx.platformAdmin) {
    json(res, 403, { error: "platform_admin_required" });
    return false;
  }
  return true;
}

function sameTenant(ctx, organizationId) {
  return ctx.organizationId && String(ctx.organizationId) === String(organizationId);
}

module.exports = {
  requireUser,
  loadAuthz,
  requireOrganization,
  requirePermission,
  requirePlatformRole,
  sameTenant,
};
