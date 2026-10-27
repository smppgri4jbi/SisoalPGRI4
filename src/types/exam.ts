export type SubjectType =
  | 'Matematika'
  | 'IPA'
  | 'Bahasa Indonesia'
  | 'Bahasa Inggris'
  | 'IPS'
  | 'PPKn'
  | 'Informatika'
  | 'PAI-BP'
  | 'Bimbingan Konseling (BK)'
  | 'Seni Budaya'
  | 'Iqra / BTQ'
  | 'PJOK';

export type GradeLevel = 'VII' | 'VIII' | 'IX';

export type CurriculumType = 'Kurikulum Merdeka' | 'Kurikulum 2013 (K13)';

export type QuestionType = 'pg' | 'pg_kompleks' | 'menjodohkan' | 'isian' | 'esai';

export type CognitiveLevel = 'LOTS' | 'MOTS' | 'HOTS';

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface RubricItem {
  criteria: string;
  maxPoints: number;
}

export interface Question {
  id: string;
  subject: SubjectType;
  grade: GradeLevel;
  curriculum?: CurriculumType;
  topic: string;
  competency?: string; // KD / Capaian Pembelajaran (CP)
  type: QuestionType;
  text: string;
  stimulus?: string; // Teks wacana, bacaan, tabel, atau pengantar
  options?: QuestionOption[]; // Tepat 4 opsi untuk SMP: A, B, C, D
  correctAnswer: string; // Misal 'B' untuk PG atau kunci jawaban
  rubric?: RubricItem[]; // Rubrik analitik untuk esai
  explanation: string;
  cognitiveLevel: CognitiveLevel;
  bloomCode: string; // C1, C2, C3, C4, C5, C6
  points: number;
}

export interface ExamHeader {
  schoolName: string;
  agencyName: string; // Dinas Pendidikan Kabupaten / Kota
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  examType: string; // Penilaian Sumatif Akhir Semester (SAS) / Asesmen Standar
  subject: SubjectType;
  grade: GradeLevel;
  timeLimitMinutes: number;
  kkm: number; // Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) / KKM standar nasional (e.g., 75)
  pgWeight: number; // Bobot PG (misal 70%)
  essayWeight: number; // Bobot Esai (misal 30%)
  teacherName: string;
  teacherNip: string;
  instructions: string[];
}

export interface ExamPaper {
  id: string;
  title: string;
  header: ExamHeader;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentScore {
  id: string;
  studentName: string;
  nisn: string;
  className: string;
  pgCorrectCount: number;
  pgTotalScore: number;
  essayScore: number;
  finalScore: number; // Skala 0 - 100
  predicate: 'A' | 'B' | 'C' | 'D';
  predicateDescription: string;
  status: 'Tuntas' | 'Remedial';
  zScore?: number;
  tScore?: number;
  answers: Record<string, string>; // questionId -> answer
}

export interface ItemAnalysisData {
  questionId: string;
  questionNumber: number;
  text: string;
  type: QuestionType;
  correctAnswer: string;
  difficultyIndex: number; // P: Proporsi siswa benar (0 - 1)
  difficultyCategory: 'Mudah' | 'Sedang' | 'Sukar';
  discriminationIndex: number; // D: Daya pembeda (-1 hingga +1)
  discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Buruk';
  distractorAnalysis: Record<string, number>; // Persentase pilihan A, B, C, D
  recommendation: 'Diterima' | 'Revisi Pengecoh' | 'Revisi Total / Dibuang';
}
