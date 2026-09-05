/* ===== TRANSLATIONS ===== */
const copy = {
  ar: {
    nav_home:"الرئيسية", nav_analyze:"حلّل", nav_market:"السوق", nav_account:"حسابي", nav_dash:"لوحة التحكم", nav_eada:"منصة إعادة",
    hero_badge:"سوق السكراب السعودي", hero_title:'صوّر. انشر.<br><em>استقبل العروض.</em>', hero_desc:"البائع يعرض السكراب، المشتري يقدّم سعره، والذكاء الاصطناعي يساعد في قراءة الصورة — والسعر النهائي بعد الوزن والفحص.", hero_cta:"أضف عرضك الآن", hero_cta2:"تصفّح السوق", hero_materials:"فئات مواد", hero_routes:"مسارات قيمة", hero_currency:"أسعار محلية", hero_ai:"تحليل ذكي",
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
    cta_title:"سكرابك واقف؟ حوّله إلى عرض.", cta_desc:"ارفع صورة، حدّد المدينة، وانشر. التحليل اختياري.", cta_btn:"ابدأ عرضك",
    analyze_badge:"تحليل إرشادي", analyze_title:"حلّل الصورة قبل ما تنشر", analyze_desc:"ارفع صورة لتحصل على تصنيف إرشادي للمادة والدرجة. ليس فحص مختبر ولا سعر ملزم.",
    input_title:"بيانات السكراب", input_badge:"مجاني",
    upload:"ارفع صورة السكراب", upload_hint:"أو اسحب الصورة هنا",
    material:"نوع المادة", auto:"🤖 تقدير تلقائي", copper:"🟠 نحاس / كيابل", aluminum:"⚪ ألمنيوم", steel:"⚙️ حديد / فولاذ", ewaste:"💻 نفايات إلكترونية", battery:"🔋 بطاريات", mixed:"♻️ مختلط",
    weight:"الوزن (كجم)", clean:"حالة الفرز", sorted:"✅ نظيف ومفروز", medium:"⚡ متوسط", dirty:"⚠️ مختلط / ملوث",
    goal:"الهدف", sell:"💵 بيع سريع", maximize:"📈 تعظيم القيمة", export:"🌍 فرصة تصدير", recycle:"♻️ تدوير ملتزم",
    run:"🔍 تشغيل التحليل", disclaimer:"تحليل حقيقي للمستخدم المسجّل عبر Gemini أو Groq؛ إرشادي وليس فحصًا مخبريًا أو عرض سعر ملزمًا.",
    waiting:"بانتظار صورة السكراب", waitingText:"بعد التحليل تظهر المادة والدرجة وملاحظات الفحص.",
    f1:"صورة", f2:"تصنيف", f3:"نقاء", f4:"قيمة", f5:"مسار",
    market_badge:"السوق", market_title:"سوق السكراب السعودي", market_desc:"تصفّح العروض الحقيقية أو انشر عرضك",
    stat_listings:"عروض مفتوحة", stat_buyers:"مشترين", stat_volume:"حجم التداول", stat_avg:"متوسط وقت البيع", stat_avg_val:"24 ساعة",
    search_placeholder:"ابحث بالمدينة أو المادة...",
    filter_all:"الكل", filter_copper:"🟠 نحاس", filter_alum:"⚪ ألمنيوم", filter_steel:"⚙️ حديد", filter_ewaste:"💻 إلكتروني", filter_battery:"🔋 بطاريات", filter_mixed:"♻️ مختلط",
    sort_new:"الأحدث", sort_high:"السعر: الأعلى", sort_low:"السعر: الأقل", sort_weight:"الوزن",
    create_title:"سكراب في المستودع؟ انشره اليوم.", create_desc:"أضف العرض مباشرة، واستخدم التحليل إذا حاب تصنيف أوضح", create_btn:"أضف بضاعة",
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
    listing_active:"مفتوح", listing_view:"عرض", listing_contact:"تواصل",
    match_score:"تطابق", match_location:"الموقع", match_capacity:"الطاقة الشهرية",
    no_history:"لا توجد تحليلات بعد", no_listings:"لا توجد مسودات بعد"
  },
  en: {
    nav_home:"Home", nav_analyze:"Analyze", nav_market:"Market", nav_account:"Account", nav_dash:"Dashboard", nav_eada:"EADA Platform",
    hero_badge:"Saudi scrap marketplace", hero_title:'Photograph. List.<br><em>Get offers.</em>', hero_desc:"Sellers list scrap, buyers name their price, and AI helps read the photo — the final amount follows inspected weight.", hero_cta:"List your scrap", hero_cta2:"Browse the market", hero_materials:"Material classes", hero_routes:"Value routes", hero_currency:"Local prices", hero_ai:"Smart analysis",
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
    cta_title:"Idle scrap? Turn it into a listing.", cta_desc:"Upload a photo, set the city, and publish. Analysis is optional.", cta_btn:"Start your listing",
    analyze_badge:"Indicative analysis", analyze_title:"Read the photo before you list", analyze_desc:"Upload an image for an indicative material and grade. Not a lab test and not a binding quote.",
    input_title:"Scrap Data", input_badge:"Free",
    upload:"Upload scrap image", upload_hint:"or drag & drop here",
    material:"Material type", auto:"🤖 Auto estimate", copper:"🟠 Copper / cables", aluminum:"⚪ Aluminum", steel:"⚙️ Iron / steel", ewaste:"💻 E-waste", battery:"🔋 Batteries", mixed:"♻️ Mixed",
    weight:"Weight (kg)", clean:"Sorting condition", sorted:"✅ Clean & sorted", medium:"⚡ Medium", dirty:"⚠️ Mixed / contaminated",
    goal:"Goal", sell:"💵 Sell fast", maximize:"📈 Maximize value", export:"🌍 Export opportunity", recycle:"♻️ Compliant recycling",
    run:"🔍 Run Analysis", disclaimer:"Real Gemini or Groq analysis for signed-in users; indicative, not a laboratory inspection or binding quote.",
    waiting:"Waiting for a scrap photo", waitingText:"Material, grade and inspection notes will appear here.",
    f1:"Image", f2:"Classify", f3:"Purity", f4:"Value", f5:"Route",
    market_badge:"Market", market_title:"Saudi Scrap Market", market_desc:"Browse real listings or publish yours",
    stat_listings:"Open listings", stat_buyers:"Buyers", stat_volume:"Trade volume", stat_avg:"Avg. sale time", stat_avg_val:"24 hours",
    search_placeholder:"Search by city or material...",
    filter_all:"All", filter_copper:"🟠 Copper", filter_alum:"⚪ Aluminum", filter_steel:"⚙️ Steel", filter_ewaste:"💻 E-waste", filter_battery:"🔋 Batteries", filter_mixed:"♻️ Mixed",
    sort_new:"Newest", sort_high:"Price: High", sort_low:"Price: Low", sort_weight:"Weight",
    create_title:"Scrap in the yard? List it today.", create_desc:"Publish directly, then use analysis if you want a clearer classification", create_btn:"Add listing",
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
    listing_active:"Open", listing_view:"View", listing_contact:"Contact",
    match_score:"Match", match_location:"Location", match_capacity:"Monthly capacity",
    no_history:"No analyses yet", no_listings:"No drafts yet"
  }
};

