function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded.slice(0, 64) || String(req.headers["x-real-ip"] || "").slice(0, 64) || null;
}

function sanitizeState(value) {
  if (value == null) return null;
  const json = JSON.parse(JSON.stringify(value));
  if (json && typeof json === "object") {
    delete json.password;
    delete json.password_hash;
    delete json.token;
    delete json.session;
    delete json.cookie;
  }
  return json;
}

async function writeAudit(db, event) {
  await db.query(
    `INSERT INTO audit_events(
      actor_user_id, organization_id, action, entity_type, entity_id, request_id, before_state, after_state, metadata, ip_address
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      event.actorUserId || null,
      event.organizationId || null,
      event.action,
      event.entityType,
      event.entityId || null,
      event.requestId || null,
      event.before ? sanitizeState(event.before) : null,
      event.after ? sanitizeState(event.after) : null,
      JSON.stringify(sanitizeState(event.metadata || {}) || {}),
      event.ip || null,
    ]
  );
}

module.exports = { writeAudit, sanitizeState, clientIp };
