function diffFeedback(before, after, mapping) {
  const fields = [
    ["title_ar", "titleAr"],
    ["title_en", "titleEn"],
    ["description_ar", "descriptionAr"],
    ["city", "city"],
    ["weight_kg", "weightKg"],
    ["condition_text", "conditionText"],
  ];
  const events = [];
  for (const [dbKey, name] of fields) {
    const aiValue = before[dbKey] == null ? "" : String(before[dbKey]);
    const humanValue = after[dbKey] == null ? "" : String(after[dbKey]);
    if (aiValue !== humanValue) {
      events.push({ fieldName: name, aiValue, humanValue, source: "SELLER" });
    }
  }
  if (mapping?.labelEn && after.title_en && mapping.labelEn !== after.title_en) {
    events.push({ fieldName: "material", aiValue: mapping.labelEn, humanValue: after.title_en, source: "SELLER" });
  }
  return events;
}

module.exports = { diffFeedback };
