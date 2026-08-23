const { chromium } = require('playwright');
const path = require('path');
const dir = 'c:/Users/user/image-converter/screenshots';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // ホーム
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(dir, 'home-final.png'), fullPage: true });

  // 使い方
  await page.goto('http://localhost:5173/how-to-use');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(dir, 'how-to-use.png'), fullPage: true });

  // プライバシーポリシー
  await page.goto('http://localhost:5173/privacy');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(dir, 'privacy.png'), fullPage: true });

  await browser.close();
  console.log('done');
})();
