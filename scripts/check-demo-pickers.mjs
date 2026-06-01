import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle", timeout: 60000 });

const types = await page
  .locator('[data-testid="realm-roller-picker"]')
  .evaluateAll((els) => els.map((e) => e.getAttribute("data-roller-type")));

const sectionTitles = await page.locator("section.realmorphism-panel h2").allTextContents();
const badges = await page.locator("section.realmorphism-panel .font-mono.text-xs.text-\\[\\#7dffb4\\]").allTextContents();

console.log("roller types:", types);
console.log("section h2s:", sectionTitles);
console.log("control badges:", badges);

await browser.close();
