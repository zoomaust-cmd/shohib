import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    
    const ai = new GoogleGenAI({ apiKey });
    console.log('Calling generateContent...');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Hello',
    });
    console.log('Response:', response.text);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
