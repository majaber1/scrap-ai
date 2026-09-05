import { readFileSync, existsSync } from "node:fs";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const { analyzeScrapImage, aiStatus } = require("../lib/ai.cjs");
const { validateAnalysis } = require("../lib/intelligence/schema.cjs");

const parsed = validateAnalysis({
  materialType: "copper",
  materialLabelAr: "كيبل نحاس",
  materialLabelEn: "Copper cable",
  grade: "medium",
  confidence: 0.8,
  observationsAr: "عازل ظاهر",
  observationsEn: "Visible insulation",
});
if (!parsed || parsed.estimateKind !== "VISUAL_ESTIMATE" || parsed.labCertifiedPurity !== false) {
  throw new Error("schema validation failed");
}

const status = await aiStatus();
if (!status.configured) {
  console.log("LOCAL SCHEMA: PASS");
  console.log("LOCAL PROVIDER: SKIP (no keys in local env)");
  process.exit(0);
}

async function copperImage() {
  const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/NatCopper.jpg/640px-NatCopper.jpg";
  const r = await fetch(url, { headers: { "User-Agent": "ScrapAI-Phase0-Local/1.0" } });
  if (!r.ok) throw new Error(`image download ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const result = await analyzeScrapImage({ imageDataUrl: await copperImage(), context: { city: "Riyadh" } });
if (!result?.data) {
  console.error(result?.events);
  throw new Error("local real provider analysis failed");
}
if (result.data.estimateKind !== "VISUAL_ESTIMATE") throw new Error("missing visual estimate kind");
console.log("LOCAL SCHEMA: PASS");
console.log("LOCAL IMAGE ANALYSIS: PASS");
console.log("REAL PROVIDER:", result.provider);
console.log("REAL MODEL:", result.model);
console.log("FALLBACK:", result.fallbackUsed);
console.log("LATENCY_MS:", result.latencyMs);
