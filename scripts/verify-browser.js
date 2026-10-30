const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3001';

async function verify() {
  console.log('Starting full browser verification against', APP_URL);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  fs.mkdirSync(path.join(__dirname, '../screenshots'), { recursive: true });

  // 1. Desktop 1440px View
  console.log('Testing at 1440px desktop width...');
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000)); // wait for entrance animation and counter ticks
  await page.screenshot({ path: path.join(__dirname, '../screenshots/desktop-1440.png') });
  console.log('Saved screenshots/desktop-1440.png');

  // Hover over the first card
  const cards = await page.$$('button[aria-controls^="folder-detail-"]');
  console.log(`Found ${cards.length} glass folder cards on page.`);

  if (cards.length >= 3) {
    console.log('Testing hover state on Card 1...');
    const box = await cards[0].boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(__dirname, '../screenshots/card-hover-interaction.png') });
      console.log('Saved screenshots/card-hover-interaction.png');
    }

    // Click Card 1 to test physical open & dossiers slide out
    console.log('Clicking Card 1 (Fatal Forgeries)...');
    await cards[0].click();
    await new Promise((r) => setTimeout(r, 200)); // capture during slide-out
    await page.screenshot({ path: path.join(__dirname, '../screenshots/card-dossiers-opening.png') });
    console.log('Saved screenshots/card-dossiers-opening.png');

    await new Promise((r) => setTimeout(r, 600)); // wait for detail modal to morph
    await page.screenshot({ path: path.join(__dirname, '../screenshots/detail-modal-open.png') });
    console.log('Saved screenshots/detail-modal-open.png');

    // Close via close button
    const closeBtn = await page.$('button[aria-label="Close dossier view"]');
    if (closeBtn) {
      console.log('Closing detail modal via close button...');
      await closeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // Click Card 2 and close with Escape key
    console.log('Clicking Card 2 (EVC Shortfalls) & closing with Escape key...');
    await cards[1].click();
    await new Promise((r) => setTimeout(r, 700));
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 500));

    // Click Card 3 and close by clicking backdrop
    console.log('Clicking Card 3 (Approved 3-Yr EoA) & closing by clicking backdrop...');
    await cards[2].click();
    await new Promise((r) => setTimeout(r, 700));
    // Click outside modal at (50, 50)
    await page.mouse.click(50, 50);
    await new Promise((r) => setTimeout(r, 500));
  }

  // 2. Keyboard Navigation Flow (Tab + Enter + Esc)
  console.log('Testing keyboard navigation flow...');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  // Trigger active element
  const activeHandle = await page.evaluateHandle(() => document.activeElement);
  console.log('Active element tag:', await activeHandle.evaluate((el) => el.tagName));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));

  // 3. Tablet 1024px View
  console.log('Testing at 1024px tablet width...');
  await page.setViewport({ width: 1024, height: 800, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, '../screenshots/tablet-1024.png') });
  console.log('Saved screenshots/tablet-1024.png');

  // 4. Mobile 390px View
  console.log('Testing at 390px mobile width (iPhone 14 style)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, '../screenshots/mobile-390.png') });
  console.log('Saved screenshots/mobile-390.png');

  // 5. Reduced-Motion Mode
  console.log('Testing with prefers-reduced-motion: reduce...');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, '../screenshots/reduced-motion-mode.png') });
  console.log('Saved screenshots/reduced-motion-mode.png');

  await browser.close();

  console.log('\n--- VERIFICATION REPORT ---');
  console.log(`Console Errors encountered: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors:', consoleErrors);
  } else {
    console.log('✓ Zero console errors detected across all viewport sizes and user interactions!');
  }
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

