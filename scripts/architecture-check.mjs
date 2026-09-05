import { readFile } from "node:fs/promises";

const clientFiles = ["app.js", "production-client.js", "index.html"];
const forbiddenInClient = ["OPENAI_API_KEY", "GEMINI_API_KEY", "GROQ_API_KEY", "Scrap_Ai_Gemeni", "DATABASE_URL", "SESSION_SECRET"];
const marketplace = await readFile("api/listings.js", "utf8") + await readFile("api/workflow.js", "utf8");
const ai = await readFile("lib/intelligence/engine.cjs", "utf8") + await readFile("lib/intelligence/providers.cjs", "utf8");
const analyzeApi = await readFile("api/ai-analyze.js", "utf8");
const platform = await readFile("api/platform.js", "utf8");

for (const file of clientFiles) {
  const text = await readFile(file, "utf8");
  for (const token of forbiddenInClient) {
    if (text.includes(token)) throw new Error(`${file} must not contain ${token}`);
  }
}

if (marketplace.includes("openai.com") || marketplace.includes("generativelanguage.googleapis.com")) {
  throw new Error("Marketplace APIs must not call AI providers directly");
}
if (marketplace.includes("stripe") || marketplace.includes("tap.company") || marketplace.includes("moyasar")) {
  throw new Error("Marketplace APIs must not bind a payment provider SDK");
}
if (ai.includes("scrap_transactions") || ai.includes("final_amount")) {
  throw new Error("AI engine must not write transaction settlement state");
}
if (analyzeApi.includes("UPDATE scrap_transactions")) {
  throw new Error("AI analyze API must not mutate transactions");
}
if (!platform.includes("ROUND") && !platform.includes("inspected_weight")) {
  throw new Error("Settlement fields must remain in platform domain code");
}
if (platform.includes("analyzeScrapImage")) {
  throw new Error("Financial platform API must not call the AI engine for settlement");
}

const app = await readFile("app.js", "utf8");
if (/price:\s*27\.5/.test(app)) throw new Error("Fake live copper SAR price remains in app.js");
if (app.includes("sampleBuyers") || app.includes("sampleListings")) {
  throw new Error("Demo marketplace entities remain unmarked in app.js");
}

const schema = await readFile("lib/schema.cjs", "utf8");
if (!schema.includes("pg_advisory_lock") || !schema.includes("003_ai_intelligence.sql") || !schema.includes("004_phase1_foundation.sql")) {
  throw new Error("Schema bootstrap must lock and include AI + Phase 1 foundation migrations");
}

const v1Apis = ["api/auth.js", "api/listings.js", "api/workflow.js", "api/platform.js", "api/ai-analyze.js", "api/upload.js", "api/health.js"];
for (const file of v1Apis) await readFile(file, "utf8");

const v2Http = await readFile("lib/foundation/v2-http.cjs", "utf8");
if (!v2Http.includes("organization_id=$2") && !v2Http.includes("organization_id=$1")) {
  throw new Error("Site item access must be tenant-scoped");
}
if (!v2Http.includes("writeOutbox") || !v2Http.includes("BEGIN")) {
  throw new Error("Site creation must write outbox in a transaction");
}

const apiFiles = ["api/auth.js", "api/workflow.js", "api/platform.js", "api/ai-analyze.js", "api/v2/[...path].js", "lib/foundation/v2-http.cjs"];
for (const file of apiFiles) {
  const text = await readFile(file, "utf8");
  if (/UPDATE\s+audit_events/i.test(text) || /DELETE\s+FROM\s+audit_events/i.test(text)) {
    throw new Error(`${file} must not mutate audit history`);
  }
}

const foundationClient = ["apps/v2/src/main.ts", "apps/v2/src/api.ts"];
for (const file of foundationClient) {
  const text = await readFile(file, "utf8");
  for (const token of forbiddenInClient) {
    if (text.includes(token)) throw new Error(`${file} must not contain ${token}`);
  }
}

console.log("Architecture boundary checks passed.");
