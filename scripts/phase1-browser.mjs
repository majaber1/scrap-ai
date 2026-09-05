import { chromium } from "playwright";

const base = (process.env.PRODUCTION_URL || "https://scrap-ai.vercel.app").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ locale: "ar-SA", viewport: { width: 390, height: 844 } });
const suffix = Date.now();
const email = `phase1-ui-${suffix}@example.test`;
const password = `Phase1Ui!${suffix}`;

try {
  await page.goto(`${base}/v2/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const dir = await page.locator("html").getAttribute("dir");
  if (dir !== "rtl") throw new Error(`Expected RTL, got ${dir}`);
  await page.locator("#register [name=fullName]").fill("Phase1 UI");
  await page.locator("#register [name=organizationName]").fill(`[QA] Phase1 UI ${suffix}`);
  await page.locator("#register [name=email]").fill(email);
  await page.locator("#register [name=password]").fill(password);
  await page.locator("#register button[type=submit]").click();
  await page.getByRole("button", { name: "فرد" }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "فرد" }).click();
  await page.getByRole("link", { name: "حلّل" }).waitFor({ timeout: 15000 });
  await page.getByRole("link", { name: "افتح التحليل" }).click();
  await page.waitForURL(/#analyze/, { timeout: 15000 });
  if (!(await page.locator("#image").count())) throw new Error("Analyze input missing after V2 handoff");
  console.log("Phase 1 browser E2E: PASS");
} finally {
  await browser.close();
}
