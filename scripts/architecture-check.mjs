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
if (!schema.includes("pg_advisory_lock") || !schema.includes("003_ai_intelligence.sql")) {
  throw new Error("Schema bootstrap must lock and include AI intelligence migration");
}

console.log("Architecture boundary checks passed.");
