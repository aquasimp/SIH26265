const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3001';

async function getBrowser() {
  return await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

async function captureElement(selector, outputPath, viewport = { width: 1440, height: 900, deviceScaleFactor: 2 }) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const el = await page.$(selector);
  if (el) {
    await el.screenshot({ path: outputPath });
    console.log('Saved element screenshot:', outputPath);
  } else {
    console.log('Element not found:', selector);
    await page.screenshot({ path: outputPath });
    console.log('Saved fallback full page screenshot:', outputPath);
  }
  await browser.close();
}

async function capturePage(urlPath, outputPath, viewport = { width: 1440, height: 900, deviceScaleFactor: 2 }) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`${APP_URL}${urlPath}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: false });
  console.log('Saved page screenshot:', outputPath);
  await browser.close();
}

const action = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

if (action === 'captureElement') {
  captureElement(arg1, arg2);
} else if (action === 'capturePage') {
  capturePage(arg1, arg2);
}

module.exports = { getBrowser, captureElement, capturePage };

