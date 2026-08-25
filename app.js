/* ===== TRANSLATIONS ===== */
const copy = {
  ar: {
    nav_home:"الرئيسية", nav_analyze:"حلّل", nav_market:"السوق", nav_dash:"لوحة التحكم", nav_eada:"منصة إعادة",
    hero_badge:"مدعوم بالذكاء الاصطناعي", hero_title:'صوّر. حلّل.<br><em>تداول بذكاء.</em>', hero_desc:"منصة متكاملة لتحليل السكراب بالذكاء الاصطناعي، أسعار السوق اللحظية، ومطابقة المشترين والبائعين في السوق السعودي.", hero_cta:"ابدأ التحليل مجاناً", hero_cta2:"تصفح السوق", hero_materials:"فئات مواد", hero_routes:"مسارات قيمة", hero_currency:"أسعار محلية", hero_ai:"تحليل ذكي",
    fc_copper:"نحاس", fc_alum:"ألمنيوم", fc_steel:"حديد",
    how_badge:"كيف تعمل المنصة", how_title:"من الصورة إلى الصفقة في 60 ثانية",
    step1_title:"صوّر السكراب", step1_desc:"التقط صورة للمادة أو ارفعها من جهازك",
    step2_title:"تحليل AI فوري", step2_desc:"الذكاء الاصطناعي يصنّف المادة والنقاء والقيمة",
    step3_title:"سعر السوق", step3_desc:"تسعير فوري مرتبط بأسعار السوق السعودي",
    step4_title:"تداول وبِع", step4_desc:"انشر عرضك أو تطابق مع مشترين تلقائياً",
    prices_badge:"أسعار لحظية", prices_title:"أسعار السوق السعودي", prices_note:"الأسعار استرشادية مبنية على متوسط السوق المحلي وبورصة لندن للمعادن (LME). آخر تحديث يدوي.",
    feat_badge:"مميزات المنصة", feat_title:"كل ما يحتاجه البائع والمشتري",
    feat1_title:"تحليل بالصورة", feat1_desc:"صوّر السكراب والذكاء الاصطناعي يحدد النوع والنقاء والقيمة فوراً",
    feat2_title:"أسعار لحظية", feat2_desc:"أسعار مرتبطة بالسوق السعودي وبورصة LME مع تنبيهات الأسعار",
    feat3_title:"مطابقة ذكية", feat3_desc:"AI يطابق عروضك مع أفضل المشترين حسب الموقع والمادة",
    feat4_title:"تحقق موثوق", feat4_desc:"تحقق بالسجل التجاري وشهادات الجودة لبيئة تداول آمنة",
    feat5_title:"لوجستيات متكاملة", feat5_desc:"ربط مع ناقلي السكراب المحليين لخدمة التوصيل والاستلام",
    feat6_title:"تصميم موبايل أولاً", feat6_desc:"واجهة سهلة تعمل من الجوال والكمبيوتر بالعربي والإنجليزي",
    cta_title:"جاهز تبدأ التداول الذكي؟", cta_desc:"حلّل السكراب مجاناً واحصل على أفضل سعر في السوق", cta_btn:"ابدأ الآن",
    analyze_badge:"تحليل ذكي", analyze_title:"حلّل السكراب واعرف قيمته", analyze_desc:"ارفع صورة وأدخل التفاصيل للحصول على تقدير AI للمادة والنقاء والقيمة والمسار الأفضل",
    input_title:"بيانات السكراب", input_badge:"مجاني",
    upload:"ارفع صورة السكراب", upload_hint:"أو اسحب الصورة هنا",
    material:"نوع المادة", auto:"🤖 تقدير تلقائي", copper:"🟠 نحاس / كيابل", aluminum:"⚪ ألمنيوم", steel:"⚙️ حديد / فولاذ", ewaste:"💻 نفايات إلكترونية", battery:"🔋 بطاريات", mixed:"♻️ مختلط",
    weight:"الوزن (كجم)", clean:"حالة الفرز", sorted:"✅ نظيف ومفروز", medium:"⚡ متوسط", dirty:"⚠️ مختلط / ملوث",
    goal:"الهدف", sell:"💵 بيع سريع", maximize:"📈 تعظيم القيمة", export:"🌍 فرصة تصدير", recycle:"♻️ تدوير ملتزم",
    run:"🔍 تشغيل التحليل", disclaimer:"تحليل OpenAI حقيقي للمستخدم المسجل؛ تقديري وليس فحصًا مخبريًا أو عرض سعر ملزمًا.",
    waiting:"بانتظار بيانات السكراب", waitingText:"ستظهر هنا المادة والنقاء والقيمة والمسار المقترح.",
    f1:"صورة", f2:"تصنيف", f3:"نقاء", f4:"قيمة", f5:"مسار",
    market_badge:"السوق", market_title:"سوق السكراب السعودي", market_desc:"تصفح العروض المتاحة أو انشر عرضك وتطابق مع مشترين",
    stat_listings:"عروض نشطة", stat_buyers:"مشترين مسجلين", stat_volume:"حجم التداول", stat_avg:"متوسط وقت البيع", stat_avg_val:"24 ساعة",
    search_placeholder:"ابحث في العروض...",
    filter_all:"الكل", filter_copper:"🟠 نحاس", filter_alum:"⚪ ألمنيوم", filter_steel:"⚙️ حديد", filter_ewaste:"💻 إلكتروني", filter_battery:"🔋 بطاريات", filter_mixed:"♻️ مختلط",
    sort_new:"الأحدث", sort_high:"السعر: الأعلى", sort_low:"السعر: الأقل", sort_weight:"الوزن",
    create_title:"عندك سكراب للبيع؟", create_desc:"حلّل المادة أولاً ثم انشر عرضك في السوق", create_btn:"حلّل وانشر",
    dash_badge:"لوحة التحكم", dash_title:"إدارة أعمالك",
    analyses:"التحليلات", value:"القيمة المقدرة", listings:"مسودات العروض", matches:"المطابقات",
    tab_history:"سجل التحليلات", tab_listings:"عروضي", tab_alerts:"تنبيهات الأسعار",
    recent:"آخر التحليلات", clear:"مسح السجل", drafts:"مسودات العروض",
    alerts_title:"تنبيهات الأسعار", add_alert:"+ إضافة تنبيه", no_alerts:"لا توجد تنبيهات. أضف تنبيه ليصلك إشعار عند تغير السعر.",
    alert_dialog_title:"إضافة تنبيه سعر", alert_material:"المادة", alert_condition:"الشرط", alert_above:"السعر أعلى من", alert_below:"السعر أقل من", alert_price:"السعر (SAR/kg)", cancel:"إلغاء", save_alert:"حفظ التنبيه",
    match_title:"المشترين المطابقين",
    online:"● متصل", offline:"● غير متصل", skip:"انتقل إلى المحتوى",
    listing_created:"تم إنشاء مسودة العرض", alert_saved:"تم حفظ التنبيه", alert_removed:"تم حذف التنبيه", history_cleared:"تم مسح السجل",
    img_error:"اختر صورة أقل من 8 MB", match_msg:"مطابقة المشترين تتطلب قاعدة بيانات إنتاجية",
    purity_label:"النقاء", price_kg:"سعر / كجم", weight_label:"الوزن", confidence_label:"ثقة التقدير",
    route_label:"المسار المبدئي", route_note:"يلزم فحص وعرض سعر حقيقي قبل التنفيذ.",
    current_val:"القيمة الحالية", process_cost:"تكلفة التحسين", optimized_val:"القيمة المحسنة", net_gain:"صافي الربح المتوقع",
    create_listing:"إنشاء مسودة عرض", match_buyer:"مطابقة مشترٍ",
    prediction_title:"📈 توقع السعر (7 أيام)", pred_today:"اليوم", pred_d2:"يوم 2", pred_d3:"يوم 3", pred_d4:"يوم 4", pred_d5:"يوم 5", pred_d6:"يوم 6", pred_d7:"يوم 7",
    route_resale:"بيع مباشر لمشترٍ صناعي", route_recycle:"تدوير عبر معالج مؤهل", route_reexport:"فحص فرصة إعادة تصدير", route_upgrade:"رفع درجة الفرز ثم البيع",
    price_low:"أدنى", price_high:"أعلى", price_updated:"آخر تحديث",
    listing_active:"نشط", listing_view:"عرض", listing_contact:"تواصل",
    match_score:"تطابق", match_location:"الموقع", match_capacity:"الطاقة الشهرية",
    no_history:"لا توجد تحليلات بعد", no_listings:"لا توجد مسودات بعد"
  },
  en: {
    nav_home:"Home", nav_analyze:"Analyze", nav_market:"Market", nav_dash:"Dashboard", nav_eada:"EADA Platform",
    hero_badge:"AI-Powered", hero_title:'Snap. Analyze.<br><em>Trade Smart.</em>', hero_desc:"All-in-one platform for AI scrap analysis, live Saudi market prices, and buyer-seller matching.", hero_cta:"Start Free Analysis", hero_cta2:"Browse Market", hero_materials:"Material classes", hero_routes:"Value routes", hero_currency:"Local prices", hero_ai:"Smart analysis",
    fc_copper:"Copper", fc_alum:"Aluminum", fc_steel:"Steel",
    how_badge:"How It Works", how_title:"From photo to deal in 60 seconds",
    step1_title:"Photograph Scrap", step1_desc:"Take a photo or upload from your device",
    step2_title:"Instant AI Analysis", step2_desc:"AI classifies material, purity, and value",
    step3_title:"Market Price", step3_desc:"Instant pricing linked to Saudi market rates",
    step4_title:"Trade & Sell", step4_desc:"Publish your listing or auto-match with buyers",
    prices_badge:"Live Prices", prices_title:"Saudi Market Prices", prices_note:"Indicative prices based on local market averages and London Metal Exchange (LME). Last manual update.",
    feat_badge:"Platform Features", feat_title:"Everything buyers and sellers need",
    feat1_title:"Photo Analysis", feat1_desc:"Photograph scrap and AI instantly identifies type, purity, and value",
    feat2_title:"Live Prices", feat2_desc:"Prices linked to Saudi market and LME with price alerts",
    feat3_title:"Smart Matching", feat3_desc:"AI matches your listings with the best buyers by location and material",
    feat4_title:"Verified Trust", feat4_desc:"CR verification and quality certificates for safe trading",
    feat5_title:"Integrated Logistics", feat5_desc:"Connect with local scrap haulers for pickup and delivery",
    feat6_title:"Mobile First", feat6_desc:"Easy interface for mobile and desktop in Arabic and English",
    cta_title:"Ready for smart trading?", cta_desc:"Analyze scrap for free and get the best market price", cta_btn:"Start Now",
    analyze_badge:"Smart Analysis", analyze_title:"Analyze scrap & discover its value", analyze_desc:"Upload an image and enter details for an AI estimate of material, purity, value, and best route",
    input_title:"Scrap Data", input_badge:"Free",
    upload:"Upload scrap image", upload_hint:"or drag & drop here",
    material:"Material type", auto:"🤖 Auto estimate", copper:"🟠 Copper / cables", aluminum:"⚪ Aluminum", steel:"⚙️ Iron / steel", ewaste:"💻 E-waste", battery:"🔋 Batteries", mixed:"♻️ Mixed",
    weight:"Weight (kg)", clean:"Sorting condition", sorted:"✅ Clean & sorted", medium:"⚡ Medium", dirty:"⚠️ Mixed / contaminated",
    goal:"Goal", sell:"💵 Sell fast", maximize:"📈 Maximize value", export:"🌍 Export opportunity", recycle:"♻️ Compliant recycling",
    run:"🔍 Run Analysis", disclaimer:"Real OpenAI analysis for signed-in users; indicative, not a laboratory inspection or binding quote.",
    waiting:"Waiting for scrap data", waitingText:"Material, purity, value and suggested route will appear here.",
    f1:"Image", f2:"Classify", f3:"Purity", f4:"Value", f5:"Route",
    market_badge:"Market", market_title:"Saudi Scrap Market", market_desc:"Browse available listings or publish yours and match with buyers",
    stat_listings:"Active listings", stat_buyers:"Registered buyers", stat_volume:"Trade volume", stat_avg:"Avg. sale time", stat_avg_val:"24 hours",
    search_placeholder:"Search listings...",
    filter_all:"All", filter_copper:"🟠 Copper", filter_alum:"⚪ Aluminum", filter_steel:"⚙️ Steel", filter_ewaste:"💻 E-waste", filter_battery:"🔋 Batteries", filter_mixed:"♻️ Mixed",
    sort_new:"Newest", sort_high:"Price: High", sort_low:"Price: Low", sort_weight:"Weight",
    create_title:"Have scrap to sell?", create_desc:"Analyze the material first then publish to the market", create_btn:"Analyze & List",
    dash_badge:"Dashboard", dash_title:"Manage Your Business",
    analyses:"Analyses", value:"Estimated value", listings:"Listing drafts", matches:"Matches",
    tab_history:"Analysis History", tab_listings:"My Listings", tab_alerts:"Price Alerts",
    recent:"Recent Analyses", clear:"Clear History", drafts:"Listing Drafts",
    alerts_title:"Price Alerts", add_alert:"+ Add Alert", no_alerts:"No alerts yet. Add one to get notified when prices change.",
    alert_dialog_title:"Add Price Alert", alert_material:"Material", alert_condition:"Condition", alert_above:"Price above", alert_below:"Price below", alert_price:"Price (SAR/kg)", cancel:"Cancel", save_alert:"Save Alert",
    match_title:"Matched Buyers",
    online:"● Online", offline:"● Offline", skip:"Skip to content",
    listing_created:"Listing draft created", alert_saved:"Alert saved", alert_removed:"Alert removed", history_cleared:"History cleared",
    img_error:"Choose an image under 8 MB", match_msg:"Buyer matching requires a production database",
    purity_label:"Purity", price_kg:"Price / kg", weight_label:"Weight", confidence_label:"Estimate confidence",
    route_label:"Preliminary route", route_note:"Inspection and a real quote are required before execution.",
    current_val:"Current value", process_cost:"Processing cost", optimized_val:"Optimized value", net_gain:"Expected net gain",
    create_listing:"Create listing draft", match_buyer:"Match buyer",
    prediction_title:"📈 Price Forecast (7 days)", pred_today:"Today", pred_d2:"Day 2", pred_d3:"Day 3", pred_d4:"Day 4", pred_d5:"Day 5", pred_d6:"Day 6", pred_d7:"Day 7",
    route_resale:"Direct industrial sale", route_recycle:"Qualified recycling route", route_reexport:"Assess re-export opportunity", route_upgrade:"Improve grade, then sell",
    price_low:"Low", price_high:"High", price_updated:"Last updated",
    listing_active:"Active", listing_view:"View", listing_contact:"Contact",
    match_score:"Match", match_location:"Location", match_capacity:"Monthly capacity",
    no_history:"No analyses yet", no_listings:"No drafts yet"
  }
};

