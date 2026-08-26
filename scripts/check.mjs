import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const required=["index.html","styles.css","hardening.css","premium.css","app.js","production-client.js","package.json",".env.example","docs/ARCHITECTURE.md","docs/PRODUCT_AUDIT.md","docs/RELEASE_REPORT.md","docs/FINAL_QA_QC_REPORT.md","assets/logo-mark.svg","assets/logo-lockup.svg"];
for (const file of required) await access(file);
const html = await readFile("index.html","utf8");
for (const marker of ["id=\"mainContent\"","id=\"home\"","id=\"analyze\"","id=\"marketplace\"","id=\"dashboard\"","id=\"result\"","id=\"themeBtn\"","id=\"connectionState\"","id=\"menuBtn\"","id=\"priceTicker\"","production-client.js"]) if (!html.includes(marker)) throw new Error(`Missing ${marker}`);
const hardening=await readFile("hardening.css","utf8");
if(!hardening.includes('@import url("premium.css")')) throw new Error("Premium theme is not activated");
const premium=await readFile("premium.css","utf8");
for(const token of ["Premium Industrial AI UX","--canvas:#07110f",".hero-section",".drop-zone",".listing-card","@media(max-width:600px)"]) if(!premium.includes(token)) throw new Error(`Missing premium UX token ${token}`);
const app = await readFile("app.js","utf8");
for (const behavior of ["history.pushState","addEventListener(\"popstate\"","reportValidity()"] ) if (!app.includes(behavior)) throw new Error(`Missing behavior ${behavior}`);
const production=await readFile("production-client.js","utf8");
for(const behavior of ["/api/auth","/api/workflow","/api/platform","createListing","submitOffer","acceptOffer","R2 setup required","Analyze image with ChatGPT"]) if(!production.includes(behavior)) throw new Error(`Missing production behavior ${behavior}`);
for(const file of ["app.js","production-client.js"]){const syntax=spawnSync(process.execPath,["--check",file],{stdio:"inherit"});if(syntax.status!==0)process.exit(syntax.status??1);}
console.log("Scrap AI release + premium UX checks passed.");
