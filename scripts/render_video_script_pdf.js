const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, '../docs/video_script.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  
  console.log('Navigating to:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const targetPaths = [
    path.resolve('C:\\Users\\anura\\Downloads\\AICTE_FDR_Portal_Demo_Video_Script_2Min.pdf'),
    path.resolve(__dirname, '../AICTE_FDR_Portal_Demo_Video_Script_2Min.pdf'),
    path.resolve(__dirname, '../docs/AICTE_FDR_Portal_Demo_Video_Script_2Min.pdf')
  ];

  console.log('Rendering PDF to:', targetPaths[0]);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  for (const p of targetPaths) {
    fs.writeFileSync(p, pdfBuffer);
    console.log('Saved PDF to:', p);
  }

  await browser.close();
  console.log('PDF generation complete!');
}

run().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});