/* ===== MATERIAL CATALOG ===== */
const catalog = {
  copper:   { ar:"نحاس / كيابل", en:"Copper / cables", price:27.5, purity:78, icon:"🟠", lme:8945, change:3.2 },
  aluminum: { ar:"ألمنيوم",      en:"Aluminum",        price:7.2,  purity:86, icon:"⚪", lme:2415, change:1.8 },
  steel:    { ar:"حديد / فولاذ",  en:"Iron / steel",    price:1.35, purity:92, icon:"⚙️", lme:420,  change:-0.5 },
  ewaste:   { ar:"نفايات إلكترونية", en:"E-waste",     price:9.8,  purity:54, icon:"💻", lme:0,    change:2.1 },
  battery:  { ar:"بطاريات",      en:"Batteries",       price:3.9,  purity:75, icon:"🔋", lme:0,    change:0.8 },
  mixed:    { ar:"سكراب مختلط",  en:"Mixed scrap",     price:4.2,  purity:48, icon:"♻️", lme:0,    change:-0.3 }
};

/* ===== SAMPLE MARKETPLACE DATA ===== */
const sampleListings = [
  { id:"MKT-001", material:"copper", weight:1200, value:39600, city:"ar:الرياض|en:Riyadh", seller:"ar:مصنع الخليج|en:Gulf Factory", verified:true, date:"2026-08-14" },
  { id:"MKT-002", material:"aluminum", weight:3500, value:24150, city:"ar:جدة|en:Jeddah", seller:"ar:شركة النور|en:Al Noor Co.", verified:true, date:"2026-08-13" },
  { id:"MKT-003", material:"steel", weight:8000, value:10800, city:"ar:الدمام|en:Dammam", seller:"ar:مؤسسة البناء|en:Al Binaa Est.", verified:false, date:"2026-08-13" },
  { id:"MKT-004", material:"ewaste", weight:450, value:4410, city:"ar:الرياض|en:Riyadh", seller:"ar:تقنية الأمس|en:Yesterday Tech", verified:true, date:"2026-08-12" },
  { id:"MKT-005", material:"copper", weight:600, value:17820, city:"ar:مكة|en:Makkah", seller:"ar:ورشة الحداد|en:Al Haddad Workshop", verified:false, date:"2026-08-11" },
  { id:"MKT-006", material:"battery", weight:2000, value:7800, city:"ar:الرياض|en:Riyadh", seller:"ar:بطاريات السعودية|en:Saudi Batteries", verified:true, date:"2026-08-10" },
  { id:"MKT-007", material:"mixed", weight:5000, value:21000, city:"ar:تبوك|en:Tabuk", seller:"ar:مجمع التدوير|en:Recycling Complex", verified:true, date:"2026-08-10" },
  { id:"MKT-008", material:"aluminum", weight:1800, value:12420, city:"ar:أبها|en:Abha", seller:"ar:معادن الجنوب|en:Southern Metals", verified:false, date:"2026-08-09" }
];

