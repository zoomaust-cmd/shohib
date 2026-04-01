import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, type } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = "";
    let model = 'gemini-3-flash-preview';

    if (type === 'advisor') {
      systemInstruction = "أنت المستشار الذكي للشركة العربية الأولى القابضة. مهمتك هي تقديم استشارات، ملخصات، أفكار، توليد محتوى، مقترحات، وصف وظيفي، وأي نصوص متعلقة بالتسويق، الإدارة، القانون، التحليل السوقي، تحليل المنافسين، والبحث عن الفرص. قدم إجابات احترافية، دقيقة، ومنظمة.";
    } else if (type === 'summarize') {
      systemInstruction = "لخص النص المقدم في 3 نقاط قصيرة جداً.";
    }
    
    const response = await ai.models.generateContent({
      model: model,
      contents: message,
      config: systemInstruction ? { systemInstruction } : undefined
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message || String(error) });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  import('vite').then(async ({ createServer: createViteServer }) => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    app.listen(PORT as number, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
