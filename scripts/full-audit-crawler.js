const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3001';

const routes = [
  { name: 'dashboard', path: '/' },
  { name: 'repository', path: '/repository' },
  { name: 'repository-detail', path: '/repository/fdr-gen-0001' },
  { name: 'intake', path: '/intake' },
  { name: 'institution', path: '/institution' },
  { name: 'release-workflow', path: '/release-workflow' },
  { name: 'audit-trail', path: '/audit-trail' },
  { name: 'metrics', path: '/metrics' },
  { name: 'settings', path: '/settings' },
];

const viewports = [
  { name: 'mobile-320', width: 320, height: 640, isMobile: true },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
];

async function runAudit() {
  console.log('--- STARTING FULL COMPREHENSIVE UI AUDIT ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const logs = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logs.push({ type: 'CONSOLE_ERROR', text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    logs.push({ type: 'PAGE_ERROR', text: err.toString() });
  });

  const auditResults = [];
  fs.mkdirSync(path.join(__dirname, '../screenshots/audit'), { recursive: true });

  for (const route of routes) {
    for (const vp of viewports) {
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
        deviceScaleFactor: vp.isMobile ? 2 : 1,
      });

      try {
        await page.goto(`${APP_URL}${route.path}`, { waitUntil: 'networkidle0' });
        await new Promise((r) => setTimeout(r, 600));

        const overflowCheck = await page.evaluate(() => {
          const sw = document.documentElement.scrollWidth;
          const cw = document.documentElement.clientWidth;
          return {
            scrollWidth: sw,
            clientWidth: cw,
            hasOverflow: sw > cw,
          };
        });

        // Screenshot for 390 and 1440
        if (vp.width === 390 || vp.width === 1440) {
          const filename = `${route.name}-${vp.name}.png`;
          await page.screenshot({
            path: path.join(__dirname, `../screenshots/audit/${filename}`),
          });
        }

        auditResults.push({
          route: route.path,
          name: route.name,
          viewport: vp.width,
          hasOverflow: overflowCheck.hasOverflow,
          scrollWidth: overflowCheck.scrollWidth,
          clientWidth: overflowCheck.clientWidth,
        });
      } catch (err) {
        auditResults.push({
          route: route.path,
          name: route.name,
          viewport: vp.width,
          error: err.message,
        });
      }
    }
  }

  await browser.close();

  console.log('\n--- AUDIT RESULTS ---');
  console.log(JSON.stringify(auditResults, null, 2));

  const overflows = auditResults.filter((r) => r.hasOverflow);
  console.log(`\nTotal Overflows detected: ${overflows.length}`);
  if (overflows.length > 0) {
    console.log('Overflowing pages:', overflows);
  }

  console.log(`Total Console/Page Errors: ${logs.length}`);
  if (logs.length > 0) {
    console.log('Errors:', logs);
  }
}

runAudit().catch(console.error);
