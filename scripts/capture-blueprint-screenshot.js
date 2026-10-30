const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3005';

async function capture() {
  console.log('Connecting to', APP_URL);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.toString()));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  const outDir = path.join(__dirname, '../screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'blueprint-studio-desktop.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Saved screenshot to:', outPath);
  console.log('Total console/page errors:', errors.length);
  if (errors.length > 0) {
    console.error('Errors:', errors);
  }

  await browser.close();
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});

