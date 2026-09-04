import { chromium } from "playwright";
const base=(process.env.PRODUCTION_URL||"https://scrap-ai.vercel.app").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({locale:"ar-SA"});
const suffix=Date.now();
const email=`buyer-ui-${suffix}@example.test`;
const password=`BuyerUi!${suffix}`;
try{
  await page.goto(base,{waitUntil:"domcontentloaded",timeout:45000});
  await page.locator(".account-btn").click();
  await page.locator("#prodRegister").waitFor({state:"visible",timeout:20000});
  await page.locator('#prodRegister [name="fullName"]').fill("Buyer UI Smoke");
  await page.locator('#prodRegister [name="organizationName"]').fill(`Buyer UI ${suffix}`);
  await page.locator('#prodRegister [name="kind"]').selectOption("buyer");
  await page.locator('#prodRegister [name="email"]').fill(email);
  await page.locator('#prodRegister [name="password"]').fill(password);
  await page.locator('#prodRegister button[type="submit"], #prodRegister button').last().click();
  await page.locator("#prodBuyTab.active").waitFor({state:"visible",timeout:20000});
  await page.locator("#buyerWelcome").waitFor({state:"visible",timeout:10000});
  if(await page.locator("#mainForm").count()) throw new Error("Buyer account incorrectly opened seller listing form");
  const roleText=await page.locator(".prodRole").innerText();
  if(!/بائع\s*\+\s*مشتري|Seller\s*\+\s*Buyer/i.test(roleText)) throw new Error(`Dual capability badge missing: ${roleText}`);
  await page.locator("#prodSellTab").click();
  await page.locator("#mainForm").waitFor({state:"visible",timeout:10000});
  await page.locator("#prodBuyTab").click();
  await page.locator("#buyerWelcome").waitFor({state:"visible",timeout:10000});
  if(await page.locator("#mainForm").count()) throw new Error("Seller form remained visible after returning to buyer mode");
  console.log("UI ROLE SMOKE: PASS — buyer defaults to buying, same account can switch to selling and back.");
} finally {
  await browser.close();
}
