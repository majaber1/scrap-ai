const SEGMENTS = new Set(["UNKNOWN", "INDIVIDUAL", "COMPANY_FACTORY", "GOVERNMENT"]);

function parseCustomerSegment(value) {
  const segment = String(value || "").trim().toUpperCase();
  if (SEGMENTS.has(segment)) return segment;
  return null;
}

function isConfirmableSegment(value) {
  return value === "INDIVIDUAL" || value === "COMPANY_FACTORY" || value === "GOVERNMENT";
}

function navigationForSegment(segment) {
  if (segment === "INDIVIDUAL") {
    return ["overview", "analyze", "activity", "account"];
  }
  if (segment === "COMPANY_FACTORY") {
    return ["overview", "sites", "analyze", "market", "team", "account"];
  }
  if (segment === "GOVERNMENT") {
    return ["overview", "sites", "team", "account"];
  }
  return ["overview", "analyze", "account"];
}

function individualUx(segment) {
  return segment === "INDIVIDUAL";
}

module.exports = {
  SEGMENTS,
  parseCustomerSegment,
  isConfirmableSegment,
  navigationForSegment,
  individualUx,
};
