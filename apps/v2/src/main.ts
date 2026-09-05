import { ar, en, type Copy } from "./i18n";
import { api, type Me } from "./api";

const root = document.getElementById("app")!;
let lang: "ar" | "en" = "ar";
let copy: Copy = ar;
let me: Me | null = null;

function t(): Copy { return copy; }

function setLang(next: "ar" | "en") {
  lang = next;
  copy = next === "ar" ? ar : en;
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
}

function navPublic() {
  return `
    <header class="top">
      <a class="brand" href="/v2/">${t().brand}</a>
      <nav>
        <a href="/">${t().v1}</a>
        <a href="/#analyze">${t().analyze}</a>
        <a href="/#marketplace">${t().market}</a>
        <button type="button" data-act="lang">${lang === "ar" ? "EN" : "ع"}</button>
      </nav>
    </header>`;
}

function navAuth() {
  const items = me?.navigation || ["overview", "analyze", "account"];
  const labels: Record<string, string> = {
    overview: t().overview,
    analyze: t().analyze,
    activity: t().activity,
    account: t().account,
    sites: t().sites,
    team: t().team,
    market: t().market,
  };
  const visible = items.filter((id) => labels[id] && !(me?.individualUx && (id === "team" || id === "sites")));
  return `
    <header class="top">
      <a class="brand" href="/v2/">${t().brand}</a>
      <nav>
        ${visible.map((id) => `<a href="#${id}">${labels[id]}</a>`).join("")}
        <a href="/">${t().v1}</a>
        <button type="button" data-act="lang">${lang === "ar" ? "EN" : "ع"}</button>
        <button type="button" data-act="logout">${t().logout}</button>
      </nav>
    </header>`;
}

function authForms() {
  return `
    <main class="shell">
      <h1>${t().signIn}</h1>
      <form id="login" class="card">
        <label>${t().email}<input name="email" type="email" required></label>
        <label>${t().password}<input name="password" type="password" minlength="8" required></label>
        <button class="primary" type="submit">${t().signIn}</button>
      </form>
      <form id="register" class="card">
        <h2>${t().register}</h2>
        <label>${t().fullName}<input name="fullName" required></label>
        <label>${t().orgName}<input name="organizationName" required></label>
        <label>${t().email}<input name="email" type="email" required></label>
        <label>${t().password}<input name="password" type="password" minlength="8" required></label>
        <button class="primary" type="submit">${t().register}</button>
      </form>
      <p id="msg" class="msg" hidden></p>
    </main>`;
}

function onboarding() {
  return `
    <main class="shell">
      <h1>${t().question}</h1>
      <p>${t().needsOnboarding}</p>
      <div class="choices">
        <button data-seg="INDIVIDUAL">${t().individual}</button>
        <button data-seg="COMPANY_FACTORY">${t().company}</button>
        <button data-seg="GOVERNMENT">${t().government}</button>
      </div>
    </main>`;
}

function workspace() {
  const hash = location.hash.replace("#", "") || "overview";
  const company = me?.organization.customerSegment === "COMPANY_FACTORY";
  const gov = me?.organization.customerSegment === "GOVERNMENT";
  const showSites = company || gov;
  const title = me?.individualUx ? me.user.fullName : me?.organization.name;
  return `
    <main class="shell">
      <h1>${title || t().workspace}</h1>
      ${hash === "sites" && showSites ? `<section id="sitesPanel" class="card"><h2>${t().sites}</h2><div id="siteList">${t().emptySites}</div>
        <form id="siteForm">
          <label>${t().siteName}<input name="name" required></label>
          <label>${t().city}<input name="city"></label>
          <button class="primary" type="submit">${t().createSite}</button>
        </form></section>` : ""}
      ${hash === "analyze" || hash === "overview" ? `<section class="card"><p>${t().analyzeHelp}</p><a class="primary link" href="/#analyze">${t().openAnalyze}</a></section>` : ""}
      ${hash === "account" ? `<section class="card"><p>${me?.user.email || ""}</p><p>${me?.organization.customerSegment || ""}</p></section>` : ""}
    </main>`;
}

function render() {
  root.innerHTML = (me ? navAuth() : navPublic()) + (me ? (me.needsOnboarding ? onboarding() : workspace()) : authForms());
}

async function refresh() {
  try {
    const data = await api.me();
    me = data as Me;
  } catch {
    me = null;
  }
  render();
  if (me && !me.needsOnboarding && (location.hash.replace("#", "") === "sites")) loadSites();
}

async function loadSites() {
  const host = document.getElementById("siteList");
  if (!host) return;
  const data = await api.sites();
  host.innerHTML = data.sites?.length
    ? data.sites.map((site: { name: string; city?: string }) => `<article><strong>${site.name}</strong><span>${site.city || ""}</span></article>`).join("")
    : t().emptySites;
}

root.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  if (target.dataset.act === "lang") {
    setLang(lang === "ar" ? "en" : "ar");
    render();
    return;
  }
  if (target.dataset.act === "logout") {
    await api.postAuth({ action: "logout" });
    me = null;
    render();
    return;
  }
  const seg = target.dataset.seg;
  if (seg) {
    await api.patchOrg({ customerSegment: seg });
    await refresh();
  }
});

root.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const body = Object.fromEntries(new FormData(form).entries());
  const msg = document.getElementById("msg");
  try {
    if (form.id === "login") await api.postAuth({ action: "login", ...body });
    if (form.id === "register") await api.postAuth({ action: "register", kind: "both", ...body });
    if (form.id === "siteForm") {
      await api.createSite({ name: body.name, city: body.city, siteType: "YARD" });
      await loadSites();
      return;
    }
    await refresh();
  } catch (error) {
    if (msg) {
      msg.hidden = false;
      msg.textContent = error instanceof Error ? error.message : "error";
    }
  }
});

window.addEventListener("hashchange", () => { render(); if (me && location.hash.includes("sites")) loadSites(); });
setLang("ar");
refresh();
