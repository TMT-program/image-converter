const { chromium } = require('playwright');
const path = require('path');
const dir = __dirname;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  // PDFタブをクリック
  await page.click('button:has-text("PDF変換")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, 'pdf-tab.png'), fullPage: true });
  await browser.close();
  console.log('done');
})();
