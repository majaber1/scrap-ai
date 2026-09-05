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
    const headers = { "User-Agent": "ScrapAI-Phase2Slice1/1.0", Cookie: joinCookies(await previewCookie(base), cookie) };
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

const seller = await register("seller", "seller");
await raw("/api/v2/organization", { method: "PATCH", cookie: seller.cookie, body: { customerSegment: "INDIVIDUAL" } });

expect(existsSync(fixture), "phase0 fixture missing");
const imageDataUrl = `data:image/jpeg;base64,${readFileSync(fixture).toString("base64")}`;
const analyzed = await raw("/api/ai-analyze", {
  method: "POST",
  cookie: seller.cookie,
  body: { imageDataUrl, city: "Riyadh", notes: "phase2-slice1-fixture" },
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
expect(Number(patched.data.draft.weight_kg) === 25, "seller weight persisted");

const refreshed = await raw(`/api/v2/ai/drafts/${draftId}`, { cookie: seller.cookie });
expect(refreshed.r.ok, `refresh get: ${refreshed.text.slice(0, 200)}`);
expect(refreshed.data.draft.title_en === "Insulated Copper Cable for Sale", "persistence after refresh title");
expect(Number(refreshed.data.draft.weight_kg) === 25, "persistence after refresh weight");
expect(refreshed.data.draft.status === "REVIEW_REQUIRED", "refresh keeps review required");
expect(refreshed.data.pricing == null, "slice 1 get draft must not attach pricing");

const relogin = await raw("/api/auth", { method: "POST", body: { action: "login", email: seller.email, password: seller.password } });
expect(relogin.r.ok && relogin.cookie, "relogin after draft edit");
const afterLogin = await raw(`/api/v2/ai/drafts/${draftId}`, { cookie: relogin.cookie });
expect(afterLogin.data.draft.city === "Riyadh" && Number(afterLogin.data.draft.weight_kg) === 25, "draft survives session refresh");

const clearedCity = await raw(`/api/v2/ai/drafts/${draftId}`, {
  method: "PATCH",
  cookie: seller.cookie,
  body: { city: "" },
});
expect(clearedCity.r.ok && clearedCity.data.draft.city == null, `clear city: ${clearedCity.text.slice(0, 200)}`);
const missingCity = await raw(`/api/v2/ai/drafts/${draftId}/confirm`, { method: "POST", cookie: seller.cookie, body: {} });
expect(missingCity.r.status === 400 && missingCity.data?.error === "city_required", `city required: ${missingCity.text.slice(0, 200)}`);
const restoreCity = await raw(`/api/v2/ai/drafts/${draftId}`, {
  method: "PATCH",
  cookie: seller.cookie,
  body: { city: "Riyadh", weightKg: 25 },
});
expect(restoreCity.r.ok, "restore city before confirm");

const confirmed = await raw(`/api/v2/ai/drafts/${draftId}/confirm`, { method: "POST", cookie: seller.cookie, body: { city: "Riyadh" } });
expect(confirmed.r.status === 201 && confirmed.data.listing?.id, `confirm: ${confirmed.text.slice(0, 400)}`);
expect(confirmed.data.listing.indicative_value == null, "confirm must not invent price");
expect(confirmed.data.draft.status === "PUBLISHED", "published after confirm");
expect(confirmed.data.draft.listing_id === confirmed.data.listing.id, "draft points at listing");

const afterConfirm = await raw(`/api/v2/ai/drafts/${draftId}`, { cookie: seller.cookie });
expect(afterConfirm.data.draft.status === "PUBLISHED" && afterConfirm.data.draft.listing_id, "published draft persists");

const rejectSource = await raw("/api/v2/ai/drafts", { method: "POST", cookie: seller.cookie, body: { analysisId } });
expect(rejectSource.r.status === 201, "second draft for reject");
const rejectId = rejectSource.data.draft.id;
const rejected = await raw(`/api/v2/ai/drafts/${rejectId}/reject`, { method: "POST", cookie: seller.cookie, body: {} });
expect(rejected.r.ok && rejected.data.draft.status === "REJECTED", `reject: ${rejected.text.slice(0, 300)}`);
expect(rejected.data.listing == null, "reject must not create listing");
const rejectPersist = await raw(`/api/v2/ai/drafts/${rejectId}`, { cookie: seller.cookie });
expect(rejectPersist.data.draft.status === "REJECTED", "rejected status persists");
const rejectConfirm = await raw(`/api/v2/ai/drafts/${rejectId}/confirm`, { method: "POST", cookie: seller.cookie, body: { city: "Riyadh" } });
expect(rejectConfirm.r.status === 409, `rejected draft cannot confirm, got ${rejectConfirm.r.status}`);

const viewerInvite = await raw("/api/v2/members", { method: "POST", cookie: seller.cookie, body: { email: other.user.email, roles: ["VIEWER"] } });
expect(viewerInvite.r.ok, `invite viewer: ${viewerInvite.text.slice(0, 200)}`);
const switched = await raw("/api/v2/session", { method: "POST", cookie: other.cookie, body: { organizationId: seller.user.organization_id } });
expect(switched.r.ok, "switch to seller org as viewer");
const viewerDraft = await raw("/api/v2/ai/drafts", { method: "POST", cookie: switched.cookie, body: { analysisId } });
expect(viewerDraft.r.status === 403, `viewer must not create draft, got ${viewerDraft.r.status}`);
const viewerConfirm = await raw(`/api/v2/ai/drafts/${draftId}/confirm`, { method: "POST", cookie: switched.cookie, body: { city: "Jeddah" } });
expect(viewerConfirm.r.status === 403 || viewerConfirm.r.status === 409, `viewer must not confirm, got ${viewerConfirm.r.status}`);

console.log("Phase 2A Slice 1 API: PASS");
console.log("Draft creation: PASS");
console.log("Tenant isolation: PASS");
console.log("RBAC: PASS");
console.log("Seller edit: PASS");
console.log("Confirm creates listing: PASS");
console.log("Rejection: PASS");
console.log("Persistence after refresh: PASS");
