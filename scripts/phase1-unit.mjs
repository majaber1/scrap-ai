import { parseCustomerSegment, isConfirmableSegment, navigationForSegment, individualUx } from "../lib/foundation/segments.cjs";
import { parseSiteInput } from "../lib/foundation/sites.cjs";
import { legacyRoles, parseRoleCodes } from "../lib/foundation/rbac.cjs";
import { mapVisualEstimateToTaxonomy } from "../lib/foundation/taxonomy-map.cjs";
import { sanitizeState } from "../lib/foundation/audit.cjs";

function expect(value, message) {
  if (!value) throw new Error(message);
}

expect(parseCustomerSegment("individual") === "INDIVIDUAL", "segment parse");
expect(parseCustomerSegment("factory") === null, "reject unknown segment");
expect(isConfirmableSegment("UNKNOWN") === false, "unknown is not confirmable");
expect(navigationForSegment("INDIVIDUAL").includes("analyze"), "individual analyze");
expect(!navigationForSegment("GOVERNMENT").includes("analyze"), "government has no fake auctions and no analyze module requirement");
expect(individualUx("INDIVIDUAL") === true, "individual ux");
expect(individualUx("COMPANY_FACTORY") === false, "company ux");

expect(parseSiteInput({ name: "A" }).error === "name_required", "site name min");
expect(parseSiteInput({ name: "Yard 1", siteType: "YARD", city: "Riyadh" }).value.siteType === "YARD", "site ok");
expect(parseSiteInput({ name: "Yard 1", latitude: 24 }).error === "coordinates_must_be_paired", "paired coords");

expect(legacyRoles("owner").includes("ORG_OWNER"), "owner mapping");
expect(legacyRoles("owner").includes("SELLER") && legacyRoles("owner").includes("BUYER"), "v1 dual capability");
expect(parseRoleCodes(["VIEWER"]).value[0] === "VIEWER", "viewer role");
expect(parseRoleCodes(["PLATFORM_ADMIN"]).error === "invalid_role", "platform role not assignable");
expect(parseRoleCodes(["SELLER", "VIEWER"]).value.length === 2, "multi role");

const mapped = mapVisualEstimateToTaxonomy({ materialType: "copper", estimateKind: "VISUAL_ESTIMATE" });
expect(mapped.candidateMaterialCode === "COPPER_CABLE", "taxonomy map");
expect(mapped.autoPublish === false, "no auto publish");
expect(mapped.confirmed === false, "human confirm later");

expect(sanitizeState({ password: "x", name: "a" }).password === undefined, "audit strips password");
expect(sanitizeState({ token: "t" }).token === undefined, "audit strips token");

console.log("Phase 1 unit tests: PASS");
