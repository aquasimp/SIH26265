const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCardVisual() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,750']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 750, deviceScaleFactor: 2 });

  const critBase64 = fs.readFileSync(path.join(__dirname, '../public/textures/marble-critical.webp')).toString('base64');
  const pendBase64 = fs.readFileSync(path.join(__dirname, '../public/textures/marble-pending.webp')).toString('base64');
  const apprBase64 = fs.readFileSync(path.join(__dirname, '../public/textures/marble-approved.webp')).toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F8F9FA;
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .grid-row {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      max-width: 1260px;
      width: 100%;
      background: #F8F9FA;
    }
    .column-cell {
      flex: 1;
      padding: 24px 32px;
      position: relative;
      display: flex;
      justify-content: center;
    }
    .column-cell:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0;
      top: -20px;
      bottom: -20px;
      width: 1px;
      background: rgba(0, 0, 0, 0.07);
    }
    .card-wrapper {
      position: relative;
      width: 100%;
      max-width: 370px;
      height: 310px;
      cursor: pointer;
      user-select: none;
      perspective: 1200px;
      filter: drop-shadow(0 14px 28px rgba(0,0,0,0.09)) drop-shadow(0 4px 10px rgba(0,0,0,0.05));
    }
    .folder-back {
      position: absolute;
      inset: 0;
      clip-path: url(#folder-back-clip);
      -webkit-clip-path: url(#folder-back-clip);
      overflow: hidden;
      background: #111;
    }
    .marble-bg {
      position: absolute;
      inset: -6%;
      width: 112%;
      height: 112%;
      background-size: cover;
      background-position: center;
    }
    .folder-front {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 65%;
      clip-path: url(#folder-front-clip);
      -webkit-clip-path: url(#folder-front-clip);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(255, 255, 255, 0.58) 45%, rgba(255, 255, 255, 0.44) 100%);
      backdrop-filter: blur(28px) saturate(135%);
      -webkit-backdrop-filter: blur(28px) saturate(135%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 26px 24px;
      transform-origin: bottom center;
    }
    .folder-front-border {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .card-content {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      z-index: 2;
    }
    .title-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .card-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #111419;
      line-height: 1.15;
    }
    .card-subtitle {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: #71717A;
      letter-spacing: -0.01em;
      font-weight: 500;
    }
    .squircle-btn {
      width: 70px;
      height: 70px;
      border-radius: 22px;
      background: linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(244,245,248,0.88) 100%);
      box-shadow: 0 10px 22px -3px rgba(0,0,0,0.12), 0 3px 8px -2px rgba(0,0,0,0.06), inset 0 1.5px 1.5px rgba(255,255,255,1);
      border: 1px solid rgba(255,255,255,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ooo-glyph {
      display: flex;
      align-items: center;
      gap: 3.5px;
    }
    .ooo-glyph span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      border: 1.8px solid #1a202c;
      box-sizing: border-box;
      background: transparent;
    }
  </style>
</head>
<body>
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <!-- Back folder: tab on right with smooth S-curve -->
      <clipPath id="folder-back-clip" clipPathUnits="objectBoundingBox">
        <path d="
          M 0, 0.24
          C 0, 0.18 0.03, 0.15 0.08, 0.15
          L 0.44, 0.15
          C 0.52, 0.15 0.55, 0.0 0.64, 0.0
          L 0.92, 0.0
          C 0.97, 0.0 1.0, 0.03 1.0, 0.08
          L 1.0, 0.92
          C 1.0, 0.97 0.97, 1.0 0.92, 1.0
          L 0.08, 1.0
          C 0.03, 1.0 0, 0.97 0, 0.92
          Z
        " />
      </clipPath>

      <!-- Front glass panel: notch dipping down on right with smooth S-curve -->
      <clipPath id="folder-front-clip" clipPathUnits="objectBoundingBox">
        <path d="
          M 0, 0.12
          C 0, 0.04 0.03, 0.0 0.08, 0.0
          L 0.42, 0.0
          C 0.49, 0.0 0.53, 0.18 0.60, 0.18
          L 0.92, 0.18
          C 0.97, 0.18 1.0, 0.22 1.0, 0.28
          L 1.0, 0.88
          C 1.0, 0.95 0.96, 1.0 0.90, 1.0
          L 0.10, 1.0
          C 0.04, 1.0 0, 0.95 0, 0.88
          Z
        " />
      </clipPath>
    </defs>
  </svg>

  <div class="grid-row">
    <!-- Card 1: Critical -->
    <div class="column-cell">
      <div class="card-wrapper">
        <div class="folder-back">
          <div class="marble-bg" style="background-image: url('data:image/webp;base64,${critBase64}')"></div>
        </div>
        <div class="folder-front">
          <svg class="folder-front-border" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="
              M 0, 12
              C 0, 4 3, 0 8, 0
              L 42, 0
              C 49, 0 53, 18 60, 18
              L 92, 18
              C 97, 18 100, 22 100, 28
            " fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="card-content">
            <div class="title-group">
              <h3 class="card-title">Fatal Forgeries</h3>
              <span class="card-subtitle">3 Critical Dossiers</span>
            </div>
            <div class="squircle-btn">
              <div class="ooo-glyph">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Pending -->
    <div class="column-cell">
      <div class="card-wrapper">
        <div class="folder-back">
          <div class="marble-bg" style="background-image: url('data:image/webp;base64,${pendBase64}')"></div>
        </div>
        <div class="folder-front">
          <svg class="folder-front-border" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="
              M 0, 12
              C 0, 4 3, 0 8, 0
              L 42, 0
              C 49, 0 53, 18 60, 18
              L 92, 18
              C 97, 18 100, 22 100, 28
            " fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="card-content">
            <div class="title-group">
              <h3 class="card-title">EVC Shortfalls</h3>
              <span class="card-subtitle">4 Pending Filings</span>
            </div>
            <div class="squircle-btn">
              <div class="ooo-glyph">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3: Approved -->
    <div class="column-cell">
      <div class="card-wrapper">
        <div class="folder-back">
          <div class="marble-bg" style="background-image: url('data:image/webp;base64,${apprBase64}')"></div>
        </div>
        <div class="folder-front">
          <svg class="folder-front-border" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="
              M 0, 12
              C 0, 4 3, 0 8, 0
              L 42, 0
              C 49, 0 53, 18 60, 18
              L 92, 18
              C 97, 18 100, 22 100, 28
            " fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="card-content">
            <div class="title-group">
              <h3 class="card-title">Approved 3-Yr EoA</h3>
              <span class="card-subtitle">5 Verified Deeds</span>
            </div>
            <div class="squircle-btn">
              <div class="ooo-glyph">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outShot = path.join(__dirname, '../screenshots/test-card-visual.png');
  await page.screenshot({ path: outShot });
  console.log('Updated visual test screenshot saved to', outShot);

  await browser.close();
}

testCardVisual().catch(console.error);
