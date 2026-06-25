const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Go to collections/all
  console.log("Navigating to collections...");
  await page.goto('https://mywowpet.com/collections/all', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // Find first product link
  const productLink = page.locator('a[href*="/products/"]').filter({ visible: true }).first();
  const href = await productLink.getAttribute('href');
  const url = 'https://mywowpet.com' + href;
  console.log(`Navigating to product page: ${url}`);
  
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // Dump all buttons
  const buttons = page.locator('button, input[type="submit"], [role="button"]');
  const count = await buttons.count();
  console.log(`Found ${count} button-like elements:`);
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    const html = await btn.evaluate(el => el.outerHTML);
    const visible = await btn.isVisible();
    console.log(`[Button ${i}] Visible: ${visible}\nHTML: ${html.substring(0, 300)}\n`);
  }
  
  await browser.close();
})();
