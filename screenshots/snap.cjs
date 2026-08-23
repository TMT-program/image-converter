const { chromium } = require('playwright');
const path = require('path');
const dir = __dirname;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(dir, 'desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(dir, 'mobile.png'), fullPage: true });
  await browser.close();
  console.log('done');
})();