/* Material labels only. Numeric prices are NOT market feeds. */
const catalog = {
  copper:   { ar:"نحاس / كيابل", en:"Copper / cables", icon:"🟠" },
  aluminum: { ar:"ألمنيوم",      en:"Aluminum",        icon:"⚪" },
  steel:    { ar:"حديد / فولاذ",  en:"Iron / steel",    icon:"⚙️" },
  ewaste:   { ar:"نفايات إلكترونية", en:"E-waste",     icon:"💻" },
  battery:  { ar:"بطاريات",      en:"Batteries",       icon:"🔋" },
  mixed:    { ar:"سكراب مختلط",  en:"Mixed scrap",     icon:"♻️" }
};

/* ===== STATE ===== */
let lang = localStorage.getItem("scrap_ai_lang") || "ar";
let currentFilter = "all";
let liveListings = [];
let marketStatus = "loading";

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
  loadLiveMarket();
  renderDashboard();
  renderAlerts();
  updateConnectionState();
  if (document.getElementById("account")?.classList.contains("active")) window.bootScrapWorkspace?.();
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
    btn.classList.toggle("nav-active", page === id || (page === "market" && id === "marketplace"));
  });
  closeMenu();
  if (updateHistory && location.hash !== `#${id}`) history.pushState({ page: id }, "", `#${id}`);
  if (id === "dashboard") renderDashboard();
  if (id === "marketplace") loadLiveMarket();
  if (id === "account") window.bootScrapWorkspace?.();
  scrollTo(0, 0);
  target.focus({ preventScroll: true });
}

