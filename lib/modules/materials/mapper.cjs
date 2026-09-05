const { mapVisualEstimateToTaxonomy } = require("../../foundation/taxonomy-map.cjs");

function hintsFromAnalysis(analysis) {
  return [...new Set([
    analysis?.materialLabelEn,
    analysis?.materialLabelAr,
    analysis?.materialType,
    analysis?.probableGrade,
    analysis?.grade,
  ].map((item) => String(item || "").trim()).filter((item) => item.length >= 2))];
}

async function resolveMaterial(db, analysis) {
  const fallback = mapVisualEstimateToTaxonomy(analysis);
  const hints = hintsFromAnalysis(analysis);
  for (const hint of hints) {
    const alias = await db.query(
      `SELECT m.id, m.code, m.label_ar, m.label_en, f.code family_code, g.id grade_id, g.label_en grade_en, g.label_ar grade_ar
       FROM material_aliases a
       JOIN materials m ON m.id = a.material_id
       JOIN material_families f ON f.id = m.family_id
       LEFT JOIN material_grades g ON g.material_id = m.id AND g.active = true
       WHERE lower(a.alias) = lower($1)
       LIMIT 1`,
      [hint]
    );
    if (alias.rows[0]) {
      return {
        materialId: alias.rows[0].id,
        gradeId: alias.rows[0].grade_id || null,
        code: alias.rows[0].code,
        familyCode: alias.rows[0].family_code,
        labelAr: alias.rows[0].label_ar,
        labelEn: alias.rows[0].label_en,
        gradeAr: alias.rows[0].grade_ar || null,
        gradeEn: alias.rows[0].grade_en || null,
        confidence: Math.min(1, Number(analysis?.confidence) || 0.5),
        source: "alias",
        autoPublish: false,
        confirmed: false,
      };
    }
  }
  const byCode = await db.query(
    `SELECT m.id, m.code, m.label_ar, m.label_en, f.code family_code, g.id grade_id, g.label_en grade_en, g.label_ar grade_ar
     FROM materials m
     JOIN material_families f ON f.id = m.family_id
     LEFT JOIN material_grades g ON g.material_id = m.id AND g.active = true
     WHERE m.code = $1
     LIMIT 1`,
    [fallback.candidateMaterialCode]
  );
  const row = byCode.rows[0];
  return {
    materialId: row?.id || null,
    gradeId: row?.grade_id || null,
    code: row?.code || fallback.candidateMaterialCode,
    familyCode: row?.family_code || null,
    labelAr: row?.label_ar || String(analysis?.materialLabelAr || ""),
    labelEn: row?.label_en || String(analysis?.materialLabelEn || ""),
    gradeAr: row?.grade_ar || null,
    gradeEn: row?.grade_en || String(analysis?.probableGrade || analysis?.grade || "") || null,
    confidence: Math.min(0.7, Number(analysis?.confidence) || 0.4),
    source: "visual_type",
    autoPublish: false,
    confirmed: false,
  };
}

module.exports = { resolveMaterial, hintsFromAnalysis };
