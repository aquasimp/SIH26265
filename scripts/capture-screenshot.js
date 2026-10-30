const puppeteer = require("puppeteer-core");

async function main() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });
  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 25000 });
  // Wait until the table loads data rows
  try {
    await page.waitForSelector("tbody tr td a", { timeout: 6000 });
  } catch (e) {
    console.log("Selector wait timed out, continuing...");
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: "public/dashboard-preview.png", fullPage: true });
  await browser.close();
  console.log("Screenshot successfully saved to public/dashboard-preview.png");
}

main().catch(console.error);