/* ===== PRICE TICKER ===== */
function renderTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track) return;
  track.innerHTML = `<span class="ticker-item">${lang === "ar" ? "مصدر أسعار السكراب غير متصل" : "Scrap price source not connected"}</span>`;
}

/* ===== PRICE GRID ===== */
function renderPriceGrid() {
  const grid = document.getElementById("priceGrid");
  if (!grid) return;
  grid.innerHTML = `<div class="price-card"><div class="name">${lang === "ar" ? "مصدر بيانات الأسعار غير متصل" : "Price data source not connected"}</div></div>`;
  const updated = document.getElementById("priceUpdated");
  if (updated) updated.textContent = lang === "ar" ? "لا يوجد مصدر أسعار حيّ مربوط بعد" : "No live price feed is connected yet";
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
let lastAiResult = null;

function publishAnalysisToListing() {
  const weight = Math.min(100000000, Math.max(1, +document.getElementById("weight")?.value || 1));
  const draft = {
    material: lastAiResult?.materialType || document.getElementById("material")?.value || "mixed",
    title: lastAiResult ? (lang === "ar" ? lastAiResult.materialLabelAr : lastAiResult.materialLabelEn) : "",
    quantity: weight,
    analysisLabel: lastAiResult ? `${lang === "ar" ? lastAiResult.materialLabelAr : lastAiResult.materialLabelEn} · ${lastAiResult.grade || ""}` : ""
  };
  sessionStorage.setItem("scrap_ai_listing_draft", JSON.stringify(draft));
  if (typeof openScrapSellDraft === "function") openScrapSellDraft(draft);
  else openScrapAccount();
}

async function analyze() {
  const weightInput = document.getElementById("weight");
  if (!weightInput.reportValidity()) return;
  const file = document.getElementById("image").files?.[0];
  if (!file) { toast(lang === "ar" ? "ارفع صورة السكراب أولاً" : "Upload a scrap image first"); return; }
  const result = document.getElementById("result");
  result.innerHTML = `<div class="empty-state"><h2>${lang === "ar" ? "جاري قراءة الصورة..." : "Reading the photo..."}</h2></div>`;
  const weight = Math.min(100000000, Math.max(1, +weightInput.value || 1));
  const clean = document.getElementById("clean").value;
  const goal = document.getElementById("goal").value;
  try {
    const imageDataUrl = await publicImageData(file);
    const response = await fetch("/api/ai-analyze", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ imageDataUrl, estimatedWeightKg:weight, notes:`sorting=${clean}; goal=${goal}` }) });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      result.innerHTML = `<div class="empty-state"><h2>${lang === "ar" ? "سجّل الدخول لتشغيل التحليل الحقيقي" : "Sign in to run real analysis"}</h2><p>${lang === "ar" ? "افتح حسابك ثم أعد التحليل. النتيجة إرشادية حتى يتم الفحص والوزن." : "Open your account, then run analysis again. The result stays indicative until inspection and weight."}</p><button class="btn-primary" onclick="openScrapAccount()">${lang === "ar" ? "فتح الحساب" : "Open account"}</button></div>`;
      return;
    }
    if (!response.ok) {
      const code = payload.error || "analysis_failed";
      const mapped = {
        authentication_required: lang === "ar" ? "سجّل الدخول أولاً لتحليل الصورة" : "Sign in first to analyze the photo",
        ai_analysis_failed: lang === "ar" ? "تعذر تحليل الصورة. جرّب صورة أوضح JPEG أو PNG." : "Could not analyze the photo. Try a clearer JPEG or PNG.",
        ai_not_configured: lang === "ar" ? "تحليل AI غير مفعّل حالياً" : "AI analysis is not configured",
        invalid_image: lang === "ar" ? "الصورة غير مدعومة. استخدم JPG أو PNG أو WebP." : "Unsupported image. Use JPG, PNG or WebP.",
      };
      throw new Error(mapped[code] || code);
    }
    const a = payload.analysis, confidence = Math.round(Number(a.confidence) * 100);
    lastAiResult = a;
    try { sessionStorage.setItem("scrap_ai_last_analysis_id", a.id || ""); } catch {}
    result.innerHTML = `<div class="result-identify"><div><span class="material-chip">🤖 ${safeAi(lang === "ar" ? a.materialLabelAr : a.materialLabelEn)}</span><p class="confidence">${lang === "ar" ? "تقدير بصري" : "VISUAL ESTIMATE"} · ${t("confidence_label")}: ${confidence}%</p><div class="confidence-bar"><div class="confidence-fill" style="width:${confidence}%"></div></div></div></div><div class="result-metrics"><div class="metric-card"><span>${lang === "ar" ? "نقاوة بصرية (ليست مختبر)" : "Visual purity (not lab)"}</span><strong>${Math.round(Number(a.purityEstimatePercent))}%</strong></div><div class="metric-card"><span>${lang === "ar" ? "الدرجة" : "Grade"}</span><strong>${safeAi(a.probableGrade || a.grade)}</strong></div><div class="metric-card"><span>${t("weight_label")}</span><strong>${fmt(weight)} kg</strong></div></div><div class="result-route"><small>${lang === "ar" ? "ملاحظات الصورة" : "Image observations"}</small><p>${safeAi(lang === "ar" ? a.observationsAr : a.observationsEn)}</p><p class="disclaimer">${lang === "ar" ? "نطاق السوق يظهر فقط عند اتصال مصدر أسعار ببروفنانس. المصدر حالياً غير متصل." : "A Saudi market range appears only when a price source with provenance is connected. Source not connected."}</p><h3>${lang === "ar" ? "الفحص المطلوب" : "Required inspection"}</h3><p>${safeAi(lang === "ar" ? a.recommendedInspectionAr : a.recommendedInspectionEn)}</p><p class="disclaimer">${safeAi(lang === "ar" ? a.pricingCaveatAr : a.pricingCaveatEn)}</p><p class="disclaimer">${payload.provider || ""} · ${payload.model || ""}</p></div><div class="result-actions"><button class="btn-listing" onclick="publishAnalysisToListing()">${lang === "ar" ? "انشر كعرض في السوق" : "Publish as a market listing"}</button></div>`;
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
function showBuyerMatch() {
  const modal = document.getElementById("matchModal");
  const results = document.getElementById("matchResults");
  results.innerHTML = `<div class="empty-state small"><p>${lang === "ar" ? "مطابقة المشترين غير متصلة بعد. لن نعرض مشترين وهميين." : "Buyer matching is not connected yet. Fake buyers are not shown."}</p></div>`;
  modal.classList.add("open");
}

