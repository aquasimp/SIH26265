const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, '../docs/rendered_document.html');
  console.log('Navigating to', 'file:///' + htmlPath.replace(/\\/g, '/'));
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const pdfPath = path.resolve(__dirname, '../docs/PROJECT_CONTEXT.pdf');
  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: -apple-system, sans-serif; font-size: 7.2pt; color: #747480; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; border-bottom: 0.75px solid #D5D1C8; padding-bottom: 3px; box-sizing: border-box;">
        <span>AICTE Central Treasury FDR Portal (SIH26265)</span>
        <span style="text-transform: uppercase; letter-spacing: 0.5px;">Regulation Bureau, AICTE New Delhi</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: -apple-system, sans-serif; font-size: 7.2pt; color: #747480; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; border-top: 0.75px solid #D5D1C8; padding-top: 3px; box-sizing: border-box;">
        <span>Smart India Hackathon 2026 — Official Prototype Dossier</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '14mm',
      right: '14mm'
    }
  });

  console.log('PDF generated at:', pdfPath);
  await browser.close();
}

run().catch(console.error);