/* ===== SAMPLE BUYERS ===== */
const sampleBuyers = [
  { name:"ar:مصنع حديد السعودية|en:Saudi Iron Factory", city:"ar:الرياض|en:Riyadh", materials:["steel","mixed"], capacity:"500 tons", score:95 },
  { name:"ar:شركة النحاس العربية|en:Arabian Copper Co.", city:"ar:جدة|en:Jeddah", materials:["copper"], capacity:"200 tons", score:92 },
  { name:"ar:مصنع الألمنيوم الوطني|en:National Aluminum Factory", city:"ar:الدمام|en:Dammam", materials:["aluminum"], capacity:"350 tons", score:88 },
  { name:"ar:شركة تدوير التقنية|en:Tech Recycling Co.", city:"ar:الرياض|en:Riyadh", materials:["ewaste","battery"], capacity:"100 tons", score:85 },
  { name:"ar:مجموعة المعادن المتحدة|en:United Metals Group", city:"ar:الجبيل|en:Jubail", materials:["copper","aluminum","steel"], capacity:"800 tons", score:90 }
];

/* ===== STATE ===== */
let lang = localStorage.getItem("scrap_ai_lang") || "ar";
let currentFilter = "all";

/* ===== HELPERS ===== */
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function fmt(n) { return n.toLocaleString(lang === "ar" ? "ar-SA" : "en-US"); }
function t(key) { return copy[lang][key] || key; }
function localized(str) { const parts = str.split("|"); for (const p of parts) { if (p.startsWith(lang + ":")) return p.slice(lang.length + 1); } return parts[0].replace(/^[a-z]{2}:/, ""); }

