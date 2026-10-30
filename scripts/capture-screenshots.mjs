import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDir = path.resolve("./screenshots");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log("Launching Edge from:", edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  const screens = [
    {
      name: "01-treasury-dashboard.png",
      url: "http://localhost:3000/",
      waitFor: 2000,
    },
    {
      name: "02-central-repository.png",
      url: "http://localhost:3000/repository",
      waitFor: 2000,
    },
    {
      name: "03-fdr-inspection-provenance.png",
      url: "http://localhost:3000/repository/fdr-ec-01-expiring-soon",
      waitFor: 2000,
    },
    {
      name: "04-ocr-assisted-intake.png",
      url: "http://localhost:3000/intake",
      waitFor: 2000,
      action: async (p) => {
        // Trigger scan preview
        const scanBtn = await p.$("button:has-text('Re-Scan')");
        if (scanBtn) await scanBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
      },
    },
    {
      name: "05-discrepancy-manager.png",
      url: "http://localhost:3000/repository/fdr-ec-04-ifsc-mismatch",
      waitFor: 2000,
    },
    {
      name: "06-institution-desk.png",
      url: "http://localhost:3000/institution",
      waitFor: 2000,
    },
    {
      name: "07-release-governance-queue.png",
      url: "http://localhost:3000/release-workflow",
      waitFor: 2000,
    },
    {
      name: "08-cryptographic-audit-trail.png",
      url: "http://localhost:3000/audit-trail",
      waitFor: 2000,
    },
  ];

  for (const s of screens) {
    console.log(`Capturing ${s.name} from ${s.url}...`);
    await page.goto(s.url, { waitUntil: "networkidle0", timeout: 15000 });
    await new Promise((r) => setTimeout(r, s.waitFor));
    if (s.action) {
      try {
        await s.action(page);
      } catch (e) {
        console.warn(`Action failed for ${s.name}:`, e.message);
      }
    }
    const filePath = path.join(outputDir, s.name);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved: ${filePath}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
