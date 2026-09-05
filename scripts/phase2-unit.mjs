import { draftFromAnalysis, parseDraftPatch } from "../lib/modules/listings/drafts.cjs";
import { buildAssistant } from "../lib/modules/ai/assistant.cjs";
import { diffFeedback } from "../lib/modules/feedback/events.cjs";
import { navigationForSegment } from "../lib/foundation/segments.cjs";

function expect(value, message) {
  if (!value) throw new Error(message);
}

expect(navigationForSegment("INDIVIDUAL").includes("sell"), "individual sell nav");
expect(navigationForSegment("COMPANY_FACTORY").includes("intelligence"), "company intelligence nav");
expect(!navigationForSegment("GOVERNMENT").includes("intelligence"), "government has no waste intelligence module");

const mapping = { labelAr: "كابل نحاس", labelEn: "Copper Cable", familyCode: "COPPER", code: "COPPER_CABLE", confidence: 0.89, autoPublish: false };
const analysis = { materialLabelAr: "كابل نحاس", materialLabelEn: "Copper Cable", observationsAr: "عزل ظاهر", observationsEn: "Insulation visible", confidence: 0.89, estimateKind: "VISUAL_ESTIMATE" };
const draft = draftFromAnalysis(analysis, mapping, {});
expect(draft.weightStatus === "NOT_PROVIDED" && draft.weightKg == null, "image must not invent weight");
expect(draft.confidence === 0.89, "draft confidence");
const fromSeller = draftFromAnalysis(analysis, mapping, { estimatedWeightKg: 12 });
expect(fromSeller.weightStatus === "SELLER_PROVIDED" && fromSeller.weightKg === 12, "seller-provided weight allowed");

const assistant = buildAssistant(analysis, mapping, { weight_status: "NOT_PROVIDED" });
expect(assistant.autoPublish === false, "assistant never auto-publishes");
expect(assistant.labCertifiedPurity === false, "no certified purity");
expect(assistant.messages.some((m) => /weight/i.test(m.en)), "assistant asks for weight");

expect(parseDraftPatch({ weightKg: -1 }).error === "invalid_weight", "reject invalid weight");
expect(parseDraftPatch({ titleEn: "Insulated Copper Cable" }).value.title_en === "Insulated Copper Cable", "seller edit");

const events = diffFeedback({ title_en: "Copper Cable", title_ar: "كابل", city: null, weight_kg: null, description_ar: "a", condition_text: "used" }, { title_en: "Insulated Copper Cable", title_ar: "كابل", city: "Riyadh", weight_kg: 10, description_ar: "a", condition_text: "used" });
expect(events.some((e) => e.fieldName === "titleEn" && e.humanValue === "Insulated Copper Cable"), "feedback stores seller correction");
expect(events.every((e) => e.source === "SELLER"), "feedback source");

console.log("Phase 2A Slice 1 unit tests: PASS");
