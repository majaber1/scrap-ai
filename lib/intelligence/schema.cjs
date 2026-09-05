const { z } = require("zod");

const INSTRUCTIONS = [
  "You are Scrap AI image intelligence for Saudi recyclable materials.",
  "Analyze only visible evidence in the photo.",
  "Never certify material identity, purity, weight, ownership, safety, or price.",
  "Never invent a Saudi market price or any SAR/kg figure.",
  "If uncertain, lower confidence and use unknown.",
  "All visual purity numbers are estimates only, not laboratory results.",
  "Reply with JSON only.",
].join(" ");

const SCHEMA_HINT = {
  estimateKind: "VISUAL_ESTIMATE",
  labCertifiedPurity: false,
  physicalConfirmationRequired: true,
  materialFamily: "copper|aluminum|ferrous|cables|batteries|ewaste|plastics|mixed|unknown",
  materialType: "copper|aluminum|steel|ewaste|battery|mixed",
  probableMaterial: "string",
  materialLabelAr: "string",
  materialLabelEn: "string",
  probableGrade: "string",
  grade: "high|medium|low|unknown",
  ferrousNonFerrous: "ferrous|non_ferrous|mixed|unknown",
  insulatedVsBare: "insulated|bare|not_applicable|unknown",
  mixedMaterial: false,
  approximateCondition: "string",
  probableReusableVsScrap: "reusable|scrap|mixed|unknown",
  safetyConcerns: [],
  batteryEwasteIndicators: [],
  visibleContamination: [],
  contaminationFlags: [],
  purityEstimatePercent: 0,
  confidence: 0,
  observationsAr: "string",
  observationsEn: "string",
  recommendedInspectionAr: "string",
  recommendedInspectionEn: "string",
  pricingCaveatAr: "string",
  pricingCaveatEn: "string",
};

const analysisSchema = z.object({
  estimateKind: z.literal("VISUAL_ESTIMATE").catch("VISUAL_ESTIMATE"),
  labCertifiedPurity: z.literal(false).catch(false),
  physicalConfirmationRequired: z.boolean().catch(true),
  materialFamily: z.string().min(1).catch("unknown"),
  materialType: z.string().min(1).catch("mixed"),
  probableMaterial: z.string().catch(""),
  materialLabelAr: z.string().min(1).catch("سكراب"),
  materialLabelEn: z.string().min(1).catch("Scrap"),
  probableGrade: z.string().catch("unknown"),
  grade: z.enum(["high", "medium", "low", "unknown"]).catch("unknown"),
  ferrousNonFerrous: z.enum(["ferrous", "non_ferrous", "mixed", "unknown"]).catch("unknown"),
  insulatedVsBare: z.enum(["insulated", "bare", "not_applicable", "unknown"]).catch("unknown"),
  mixedMaterial: z.boolean().catch(false),
  approximateCondition: z.string().catch("unknown"),
  probableReusableVsScrap: z.enum(["reusable", "scrap", "mixed", "unknown"]).catch("unknown"),
  safetyConcerns: z.array(z.string()).catch([]),
  batteryEwasteIndicators: z.array(z.string()).catch([]),
  visibleContamination: z.array(z.string()).catch([]),
  contaminationFlags: z.array(z.string()).catch([]),
  purityEstimatePercent: z.coerce.number().min(0).max(100).catch(0),
  confidence: z.coerce.number().min(0).max(1).catch(0),
  observationsAr: z.string().catch(""),
  observationsEn: z.string().catch(""),
  recommendedInspectionAr: z.string().catch(""),
  recommendedInspectionEn: z.string().catch(""),
  pricingCaveatAr: z.string().catch("تقدير بصري فقط. القيمة النهائية بعد الفحص والوزن."),
  pricingCaveatEn: z.string().catch("Visual estimate only. Final value follows inspection and weighing."),
});

function parseDataUrl(imageDataUrl) {
  const match = String(imageDataUrl || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

function extractJson(text) {
  const raw = String(text || "").trim();
  const block = raw.match(/\{[\s\S]*\}/);
  if (!block) return null;
  try {
    return JSON.parse(block[0]);
  } catch {
    return null;
  }
}

function coerceBooleans(data) {
  if (!data || typeof data !== "object") return data;
  for (const key of ["labCertifiedPurity", "physicalConfirmationRequired", "mixedMaterial"]) {
    if (data[key] === "true") data[key] = true;
    if (data[key] === "false") data[key] = false;
  }
  return data;
}

function validateAnalysis(raw) {
  if (!raw || typeof raw !== "object" || !Object.keys(raw).length) return null;
  const parsed = analysisSchema.safeParse(coerceBooleans(raw) || {});
  if (!parsed.success) return null;
  const data = parsed.data;
  data.estimateKind = "VISUAL_ESTIMATE";
  data.labCertifiedPurity = false;
  data.physicalConfirmationRequired = true;
  if (!data.contaminationFlags.length && data.visibleContamination.length) {
    data.contaminationFlags = data.visibleContamination.slice(0, 10);
  }
  if (!data.visibleContamination.length && data.contaminationFlags.length) {
    data.visibleContamination = data.contaminationFlags.slice(0, 10);
  }
  if (!data.probableMaterial) data.probableMaterial = data.materialLabelEn || data.materialType;
  data.safetyConcerns = data.safetyConcerns.slice(0, 10);
  data.batteryEwasteIndicators = data.batteryEwasteIndicators.slice(0, 10);
  data.visibleContamination = data.visibleContamination.slice(0, 10);
  data.contaminationFlags = data.contaminationFlags.slice(0, 10);
  if (!/تقدير|فحص|وزن/.test(data.pricingCaveatAr)) {
    data.pricingCaveatAr = "تقدير بصري فقط. ليست نقاوة مختبرية. القيمة النهائية بعد الفحص والوزن.";
  }
  if (!/visual|inspect|weigh/i.test(data.pricingCaveatEn)) {
    data.pricingCaveatEn = "Visual estimate only. Not laboratory-certified purity. Final value follows inspection and weighing.";
  }
  return data;
}

function prompt(context) {
  return `${INSTRUCTIONS}\nUser context: ${JSON.stringify(context || {})}\nReturn only JSON matching: ${JSON.stringify(SCHEMA_HINT)}`;
}

module.exports = { INSTRUCTIONS, SCHEMA_HINT, analysisSchema, parseDataUrl, extractJson, validateAnalysis, prompt };
