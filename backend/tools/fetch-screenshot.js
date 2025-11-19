// backend/tools/fetchScreenshot.js
const { analyzeImage } = require("./analyze-image.js");
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// ensures tmp folder exists
const TMP_DIR = path.join(process.cwd(), "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

async function fetchScreenshot(url, options = {}) {
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage({
        viewport: options.viewport || { width: 1280, height: 800 },
    });

    try {
        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        // Small delay for late-loading UI
        await page.waitForTimeout(1200);

        const fileName = `screenshot-${Date.now()}.png`;
        const filePath = path.join(TMP_DIR, fileName);

        await page.screenshot({
            path: filePath,
            fullPage: true,
            type: "png",
        });

        const html = await page.content();

        const styles = await page.evaluate(() => {
            return Array.from(document.styleSheets)
                .map(s => s.href || "inline")
                .filter(Boolean);
        });

        const base64 = fs.readFileSync(filePath, { encoding: "base64" });

        return {
            success: true,
            filePath,
            base64,
            width: page.viewportSize().width,
            height: page.viewportSize().height,
            url,
            html,
            styles,
        };
    } catch (error) {
        console.error("❌ Screenshot error:", error);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

module.exports = { fetchScreenshot };