const base=(process.env.PRODUCTION_URL||"https://scrap-ai.vercel.app").replace(/\/$/,"");
const timeout=Number(process.env.SMOKE_TIMEOUT_MS||10000);
async function get(path,{json=false}={}){const c=new AbortController();const timer=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(base+path,{signal:c.signal,headers:{"User-Agent":"ScrapAI-Production-Smoke/1.0"}});const body=json?await r.json().catch(()=>null):await r.text();if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return body;}finally{clearTimeout(timer)}}
const html=await get("/");
for(const marker of ["Scrap AI","id=\"analyze\"","id=\"marketplace\"","production-client.js"]) if(!html.includes(marker)) throw new Error(`Production root missing ${marker}`);
const health=await get("/api/health",{json:true});
if(!health||health.status!=="ok") throw new Error(`Health is not ok: ${JSON.stringify(health)}`);
if(health.database!==true||health.session!==true) throw new Error(`Core persistence/session not ready: ${JSON.stringify(health)}`);
console.log("Scrap AI production core: PASS");
console.log("AI:",health.ai?"configured":"not configured");
console.log("Storage:",health.storage?"Cloudflare R2 configured":"Cloudflare R2 not configured");
if(!health.ai) console.warn("WARN: AI analysis will not use the production OpenAI provider.");
if(!health.storage) console.warn("WARN: private photo/report upload requires R2 production credentials.");
