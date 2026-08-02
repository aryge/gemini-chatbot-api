import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Inisialisasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Gemini AI Client menggunakan SDK terbaru @google/genai
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const GEMINI_MODEL = 'gemini-3.6-flash';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint POST /api/chat untuk percakapan multi-turn
app.post('/api/chat', async (req, res) => {
  const { conversation, temperature, systemInstruction } = req.body;

  try {
    // Validasi bahwa input berupa array
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversation must be a valid array' });
    }

    // Ubah format pesan ke format yang kompatibel dengan Gemini SDK (role dan parts)
    const contents = conversation.map(({ role, text }) => ({
      role: role === 'bot' ? 'model' : 'user', // Gemini hanya menerima role 'user' atau 'model'
      parts: [{ text: text }],
    }));

    // Panggil model Gemini AI menggunakan metode generateContent
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        temperature: parseFloat(temperature) || 0.7,
        systemInstruction: systemInstruction || 'Kamu adalah asisten AI yang ramah, sopan, dan suka membantu pengguna.',
      },
    });

    // Kembalikan respons teks dari Gemini AI
    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message || 'Gagal memproses percakapan' });
  }
});

// Fallback route untuk menyajikan index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server pada port yang ditentukan
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on http://0.0.0.0:${PORT}`);
});
