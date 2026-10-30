import puppeteer from "puppeteer-core";
import path from "path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDir = path.resolve("./screenshots");

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  console.log("Navigating to /intake to capture active OCR bounding boxes...");
  await page.goto("http://localhost:3000/intake", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));

  // Click Sample 1 button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const sampleBtn = buttons.find((b) => b.textContent.includes("Sample 1"));
    if (sampleBtn) sampleBtn.click();
  });

  // Wait for OCR sweep & response
  await new Promise((r) => setTimeout(r, 1500));

  const filePath = path.join(outputDir, "04-ocr-assisted-intake.png");
  await page.screenshot({ path: filePath });
  console.log("Re-captured 04-ocr-assisted-intake.png with active bounding boxes!");

  await browser.close();
}

run().catch(console.error);

