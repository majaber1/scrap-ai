import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { previewCookie, joinCookies } from "./preview-access.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = join(root, "..", "tests", "fixtures", "PHASE0_TEST_FIXTURE_scrap_photo.jpg");

const base = (process.env.PRODUCTION_URL || "https://scrap-ai.vercel.app").replace(/\/$/, "");
const timeout = Number(process.env.SMOKE_TIMEOUT_MS || 180000);
const expectedSha = (process.env.EXPECTED_GIT_SHA || "").trim();

async function raw(path, { method = "GET", body, cookie } = {}) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), timeout);
  try {
    const headers = { "User-Agent": "ScrapAI-Phase0-AI/1.0", Cookie: joinCookies(await previewCookie(base), cookie) };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const r = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: c.signal,
    });
    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}
    return { r, text, data, cookie: r.headers.get("set-cookie")?.split(";")[0] || cookie };
  } finally {
    clearTimeout(timer);
  }
}

function expect(value, message) {
  if (!value) throw new Error(message);
}

function loadFixtureDataUrl() {
  expect(existsSync(fixture), `Missing labeled test fixture: ${fixture}`);
  const buf = readFileSync(fixture);
  expect(buf.length > 2000, "Test fixture is too small to be a real photograph");
  expect(buf[0] === 0xff && buf[1] === 0xd8, "Test fixture must be a JPEG photograph");
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function assertVisualSchema(a) {
  expect(a && typeof a === "object", "SCHEMA: analysis object");
  expect(a.estimateKind === "VISUAL_ESTIMATE", "SCHEMA: estimateKind");
  expect(a.labCertifiedPurity === false, "SCHEMA: labCertifiedPurity");
  expect(a.physicalConfirmationRequired === true, "SCHEMA: physicalConfirmationRequired");
  expect(typeof a.materialLabelEn === "string" && a.materialLabelEn.length > 0, "SCHEMA: materialLabelEn");
  expect(typeof a.materialLabelAr === "string" && a.materialLabelAr.length > 0, "SCHEMA: materialLabelAr");
  expect(typeof a.confidence === "number" && a.confidence >= 0 && a.confidence <= 1, "SCHEMA: confidence");
  expect(typeof a.observationsEn === "string" || typeof a.observationsAr === "string", "SCHEMA: observations");
}

const health = await raw("/api/health");
expect(health.r.ok && health.data?.status === "ok", `HEALTH: ${health.text.slice(0, 300)}`);
expect(health.data.database === true && health.data.session === true, `HEALTH core: ${JSON.stringify(health.data)}`);
expect(health.data.ai === true, `AI not configured: ${JSON.stringify(health.data)}`);
if (expectedSha) {
  const liveSha = String(health.data.gitSha || "");
  expect(
    liveSha === expectedSha || liveSha.startsWith(expectedSha.slice(0, 7)),
    `GIT SHA mismatch live=${liveSha || "null"} expected=${expectedSha}`
  );
}

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const password = `Qa!${Date.now()}x`;
const email = `phase0-ai-${stamp}@example.test`;
const reg = await raw("/api/auth", {
  method: "POST",
  body: {
    action: "register",
    fullName: "Phase0 AI",
    organizationName: `Phase0 AI ${stamp}`,
    kind: "seller",
    email,
    password,
  },
});
expect(reg.r.ok && reg.cookie, `Register failed: ${reg.text.slice(0, 300)}`);

const imageDataUrl = loadFixtureDataUrl();
const analyzed = await raw("/api/ai-analyze", {
  method: "POST",
  cookie: reg.cookie,
  body: { imageDataUrl, city: "Riyadh", notes: "phase0-test-fixture-only" },
});
expect(analyzed.r.ok, `IMAGE ANALYSIS HTTP ${analyzed.r.status}: ${analyzed.text.slice(0, 800)}`);
const a = analyzed.data?.analysis;
expect(a?.id, "RESULT PERSISTED: missing analysis id");
assertVisualSchema(a);
expect(analyzed.data.provider && analyzed.data.provider !== "none" && analyzed.data.provider !== "mock", "REAL PROVIDER missing");
expect(analyzed.data.model && !/mock|stub|demo/i.test(analyzed.data.model), "REAL MODEL missing");
expect(typeof analyzed.data.fallbackUsed === "boolean", "fallbackUsed not logged");
expect(typeof analyzed.data.latencyMs === "number" || analyzed.data.latencyMs === null, "latency not logged");
const blob = JSON.stringify(analyzed.data).toLowerCase();
expect(!blob.includes("\"mock\"") && !blob.includes("stub") && !blob.includes("fake live"), "mock/stub payload detected");
expect(!String(analyzed.data.notice || "").toLowerCase().includes("demo"), "DEMO notice in production result");

const listed = await raw("/api/ai-analyze", { cookie: reg.cookie });
expect(listed.r.ok, `GET analyses failed: ${listed.text.slice(0, 300)}`);
const saved = listed.data?.analyses?.find((row) => row.id === a.id);
expect(saved, "RESULT SURVIVES REFRESH: id not returned by GET");
assertVisualSchema(saved.result);
expect(saved.provider === analyzed.data.provider, "persisted provider mismatch");
expect(saved.model === analyzed.data.model, "persisted model mismatch");
expect(typeof saved.fallbackUsed === "boolean", "persisted fallback not logged");

await raw("/api/auth", { method: "POST", cookie: reg.cookie, body: { action: "logout" } });
const login = await raw("/api/auth", {
  method: "POST",
  body: { action: "login", email, password },
});
expect(login.r.ok && login.cookie, `Re-login failed: ${login.text.slice(0, 300)}`);
const afterLogin = await raw("/api/ai-analyze", { cookie: login.cookie });
expect(afterLogin.data?.analyses?.some((row) => row.id === a.id), "RESULT SURVIVES RE-LOGIN: row missing");

const report = {
  health: health.data,
  email,
  password,
  analysisId: a.id,
  provider: analyzed.data.provider,
  model: analyzed.data.model,
  fallbackUsed: analyzed.data.fallbackUsed,
  latencyMs: analyzed.data.latencyMs,
  fixture: "tests/fixtures/PHASE0_TEST_FIXTURE_scrap_photo.jpg",
};
writeFileSync(join(root, "..", "tests", "fixtures", ".phase0-last-run.json"), JSON.stringify(report, null, 2));

console.log("Phase 0 AI production E2E: PASS");
console.log("HEALTH: PASS");
console.log("IMAGE ANALYSIS: PASS");
console.log("REAL PROVIDER:", analyzed.data.provider);
console.log("REAL MODEL:", analyzed.data.model);
console.log("FALLBACK USED:", analyzed.data.fallbackUsed);
console.log("LATENCY_MS:", analyzed.data.latencyMs);
console.log("ANALYSIS_ID:", a.id);
console.log("FIXTURE: tests/fixtures/PHASE0_TEST_FIXTURE_scrap_photo.jpg");
console.log("PRODUCTION E2E: PASS");
console.log("RESULT PERSISTED: PASS");
console.log("RESULT SURVIVES REFRESH: PASS");
console.log("RESULT SURVIVES RELOGIN: PASS");
console.log("AUTH: PASS");
if (expectedSha) console.log("GIT SHA MATCH: PASS", health.data.gitSha);
else console.log("GIT SHA LIVE:", health.data.gitSha || "(not reported by runtime)");
console.log("DEPLOYMENT:", health.data.deploymentId || "(none)");
console.log("E2E_LOGIN_EMAIL:", email);
