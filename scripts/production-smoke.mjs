const base=(process.env.PRODUCTION_URL||"https://scrap-ai.vercel.app").replace(/\/$/,"");
const timeout=Number(process.env.SMOKE_TIMEOUT_MS||15000);

async function raw(path,{method="GET",body,cookie}={}){const c=new AbortController();const timer=setTimeout(()=>c.abort(),timeout);try{const headers={"User-Agent":"ScrapAI-Production-Smoke/2.0"};if(body!==undefined)headers["Content-Type"]="application/json";if(cookie)headers.Cookie=cookie;const r=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:c.signal});const text=await r.text();let data=null;try{data=JSON.parse(text)}catch{}return{r,text,data,cookie:r.headers.get("set-cookie")?.split(";")[0]||cookie}}finally{clearTimeout(timer)}}
async function ok(path,options={}){const x=await raw(path,options);if(!x.r.ok)throw new Error(`${path} HTTP ${x.r.status}: ${x.text.slice(0,300)}`);return x}
function expect(value,message){if(!value)throw new Error(message)}

const root=await ok("/");
for(const marker of ["Scrap AI","simple-market.css","scrap-hero.svg","openScrapAccount","id=\"marketplace\""]) expect(root.text.includes(marker),`Production root missing ${marker}`);
for(const forbidden of ["Scrap AI by EADA","eada-platform.vercel.app","data-t=\"nav_eada\""]) expect(!root.text.includes(forbidden),`Production root still contains ${forbidden}`);

const health=(await ok("/api/health")).data;
expect(health?.status==="ok",`Health is not ok: ${JSON.stringify(health)}`);
expect(health.database===true&&health.session===true,`Core persistence/session not ready: ${JSON.stringify(health)}`);

const stamp=`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const password=`Qa!${Date.now()}x`;

const sellerReg=await ok("/api/auth",{method:"POST",body:{action:"register",fullName:"QA Seller",organizationName:`QA Scrap Seller ${stamp}`,kind:"seller",email:`qa-seller-${stamp}@example.test`,password}});
const sellerCookie=sellerReg.cookie;expect(sellerCookie,"Seller session cookie missing");
const listing=await ok("/api/workflow",{method:"POST",cookie:sellerCookie,body:{action:"createListing",title:`[QA] Copper Scrap ${stamp}`,material:"copper",quantity:100,unit:"kg",city:"Riyadh",indicativeValue:1200}});
const listingId=listing.data?.listing?.id;expect(listingId,"Listing creation did not return an id");

const buyerReg=await ok("/api/auth",{method:"POST",body:{action:"register",fullName:"QA Buyer",organizationName:`QA Scrap Buyer ${stamp}`,kind:"buyer",email:`qa-buyer-${stamp}@example.test`,password}});
const buyerCookie=buyerReg.cookie;expect(buyerCookie,"Buyer session cookie missing");
const buyerView=await ok("/api/workflow",{cookie:buyerCookie});expect(buyerView.data?.listings?.some(x=>x.id===listingId),"Buyer cannot see seller listing");
const offer=await ok("/api/workflow",{method:"POST",cookie:buyerCookie,body:{action:"submitOffer",listingId,amount:1100}});
const offerId=offer.data?.offer?.id;expect(offerId,"Offer creation did not return an id");

const accepted=await ok("/api/workflow",{method:"POST",cookie:sellerCookie,body:{action:"acceptOffer",offerId,scheduledAt:new Date(Date.now()+86400000).toISOString(),address:"QA Pickup - Riyadh"}});
expect(accepted.data?.offer?.status==="accepted","Seller could not accept buyer offer");
expect(accepted.data?.pickup?.id,"Pickup was not created after acceptance");

const transaction=await ok("/api/platform",{method:"POST",cookie:sellerCookie,body:{action:"createTransaction",offerId}});
const transactionId=transaction.data?.transaction?.id;expect(transactionId,"Accepted offer did not create transaction");
const inspected=await ok("/api/platform",{method:"POST",cookie:sellerCookie,body:{action:"recordInspection",transactionId,inspectedWeight:98,purityPercent:92,weighbridgeTicket:`QA-${stamp}`}});
expect(inspected.data?.transaction?.stage==="inspected","Inspection stage was not recorded");
const advanced=await ok("/api/platform",{method:"POST",cookie:sellerCookie,body:{action:"advanceTransaction",transactionId}});
expect(advanced.data?.transaction?.stage==="final_weight_confirmed","Transaction did not advance to final_weight_confirmed");

console.log("Scrap AI production journey: PASS");
console.log("Seller listing -> Buyer offer -> Seller accept -> Pickup -> Transaction -> Inspection -> Final weight: PASS");
console.log("AI:",health.ai?"configured":"not configured");
console.log("Storage:",health.storage?"Cloudflare R2 configured":"Cloudflare R2 not configured");
if(!health.ai)console.warn("WARN: AI provider is not configured in production.");
if(!health.storage)console.warn("WARN: private evidence upload requires R2 production credentials.");
