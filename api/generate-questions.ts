import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    subject = 'Matematika',
    grade = 'VIII',
    curriculum = 'Kurikulum Merdeka',
    topic = 'Standar Kurikulum SMP',
    count = 3,
    type = 'campuran',
    cognitiveLevel = 'HOTS',
    semester = 'Ganjil',
  } = req.body || {};

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      success: true,
      source: 'offline-bank',
      message: 'Soal berhasil disiapkan dari Bank Soal Standar Kurikulum SMP.',
      questions: [],
    });
  }

  try {
    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Anda adalah Tim Ahli Pembuat Soal Ujian Nasional dan Asesmen Standar SMP Kemdikbudristek RI.
Buatlah ${count} butir soal ujian tingkat SMP dengan spesifikasi:
- Mata Pelajaran: ${subject}
- Kelas: Kelas ${grade} SMP
- Kurikulum: ${curriculum}
- Topik / Capaian Pembelajaran: ${topic}
- Bentuk Soal: ${type}
- Level Kognitif: ${cognitiveLevel}

Format output WAJIB JSON array murni tanpa markdown:
[
  {
    "id": "gen-1",
    "subject": "${subject}",
    "grade": "${grade}",
    "topic": "${topic}",
    "type": "pg",
    "text": "Pertanyaan...",
    "options": [
      { "label": "A", "text": "Pilihan A" },
      { "label": "B", "text": "Pilihan B" },
      { "label": "C", "text": "Pilihan C" },
      { "label": "D", "text": "Pilihan D" }
    ],
    "correctAnswer": "A",
    "explanation": "Penjelasan...",
    "cognitiveLevel": "${cognitiveLevel}",
    "bloomCode": "C4 (Analisis)",
    "points": 2
  }
]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '[]';
    let questions = [];
    try {
      questions = JSON.parse(responseText);
      if (!Array.isArray(questions)) {
        if (questions && typeof questions === 'object' && Array.isArray((questions as any).questions)) {
          questions = (questions as any).questions;
        } else {
          questions = [questions];
        }
      }
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      questions,
    });
  } catch (error: any) {
    return res.json({
      success: true,
      source: 'fallback',
      questions: [],
      errorDetail: error.message,
    });
  }
}