/* ===== LANGUAGE ===== */
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-t]").forEach(el => {
    const key = el.dataset.t;
    if (copy[lang][key]) el.innerHTML = copy[lang][key];
  });
  document.querySelectorAll("[data-t-placeholder]").forEach(el => {
    const key = el.dataset.tPlaceholder;
    if (copy[lang][key]) el.placeholder = copy[lang][key];
  });
  const langBtn = document.getElementById("langBtn");
  langBtn.textContent = lang === "ar" ? "EN" : "AR";
  langBtn.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
  document.getElementById("skipLink").textContent = t("skip");
  renderTicker();
  renderPriceGrid();
  renderMarketplace();
  renderDashboard();
  renderAlerts();
  updateConnectionState();
}

function toggleLang() {
  lang = lang === "ar" ? "en" : "ar";
  localStorage.setItem("scrap_ai_lang", lang);
  applyLang();
}

/* ===== THEME ===== */
function applyTheme() {
  const theme = localStorage.getItem("scrap_ai_theme") || "light";
  document.documentElement.dataset.theme = theme;
  document.getElementById("themeBtn").textContent = theme === "dark" ? "☀" : "◐";
}
function toggleTheme() {
  localStorage.setItem("scrap_ai_theme", document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  applyTheme();
}

/* ===== MENU ===== */
function toggleMenu() {
  const nav = document.getElementById("mainNav");
  const btn = document.getElementById("menuBtn");
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", String(open));
}
function closeMenu() {
  document.getElementById("mainNav").classList.remove("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded", "false");
}

/* ===== NAVIGATION ===== */
function showPage(id, opts = {}) {
  const { updateHistory = true } = opts;
  const target = document.getElementById(id);
  if (!target) return;
  document.querySelectorAll(".page").forEach(el => {
    el.classList.toggle("active", el.id === id);
    el.setAttribute("aria-hidden", String(el.id !== id));
  });
  document.querySelectorAll("nav button[data-t]").forEach(btn => {
    const page = btn.dataset.t.replace("nav_", "");
    btn.classList.toggle("nav-active", page === id);
  });
  closeMenu();
  if (updateHistory && location.hash !== `#${id}`) history.pushState({ page: id }, "", `#${id}`);
  if (id === "dashboard") renderDashboard();
  if (id === "marketplace") renderMarketplace();
  scrollTo(0, 0);
  target.focus({ preventScroll: true });
}

/* ===== PRICE TICKER ===== */
function renderTicker() {
  const track = document.getElementById("tickerTrack");
  let items = "";
  for (const [key, mat] of Object.entries(catalog)) {
    const dir = mat.change >= 0 ? "up" : "down";
    const arrow = mat.change >= 0 ? "▲" : "▼";
    items += `<span class="ticker-item"><strong>${mat.icon} ${mat[lang]}</strong> ${mat.price} SAR/kg <span class="${dir}">${arrow} ${Math.abs(mat.change)}%</span></span>`;
  }
  track.innerHTML = items + items;
}

/* ===== PRICE GRID ===== */
function renderPriceGrid() {
  const grid = document.getElementById("priceGrid");
  if (!grid) return;
  let html = "";
  for (const [key, mat] of Object.entries(catalog)) {
    const dir = mat.change >= 0 ? "up" : "down";
    const arrow = mat.change >= 0 ? "▲" : "▼";
    const low = (mat.price * 0.88).toFixed(2);
    const high = (mat.price * 1.12).toFixed(2);
    html += `<div class="price-card">
      <div class="price-card-head"><span class="icon">${mat.icon}</span><span class="name">${mat[lang]}</span></div>
      <div class="price">${mat.price} <small>SAR/kg</small></div>
      <span class="change ${dir}">${arrow} ${Math.abs(mat.change)}%</span>
      ${mat.lme ? `<div class="range"><span>LME: $${fmt(mat.lme)}/t</span></div>` : ""}
      <div class="range"><span>${t("price_low")}: ${low}</span><span>${t("price_high")}: ${high}</span></div>
    </div>`;
  }
  grid.innerHTML = html;
  const updated = document.getElementById("priceUpdated");
  if (updated) updated.textContent = `${t("price_updated")}: ${new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}`;
}

/* ===== IMAGE PREVIEW ===== */
function previewImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) { toast(t("img_error")); return; }
  const reader = new FileReader();
  reader.onload = e => document.getElementById("preview").innerHTML = `<img src="${e.target.result}" alt="Scrap preview">`;
  reader.readAsDataURL(file);
}

