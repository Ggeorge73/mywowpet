const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const accountPaths = ['/account/login', '/account'];
  for (const path of accountPaths) {
    const url = 'https://mywowpet.com' + path;
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      console.log(`Final URL: ${page.url()}`);
      console.log(`Title: ${await page.title()}`);
    } catch (e) {
      console.error(e);
    }
  }
  await browser.close();
})();