function closeMatchModal() { document.getElementById("matchModal").classList.remove("open"); }

/* ===== MARKETPLACE ===== */
async function loadLiveMarket() {
  const grid = document.getElementById("listingsGrid");
  if (grid && marketStatus === "loading") {
    grid.innerHTML = `<div class="empty-state small"><p>${lang === "ar" ? "جاري تحميل العروض الحقيقية..." : "Loading live listings..."}</p></div>`;
  }
  try {
    const response = await fetch("/api/listings");
    const payload = await response.json().catch(() => ({ listings: [] }));
    liveListings = Array.isArray(payload.listings) ? payload.listings : [];
    marketStatus = response.ok ? "ready" : "error";
  } catch {
    liveListings = [];
    marketStatus = "error";
  }
  renderMarketplace();
}

function renderMarketplace() {
  const grid = document.getElementById("listingsGrid");
  if (!grid) return;

  let filtered = liveListings.filter((listing) => currentFilter === "all" || listing.material === currentFilter);

  const search = document.getElementById("marketSearch")?.value?.toLowerCase() || "";
  if (search) {
    filtered = filtered.filter((listing) =>
      `${listing.title || ""} ${listing.city || ""} ${listing.seller_name || ""} ${listing.material || ""}`.toLowerCase().includes(search)
    );
  }

  const sort = document.getElementById("marketSort")?.value || "newest";
  if (sort === "price_high") filtered.sort((a, b) => Number(b.indicative_value || 0) - Number(a.indicative_value || 0));
  else if (sort === "price_low") filtered.sort((a, b) => Number(a.indicative_value || 0) - Number(b.indicative_value || 0));
  else if (sort === "weight") filtered.sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0));
  else filtered.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));

  const listingsEl = document.getElementById("marketListings");
  const buyersEl = document.getElementById("marketBuyers");
  if (listingsEl) listingsEl.textContent = fmt(liveListings.length);
  if (buyersEl) buyersEl.textContent = "—";

  if (marketStatus === "error") {
    grid.innerHTML = `<div class="empty-state small"><p>${lang === "ar" ? "تعذر تحميل السوق المباشر. أعد المحاولة." : "Live market could not be loaded. Try again."}</p><button class="btn-primary" onclick="loadLiveMarket()">${lang === "ar" ? "إعادة التحميل" : "Reload"}</button></div>`;
    return;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state small market-empty"><p>${lang === "ar" ? "ما فيه عروض مفتوحة بهالتصنيف حالياً. كن أول من ينشر." : "No open listings in this filter yet. Be the first to publish."}</p><button class="btn-primary" onclick="openScrapAccount('sell')">${lang === "ar" ? "+ أضف بضاعة" : "+ Add listing"}</button></div>`;
    return;
  }

  grid.innerHTML = filtered.map((listing) => {
    const mat = catalog[listing.material] || catalog.mixed;
    const qty = listing.quantity ? `${fmt(listing.quantity)} ${listing.unit || "kg"}` : (lang === "ar" ? "الوزن عند التفاوض" : "Weight by negotiation");
    const price = listing.indicative_value ? `${fmt(listing.indicative_value)} SAR` : (lang === "ar" ? "السعر عند التفاوض" : "Price by negotiation");
    const photo = listing.image || "";
    return `<div class="listing-card">
      <div class="listing-img">${photo ? `<img src="${safeAi(photo)}" alt="">` : ""}<span class="listing-status">${t("listing_active")}</span><span class="listing-mat">${safeAi(mat[lang])}</span></div>
      <div class="listing-body">
        <h3>${safeAi(listing.title || mat[lang])}</h3>
        <div class="listing-meta">
          <span>📍 ${safeAi(listing.city || (lang === "ar" ? "المدينة عند التفاوض" : "City on request"))}</span>
          <span>⚖️ ${qty}</span>
        </div>
        <div class="listing-price">
          <div><strong>${price}</strong><br><small>${lang === "ar" ? "قيمة استرشادية — ليست عرض شراء" : "Indicative — not a purchase offer"}</small></div>
        </div>
        <div class="listing-actions">
          <button class="btn-listing" onclick="openScrapAccount('buy')">${lang === "ar" ? "قدّم عرض شراء" : "Make an offer"}</button>
        </div>
      </div>
    </div>`;
  }).join("");
}

