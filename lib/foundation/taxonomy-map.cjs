const AI_TO_MATERIAL = {
  copper: "COPPER_CABLE",
  aluminum: "ALUMINUM_SCRAP",
  steel: "STEEL_SCRAP",
  ewaste: "E_WASTE_MIXED",
  battery: "LEAD_ACID_BATTERY",
  mixed: "MIXED_SCRAP",
};

function mapVisualEstimateToTaxonomy(analysis) {
  const type = String(analysis?.materialType || analysis?.material_type || "mixed").toLowerCase();
  const code = AI_TO_MATERIAL[type] || "MIXED_SCRAP";
  return {
    candidateMaterialCode: code,
    confirmed: false,
    autoPublish: false,
    estimateKind: analysis?.estimateKind || "VISUAL_ESTIMATE",
  };
}

module.exports = { mapVisualEstimateToTaxonomy, AI_TO_MATERIAL };
