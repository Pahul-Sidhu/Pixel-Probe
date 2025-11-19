// analyze-image.js
const fs = require("fs");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeImage({ filePath }) {
    try {
        // 1. Read image file into buffer
        const imageBuffer = fs.readFileSync(filePath);

        // 2. Convert to base64
        const base64Image = imageBuffer.toString("base64");

        // 3. Send to OpenAI Vision Model
        const response = await client.responses.create({
            model: "gpt-4.1-mini", // or "gpt-4o" for full quality
            temperature: 0,
            text: { format: { type: "json_object" } },
            input: [
                {
                    role: "system",
                    content:
                        "You are a UX auditor. Analyze screenshots and return JSON insights. Keep responses structured.",
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: "Analyze the UX of this uploaded screenshot. Output JSON with UX score, hierarchy, readability, spacing, and color issues. Highlight strengths and issues of each." },
                        {
                            type: "input_image",
                            image_url: `data:image/jpeg;base64,${base64Image}`,
                        },
                    ],
                },
            ],
        });

        const result = JSON.parse(response.output[0].content[0].text);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("OpenAI Vision Error", error);
        return { success: false, error: error.message };
    }
}

module.exports = { analyzeImage };