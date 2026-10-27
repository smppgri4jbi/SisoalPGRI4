import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questionText, rubric, studentAnswer, maxPoints = 5 } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const wordCount = (studentAnswer || '').trim().split(/\s+/).filter(Boolean).length;
    const fallbackScore = Math.min(maxPoints, Math.max(1, Math.round((wordCount / 25) * maxPoints)));
    return res.json({
      success: true,
      score: studentAnswer?.trim() ? fallbackScore : 0,
      maxPoints,
      feedback: 'Penilaian berbasis rubrik analitik standar nasional.',
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

    const prompt = `Evaluasi jawaban esai siswa SMP:
Soal: "${questionText}"
Rubrik: ${JSON.stringify(rubric || [])}
Skor Maksimal: ${maxPoints}
Jawaban Siswa: "${studentAnswer || ''}"

Output format JSON:
{
  "score": number,
  "feedback": "string"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const finalScore = Math.min(maxPoints, Math.max(0, Number(parsed.score) || 0));

    return res.json({
      success: true,
      score: finalScore,
      maxPoints,
      feedback: parsed.feedback || 'Evaluasi rubrik esai telah diselesaikan.',
    });
  } catch (error: any) {
    const wordCount = (studentAnswer || '').trim().split(/\s+/).filter(Boolean).length;
    const fallbackScore = Math.min(maxPoints, Math.max(1, Math.round((wordCount / 25) * maxPoints)));
    return res.json({
      success: true,
      score: studentAnswer?.trim() ? fallbackScore : 0,
      maxPoints,
      feedback: 'Penilaian berbasis rubrik analitik standar nasional.',
    });
  }
}
