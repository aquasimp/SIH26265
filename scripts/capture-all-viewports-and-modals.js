const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'viewports');
const AUDIT_DIR = path.join(__dirname, '..', 'screenshots', 'audit');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '320-portrait', width: 320, height: 568, isMobile: true, hasTouch: true, dpr: 2 },
  { name: '320-landscape', width: 568, height: 320, isMobile: true, hasTouch: true, dpr: 2 },
  { name: '360-portrait', width: 360, height: 740, isMobile: true, hasTouch: true, dpr: 3 },
  { name: '360-landscape', width: 740, height: 360, isMobile: true, hasTouch: true, dpr: 3 },
  { name: '390-portrait', width: 390, height: 844, isMobile: true, hasTouch: true, dpr: 3 },
  { name: '390-landscape', width: 844, height: 390, isMobile: true, hasTouch: true, dpr: 3 },
  { name: '414-portrait', width: 414, height: 896, isMobile: true, hasTouch: true, dpr: 3 },
  { name: '414-landscape', width: 896, height: 414, isMobile: true, hasTouch: true, dpr: 3 },
  { name: '768-portrait', width: 768, height: 1024, isMobile: true, hasTouch: true, dpr: 2 },
  { name: '768-landscape', width: 1024, height: 768, isMobile: true, hasTouch: true, dpr: 2 },
  { name: '1024-portrait', width: 1024, height: 1366, isMobile: false, hasTouch: false, dpr: 2 },
  { name: '1440-desktop', width: 1440, height: 900, isMobile: false, hasTouch: false, dpr: 1 },
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon or non-fatal asset issues if any
      consoleErrors.push(text);
    }
  });

  console.log('Testing viewports for horizontal scroll and visual fidelity...');

  for (const vp of VIEWPORTS) {
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 600));

    const overflowInfo = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      return {
        scrollWidth: scrollW,
        clientWidth: clientW,
        hasOverflow: scrollW > clientW + 1
      };
    });

    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): client=${overflowInfo.clientWidth}, scroll=${overflowInfo.scrollWidth}, overflow=${overflowInfo.hasOverflow}`);

    if (overflowInfo.hasOverflow) {
      console.error(`HORIZONTAL SCROLL DETECTED on ${vp.name}!`);
    }

    const shotPath = path.join(OUT_DIR, `dashboard-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
  }

  // Test Interactive: Mobile Drawer on 390px
  console.log('\nTesting Mobile Drawer on 390px...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Click hamburger button in header
  const menuBtn = await page.$('button[aria-label="Toggle navigation drawer"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(AUDIT_DIR, 'mobile-drawer-open-390.png') });
    console.log('Captured mobile drawer open.');
  }

  // Test Command Palette on 1440px
  console.log('\nTesting Command Palette on 1440px...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(AUDIT_DIR, 'command-palette-1440.png') });
  console.log('Captured command palette.');

  // Test Demo Modal
  console.log('\nTesting Demo Walkthrough Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const demo = btns.find(b => b.textContent.includes('Demo') || b.textContent.includes('Walkthrough'));
    if (demo) demo.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(AUDIT_DIR, 'demo-modal-1440.png') });
  console.log('Captured demo modal.');

  // Test Attention Score Popover on Table
  console.log('\nTesting Attention Score Popover...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  const scoreBadge = await page.$('button[aria-label^="Inspect attention score formula"]');
  if (scoreBadge) {
    await scoreBadge.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(AUDIT_DIR, 'score-popover-1440.png') });
    console.log('Captured score popover.');
  }

  // Test Table After on 1440px
  await page.screenshot({ path: path.join(AUDIT_DIR, 'table-after-fixed.png') });

  console.log(`\nAll tests completed! Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }

  await browser.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