function filterByMaterial(mat) {
  currentFilter = mat;
  document.querySelectorAll(".filter-chips .chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === mat);
  });
  renderMarketplace();
}

function openMarketMaterial(mat) {
  filterByMaterial(mat);
  showPage("marketplace");
}

function filterMarket() { renderMarketplace(); }
function sortMarket() { renderMarketplace(); }

/* ===== DASHBOARD ===== */
async function renderDashboard() {
  const listings = read("scrap_ai_listings", []);
  document.getElementById("statListings").textContent = listings.length;
  document.getElementById("statValue").textContent = lang === "ar" ? "مصدر غير متصل" : "Source not connected";
  document.getElementById("statMatches").textContent = "—";

  let history = [];
  try {
    const response = await fetch("/api/ai-analyze");
    if (response.ok) {
      const payload = await response.json();
      history = Array.isArray(payload.analyses) ? payload.analyses : [];
    }
  } catch { /* guest */ }
  document.getElementById("statAnalyses").textContent = history.length;

  const histEl = document.getElementById("history");
  histEl.innerHTML = history.length
    ? history.slice(0, 15).map(item => {
      const a = item.result || {};
      const label = lang === "ar" ? (a.materialLabelAr || a.materialType) : (a.materialLabelEn || a.materialType);
      return `
      <div class="history-item">
        <div>
          <strong>${catalog[a.materialType]?.icon || "♻️"} ${safeAi(label)}</strong>
          <small>${new Date(item.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")} · ${lang === "ar" ? "تقدير بصري" : "VISUAL ESTIMATE"} · ${item.provider || ""}</small>
        </div>
        <span class="history-value">${Math.round(Number(a.confidence || 0) * 100)}%</span>
      </div>`;
    }).join("")
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
  const valid = ["home", "analyze", "marketplace", "account", "dashboard"];
  showPage(valid.includes(hash) ? hash : "home", { updateHistory: false });
});

/* ===== INIT ===== */
applyLang();
applyTheme();
updateConnectionState();

const initPage = location.hash.slice(1);
const validPages = ["home", "analyze", "marketplace", "account", "dashboard"];
showPage(validPages.includes(initPage) ? initPage : "home", { updateHistory: false });
