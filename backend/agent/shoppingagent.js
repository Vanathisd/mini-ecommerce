console.log("Gemini API key loaded:", !!process.env.GEMINI_API_KEY);
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function askShoppingAgent(message) {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: message,
    });

    return response.text;
}

module.exports = { askShoppingAgent };