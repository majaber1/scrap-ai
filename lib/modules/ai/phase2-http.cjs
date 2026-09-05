const { pool, json } = require("../../server.cjs");
const { requirePermission } = require("../../foundation/authz.cjs");
const { writeAudit, clientIp } = require("../../foundation/audit.cjs");
const { writeOutbox } = require("../../foundation/outbox.cjs");
const { normalizeMaterial } = require("../../materials.cjs");
const { resolveMaterial } = require("../materials/mapper.cjs");
const { buildAssistant } = require("./assistant.cjs");
const { draftFromAnalysis, parseDraftPatch } = require("../listings/drafts.cjs");
const { diffFeedback } = require("../feedback/events.cjs");

function queryValue(req, key) {
  const direct = req.query?.[key];
  if (direct != null && !Array.isArray(direct)) return String(direct);
  if (Array.isArray(direct) && direct[0]) return String(direct[0]);
  const search = String(req.url || "").split("?")[1] || "";
  return new URLSearchParams(search).get(key) || "";
}

async function handlePhase2(req, res, ctx, parts) {
  if (parts[0] === "ai" && parts[1] === "analyses" && req.method === "GET") return listAnalyses(req, res, ctx);
  if (parts[0] === "ai" && parts[1] === "assistant" && req.method === "GET") return assistant(req, res, ctx);
  if (parts[0] === "ai" && parts[1] === "drafts" && parts[2] && parts[3] === "confirm" && req.method === "POST") return confirmDraft(req, res, ctx, parts[2]);
  if (parts[0] === "ai" && parts[1] === "drafts" && parts[2] && parts[3] === "reject" && req.method === "POST") return rejectDraft(req, res, ctx, parts[2]);
  if (parts[0] === "ai" && parts[1] === "drafts" && parts[2] && req.method === "GET") return getDraft(req, res, ctx, parts[2]);
  if (parts[0] === "ai" && parts[1] === "drafts" && parts[2] && req.method === "POST" && !parts[3]) {
    const action = String(req.body?.action || queryValue(req, "action") || "");
    if (action === "confirm") return confirmDraft(req, res, ctx, parts[2]);
    if (action === "reject") return rejectDraft(req, res, ctx, parts[2]);
    return patchDraft(req, res, ctx, parts[2]);
  }
  if (parts[0] === "ai" && parts[1] === "drafts" && parts[2] && req.method === "PATCH") return patchDraft(req, res, ctx, parts[2]);
  if (parts[0] === "ai" && parts[1] === "drafts" && req.method === "GET") return listDrafts(req, res, ctx);
  if (parts[0] === "ai" && parts[1] === "drafts" && req.method === "POST") return createDraft(req, res, ctx);
  return false;
}

async function listAnalyses(req, res, ctx) {
  if (!requirePermission(ctx, res, "analysis.read")) return;
  const limit = Math.min(20, Math.max(1, Number(queryValue(req, "limit")) || 10));
  const result = await pool.query(
    `SELECT id, created_at, provider, model, latency_ms, fallback_used, estimate_kind, result
     FROM ai_analyses WHERE organization_id=$1 ORDER BY created_at DESC LIMIT $2`,
    [ctx.organizationId, limit]
  );
  return json(res, 200, {
    analyses: result.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      provider: row.provider,
      model: row.model,
      latencyMs: row.latency_ms,
      fallbackUsed: row.fallback_used,
      estimateKind: row.estimate_kind || "VISUAL_ESTIMATE",
      materialLabelEn: row.result?.materialLabelEn || null,
      materialLabelAr: row.result?.materialLabelAr || null,
      confidence: row.result?.confidence ?? null,
    })),
  });
}

async function loadOrgAnalysis(ctx, analysisId) {
  const result = await pool.query(
    `SELECT id, organization_id, result, context, provider, model, latency_ms, fallback_used, estimate_kind
     FROM ai_analyses WHERE id=$1 AND organization_id=$2`,
    [analysisId, ctx.organizationId]
  );
  return result.rows[0] || null;
}

async function assistant(req, res, ctx) {
  if (!requirePermission(ctx, res, "analysis.read")) return;
  const analysisId = String(queryValue(req, "analysisId") || req.body?.analysisId || "");
  const analysis = await loadOrgAnalysis(ctx, analysisId);
  if (!analysis) return json(res, 404, { error: "analysis_not_found" });
  const mapping = await resolveMaterial(pool, analysis.result);
  const draft = await pool.query(`SELECT * FROM ai_listing_drafts WHERE analysis_id=$1 AND organization_id=$2 ORDER BY created_at DESC LIMIT 1`, [analysisId, ctx.organizationId]);
  return json(res, 200, { assistant: buildAssistant(analysis.result, mapping, draft.rows[0] || null), mapping, analysisId });
}

async function listDrafts(req, res, ctx) {
  if (!requirePermission(ctx, res, "listing.read")) return;
  const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 20));
  const result = await pool.query(
    `SELECT id, analysis_id, material_id, title_ar, title_en, confidence, status, weight_status, weight_kg, city, listing_id, created_at, updated_at
     FROM ai_listing_drafts WHERE organization_id=$1 ORDER BY created_at DESC LIMIT $2`,
    [ctx.organizationId, limit]
  );
  return json(res, 200, { drafts: result.rows });
}

