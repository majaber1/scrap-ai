"use strict";(()=>{var u={brand:"\u0633\u0643\u0631\u0627\u0628 AI",home:"\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",analyze:"\u062D\u0644\u0651\u0644",market:"\u0627\u0644\u0633\u0648\u0642",signIn:"\u062F\u062E\u0648\u0644",overview:"\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629",activity:"\u0646\u0634\u0627\u0637\u064A",account:"\u0627\u0644\u062D\u0633\u0627\u0628",sites:"\u0627\u0644\u0645\u0648\u0627\u0642\u0639",team:"\u0627\u0644\u0641\u0631\u064A\u0642",workspace:"\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644",v1:"\u0627\u0644\u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",question:"\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u0635\u0641\u0643\u061F",individual:"\u0641\u0631\u062F",company:"\u0634\u0631\u0643\u0629 / \u0645\u0635\u0646\u0639",government:"\u062C\u0647\u0629 \u062D\u0643\u0648\u0645\u064A\u0629",confirm:"\u062D\u0641\u0638",siteName:"\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639",siteType:"\u0646\u0648\u0639 \u0627\u0644\u0645\u0648\u0642\u0639",city:"\u0627\u0644\u0645\u062F\u064A\u0646\u0629",createSite:"\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0642\u0639",analyzeHelp:"\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u0635\u0631\u064A \u064A\u0639\u0645\u0644 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u064F\u062B\u0628\u062A. \u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0644\u0627 \u062A\u0639\u064A\u062F \u0628\u0646\u0627\u0621 \u0645\u062D\u0631\u0643 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.",openAnalyze:"\u0627\u0641\u062A\u062D \u0627\u0644\u062A\u062D\u0644\u064A\u0644",logout:"\u062E\u0631\u0648\u062C",email:"\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",password:"\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",fullName:"\u0627\u0644\u0627\u0633\u0645",orgName:"\u0627\u0633\u0645 \u0627\u0644\u062D\u0633\u0627\u0628",register:"\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628",emptySites:"\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0648\u0627\u0642\u0639 \u0628\u0639\u062F.",needsOnboarding:"\u062D\u062F\u0651\u062F \u0646\u0648\u0639 \u062D\u0633\u0627\u0628\u0643 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629."},y={brand:"Scrap AI",home:"Home",analyze:"Analyze",market:"Market",signIn:"Sign in",overview:"Overview",activity:"My activity",account:"Account",sites:"Sites",team:"Team",workspace:"Workspace",v1:"Current app",question:"What describes you?",individual:"Individual",company:"Company / Factory",government:"Government Entity",confirm:"Save",siteName:"Site name",siteType:"Site type",city:"City",createSite:"Add site",analyzeHelp:"Visual analysis uses the proven production path. This shell does not rebuild the AI engine.",openAnalyze:"Open analysis",logout:"Sign out",email:"Email",password:"Password",fullName:"Name",orgName:"Account name",register:"Create account",emptySites:"No sites yet.",needsOnboarding:"Confirm your account type to continue."};async function r(t){let a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a.error||"request_failed");return a}var o={me:()=>fetch("/api/v2/me",{credentials:"include"}).then(r),auth:()=>fetch("/api/auth",{credentials:"include"}).then(r),postAuth:t=>fetch("/api/auth",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(r),patchOrg:t=>fetch("/api/v2/organization",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(r),sites:()=>fetch("/api/v2/sites",{credentials:"include"}).then(r),createSite:t=>fetch("/api/v2/sites",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(r)};var d=document.getElementById("app"),l="ar",h=u,n=null;function e(){return h}function b(t){l=t,h=t==="ar"?u:y,document.documentElement.lang=t,document.documentElement.dir=t==="ar"?"rtl":"ltr"}function f(){return`
    <header class="top">
      <a class="brand" href="/v2/">${e().brand}</a>
      <nav>
        <a href="/">${e().v1}</a>
        <a href="/#analyze">${e().analyze}</a>
        <a href="/#marketplace">${e().market}</a>
        <button type="button" data-act="lang">${l==="ar"?"EN":"\u0639"}</button>
      </nav>
    </header>`}function v(){let t=n?.navigation||["overview","analyze","account"],a={overview:e().overview,analyze:e().analyze,activity:e().activity,account:e().account,sites:e().sites,team:e().team,market:e().market},i=t.filter(s=>a[s]&&!(n?.individualUx&&(s==="team"||s==="sites")));return`
    <header class="top">
      <a class="brand" href="/v2/">${e().brand}</a>
      <nav>
        ${i.map(s=>`<a href="#${s}">${a[s]}</a>`).join("")}
        <a href="/">${e().v1}</a>
        <button type="button" data-act="lang">${l==="ar"?"EN":"\u0639"}</button>
        <button type="button" data-act="logout">${e().logout}</button>
      </nav>
    </header>`}function $(){return`
    <main class="shell">
      <h1>${e().signIn}</h1>
      <form id="login" class="card">
        <label>${e().email}<input name="email" type="email" required></label>
        <label>${e().password}<input name="password" type="password" minlength="8" required></label>
        <button class="primary" type="submit">${e().signIn}</button>
      </form>
      <form id="register" class="card">
        <h2>${e().register}</h2>
        <label>${e().fullName}<input name="fullName" required></label>
        <label>${e().orgName}<input name="organizationName" required></label>
        <label>${e().email}<input name="email" type="email" required></label>
        <label>${e().password}<input name="password" type="password" minlength="8" required></label>
        <button class="primary" type="submit">${e().register}</button>
      </form>
      <p id="msg" class="msg" hidden></p>
    </main>`}function w(){return`
    <main class="shell">
      <h1>${e().question}</h1>
      <p>${e().needsOnboarding}</p>
      <div class="choices">
        <button data-seg="INDIVIDUAL">${e().individual}</button>
        <button data-seg="COMPANY_FACTORY">${e().company}</button>
        <button data-seg="GOVERNMENT">${e().government}</button>
      </div>
    </main>`}function S(){let t=location.hash.replace("#","")||"overview",a=n?.organization.customerSegment==="COMPANY_FACTORY",i=n?.organization.customerSegment==="GOVERNMENT",s=a||i;return`
    <main class="shell">
      <h1>${(n?.individualUx?n.user.fullName:n?.organization.name)||e().workspace}</h1>
      ${t==="sites"&&s?`<section id="sitesPanel" class="card"><h2>${e().sites}</h2><div id="siteList">${e().emptySites}</div>
        <form id="siteForm">
          <label>${e().siteName}<input name="name" required></label>
          <label>${e().city}<input name="city"></label>
          <button class="primary" type="submit">${e().createSite}</button>
        </form></section>`:""}
      ${t==="analyze"||t==="overview"?`<section class="card"><p>${e().analyzeHelp}</p><a class="primary link" href="/#analyze">${e().openAnalyze}</a></section>`:""}
      ${t==="account"?`<section class="card"><p>${n?.user.email||""}</p><p>${n?.organization.customerSegment||""}</p></section>`:""}
    </main>`}function c(){d.innerHTML=(n?v():f())+(n?n.needsOnboarding?w():S():$())}async function p(){try{n=await o.me()}catch{n=null}c(),n&&!n.needsOnboarding&&location.hash.replace("#","")==="sites"&&g()}async function g(){let t=document.getElementById("siteList");if(!t)return;let a=await o.sites();t.innerHTML=a.sites?.length?a.sites.map(i=>`<article><strong>${i.name}</strong><span>${i.city||""}</span></article>`).join(""):e().emptySites}d.addEventListener("click",async t=>{let a=t.target;if(a.dataset.act==="lang"){b(l==="ar"?"en":"ar"),c();return}if(a.dataset.act==="logout"){await o.postAuth({action:"logout"}),n=null,c();return}let i=a.dataset.seg;i&&(await o.patchOrg({customerSegment:i}),await p())});d.addEventListener("submit",async t=>{t.preventDefault();let a=t.target,i=Object.fromEntries(new FormData(a).entries()),s=document.getElementById("msg");try{if(a.id==="login"&&await o.postAuth({action:"login",...i}),a.id==="register"&&await o.postAuth({action:"register",kind:"both",...i}),a.id==="siteForm"){await o.createSite({name:i.name,city:i.city,siteType:"YARD"}),await g();return}await p()}catch(m){s&&(s.hidden=!1,s.textContent=m instanceof Error?m.message:"error")}});window.addEventListener("hashchange",()=>{c(),n&&location.hash.includes("sites")&&g()});b("ar");p();})();