/* ===== MATERIAL INFERENCE ===== */
function inferMaterial() {
  const selected = document.getElementById("material").value;
  if (selected !== "auto") return selected;
  const name = (document.getElementById("image").files?.[0]?.name || "").toLowerCase();
  if (/copper|cable|wire/.test(name)) return "copper";
  if (/alum/.test(name)) return "aluminum";
  if (/steel|iron/.test(name)) return "steel";
  if (/battery|batt/.test(name)) return "battery";
  if (/pcb|electronic|laptop|phone/.test(name)) return "ewaste";
  return "mixed";
}

/* ===== ANALYSIS ===== */
function publicImageData(file) {
  return new Promise((resolve, reject) => {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return reject(new Error(lang === "ar" ? "اختر صورة JPG أو PNG أو WebP" : "Choose a JPG, PNG or WebP image"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("image_read_failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("invalid_image"));
      image.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const safeAi = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));

async function analyze() {
  const weightInput = document.getElementById("weight");
  if (!weightInput.reportValidity()) return;
  const file = document.getElementById("image").files?.[0];
  if (!file) { toast(lang === "ar" ? "ارفع صورة السكراب أولاً" : "Upload a scrap image first"); return; }
  const result = document.getElementById("result");
  result.innerHTML = `<div class="empty-state"><h2>${lang === "ar" ? "جاري تحليل الصورة عبر OpenAI..." : "Analyzing the image with OpenAI..."}</h2></div>`;
  const weight = Math.min(100000000, Math.max(1, +weightInput.value || 1));
  const clean = document.getElementById("clean").value;
  const goal = document.getElementById("goal").value;
  try {
    const imageDataUrl = await publicImageData(file);
    const response = await fetch("/api/ai-analyze", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ imageDataUrl, estimatedWeightKg:weight, notes:`sorting=${clean}; goal=${goal}` }) });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      result.innerHTML = `<div class="empty-state"><h2>${lang === "ar" ? "سجل الدخول لتشغيل تحليل OpenAI الحقيقي" : "Sign in to run real OpenAI analysis"}</h2><p>${lang === "ar" ? "افتح حساب الإنتاج ثم أعد التحليل." : "Open the Production account, then run the analysis again."}</p><button class="btn-primary" onclick="document.getElementById('prodOpen').click()">${lang === "ar" ? "فتح حساب الإنتاج" : "Open Production account"}</button></div>`;
      return;
    }
    if (!response.ok) throw new Error(payload.error || "analysis_failed");
    const a = payload.analysis, confidence = Math.round(Number(a.confidence) * 100);
    result.innerHTML = `<div class="result-identify"><div><span class="material-chip">🤖 ${safeAi(lang === "ar" ? a.materialLabelAr : a.materialLabelEn)}</span><p class="confidence">${t("confidence_label")}: ${confidence}%</p><div class="confidence-bar"><div class="confidence-fill" style="width:${confidence}%"></div></div></div></div><div class="result-metrics"><div class="metric-card"><span>${t("purity_label")}</span><strong>${Math.round(Number(a.purityEstimatePercent))}%</strong></div><div class="metric-card"><span>${lang === "ar" ? "الدرجة" : "Grade"}</span><strong>${safeAi(a.grade)}</strong></div><div class="metric-card"><span>${t("weight_label")}</span><strong>${fmt(weight)} kg</strong></div></div><div class="result-route"><small>${lang === "ar" ? "ملاحظات الصورة" : "Image observations"}</small><p>${safeAi(lang === "ar" ? a.observationsAr : a.observationsEn)}</p><h3>${lang === "ar" ? "الفحص المطلوب" : "Required inspection"}</h3><p>${safeAi(lang === "ar" ? a.recommendedInspectionAr : a.recommendedInspectionEn)}</p><p class="disclaimer">${safeAi(lang === "ar" ? a.pricingCaveatAr : a.pricingCaveatEn)}</p></div><div class="result-actions"><button class="btn-listing" onclick="document.getElementById('prodOpen').click()">${lang === "ar" ? "إنشاء عرض إنتاجي" : "Create production listing"}</button></div>`;
  } catch (error) {
    result.innerHTML = `<div class="empty-state"><h2>${lang === "ar" ? "تعذر التحليل" : "Analysis unavailable"}</h2><p>${safeAi(error.message)}</p></div>`;
  }
}

