const express = require('express');
const { fetchScreenshot } = require("./tools/fetch-screenshot.js");
const { analyzeImage } = require("./tools/analyze-image.js");
const { compareImages } = require("./tools/compare-design.js");
const { getSession, sessions } = require("./sessionStore");
const { randomUUID } = require("crypto");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get('/', (req, res) => {
    res.send('Welcome to Pixel_probe!');
});

app.post("/api/screenshot", async (req, res) => {
    console.log(req)
    const { url, sessionId } = req.body;
    const session = getSession(sessionId);

    if(!session) return res.status(400).json({ error: "Invalid session ID" });

    if (!url) return res.status(400).json({ error: "URL is required" });

    const result = await fetchScreenshot(url);

    if (!result.success)
        return res.status(500).json({ error: result.error });

    const analysis = await analyzeImage({ filePath: result.filePath });

    if (!analysis.success)
        return res.status(500).json({ error: analysis.error });

    if (session) {
        session.screenshot = {
            base64: result.base64,
            filePath: result.filePath,
            width: result.width,
            height: result.height,
        };
        session.dom = result.html;
        session.styles = result.styles;
        session.uxReport = analysis.data;
    }

    res.json({
        image: result.base64,
        filePath: result.filePath,
        width: result.width,
        height: result.height,
        analysis: analysis.data,
    });
});

app.post("/api/analyze", async (req, res) => {
    // get req.file
    const { prodImage, DesImage } = req.body;
    const sessionId = req.body.sessionId;
    const session = getSession(sessionId);
    if (!session){
        return res.status(400).json({ error: "Invalid session ID" });
    }

    const result = await compareImages({ prodImage, designImage: DesImage });

    if (!result.success) {
        return res.status(500).json({ error: result.error });
    }

    res.json({
        comparison: result.data,
    });
});

app.post('/api/start', (req, res) => {
    const sessionId = randomUUID();

    sessions.set(sessionId, {
        createdAt: Date.now(),
        dom: null,
        styles: null,
        screenshot: null,
        uxReport: null,
        comparable: null
    });

    res.json({ sessionId });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});