async function createDraft(req, res, ctx) {
  if (!requirePermission(ctx, res, "listing.create")) return;
  const analysisId = String(req.body?.analysisId || "");
  let analysis = null;
  if (analysisId) {
    analysis = await loadOrgAnalysis(ctx, analysisId);
    if (!analysis) return json(res, 404, { error: "analysis_not_found" });
  } else {
    const latest = await pool.query(
      `SELECT id, organization_id, result, context, provider, model, latency_ms, fallback_used, estimate_kind
       FROM ai_analyses WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [ctx.organizationId]
    );
    analysis = latest.rows[0] || null;
  }
  if (!analysis) return json(res, 404, { error: "analysis_not_found" });
  const mapping = await resolveMaterial(pool, analysis.result);
  const built = draftFromAnalysis(analysis.result, mapping, analysis.context || {});
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = await client.query(
      `INSERT INTO ai_listing_drafts(
        organization_id, user_id, analysis_id, material_id, grade_id, title_ar, title_en, description_ar, description_en,
        suggested_tags, condition_text, city, weight_status, weight_kg, confidence, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'REVIEW_REQUIRED')
      RETURNING *`,
      [
        ctx.organizationId, ctx.userId, analysis.id, mapping.materialId, mapping.gradeId,
        built.titleAr, built.titleEn, built.descriptionAr, built.descriptionEn,
        JSON.stringify(built.suggestedTags), built.conditionText, built.city,
        built.weightStatus, built.weightKg, built.confidence,
      ]
    );
    await client.query(
      `INSERT INTO material_mapping_events(organization_id, analysis_id, draft_id, ai_label, mapped_material_id, mapped_grade_id, confidence)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [ctx.organizationId, analysis.id, created.rows[0].id, mapping.labelEn || mapping.code, mapping.materialId, mapping.gradeId, mapping.confidence]
    );
    await writeAudit(client, {
      actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "listing.draft.created",
      entityType: "ai_listing_draft", entityId: created.rows[0].id, after: { status: "REVIEW_REQUIRED", autoPublish: false }, ip: clientIp(req),
    });
    await writeOutbox(client, {
      eventType: "ListingDraftCreated", aggregateType: "ai_listing_draft", aggregateId: created.rows[0].id,
      organizationId: ctx.organizationId, payload: { analysisId: analysis.id, autoPublish: false },
    });
    await client.query("COMMIT");
    console.error("draft_generated", { organizationId: ctx.organizationId, draftId: created.rows[0].id, provider: analysis.provider, model: analysis.model, confidence: mapping.confidence });
    return json(res, 201, {
      draft: created.rows[0],
      mapping,
      assistant: buildAssistant(analysis.result, mapping, created.rows[0]),
      autoPublish: false,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getDraft(req, res, ctx, id) {
  if (!requirePermission(ctx, res, "listing.read")) return;
  const draft = await pool.query(`SELECT * FROM ai_listing_drafts WHERE id=$1 AND organization_id=$2`, [id, ctx.organizationId]);
  if (!draft.rows[0]) return json(res, 404, { error: "draft_not_found" });
  const analysis = draft.rows[0].analysis_id ? await loadOrgAnalysis(ctx, draft.rows[0].analysis_id) : null;
  const mapping = analysis ? await resolveMaterial(pool, analysis.result) : null;
  return json(res, 200, {
    draft: draft.rows[0],
    assistant: analysis ? buildAssistant(analysis.result, mapping, draft.rows[0]) : null,
    mapping,
    autoPublish: false,
  });
}

async function patchDraft(req, res, ctx, id) {
  if (!requirePermission(ctx, res, "listing.manage_own")) return;
  const parsed = parseDraftPatch(req.body || {});
  if (parsed.error) return json(res, 400, { error: parsed.error });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await client.query(`SELECT * FROM ai_listing_drafts WHERE id=$1 AND organization_id=$2 FOR UPDATE`, [id, ctx.organizationId]);
    if (!before.rows[0]) { await client.query("ROLLBACK"); return json(res, 404, { error: "draft_not_found" }); }
    if (["PUBLISHED", "REJECTED"].includes(before.rows[0].status)) { await client.query("ROLLBACK"); return json(res, 409, { error: "draft_locked" }); }
    const patch = parsed.value;
    const next = { ...before.rows[0], ...patch };
    const updated = await client.query(
      `UPDATE ai_listing_drafts SET
        title_ar=$3, title_en=$4, description_ar=$5, description_en=$6, condition_text=$7, city=$8,
        weight_kg=$9, weight_status=$10, status='REVIEW_REQUIRED', updated_at=now()
       WHERE id=$1 AND organization_id=$2 RETURNING *`,
      [
        id, ctx.organizationId,
        next.title_ar, next.title_en, next.description_ar, next.description_en, next.condition_text, next.city,
        next.weight_kg, next.weight_status || "NOT_PROVIDED",
      ]
    );
    const events = diffFeedback(before.rows[0], updated.rows[0]);
    for (const event of events) {
      await client.query(
        `INSERT INTO ai_feedback_events(organization_id, analysis_id, draft_id, field_name, ai_value, human_value, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [ctx.organizationId, before.rows[0].analysis_id, id, event.fieldName, event.aiValue, event.humanValue, event.source]
      );
    }
    await writeAudit(client, {
      actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "listing.draft.updated",
      entityType: "ai_listing_draft", entityId: id, before: { status: before.rows[0].status }, after: { status: updated.rows[0].status }, ip: clientIp(req),
    });
    await client.query("COMMIT");
    return json(res, 200, { draft: updated.rows[0], feedbackEvents: events.length });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function rejectDraft(req, res, ctx, id) {
  if (!requirePermission(ctx, res, "listing.manage_own")) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await client.query(
      `SELECT * FROM ai_listing_drafts WHERE id=$1 AND organization_id=$2 FOR UPDATE`,
      [id, ctx.organizationId]
    );
    if (!before.rows[0] || before.rows[0].status === "PUBLISHED") {
      await client.query("ROLLBACK");
      return json(res, 404, { error: "draft_not_found" });
    }
    const result = await client.query(
      `UPDATE ai_listing_drafts SET status='REJECTED', updated_at=now()
       WHERE id=$1 AND organization_id=$2 RETURNING *`,
      [id, ctx.organizationId]
    );
    await client.query(
      `INSERT INTO ai_feedback_events(organization_id, analysis_id, draft_id, field_name, ai_value, human_value, source)
       VALUES ($1,$2,$3,'status',$4,'REJECTED','SELLER')`,
      [ctx.organizationId, before.rows[0].analysis_id, id, before.rows[0].status]
    );
    await writeAudit(client, {
      actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "listing.draft.rejected",
      entityType: "ai_listing_draft", entityId: id, after: { status: "REJECTED" }, ip: clientIp(req),
    });
    await writeOutbox(client, {
      eventType: "ListingDraftRejected", aggregateType: "ai_listing_draft", aggregateId: id,
      organizationId: ctx.organizationId, payload: { status: "REJECTED" },
    });
    await client.query("COMMIT");
    return json(res, 200, { draft: result.rows[0], listing: null });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function confirmDraft(req, res, ctx, id) {
  if (!requirePermission(ctx, res, "listing.create")) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const draft = await client.query(`SELECT * FROM ai_listing_drafts WHERE id=$1 AND organization_id=$2 FOR UPDATE`, [id, ctx.organizationId]);
    if (!draft.rows[0]) { await client.query("ROLLBACK"); return json(res, 404, { error: "draft_not_found" }); }
    if (draft.rows[0].status === "PUBLISHED") { await client.query("ROLLBACK"); return json(res, 409, { error: "already_published" }); }
    if (draft.rows[0].status === "REJECTED") { await client.query("ROLLBACK"); return json(res, 409, { error: "draft_rejected" }); }
    let city = String(draft.rows[0].city || "").trim();
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, "city")) {
      city = String(req.body.city || "").trim();
    }
    if (city.length < 2) { await client.query("ROLLBACK"); return json(res, 400, { error: "city_required" }); }
    const title = draft.rows[0].title_ar || draft.rows[0].title_en;
    if (!title || title.length < 2) { await client.query("ROLLBACK"); return json(res, 400, { error: "title_required" }); }
    const materialCode = await client.query(`SELECT code FROM materials WHERE id=$1`, [draft.rows[0].material_id]);
    const listing = await client.query(
      `INSERT INTO scrap_listings(seller_org_id, title, material, quantity, unit, city, indicative_value)
       VALUES ($1,$2,$3,$4,'kg',$5,NULL) RETURNING *`,
      [ctx.organizationId, title, normalizeMaterial(materialCode.rows[0]?.code || title), draft.rows[0].weight_kg, city]
    );
    const published = await client.query(
      `UPDATE ai_listing_drafts SET status='PUBLISHED', listing_id=$3, city=$4, updated_at=now() WHERE id=$1 AND organization_id=$2 RETURNING *`,
      [id, ctx.organizationId, listing.rows[0].id, city]
    );
    await writeAudit(client, {
      actorUserId: ctx.userId, organizationId: ctx.organizationId, action: "listing.draft.confirmed",
      entityType: "scrap_listing", entityId: listing.rows[0].id, after: { draftId: id, listingId: listing.rows[0].id }, ip: clientIp(req),
    });
    await writeOutbox(client, {
      eventType: "ListingPublishedFromDraft", aggregateType: "scrap_listing", aggregateId: listing.rows[0].id,
      organizationId: ctx.organizationId, payload: { draftId: id },
    });
    await client.query("COMMIT");
    console.error("draft_confirmed", { organizationId: ctx.organizationId, listingId: listing.rows[0].id, draftId: id });
    return json(res, 201, { draft: published.rows[0], listing: listing.rows[0], autoPublish: false });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { handlePhase2 };
