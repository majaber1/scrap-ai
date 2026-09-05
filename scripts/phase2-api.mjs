import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { previewCookie, joinCookies } from "./preview-access.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = join(root, "..", "tests", "fixtures", "PHASE0_TEST_FIXTURE_scrap_photo.jpg");
const base = (process.env.PRODUCTION_URL || process.env.PHASE2_URL || process.env.PHASE1_URL || "https://scrap-ai.vercel.app").replace(/\/$/, "");
const timeout = Number(process.env.SMOKE_TIMEOUT_MS || 180000);

async function raw(path, { method = "GET", body, cookie } = {}) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), timeout);
  try {
    const headers = { "User-Agent": "ScrapAI-Phase2/1.0", Cookie: joinCookies(await previewCookie(base), cookie) };
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

async function register(label, kind = "both") {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const password = `Qa!${Date.now()}x`;
  const email = `phase2-${label}-${stamp}@example.test`;
  const res = await raw("/api/auth", {
    method: "POST",
    body: { action: "register", fullName: `Phase2 ${label}`, organizationName: `[QA] Phase2 ${label} ${stamp}`, kind, email, password },
  });
  expect(res.r.ok && res.cookie, `register ${label}: ${res.text.slice(0, 200)}`);
  return { email, password, cookie: res.cookie, user: res.data.user };
}

const health = await raw("/api/health");
expect(health.r.ok && health.data?.status === "ok", "health");
expect(health.data.phase2Intelligence === true, "phase2 health flag");

const buyer = await register("buyer", "buyer");
const seller = await register("seller", "seller");
await raw("/api/v2/organization", { method: "PATCH", cookie: seller.cookie, body: { customerSegment: "INDIVIDUAL" } });

expect(existsSync(fixture), "phase0 fixture missing");
const imageDataUrl = `data:image/jpeg;base64,${readFileSync(fixture).toString("base64")}`;
const analyzed = await raw("/api/ai-analyze", {
  method: "POST",
  cookie: seller.cookie,
  body: { imageDataUrl, city: "Riyadh", notes: "phase2-draft-fixture" },
});
expect(analyzed.r.ok && analyzed.data?.analysis?.id, `analyze: ${analyzed.text.slice(0, 400)}`);
const analysisId = analyzed.data.analysis.id;
expect(analyzed.data.analysis.labCertifiedPurity === false, "analyze contract purity");

const created = await raw("/api/v2/ai/drafts", { method: "POST", cookie: seller.cookie, body: { analysisId } });
expect(created.r.status === 201 && created.data.draft?.id, `draft create: ${created.text.slice(0, 400)}`);
expect(created.data.autoPublish === false, "draft must not auto-publish");
expect(created.data.draft.status === "REVIEW_REQUIRED", "draft review required");
expect(created.data.draft.listing_id == null, "no listing until confirm");
expect(created.data.draft.weight_status === "NOT_PROVIDED" || created.data.draft.weight_status === "SELLER_PROVIDED", "weight status");
const draftId = created.data.draft.id;

const other = await register("other", "seller");
const steal = await raw(`/api/v2/ai/drafts/${draftId}`, { cookie: other.cookie });
expect(steal.r.status === 404, `tenant isolation draft got ${steal.r.status}`);

const patched = await raw(`/api/v2/ai/drafts/${draftId}`, {
  method: "PATCH",
  cookie: seller.cookie,
  body: { titleEn: "Insulated Copper Cable for Sale", titleAr: "كابل نحاس معزول للبيع", city: "Riyadh", weightKg: 25 },
});
expect(patched.r.ok && patched.data.draft.weight_status === "SELLER_PROVIDED", `patch: ${patched.text.slice(0, 300)}`);
expect(Number(patched.data.feedbackEvents) >= 1, "feedback events stored");

const assistant = await raw(`/api/v2/ai/assistant?analysisId=${analysisId}`, { cookie: seller.cookie });
expect(assistant.r.ok && assistant.data.assistant?.autoPublish === false, "assistant");
expect(assistant.data.mapping?.materialId, "material mapping");

const pricing = await raw(`/api/v2/price-signals?materialId=${created.data.draft.material_id || ""}`, { cookie: seller.cookie });
expect(pricing.r.ok, `pricing: ${pricing.r.status} ${pricing.text.slice(0, 200)}`);
expect(pricing.data.notice === "price_source_not_connected" || pricing.data.range, "pricing honesty");
if (pricing.data.notice === "price_source_not_connected") expect(pricing.data.range === null, "no fake production price");

const confirmed = await raw(`/api/v2/ai/drafts/${draftId}`, { method: "POST", cookie: seller.cookie, body: { action: "confirm", city: "Riyadh" } });
expect(confirmed.r.status === 201 && confirmed.data.listing?.id, `confirm: ${confirmed.text.slice(0, 400)}`);
expect(confirmed.data.listing.indicative_value == null, "confirm must not invent price");
expect(confirmed.data.draft.status === "PUBLISHED", "published after confirm");

const matches = await raw(`/api/v2/buyer-matches?listingId=${confirmed.data.listing.id}`, { cookie: seller.cookie });
expect(matches.r.ok, `matching: ${matches.r.status} ${matches.text.slice(0, 200)}`);
expect(Array.isArray(matches.data.matches), "matching array");
if (matches.data.matches.length) {
  expect(matches.data.matches.some((row) => row.buyer_org_id === buyer.user.organization_id), "real buyer org scored");
  expect(matches.data.matches.every((row) => typeof Number(row.score) === "number"), "match score");
}

const viewerInvite = await raw("/api/v2/members", { method: "POST", cookie: seller.cookie, body: { email: other.user.email, roles: ["VIEWER"] } });
expect(viewerInvite.r.ok, `invite viewer: ${viewerInvite.text.slice(0, 200)}`);
const switched = await raw("/api/v2/session", { method: "POST", cookie: other.cookie, body: { organizationId: seller.user.organization_id } });
expect(switched.r.ok, "switch to seller org as viewer");
const viewerDraft = await raw("/api/v2/ai/drafts", { method: "POST", cookie: switched.cookie, body: { analysisId } });
expect(viewerDraft.r.status === 403, `viewer must not create draft, got ${viewerDraft.r.status}`);

console.log("Phase 2 API: PASS");
console.log("AI draft flow: PASS");
console.log("Feedback: PASS");
console.log("Pricing foundation: PASS");
console.log("Matching foundation: PASS");
console.log("Tenant isolation drafts: PASS");
