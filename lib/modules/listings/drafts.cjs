const DRAFT_STATUSES = new Set(["DRAFT", "REVIEW_REQUIRED", "CONFIRMED", "PUBLISHED", "REJECTED"]);

function draftFromAnalysis(analysis, mapping, context) {
  const labelAr = mapping.labelAr || analysis.materialLabelAr || "سكراب";
  const labelEn = mapping.labelEn || analysis.materialLabelEn || "Scrap";
  const gradeAr = mapping.gradeAr || analysis.probableGrade || "";
  const gradeEn = mapping.gradeEn || analysis.probableGrade || analysis.grade || "";
  const sellerKg = Number(context?.estimatedWeightKg);
  const weightKg = Number.isFinite(sellerKg) && sellerKg > 0 ? sellerKg : null;
  return {
    titleAr: gradeAr ? `${labelAr} — ${gradeAr}` : `${labelAr} للبيع`,
    titleEn: gradeEn ? `${labelEn} — ${gradeEn}` : `${labelEn} for sale`,
    descriptionAr: `${analysis.observationsAr || ""}\nتقدير بصري فقط. الوزن غير مؤكد من الصورة. يتطلب تأكيد البائع والفحص.`.trim(),
    descriptionEn: `${analysis.observationsEn || ""}\nVisual estimate only. Weight is not proven from the photo. Seller confirmation and inspection required.`.trim(),
    suggestedTags: [mapping.familyCode, mapping.code, "VISUAL_ESTIMATE"].filter(Boolean),
    conditionText: "used",
    city: context?.city || null,
    weightStatus: weightKg ? "SELLER_PROVIDED" : "NOT_PROVIDED",
    weightKg,
    confidence: mapping.confidence,
  };
}

function parseDraftPatch(body) {
  const next = {};
  if (body.titleAr != null) next.title_ar = String(body.titleAr).trim().slice(0, 120);
  if (body.titleEn != null) next.title_en = String(body.titleEn).trim().slice(0, 120);
  if (body.descriptionAr != null) next.description_ar = String(body.descriptionAr).trim().slice(0, 2000);
  if (body.descriptionEn != null) next.description_en = String(body.descriptionEn).trim().slice(0, 2000);
  if (body.conditionText != null) next.condition_text = String(body.conditionText).trim().slice(0, 80);
  if (body.city != null) next.city = String(body.city).trim().slice(0, 80) || null;
  if (body.weightKg === "" || body.weightKg === null) {
    next.weight_kg = null;
    next.weight_status = "NOT_PROVIDED";
  } else if (body.weightKg != null) {
    const kg = Number(body.weightKg);
    if (!Number.isFinite(kg) || kg <= 0) return { error: "invalid_weight" };
    next.weight_kg = kg;
    next.weight_status = "SELLER_PROVIDED";
  }
  if (body.status && !DRAFT_STATUSES.has(String(body.status))) return { error: "invalid_status" };
  return { value: next };
}

module.exports = { draftFromAnalysis, parseDraftPatch, DRAFT_STATUSES };
