function roundPct(confidence) {
  const n = Number(confidence);
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(1, Math.max(0, n)) * 100);
}

function buildAssistant(analysis, mapping, draft) {
  const confidence = roundPct(analysis?.confidence ?? mapping?.confidence ?? draft?.confidence);
  const material = mapping?.labelAr || analysis?.materialLabelAr || mapping?.labelEn || analysis?.materialLabelEn || "غير محدد";
  const materialEn = mapping?.labelEn || analysis?.materialLabelEn || material;
  const observations = analysis?.observationsAr || analysis?.observationsEn || "";
  const weightStatus = draft?.weight_status || draft?.weightStatus || "NOT_PROVIDED";
  const needsWeight = weightStatus === "NOT_PROVIDED";
  const messages = [
    {
      role: "assistant",
      ar: `تحليل بصري (ليس فحص مختبر).\nالمادة المرشحة: ${material}\nالثقة: ${confidence == null ? "غير متاحة" : `${confidence}%`}\nالملاحظات: ${observations || "—"}\nالوزن: ${needsWeight ? "غير متوفر — الصورة لا تثبت الوزن" : `${draft.weight_kg || draft.weightKg} كجم (إدخال البائع)`}`,
      en: `Visual estimate (not a lab test).\nCandidate material: ${materialEn}\nConfidence: ${confidence == null ? "unavailable" : `${confidence}%`}\nObservations: ${observations || "—"}\nWeight: ${needsWeight ? "not provided — an image cannot prove weight" : `${draft.weight_kg || draft.weightKg} kg (seller-provided)`}`,
    },
  ];
  if (needsWeight) {
    messages.push({
      role: "assistant",
      ar: "يرجى إدخال الوزن التقريبي إن عرفته. إن لم تعرفه اتركه فارغاً — لن نخترع وزناً.",
      en: "Please provide an approximate weight if you know it. If not, leave it empty — we will not invent weight.",
    });
  }
  messages.push({
    role: "assistant",
    ar: "جهّزت مسودة بيع للمراجعة. أكّد أو عدّل أو ارفض قبل النشر. الذكاء الاصطناعي ليس مصدر الحقيقة.",
    en: "A selling draft is ready for review. Confirm, edit, or reject before publishing. AI is not the source of truth.",
  });
  return {
    estimateKind: analysis?.estimateKind || "VISUAL_ESTIMATE",
    labCertifiedPurity: false,
    physicalConfirmationRequired: true,
    autoPublish: false,
    messages,
  };
}

module.exports = { buildAssistant, roundPct };