function generatePredictions(basePrice, changePercent) {
  const labels = [t("pred_today"), t("pred_d2"), t("pred_d3"), t("pred_d4"), t("pred_d5"), t("pred_d6"), t("pred_d7")];
  const values = [basePrice];
  const daily = changePercent / 7;
  for (let i = 1; i < 7; i++) {
    const noise = (Math.random() - 0.5) * 0.5;
    values.push(values[i - 1] * (1 + (daily + noise) / 100));
  }
  const max = Math.max(...values);
  return values.map((v, i) => ({ label: labels[i], h: Math.max(20, Math.round((v / max) * 100)) }));
}

/* ===== LISTINGS ===== */
function createListing(material, weight, value) {
  const listings = read("scrap_ai_listings", []);
  listings.unshift({ id: `SCRAP-${Date.now()}`, material, weight, value, status: "draft", date: new Date().toISOString() });
  localStorage.setItem("scrap_ai_listings", JSON.stringify(listings));
  toast(t("listing_created"));
}

/* ===== BUYER MATCHING ===== */
function showBuyerMatch(material) {
  const matches = sampleBuyers.filter(b => b.materials.includes(material)).sort((a, b) => b.score - a.score);
  const modal = document.getElementById("matchModal");
  const results = document.getElementById("matchResults");

  if (matches.length === 0) {
    results.innerHTML = `<div class="empty-state small"><p>${t("match_msg")}</p></div>`;
  } else {
    results.innerHTML = matches.map(b => `
      <div class="match-card">
        <div class="match-avatar">🏭</div>
        <div class="match-info">
          <h4>${localized(b.name)}</h4>
          <p>${t("match_location")}: ${localized(b.city)} · ${t("match_capacity")}: ${b.capacity}</p>
        </div>
        <div class="match-score">
          <strong>${b.score}%</strong>
          <small>${t("match_score")}</small>
        </div>
      </div>`).join("");
  }
  modal.classList.add("open");
}

