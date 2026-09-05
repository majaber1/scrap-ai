import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = join(root, "..", "tests", "fixtures", "copper.jpg");

const base = (process.env.PRODUCTION_URL || "https://scrap-ai.vercel.app").replace(/\/$/, "");
const timeout = Number(process.env.SMOKE_TIMEOUT_MS || 180000);
const expectedSha = (process.env.EXPECTED_GIT_SHA || "").trim();

async function raw(path, { method = "GET", body, cookie } = {}) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), timeout);
  try {
    const headers = { "User-Agent": "ScrapAI-Phase0-AI/1.0" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (cookie) headers.Cookie = cookie;
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

async function realCopperImage() {
  if (existsSync(fixture)) {
    const buf = readFileSync(fixture);
    if (buf.length > 1000) return `data:image/jpeg;base64,${buf.toString("base64")}`;
  }
  const urls = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/NatCopper.jpg/640px-NatCopper.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Copper_sample.jpg/640px-Copper_sample.jpg",
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "ScrapAI-Phase0-AI/1.0" } });
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 1000) continue;
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {
      /* try next */
    }
  }
  throw new Error("Could not download a real copper photograph for E2E");
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

const imageDataUrl = await realCopperImage();
const analyzed = await raw("/api/ai-analyze", {
  method: "POST",
  cookie: reg.cookie,
  body: { imageDataUrl, city: "Riyadh" },
});
expect(analyzed.r.ok, `IMAGE ANALYSIS HTTP ${analyzed.r.status}: ${analyzed.text.slice(0, 800)}`);
const a = analyzed.data?.analysis;
expect(a?.id, "RESULT PERSISTED: missing analysis id");
expect(a.estimateKind === "VISUAL_ESTIMATE", "SCHEMA: estimateKind");
expect(a.labCertifiedPurity === false, "SCHEMA: labCertifiedPurity");
expect(typeof a.materialLabelEn === "string" && a.materialLabelEn.length > 0, "SCHEMA: materialLabelEn");
expect(typeof a.confidence === "number", "SCHEMA: confidence");
expect(analyzed.data.provider && analyzed.data.provider !== "none", "REAL PROVIDER missing");
expect(analyzed.data.model, "REAL MODEL missing");
expect(typeof analyzed.data.fallbackUsed === "boolean", "fallbackUsed not logged");
expect(!String(analyzed.data.notice || "").includes("demo"), "DEMO notice in production result");
expect(!JSON.stringify(a).toLowerCase().includes("mock"), "mock payload detected");

const listed = await raw("/api/ai-analyze", { cookie: reg.cookie });
expect(listed.r.ok, `GET analyses failed: ${listed.text.slice(0, 300)}`);
const saved = listed.data?.analyses?.find((row) => row.id === a.id);
expect(saved, "RESULT SURVIVES REFRESH: id not returned by GET");
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

console.log("Phase 0 AI production E2E: PASS");
console.log("HEALTH: PASS");
console.log("IMAGE ANALYSIS: PASS");
console.log("REAL PROVIDER:", analyzed.data.provider);
console.log("REAL MODEL:", analyzed.data.model);
console.log("FALLBACK USED:", analyzed.data.fallbackUsed);
console.log("LATENCY_MS:", analyzed.data.latencyMs);
console.log("ANALYSIS_ID:", a.id);
console.log("PRODUCTION E2E: PASS");
console.log("RESULT PERSISTED: PASS");
console.log("RESULT SURVIVES REFRESH: PASS");
console.log("RESULT SURVIVES RELOGIN: PASS");
console.log("AUTH: PASS");
if (expectedSha) console.log("GIT SHA MATCH: PASS", health.data.gitSha);
else console.log("GIT SHA LIVE:", health.data.gitSha || "(not reported by runtime)");
console.log("DEPLOYMENT:", health.data.deploymentId || "(none)");
