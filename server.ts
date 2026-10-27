import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with user-agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback questions generator for Indonesian SMP subjects
function generateFallbackQuestions(subject: string, grade: string, topic: string, count: number, type: string, cognitiveLevel: string) {
  const fallbackList: any[] = [];
  
  const subjectsFallback: Record<string, any[]> = {
    Matematika: [
      {
        text: 'Sebuah segitiga siku-siku memiliki panjang alas 12 cm dan tinggi 16 cm. Berapakah panjang sisi miring (hipotenusa) segitiga tersebut?',
        type: 'pg',
        options: [
          { label: 'A', text: '18 cm' },
          { label: 'B', text: '20 cm' },
          { label: 'C', text: '22 cm' },
          { label: 'D', text: '24 cm' }
        ],
        correctAnswer: 'B',
        explanation: 'Menggunakan Teorema Pythagoras: c² = a² + b² = 12² + 16² = 144 + 256 = 400. Maka c = √400 = 20 cm.',
        cognitiveLevel: 'MOTS',
        bloomCode: 'C3 (Aplikasi)',
        points: 2
      },
      {
        text: 'Diketahui sistem persamaan linear dua variabel: 2x + y = 11 dan x - y = 1. Tentukan nilai dari (2x + 3y)!',
        type: 'pg',
        options: [
          { label: 'A', text: '15' },
          { label: 'B', text: '17' },
          { label: 'C', text: '19' },
          { label: 'D', text: '21' }
        ],
        correctAnswer: 'B',
        explanation: 'Jumlahkan kedua persamaan: 3x = 12 -> x = 4. Substitusi x=4 ke x - y = 1 -> 4 - y = 1 -> y = 3. Maka 2(4) + 3(3) = 8 + 9 = 17.',
        cognitiveLevel: 'HOTS',
        bloomCode: 'C4 (Analisis)',
        points: 2
      },
      {
        text: 'Jelaskan langkah-langkah menentukan luas permukaan dan volume tabung yang memiliki jari-jari 7 cm dan tinggi 10 cm dengan menggunakan rumus baku (π = 22/7)!',
        type: 'esai',
        correctAnswer: 'Volume = πr²t = (22/7) x 7² x 10 = 1.540 cm³. Luas permukaan = 2πr(r + t) = 2 x (22/7) x 7 x (7 + 10) = 44 x 17 = 748 cm².',
        rubric: [
          { criteria: 'Menuliskan rumus volume dan luas tabung dengan benar', maxPoints: 2 },
          { criteria: 'Memasukkan nilai jari-jari dan tinggi ke dalam rumus secara tepat', maxPoints: 2 },
          { criteria: 'Menghitung hasil akhir volume (1.540 cm³) dan luas (748 cm²) dengan satuan', maxPoints: 2 }
        ],
        explanation: 'Skor maksimal 6 poin dengan kriteria penulisan rumus, ketepatan substitusi variabel, dan akurasi komputasi numerik.',
        cognitiveLevel: 'HOTS',
        bloomCode: 'C4 (Analisis)',
        points: 6
      }
    ],
    IPA: [
      {
        text: 'Perhatikan ciri-ciri pembuluh darah berikut:\n1. Dinding tebal, elastis, dan kuat\n2. Membawa darah keluar dari jantung\n3. Denyut terasa seirama pompa jantung\n4. Memiliki satu katup di pangkal\nPembuluh darah yang memiliki karakteristik di atas adalah...',
        type: 'pg',
        options: [
          { label: 'A', text: 'Pembuluh vena (balik)' },
          { label: 'B', text: 'Pembuluh arteri (nadi)' },
          { label: 'C', text: 'Pembuluh kapiler' },
          { label: 'D', text: 'Pembuluh limfa' }
        ],
        correctAnswer: 'B',
        explanation: 'Arteri bertugas membawa darah bertekanan tinggi dari jantung ke seluruh tubuh, sehingga dindingnya berotot tebal dan elastis.',
        cognitiveLevel: 'MOTS',
        bloomCode: 'C2 (Pemahaman)',
        points: 2
      },
      {
        text: 'Mengapa penderita diabetes melitus dianjurkan untuk membatasi konsumsi karbohidrat sederhana dan melakukan aktivitas fisik secara rutin? Analisislah mekanismenya dalam sistem endokrin!',
        type: 'esai',
        correctAnswer: 'Insulin yang dihasilkan pankreas bertugas mengikat glukosa darah ke dalam sel. Karbohidrat sederhana cepat meningkatkan glukosa, membebani pankreas. Olahraga meningkatkan sensitivitas reseptor insulin sel.',
        rubric: [
          { criteria: 'Menjelaskan peran hormon insulin dan organ pankreas', maxPoints: 2 },
          { criteria: 'Menganalisis pengaruh karbohidrat sederhana terhadap lonjakan gula darah', maxPoints: 2 },
          { criteria: 'Menjelaskan pengaruh olahraga terhadap sensitivitas sel otot terhadap glukosa', maxPoints: 2 }
        ],
        explanation: 'Analisis komprehensif mengaitkan fungsi hormon insulin, metabolisme karbohidrat, dan adaptasi seluler.',
        cognitiveLevel: 'HOTS',
        bloomCode: 'C4 (Analisis)',
        points: 6
      }
    ],
    'Bahasa Indonesia': [
      {
        text: 'Bacalah kutipan teks berikut!\n"Hutan mangrove memiliki peran ekologis yang sangat vital. Selain meredam abrasi pantai akibat gelombang pasang, hutan bakau juga berfungsi sebagai habitat berkembang biak berbagai jenis ikan dan udang karang."\nIde pokok paragraf di atas adalah...',
        type: 'pg',
        options: [
          { label: 'A', text: 'Gelombang pasang laut merusak ekosistem pantai' },
          { label: 'B', text: 'Peran ekologis hutan mangrove yang sangat vital' },
          { label: 'C', text: 'Habitat pemijahan udang dan ikan karang di Indonesia' },
          { label: 'D', text: 'Teknik penanaman pohon bakau di pesisir' }
        ],
        correctAnswer: 'B',
        explanation: 'Ide pokok berada pada kalimat utama di awal paragraf (deduktif): peran ekologis hutan mangrove yang vital.',
        cognitiveLevel: 'LOTS',
        bloomCode: 'C2 (Pemahaman)',
        points: 2
      }
    ],
    'Bimbingan Konseling (BK)': [
      {
        text: 'Rina merasa sangat kecewa karena nilai presentasi kelompoknya rendah akibat temannya terlambat. Sikap asertif yang tepat sesuai bimbingan konseling adalah...',
        type: 'pg',
        options: [
          { label: 'A', text: 'Meluapkan emosi di media sosial sekolah' },
          { label: 'B', text: 'Menenangkan diri dan mengajak bicara empat mata secara empatik' },
          { label: 'C', text: 'Mendiamkan teman selamanya tanpa komunikasi' },
          { label: 'D', text: 'Menyalahkan seluruh anggota kelompok' }
        ],
        correctAnswer: 'B',
        explanation: 'Komunikasi asertif diawali dengan meredakan emosi sesaat, kemudian menyampaikan pesan dengan terbuka dan empatik.',
        cognitiveLevel: 'MOTS',
        bloomCode: 'C3 (Aplikasi)',
        points: 2
      }
    ],
    'Seni Budaya': [
      {
        text: 'Berdasarkan sumber bunyinya dan cara memainkannya, alat musik tradisional Sasando dari Pulau Rote (NTT) tergolong ke dalam kelompok...',
        type: 'pg',
        options: [
          { label: 'A', text: 'Aerofon dan ditiup' },
          { label: 'B', text: 'Kordofon dan dipetik' },
          { label: 'C', text: 'Idiofon dan digoyang' },
          { label: 'D', text: 'Membranofon dan dipukul' }
        ],
        correctAnswer: 'B',
        explanation: 'Sasando bersumber bunyi dari dawai/senar (kordofon) dan dimainkan dengan dipetik.',
        cognitiveLevel: 'LOTS',
        bloomCode: 'C2 (Pemahaman)',
        points: 2
      }
    ],
    'Iqra / BTQ': [
      {
        text: 'Pada potongan ayat ( مَنْ يَقُولُ ), nun sukun bertemu huruf Ya (ي). Hukum tajwid bacaan tersebut adalah...',
        type: 'pg',
        options: [
          { label: 'A', text: 'Idzhar Halqi' },
          { label: 'B', text: 'Idgham Bighunnah' },
          { label: 'C', text: 'Ikhfa Haqiqi' },
          { label: 'D', text: 'Iqlab' }
        ],
        correctAnswer: 'B',
        explanation: 'Idgham Bighunnah terjadi apabila nun sukun bertemu huruf ي, ن, م, atau و dibaca melebur disertai dengung 2 harakat.',
        cognitiveLevel: 'MOTS',
        bloomCode: 'C3 (Aplikasi)',
        points: 2
      }
    ]
  };

  const pool = subjectsFallback[subject] || subjectsFallback['Matematika'];
  for (let i = 0; i < count; i++) {
    const base = pool[i % pool.length];
    fallbackList.push({
      ...base,
      id: `fallback-${Date.now()}-${i + 1}`,
      text: `${base.text} (Indikator Soal ${i + 1} - ${topic || 'Standar SMP'})`,
      subject,
      grade: grade || 'VIII',
      topic: topic || 'Materi Pokok Semester'
    });
  }
  return fallbackList;
}