function closeMatchModal() { document.getElementById("matchModal").classList.remove("open"); }

/* ===== MARKETPLACE ===== */
function renderMarketplace() {
  const grid = document.getElementById("listingsGrid");
  if (!grid) return;

  const userListings = read("scrap_ai_listings", []);
  const allListings = [...sampleListings, ...userListings.map(l => ({
    ...l,
    city: lang === "ar" ? "ar:الرياض|en:Riyadh" : "ar:الرياض|en:Riyadh",
    seller: lang === "ar" ? "ar:أنت|en:You" : "ar:أنت|en:You",
    verified: false
  }))];

  let filtered = currentFilter === "all" ? allListings : allListings.filter(l => l.material === currentFilter);

  const search = document.getElementById("marketSearch")?.value?.toLowerCase() || "";
  if (search) {
    filtered = filtered.filter(l =>
      (catalog[l.material]?.[lang] || "").toLowerCase().includes(search) ||
      localized(l.city).toLowerCase().includes(search) ||
      localized(l.seller).toLowerCase().includes(search) ||
      l.id.toLowerCase().includes(search)
    );
  }

  const sort = document.getElementById("marketSort")?.value || "newest";
  if (sort === "price_high") filtered.sort((a, b) => b.value - a.value);
  else if (sort === "price_low") filtered.sort((a, b) => a.value - b.value);
  else if (sort === "weight") filtered.sort((a, b) => b.weight - a.weight);

  const stats = read("scrap_ai_listings", []);
  document.getElementById("marketListings").textContent = fmt(allListings.length);
  document.getElementById("marketBuyers").textContent = fmt(sampleBuyers.length);
  document.getElementById("marketVolume").textContent = `${fmt(allListings.reduce((s, l) => s + l.value, 0))} SAR`;

  grid.innerHTML = filtered.map(l => {
    const mat = catalog[l.material] || catalog.mixed;
    return `<div class="listing-card">
      <div class="listing-img">${mat.icon}<span class="listing-status">${t("listing_active")}</span></div>
      <div class="listing-body">
        <h3>${mat[lang]}</h3>
        <div class="listing-meta">
          <span>📍 ${localized(l.city)}</span>
          <span>⚖️ ${fmt(l.weight)} kg</span>
          ${l.verified ? '<span>✅</span>' : ''}
        </div>
        <div class="listing-price">
          <div><strong>${fmt(l.value)} SAR</strong><br><small>${(l.value / l.weight).toFixed(1)} SAR/kg</small></div>
          <span style="font-size:11px;color:var(--muted)">${l.id}</span>
        </div>
        <div class="listing-actions">
          <button class="btn-listing" onclick="toast('${l.id}')">${t("listing_view")}</button>
          <button class="btn-match" onclick="toast('${t("match_msg")}')">${t("listing_contact")}</button>
        </div>
      </div>
    </div>`;
  }).join("");

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state small"><p>${t("no_listings")}</p></div>`;
  }
}

function filterByMaterial(mat) {
  currentFilter = mat;
  document.querySelectorAll(".filter-chips .chip").forEach(c => c.classList.remove("active"));
  event.target.classList.add("active");
  renderMarketplace();
}

function filterMarket() { renderMarketplace(); }
function sortMarket() { renderMarketplace(); }

