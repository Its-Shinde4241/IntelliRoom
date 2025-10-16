import { Router, text } from "express";
import { Request, Response } from "express";
import { cleanAIResponse, createImprovedPrompt } from "../lib/helper";
const AgentRouter = Router();
interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: { text?: string }[];
        };
    }[];
}
AgentRouter.post("/generate", async (req: Request, res: Response) => {
    const { prompt } = req.body;
    const fullPrompt = createImprovedPrompt(prompt);
    const response = await fetch(process.env.GEMINI_AGENT_URL || "", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json() as GeminiResponse;
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!textResponse) {
        throw new Error("No valid text received from Gemini API");
    }

    const cleaned = cleanAIResponse(textResponse);

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (e) {
        throw new Error("Invalid JSON returned by Gemini: " + e);
    }

    const { html, css, js } = parsed;

    res.json({
        indexfile: html || "",
        stylefile: css || "",
        scriptfile: js || "",
    });
});

export default AgentRouter;