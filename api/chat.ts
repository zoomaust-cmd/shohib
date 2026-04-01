import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    const { message } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    res.status(200).json({
      text: response.text,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      text: "حدث خطأ في الخادم",
    });
  }
}