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
    sell: t().sell,
    intelligence: t().intelligence,
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
  const sell = hash === "sell" || (hash === "overview" && me?.individualUx);
  const intel = hash === "intelligence" && company;
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
      ${sell ? `<section class="card">
        <h2>${me?.individualUx ? t().reviewDraft : t().sell}</h2>
        <p>${t().sellHelp}</p>
        <div class="row">
          <a class="primary link" href="/#analyze">${t().openAnalyze}</a>
          <button class="primary" type="button" data-act="prepare-draft">${t().prepareDraft}</button>
        </div>
        <p id="sellMsg" class="msg" hidden></p>
        <div id="assistantBox" class="muted"></div>
        <div id="draftBox"></div>
      </section>` : ""}
      ${intel ? `<section class="card">
        <h2>${t().intelligence}</h2>
        <p class="muted">${t().sellHelp}</p>
        <h3>${t().analyze}</h3>
        <div id="analysisList">${t().noAnalyses}</div>
        <h3>${t().sell}</h3>
        <div id="intelDrafts">${t().noDrafts}</div>
        <h3>${t().overview}</h3>
        <div id="intelMaterials"></div>
      </section>` : ""}
      ${hash === "account" ? `<section class="card"><p>${me?.user.email || ""}</p><p>${me?.organization.customerSegment || ""}</p></section>` : ""}
    </main>`;
}

function render() {
  root.innerHTML = (me ? navAuth() : navPublic()) + (me ? (me.needsOnboarding ? onboarding() : workspace()) : authForms());
}

function hashId() {
  return location.hash.replace("#", "") || "overview";
}

async function refresh() {
  try {
    const data = await api.me();
    me = data as Me;
  } catch {
    me = null;
  }
  render();
  if (!me || me.needsOnboarding) return;
  const hash = hashId();
  if (hash === "sites") loadSites();
  if (hash === "sell" || (hash === "overview" && me.individualUx)) loadSell();
  if (hash === "intelligence") loadIntelligence();
}

async function loadSites() {
  const host = document.getElementById("siteList");
  if (!host) return;
  const data = await api.sites();
  host.innerHTML = data.sites?.length
    ? data.sites.map((site: { name: string; city?: string }) => `<article><strong>${site.name}</strong><span>${site.city || ""}</span></article>`).join("")
    : t().emptySites;
}

function escapeText(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}

async function loadSell() {
  const box = document.getElementById("draftBox");
  if (!box) return;
  const data = await api.drafts();
  const drafts = data.drafts || [];
  if (!drafts.length) {
    box.innerHTML = `<p>${t().noDrafts}</p>`;
    return;
  }
  const current = drafts.find((row: { status: string }) => row.status === "REVIEW_REQUIRED") || drafts[0];
  const detail = await api.getDraft(current.id);
  const draft = detail.draft;
  const assistant = detail.assistant?.messages || [];
  const assistantBox = document.getElementById("assistantBox");
  if (assistantBox) {
    assistantBox.innerHTML = `<h3>${t().assistant}</h3>` + assistant.map((msg: { ar: string; en: string }) => `<p>${escapeText(lang === "ar" ? msg.ar : msg.en)}</p>`).join("");
  }
  const locked = draft.status === "PUBLISHED" || draft.status === "REJECTED";
  box.innerHTML = `
    <form id="draftForm" data-id="${escapeText(draft.id)}">
      <p><strong>${escapeText(lang === "ar" ? (detail.mapping?.labelAr || draft.title_ar) : (detail.mapping?.labelEn || draft.title_en))}</strong></p>
      <p class="muted">${escapeText(draft.status)} · ${escapeText(draft.weight_status)}</p>
      ${draft.status === "PUBLISHED" && draft.listing_id ? `<p>${t().publishedListing} ${escapeText(draft.listing_id)}</p>` : ""}
      <label>${t().titleAr}<input name="titleAr" value="${escapeText(draft.title_ar || "")}" ${locked ? "disabled" : ""}></label>
      <label>${t().titleEn}<input name="titleEn" value="${escapeText(draft.title_en || "")}" ${locked ? "disabled" : ""}></label>
      <label>${t().city}<input name="city" value="${escapeText(draft.city || "")}" required ${locked ? "disabled" : ""}></label>
      <label>${t().weightKg}<input name="weightKg" type="number" min="0" step="0.01" value="${escapeText(draft.weight_kg || "")}" ${locked ? "disabled" : ""}></label>
      <p class="muted">${t().weightHint}</p>
      ${locked ? "" : `<div class="row">
        <button class="primary" type="submit">${t().saveEdits}</button>
        <button class="primary" type="button" data-act="confirm-draft" data-id="${escapeText(draft.id)}">${t().confirmListing}</button>
        <button class="danger" type="button" data-act="reject-draft" data-id="${escapeText(draft.id)}">${t().rejectDraft}</button>
      </div>`}
    </form>`;
}

async function loadIntelligence() {
  const analysesHost = document.getElementById("analysisList");
  const draftsHost = document.getElementById("intelDrafts");
  const materialsHost = document.getElementById("intelMaterials");
  if (!analysesHost || !draftsHost || !materialsHost) return;
  const [analyses, drafts, materials] = await Promise.all([api.analyses(), api.drafts(), api.materials()]);
  analysesHost.innerHTML = analyses.analyses?.length
    ? analyses.analyses.map((row: { materialLabelAr?: string; materialLabelEn?: string; confidence?: number }) =>
      `<article><strong>${escapeText(lang === "ar" ? row.materialLabelAr : row.materialLabelEn)}</strong> <span>${row.confidence == null ? "" : Math.round(Number(row.confidence) * 100) + "%"}</span></article>`).join("")
    : t().noAnalyses;
  draftsHost.innerHTML = drafts.drafts?.length
    ? drafts.drafts.map((row: { title_ar?: string; title_en?: string; status: string }) =>
      `<article><strong>${escapeText(lang === "ar" ? row.title_ar : row.title_en)}</strong> <span>${escapeText(row.status)}</span></article>`).join("")
    : t().noDrafts;
  materialsHost.innerHTML = (materials.materials || []).slice(0, 12).map((row: { label_ar: string; label_en: string }) =>
    `<span>${escapeText(lang === "ar" ? row.label_ar : row.label_en)}</span>`).join(" · ");
}

function showSellError(error: unknown) {
  const msg = document.getElementById("sellMsg");
  if (!msg) return;
  msg.hidden = false;
  msg.textContent = error instanceof Error ? error.message : "error";
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
    return;
  }
  try {
    if (target.dataset.act === "prepare-draft") {
      await api.createDraft({});
      if (location.hash !== "#sell") location.hash = "#sell";
      else await loadSell();
    }
    if (target.dataset.act === "confirm-draft" && target.dataset.id) {
      const form = document.getElementById("draftForm") as HTMLFormElement | null;
      const city = form ? String(new FormData(form).get("city") || "") : "";
      await api.confirmDraft(target.dataset.id, { city });
      await loadSell();
    }
    if (target.dataset.act === "reject-draft" && target.dataset.id) {
      await api.rejectDraft(target.dataset.id);
      await loadSell();
    }
  } catch (error) {
    showSellError(error);
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
    if (form.id === "draftForm") {
      await api.patchDraft(String(form.dataset.id), {
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        city: body.city,
        weightKg: body.weightKg === "" ? null : body.weightKg,
      });
      await loadSell();
      return;
    }
    await refresh();
  } catch (error) {
    if (msg) {
      msg.hidden = false;
      msg.textContent = error instanceof Error ? error.message : "error";
    }
    showSellError(error);
  }
});

window.addEventListener("hashchange", () => {
  if (!me) { render(); return; }
  render();
  const hash = hashId();
  if (hash === "sites") loadSites();
  if (hash === "sell" || (hash === "overview" && me.individualUx)) loadSell();
  if (hash === "intelligence") loadIntelligence();
});
setLang("ar");
refresh();
