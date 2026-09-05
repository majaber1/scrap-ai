const { createHash } = require("crypto");
const { pool, requireSession, json } = require("../lib/server.cjs");
const { ensureOperations } = require("../lib/operations.cjs");
const { analyzeScrapImage, aiStatus } = require("../lib/ai.cjs");
const { loadAuthz, requirePermission } = require("../lib/foundation/authz.cjs");

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 2800000;

async function recordEvents(orgId, userId, analysisId, events, fallbackUsed) {
  for (const event of events || []) {
    try {
    await pool.query(
      `INSERT INTO ai_provider_events(
        organization_id,user_id,analysis_id,provider,model,status,ok,fallback_used,latency_ms,error_class,error_message,prompt_tokens,completion_tokens
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        orgId,
        userId,
        analysisId,
        event.provider,
        event.model,
        event.status || "failed",
        Boolean(event.ok),
        Boolean(fallbackUsed),
        event.latencyMs,
        event.errorClass,
        event.errorMessage ? String(event.errorMessage).slice(0, 500) : null,
        event.promptTokens,
        event.completionTokens,
      ]
    );
    } catch (error) {
      console.error("ai_provider_event_insert_failed", error);
    }
  }
}

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  const ai = await Promise.resolve(aiStatus());
  try {
    await ensureOperations(pool);
    const ctx = await loadAuthz(pool, session);
    if (req.method === "GET") {
      if (!requirePermission(ctx, res, "analysis.read")) return;
      const rows = await pool.query(
        `SELECT id, created_at, provider, model, fallback_used, estimate_kind, latency_ms, result
         FROM ai_analyses
         WHERE organization_id=$1
         ORDER BY created_at DESC
         LIMIT 20`,
        [session.organizationId]
      );
      return json(res, 200, {
        analyses: rows.rows.map((row) => ({
          id: row.id,
          createdAt: row.created_at,
          provider: row.provider,
          model: row.model,
          fallbackUsed: row.fallback_used,
          estimateKind: row.estimate_kind || "VISUAL_ESTIMATE",
          latencyMs: row.latency_ms,
          result: row.result,
        })),
      });
    }
    if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" });
    if (!requirePermission(ctx, res, "analysis.create")) return;
    if (!ai.configured) return json(res, 503, { error: "ai_not_configured", required: ai.required });
    const recent = await pool.query(
      "SELECT count(*)::int count FROM ai_analyses WHERE organization_id=$1 AND created_at>now()-interval '1 hour'",
      [session.organizationId]
    );
    if (recent.rows[0].count >= 20) return json(res, 429, { error: "ai_hourly_limit_reached" });
    const raw = String(req.body?.imageDataUrl || "");
    const match = raw.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match || !allowed.has(match[1])) return json(res, 400, { error: "invalid_image", allowed: [...allowed] });
    const image = Buffer.from(match[2], "base64");
    if (!image.length || image.length > maxBytes) return json(res, 400, { error: "image_too_large", maxBytes });
    const context = {
      city: String(req.body?.city || "").slice(0, 80),
      estimatedWeightKg: Number(req.body?.estimatedWeightKg) || null,
      notes: String(req.body?.notes || "").slice(0, 500),
    };
    const result = await analyzeScrapImage({ imageDataUrl: raw, context });
    if (!result?.data) {
      await recordEvents(session.organizationId, session.userId, null, result?.events, Boolean(result?.fallbackUsed));
      return json(res, 502, { error: "ai_analysis_failed", events: (result?.events || []).map((e) => ({ provider: e.provider, errorClass: e.errorClass })) });
    }
    const sha = createHash("sha256").update(image).digest("hex");
    const saved = await pool.query(
      `INSERT INTO ai_analyses(
        organization_id,user_id,image_sha256,mime_type,model,response_id,context,result,provider,latency_ms,fallback_used,estimate_kind
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id,created_at`,
      [
        session.organizationId,
        session.userId,
        sha,
        match[1],
        result.model,
        result.responseId || null,
        JSON.stringify(context),
        JSON.stringify(result.data),
        result.provider,
        result.latencyMs || null,
        Boolean(result.fallbackUsed),
        "VISUAL_ESTIMATE",
      ]
    );
    await recordEvents(session.organizationId, session.userId, saved.rows[0].id, result.events, result.fallbackUsed);
    return json(res, 200, {
      analysis: { id: saved.rows[0].id, createdAt: saved.rows[0].created_at, ...result.data },
      model: result.model,
      provider: result.provider,
      fallbackUsed: Boolean(result.fallbackUsed),
      latencyMs: result.latencyMs || null,
      notice: "visual_estimate_requires_physical_inspection",
    });
  } catch (error) {
    console.error("ai_analyze_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