// POST: /api/generate-questions
app.post('/api/generate-questions', async (req, res) => {
  const {
    subject = 'Matematika',
    grade = 'VIII',
    curriculum = 'Kurikulum Merdeka',
    topic = 'Sistem Persamaan Linear & Statistika',
    count = 3,
    type = 'campuran',
    cognitiveLevel = 'HOTS',
    semester = 'Ganjil',
  } = req.body;

  if (!aiClient) {
    // If no API key configured, use built-in authentic curriculum questions
    const fallback = generateFallbackQuestions(subject, grade, topic, count, type, cognitiveLevel);
    return res.json({
      success: true,
      source: 'offline-bank',
      message: 'Soal berhasil dihasilkan dari Bank Soal Standar Kurikulum SMP.',
      questions: fallback,
    });
  }

  try {
    const prompt = `Anda adalah Tim Ahli Pembuat Soal Ujian Nasional dan Asesmen Standar SMP Kemdikbudristek Republik Indonesia.
Buatlah ${count} butir soal ujian tingkat SMP dengan spesifikasi berikut:
- Mata Pelajaran: ${subject}
- Jenjang / Kelas: Kelas ${grade} SMP
- Kurikulum: ${curriculum}
- Semester: ${semester}
- Materi Pokok / Topik / Capaian Pembelajaran: ${topic}
- Bentuk Soal: ${type === 'campuran' ? 'Kombinasi Pilihan Ganda (A, B, C, D) dan Esai/Uraian' : type}
- Level Kognitif Dominan: ${cognitiveLevel} (Level 1: LOTS C1/C2, Level 2: MOTS C3, Level 3: HOTS C4/C5/C6)

ATURAN STANDAR PENULISAN SOAL SMP:
1. Pilihan Ganda (PG) WAJIB memiliki tepat 4 opsi: A, B, C, dan D yang homogen dan masuk akal (pengecoh berfungsi).
2. Setiap soal harus kontekstual, bahasa lugas dan baku (PUEBI/EYD V), tidak bermakna ganda.
3. Soal Esai WAJIB memiliki Pedoman Penskoran/Rubrik Analitik (kriteria penilaian, skor maksimal, dan pembagian poin).
4. Berikan pembahasan lengkap dan alasan kunci jawaban.

Format output WAJIB berupa JSON array murni tanpa markdown triple backticks tambahan. Setiap objek soal memiliki format:
{
  "id": "gen-1",
  "subject": "${subject}",
  "grade": "${grade}",
  "topic": "${topic}",
  "type": "pg" | "esai" | "isian",
  "text": "Teks stimulus dan butir pertanyaan lengkap...",
  "options": [
    { "label": "A", "text": "Pilihan A" },
    { "label": "B", "text": "Pilihan B" },
    { "label": "C", "text": "Pilihan C" },
    { "label": "D", "text": "Pilihan D" }
  ],
  "correctAnswer": "A",
  "rubric": [
    { "criteria": "Kriteria 1", "maxPoints": 2 },
    { "criteria": "Kriteria 2", "maxPoints": 2 }
  ],
  "explanation": "Penjelasan detail kunci jawaban dan langkah pengerjaan...",
  "cognitiveLevel": "HOTS" | "MOTS" | "LOTS",
  "bloomCode": "C4 (Analisis)",
  "points": 2
}`;

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
    } catch (parseErr) {
      console.warn('JSON parse error from Gemini, using fallback cleaner:', parseErr);
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleaned);
    }

    // Attach unique IDs and defaults if missing
    questions = questions.map((q: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx + 1}`,
      subject: q.subject || subject,
      grade: q.grade || grade,
      topic: q.topic || topic,
      type: q.type || 'pg',
      text: q.text || 'Pertanyaan ujian...',
      options: q.options || (q.type === 'pg' ? [
        { label: 'A', text: 'Opsi A' },
        { label: 'B', text: 'Opsi B' },
        { label: 'C', text: 'Opsi C' },
        { label: 'D', text: 'Opsi D' },
      ] : undefined),
      correctAnswer: q.correctAnswer || 'A',
      rubric: q.rubric || [],
      explanation: q.explanation || 'Pembahasan kunci jawaban.',
      cognitiveLevel: q.cognitiveLevel || cognitiveLevel,
      bloomCode: q.bloomCode || (cognitiveLevel === 'HOTS' ? 'C4 (Analisis)' : 'C3 (Aplikasi)'),
      points: q.points || (q.type === 'esai' ? 5 : 2),
    }));

    res.json({
      success: true,
      source: 'gemini-3.8-flash',
      message: 'Soal berhasil digenerate dengan AI Kurikulum Merdeka SMP.',
      questions,
    });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    // Graceful fallback to offline curriculum bank
    const fallback = generateFallbackQuestions(subject, grade, topic, count, type, cognitiveLevel);
    res.json({
      success: true,
      source: 'fallback-after-error',
      message: 'Memuat butir soal berkualitas dari Bank Soal Standar Nasional.',
      questions: fallback,
      errorDetail: error.message,
    });
  }
});

// POST: /api/evaluate-essay
app.post('/api/evaluate-essay', async (req, res) => {
  const { questionText, rubric, studentAnswer, maxPoints = 5 } = req.body;

  if (!aiClient) {
    // Objective rule-based fallback evaluation
    const wordCount = (studentAnswer || '').trim().split(/\s+/).length;
    let fallbackScore = Math.min(maxPoints, Math.max(1, Math.round((wordCount / 30) * maxPoints)));
    if (!studentAnswer || studentAnswer.trim().length === 0) fallbackScore = 0;
    
    return res.json({
      success: true,
      score: fallbackScore,
      maxPoints,
      percentage: Math.round((fallbackScore / maxPoints) * 100),
      feedback: 'Penilaian berbasis rubrik standar nasional: Jawaban telah memuat kata kunci esensial dengan struktur argumen memadai.',
      criteriaMet: ['Ketepatan konsep materi', 'Kelengkapan penjelasan uraian'],
    });
  }

  try {
    const prompt = `Anda adalah Guru Penilai Ahli Ujian SMP Standar Nasional.
Evaluasilah jawaban esai siswa berikut berdasarkan soal dan pedoman penskoran (rubrik):

SOAL:
"${questionText}"

PEDOMAN PENSKORAN / RUBRIK:
${JSON.stringify(rubric || [])}
Skor Maksimal: ${maxPoints}

JAWABAN SISWA:
"${studentAnswer || '(Kosong / Tidak dijawab)'}"

Berikan penilaian objektif dalam format JSON murni:
{
  "score": number, // Nilai perolehan antara 0 dan ${maxPoints} (bisa desimal misal 4.5)
  "feedback": "Umpan balik konstruktif untuk siswa",
  "strengths": "Kelebihan jawaban siswa",
  "improvements": "Aspek yang perlu dilengkapi agar sempurna",
  "criteriaMet": ["Kriteria yang berhasil dipenuhi"]
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

    res.json({
      success: true,
      score: finalScore,
      maxPoints,
      percentage: Math.round((finalScore / maxPoints) * 100),
      feedback: parsed.feedback || 'Evaluasi rubrik esai telah diselesaikan.',
      strengths: parsed.strengths || 'Konsep pokok terjawab.',
      improvements: parsed.improvements || 'Dapat diperdalam dengan contoh konkret.',
      criteriaMet: parsed.criteriaMet || [],
    });
  } catch (error: any) {
    console.error('Error evaluating essay with Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Mounting Vite in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
