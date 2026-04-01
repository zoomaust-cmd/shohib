import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // 🔍 تأكد من وجود المفتاح
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API KEY missing" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "لا يوجد رد";

    res.status(200).json({ text });

  } catch (error) {
  console.error("FULL ERROR:", error);

  return res.status(500).json({
    error: error.message,
    stack: error.stack
  });
}
}