const { randomUUID } = require("crypto");
const { pool, requireSession, json } = require("../lib/server.cjs");
const { ensureOperations } = require("../lib/operations.cjs");
const { blobConfigured, r2Configured, storageConfigured, storageRequired, keys, sign } = require("../lib/storage.cjs");

const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const extensions = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function parseDataUrl(raw) {
  const match = String(raw || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || !allowed.has(match[1])) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 2800000) return null;
  return { type: match[1], buffer };
}

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
  if (!storageConfigured()) return json(res, 503, { error: "object_storage_not_configured", required: storageRequired() });
  try {
    await ensureOperations(pool);
    const body = req.body || {};

    if (body.action === "store") {
      const parsed = parseDataUrl(body.imageDataUrl);
      if (!parsed) return json(res, 400, { error: "invalid_image" });
      const category = String(body.category || "listing").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "listing";
      const pathname = `organizations/${session.organizationId}/${category}/${randomUUID()}.${extensions[parsed.type]}`;
      if (blobConfigured()) {
        const { put } = require("@vercel/blob");
        const stored = await put(pathname, parsed.buffer, { access: "public", contentType: parsed.type, addRandomSuffix: false });
        await pool.query(
          `INSERT INTO organization_documents(organization_id,category,object_key,file_name,content_type,size_bytes,entity_type,entity_id)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT(object_key) DO UPDATE SET status='uploaded'`,
          [session.organizationId, category, stored.url, body.fileName || "listing.jpg", parsed.type, parsed.buffer.length, body.entityType || "scrap_listing", body.entityId || null]
        );
        return json(res, 201, { url: stored.url, objectKey: stored.url, provider: "vercel-blob" });
      }
      return json(res, 503, { error: "object_storage_not_configured", required: keys });
    }

    if (!r2Configured()) return json(res, 503, { error: "object_storage_not_configured", required: storageRequired() });
    if (body.action === "presign") {
      const size = Number(body.sizeBytes);
      const type = String(body.contentType || "");
      if (!allowed.has(type) || !Number.isInteger(size) || size < 1 || size > 10485760) {
        return json(res, 400, { error: "invalid_file", allowed: [...allowed], maxBytes: 10485760 });
      }
      const category = String(body.category || "other").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "other";
      const key = `organizations/${session.organizationId}/${category}/${randomUUID()}.${extensions[type]}`;
      return json(res, 200, {
        uploadUrl: sign(key, "PUT", 600),
        objectKey: key,
        expiresIn: 600,
        method: "PUT",
        headers: { "Content-Type": type },
      });
    }
    if (body.action === "complete") {
      const key = String(body.objectKey || "");
      if (!key.startsWith(`organizations/${session.organizationId}/`)) return json(res, 400, { error: "invalid_object_key" });
      const saved = await pool.query(
        `INSERT INTO organization_documents(organization_id,category,object_key,file_name,content_type,size_bytes,entity_type,entity_id)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT(object_key) DO UPDATE SET status='uploaded'
         RETURNING *`,
        [session.organizationId, body.category || "other", key, body.fileName, body.contentType, body.sizeBytes, body.entityType || null, body.entityId || null]
      );
      return json(res, 201, { document: saved.rows[0] });
    }
    return json(res, 400, { error: "invalid_action" });
  } catch (error) {
    console.error("upload_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
