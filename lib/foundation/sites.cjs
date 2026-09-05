const SITE_TYPES = new Set(["FACTORY", "WAREHOUSE", "OFFICE", "PROJECT_SITE", "YARD", "FACILITY", "OTHER"]);

function parseSiteInput(body) {
  const name = String(body?.name || "").trim().slice(0, 120);
  const siteType = String(body?.siteType || body?.site_type || "OTHER").trim().toUpperCase();
  const city = String(body?.city || "").trim().slice(0, 80) || null;
  const region = String(body?.region || "").trim().slice(0, 80) || null;
  const addressText = String(body?.addressText || body?.address_text || "").trim().slice(0, 240) || null;
  const latitude = body?.latitude === "" || body?.latitude == null ? null : Number(body.latitude);
  const longitude = body?.longitude === "" || body?.longitude == null ? null : Number(body.longitude);
  const active = body?.active === false ? false : true;
  if (name.length < 2) return { error: "name_required" };
  if (!SITE_TYPES.has(siteType)) return { error: "invalid_site_type" };
  if (latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) return { error: "invalid_latitude" };
  if (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) return { error: "invalid_longitude" };
  if ((latitude == null) !== (longitude == null)) return { error: "coordinates_must_be_paired" };
  return { value: { name, siteType, city, region, addressText, latitude, longitude, active } };
}

module.exports = { SITE_TYPES, parseSiteInput };
