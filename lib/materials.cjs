const CANONICAL = new Set(["mixed", "copper", "aluminum", "steel", "ewaste", "battery"]);

function normalizeMaterial(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (CANONICAL.has(raw)) return raw;
  if (/copper|كابل|نحاس/.test(raw)) return "copper";
  if (/alumin|ألمونيوم|المنيوم|ألمنيوم/.test(raw)) return "aluminum";
  if (/steel|iron|حديد|فولاذ/.test(raw)) return "steel";
  if (/e-?waste|electronic|إلكتر/.test(raw)) return "ewaste";
  if (/batter|بطار/.test(raw)) return "battery";
  return "mixed";
}

module.exports = { CANONICAL, normalizeMaterial };
