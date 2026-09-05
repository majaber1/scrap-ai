import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { previewCookie, joinCookies } from "./preview-access.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = join(root, "..", "tests", "fixtures", "PHASE0_TEST_FIXTURE_scrap_photo.jpg");
const base = (process.env.PRODUCTION_URL || process.env.PHASE2_URL || "https://scrap-ai.vercel.app").replace(/\/$/, "");
if (!existsSync(fixture)) throw new Error("phase0 fixture missing");

const suffix = Date.now();
const email = `phase2-ui-${suffix}@example.test`;
const password = `Phase2Ui!${suffix}`;
const shareCookie = await previewCookie(base);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 } });
if (shareCookie) {
  const cookies = shareCookie.split("; ").map((part) => {
    const [name, ...rest] = part.split("=");
    return { name, value: rest.join("="), url: base };
  }).filter((row) => row.name && row.value);
  if (cookies.length) await context.addCookies(cookies);
}
const page = await context.newPage();

function expect(value, message) {
  if (!value) throw new Error(message);
}

try {
  await page.goto(`${base}/v2/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  expect(await page.locator("html").getAttribute("dir") === "rtl", "V2 RTL");
  await page.locator("#register [name=fullName]").fill("Phase2 UI");
  await page.locator("#register [name=organizationName]").fill(`[QA] Phase2 UI ${suffix}`);
  await page.locator("#register [name=email]").fill(email);
  await page.locator("#register [name=password]").fill(password);
  await page.locator("#register button[type=submit]").click();
  await page.getByRole("button", { name: "فرد" }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "فرد" }).click();
  await page.getByRole("link", { name: "افتح التحليل" }).first().waitFor({ timeout: 15000 });
  await page.getByRole("link", { name: "افتح التحليل" }).first().click();
  await page.waitForURL(/#analyze/, { timeout: 20000 });
  await page.locator("#image").setInputFiles(fixture);
  await page.locator("button.btn-primary.btn-full").filter({ hasText: /حلّل|Analyze/ }).click();
  await page.locator(".material-chip").waitFor({ timeout: 180000 });
  const analysisText = await page.locator("#result").innerText();
  expect(/تقدير بصري|VISUAL ESTIMATE/.test(analysisText), "analysis result missing");

  await page.goto(`${base}/v2/#sell`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.getByRole("button", { name: "جهّز مسودة البيع" }).click();
  await page.locator("#draftForm").waitFor({ timeout: 30000 });
  const title = page.locator("#draftForm [name=titleEn]");
  await title.fill("Slice1 Browser Copper Cable");
  await page.locator("#draftForm [name=city]").fill("Riyadh");
  await page.locator("#draftForm [name=weightKg]").fill("18");
  await page.getByRole("button", { name: "حفظ التعديلات" }).click();
  await page.waitForFunction(() => {
    const input = document.querySelector("#draftForm [name=weightKg]");
    return input && String(input.value) === "18";
  }, { timeout: 20000 });
  const confirmResponse = page.waitForResponse((res) => res.url().includes("/confirm") && res.request().method() === "POST", { timeout: 30000 });
  await page.getByRole("button", { name: "تأكيد ونشر" }).click();
  const confirmed = await confirmResponse;
  const confirmBody = await confirmed.text();
  if (confirmed.status() !== 201) {
    const msg = await page.locator("#sellMsg").innerText().catch(() => "");
    const box = await page.locator("#draftBox").innerText().catch(() => "");
    throw new Error(`confirm HTTP ${confirmed.status()} body=${confirmBody.slice(0, 400)} msg=${msg} box=${box.slice(0, 400)}`);
  }
  await page.getByText("تم النشر. رقم الإعلان:").waitFor({ timeout: 30000 });
  const published = await page.locator("#draftBox").innerText();
  const listingId = (published.match(/[0-9a-f-]{36}/i) || [])[0];
  expect(listingId, "published listing id missing");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.goto(`${base}/v2/#sell`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.getByText(listingId).waitFor({ timeout: 20000 });

  await page.getByRole("button", { name: "خروج" }).click();
  await page.locator("#login [name=email]").waitFor({ timeout: 15000 });
  await page.locator("#login [name=email]").fill(email);
  await page.locator("#login [name=password]").fill(password);
  await page.locator("#login button[type=submit]").click();
  await page.goto(`${base}/v2/#sell`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.getByText(listingId).waitFor({ timeout: 20000 });

  console.log("Phase 2A Slice 1 browser E2E: PASS");
  console.log(`listingId=${listingId}`);
} finally {
  await browser.close();
}
