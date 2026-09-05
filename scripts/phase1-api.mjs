const base = (process.env.PRODUCTION_URL || process.env.PHASE1_URL || "https://scrap-ai.vercel.app").replace(/\/$/, "");
const timeout = Number(process.env.SMOKE_TIMEOUT_MS || 30000);

async function raw(path, { method = "GET", body, cookie } = {}) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), timeout);
  try {
    const headers = { "User-Agent": "ScrapAI-Phase1/1.0" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (cookie) headers.Cookie = cookie;
    const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: c.signal });
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

async function register(label) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const password = `Qa!${Date.now()}x`;
  const email = `phase1-${label}-${stamp}@example.test`;
  const res = await raw("/api/auth", {
    method: "POST",
    body: { action: "register", fullName: `Phase1 ${label}`, organizationName: `[QA] Phase1 ${label} ${stamp}`, kind: "both", email, password },
  });
  expect(res.r.ok && res.cookie, `register ${label}: ${res.text.slice(0, 200)}`);
  return { email, password, cookie: res.cookie, user: res.data.user };
}

const v2 = await raw("/v2/");
expect(v2.r.ok && v2.text.includes("dir=\"rtl\""), "V2 shell RTL missing");
expect(v2.text.includes("سكراب AI"), "V2 Arabic title missing");

const health = await raw("/api/health");
expect(health.r.ok && health.data?.status === "ok", "health");

const a = await register("orgA");
const meA = await raw("/api/v2/me", { cookie: a.cookie });
expect(meA.r.ok && meA.data.needsOnboarding === true, "unknown segment");
const conf = await raw("/api/v2/organization", { method: "PATCH", cookie: a.cookie, body: { customerSegment: "COMPANY_FACTORY" } });
expect(conf.r.ok && conf.data.organization.customer_segment === "COMPANY_FACTORY", "segment persist");
const meA2 = await raw("/api/v2/me", { cookie: a.cookie });
expect(meA2.data.organization.customerSegment === "COMPANY_FACTORY", "segment after GET");

const site = await raw("/api/v2/sites", { method: "POST", cookie: a.cookie, body: { name: "[QA] Riyadh yard", siteType: "YARD", city: "Riyadh" } });
expect(site.r.ok && site.data.site?.id, `site create: ${site.text.slice(0, 200)}`);
const siteId = site.data.site.id;
const listed = await raw("/api/v2/sites", { cookie: a.cookie });
expect(listed.data.sites.some((row) => row.id === siteId), "site list persist");

const b = await register("orgB");
const steal = await raw(`/api/v2/sites/${siteId}`, { cookie: b.cookie });
expect(steal.r.status === 404, `tenant isolation expected 404 got ${steal.r.status}`);
const stealPatch = await raw(`/api/v2/sites/${siteId}`, { method: "PATCH", cookie: b.cookie, body: { name: "hack" } });
expect(stealPatch.r.status === 404, "tenant isolation patch");

const invite = await raw("/api/v2/members", { method: "POST", cookie: a.cookie, body: { email: b.user.email, roles: ["VIEWER"] } });
expect(invite.r.ok, `invite: ${invite.text.slice(0, 200)}`);
const switched = await raw("/api/v2/session", { method: "POST", cookie: b.cookie, body: { organizationId: a.user.organization_id } });
expect(switched.r.ok, `switch org: ${switched.text.slice(0, 200)}`);
const viewerSite = await raw("/api/v2/sites", { method: "POST", cookie: switched.cookie, body: { name: "should fail", siteType: "YARD" } });
expect(viewerSite.r.status === 403, `viewer must not create site, got ${viewerSite.r.status}`);

const tax = await raw("/api/v2/materials", { cookie: a.cookie });
expect(tax.r.ok && tax.data.families?.length >= 8, "taxonomy families");
expect(tax.data.materials.some((m) => m.label_ar && m.label_en), "arabic/english materials");

const relog = await raw("/api/auth", { method: "POST", body: { action: "login", email: a.email, password: a.password } });
expect(relog.r.ok, "existing user login");
const after = await raw("/api/v2/sites", { cookie: relog.cookie });
expect(after.data.sites.some((row) => row.id === siteId), "site survives relogin");

const ind = await register("ind");
const indSeg = await raw("/api/v2/organization", { method: "PATCH", cookie: ind.cookie, body: { customerSegment: "INDIVIDUAL" } });
expect(indSeg.r.ok, "individual onboard");
const indMe = await raw("/api/v2/me", { cookie: ind.cookie });
expect(indMe.data.individualUx === true, "individual ux flag");
expect(indMe.data.navigation.includes("analyze"), "individual analyze");

console.log("Phase 1 API/integration: PASS");
console.log("Tenant isolation: PASS");
console.log("RBAC viewer cannot create site: PASS");
console.log("Sites persist: PASS");
console.log("Taxonomy: PASS");
console.log("Onboarding: PASS");
