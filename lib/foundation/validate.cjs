const { z } = require("zod");

const segmentSchema = z.enum(["INDIVIDUAL", "COMPANY_FACTORY", "GOVERNMENT"]);
const orgPatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  customerSegment: segmentSchema.optional(),
}).refine((value) => value.name || value.customerSegment, { message: "empty_patch" });

module.exports = { segmentSchema, orgPatchSchema };
