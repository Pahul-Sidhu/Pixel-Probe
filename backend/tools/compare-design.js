// analyze-image.js
const fs = require("fs");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function compareImages({ prodImage, designImage }) {
    try {
        const prompt = `
            You are a senior UX reviewer. Compare the Production Image (Image A) vs Design Image (Image B).

            Return structured JSON:

            {
            "overall_change": "...",
            "improvements": ["...", "..."],
            "regressions": ["...", "..."],
            "spacing_changes": [...],
            "color_changes": [...],
            "typography_changes": [...],
            "missing_elements": [...],
            "recommendations": [...]
            }
        `;
        const response = await client.responses.create({
            model: "gpt-4.1", // or "gpt-4o" for full quality
            temperature: 0,
            text: { format: { type: "json_object" } },
            input: [
                {
                    role: "system",
                    content: prompt,
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: "Image A = Production Image" },
                        { type: "input_image", image_url: `data:image/png;base64,${prodImage}` },

                        { type: "input_text", text: "Image B = Design Image" },
                        { type: "input_image", image_url: `data:image/png;base64,${designImage}` },
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

module.exports = { compareImages };