/* ===== DASHBOARD ===== */
function renderDashboard() {
  const history = read("scrap_ai_history", []);
  const listings = read("scrap_ai_listings", []);

  document.getElementById("statAnalyses").textContent = history.length;
  document.getElementById("statListings").textContent = listings.length;
  document.getElementById("statValue").textContent = `${fmt(history.reduce((s, i) => s + i.value, 0))} SAR`;
  document.getElementById("statMatches").textContent = "0";

  const histEl = document.getElementById("history");
  histEl.innerHTML = history.length
    ? history.slice(0, 15).map(item => `
      <div class="history-item">
        <div>
          <strong>${catalog[item.material]?.icon || "♻️"} ${catalog[item.material]?.[lang] || item.material}</strong>
          <small>${new Date(item.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")} · ${fmt(item.weight)} kg · ${item.purity}%</small>
        </div>
        <span class="history-value">${fmt(item.value)} SAR</span>
      </div>`).join("")
    : `<div class="empty-state small"><p>${t("no_history")}</p></div>`;

  const listEl = document.getElementById("listingList");
  listEl.innerHTML = listings.length
    ? listings.slice(0, 15).map(item => `
      <div class="history-item">
        <div>
          <strong>${catalog[item.material]?.icon || "♻️"} ${item.id}</strong>
          <small>${catalog[item.material]?.[lang] || item.material} · ${fmt(item.weight)} kg</small>
        </div>
        <span class="history-value">${fmt(item.value)} SAR</span>
      </div>`).join("")
    : `<div class="empty-state small"><p>${t("no_listings")}</p></div>`;
}

function switchDashTab(tab) {
  document.querySelectorAll(".dash-tabs .tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".dash-panel").forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById(`panel-${tab}`).classList.add("active");
}

function clearHistory() {
  localStorage.removeItem("scrap_ai_history");
  renderDashboard();
  toast(t("history_cleared"));
}

/* ===== PRICE ALERTS ===== */
function showAlertDialog() { document.getElementById("alertModal").classList.add("open"); }
function closeAlertDialog() { document.getElementById("alertModal").classList.remove("open"); }

function addPriceAlert() {
  const material = document.getElementById("alertMaterial").value;
  const condition = document.getElementById("alertCondition").value;
  const price = +document.getElementById("alertPrice").value;
  const alerts = read("scrap_ai_alerts", []);
  alerts.push({ material, condition, price, id: Date.now() });
  localStorage.setItem("scrap_ai_alerts", JSON.stringify(alerts));
  closeAlertDialog();
  renderAlerts();
  toast(t("alert_saved"));
}

function removeAlert(id) {
  const alerts = read("scrap_ai_alerts", []).filter(a => a.id !== id);
  localStorage.setItem("scrap_ai_alerts", JSON.stringify(alerts));
  renderAlerts();
  toast(t("alert_removed"));
}

function renderAlerts() {
  const alerts = read("scrap_ai_alerts", []);
  const list = document.getElementById("alertsList");
  const empty = document.getElementById("alertsEmpty");
  if (!list) return;

  if (alerts.length === 0) {
    list.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  list.innerHTML = alerts.map(a => {
    const mat = catalog[a.material];
    const condText = a.condition === "above" ? t("alert_above") : t("alert_below");
    return `<div class="alert-item">
      <div class="alert-info">
        <span class="alert-icon">${mat?.icon || "♻️"}</span>
        <div class="alert-condition">
          <strong>${mat?.[lang] || a.material}</strong>
          <span>${condText}: ${a.price} SAR/kg</span>
        </div>
      </div>
      <button onclick="removeAlert(${a.id})">✕</button>
    </div>`;
  }).join("");
}

/* ===== TOAST ===== */
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 2800);
}

/* ===== CONNECTION STATE ===== */
function updateConnectionState() {
  const el = document.getElementById("connectionState");
  el.textContent = navigator.onLine ? t("online") : t("offline");
  el.classList.toggle("offline", !navigator.onLine);
}

/* ===== ERROR LOGGING ===== */
window.addEventListener("online", updateConnectionState);
window.addEventListener("offline", updateConnectionState);
window.addEventListener("error", event => {
  const errors = read("scrap_ai_errors", []);
  errors.unshift({ message: event.message, date: new Date().toISOString() });
  localStorage.setItem("scrap_ai_errors", JSON.stringify(errors.slice(0, 20)));
});

/* ===== ROUTING ===== */
window.addEventListener("popstate", () => {
  const hash = location.hash.slice(1);
  const valid = ["home", "analyze", "marketplace", "dashboard"];
  showPage(valid.includes(hash) ? hash : "home", { updateHistory: false });
});

/* ===== INIT ===== */
applyLang();
applyTheme();
updateConnectionState();

const initPage = location.hash.slice(1);
const validPages = ["home", "analyze", "marketplace", "dashboard"];
showPage(validPages.includes(initPage) ? initPage : "home", { updateHistory: false });
