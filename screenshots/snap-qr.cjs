const { chromium } = require('playwright');
const path = require('path');
const dir = 'c:/Users/user/image-converter/screenshots';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // QRタブをクリック
  await page.click('button:has-text("QRコード")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, 'qr-empty.png'), fullPage: true });

  // テキスト入力してQR生成
  await page.fill('textarea', 'https://example.com');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(dir, 'qr-filled.png'), fullPage: true });

  await browser.close();
  console.log('done');
})();
