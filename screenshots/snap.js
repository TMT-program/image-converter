const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'c:\Users\user\image-converter\screenshots\\desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'c:\Users\user\image-converter\screenshots\\mobile.png', fullPage: true });
  await browser.close();
  console.log('Screenshots saved.');
})();
