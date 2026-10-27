import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';
import { ExamPaper, Question, QuestionType, CognitiveLevel } from '../types/exam';

interface ExamBuilderProps {
  exam: ExamPaper;
  onUpdateExam: (updated: ExamPaper) => void;
  onOpenBank: () => void;
}

export const ExamBuilder: React.FC<ExamBuilderProps> = ({
  exam,
  onUpdateExam,
  onOpenBank,
}) => {
  const [showKopSettings, setShowKopSettings] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New Question Form state
  const [newType, setNewType] = useState<QuestionType>('pg');
  const [newStimulus, setNewStimulus] = useState<string>('');
  const [newText, setNewText] = useState<string>('');
  const [newOptionA, setNewOptionA] = useState<string>('');
  const [newOptionB, setNewOptionB] = useState<string>('');
  const [newOptionC, setNewOptionC] = useState<string>('');
  const [newOptionD, setNewOptionD] = useState<string>('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<string>('A');
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [newCognitive, setNewCognitive] = useState<CognitiveLevel>('MOTS');
  const [newPoints, setNewPoints] = useState<number>(2);

  const totalQuestions = exam.questions.length;
  const pgQuestions = exam.questions.filter((q) => q.type === 'pg');
  const essayQuestions = exam.questions.filter((q) => q.type === 'esai');
  const totalPoints = exam.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  // Header field updates
  const handleHeaderChange = (field: string, value: any) => {
    onUpdateExam({
      ...exam,
      header: {
        ...exam.header,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Reorder
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...exam.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    onUpdateExam({
      ...exam,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete
  const handleDelete = (id: string) => {
    onUpdateExam({
      ...exam,
      questions: exam.questions.filter((q) => q.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  // Add new manual question
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const question: Question = {
      id: `manual-${Date.now()}`,
      subject: exam.header.subject,
      grade: exam.header.grade,
      topic: 'Materi Ujian Pokok',
      type: newType,
      stimulus: newStimulus.trim() || undefined,
      text: newText.trim(),
      options:
        newType === 'pg'
          ? [
              { label: 'A', text: newOptionA || 'Pilihan A' },
              { label: 'B', text: newOptionB || 'Pilihan B' },
              { label: 'C', text: newOptionC || 'Pilihan C' },
              { label: 'D', text: newOptionD || 'Pilihan D' },
            ]
          : undefined,
      correctAnswer: newType === 'pg' ? newCorrectAnswer : newExplanation,
      explanation: newExplanation || 'Kunci jawaban dan kriteria penskoran.',
      cognitiveLevel: newCognitive,
      bloomCode: newCognitive === 'HOTS' ? 'C4 (Analisis)' : 'C3 (Aplikasi)',
      points: Number(newPoints) || (newType === 'esai' ? 5 : 2),
      rubric:
        newType === 'esai'
          ? [
              { criteria: 'Kesesuaian konsep materi pokok', maxPoints: Math.round(newPoints * 0.5) || 2 },
              { criteria: 'Kelengkapan penjelasan dan sistematika argumen', maxPoints: Math.round(newPoints * 0.5) || 2 },
            ]
          : undefined,
    };

    onUpdateExam({
      ...exam,
      questions: [...exam.questions, question],
      updatedAt: new Date().toISOString(),
    });

    // Reset form
    setIsAddingNew(false);
    setNewText('');
    setNewStimulus('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewExplanation('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Asset & Headline */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-blue-900">{exam.header.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>Kelas {exam.header.grade}</span>
              <span aria-hidden="true">·</span>
              <span>{exam.header.subject}</span>
              <span aria-hidden="true">·</span>
              <span>Semester {exam.header.semester} {exam.header.academicYear}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {exam.header.examType}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Naskah ujian siap cetak dan digital dengan sistem penilaian standar nasional. Dilengkapi pembobotan instrumen, bank soal otomatis berbasis AI, dan rubrik analitik.
            </p>

            {/* Quick Actions & Kop Setting Toggle */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowKopSettings(!showKopSettings)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showKopSettings ? 'Tutup Pengaturan Kop & Bobot' : 'Sesuaikan Kop Surat & Bobot'}</span>
                {showKopSettings ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button
                onClick={onOpenBank}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Buka Bank Soal & AI Generator</span>
              </button>

              <button
                onClick={() => {
                  import('../data/defaultBank').then(({ generateFull50ExamPackage }) => {
                    const full50 = generateFull50ExamPackage(exam.header.subject, exam.header.grade);
                    onUpdateExam({
                      ...exam,
                      questions: full50,
                      header: {
                        ...exam.header,
                        timeLimitMinutes: 120,
                        instructions: [
                          'Tulislah Nomor Peserta dan Nama Lengkap pada Lembar Jawaban Komputer (LJK) dengan pensil 2B.',
                          'Jumlah soal terdiri atas 40 Pilihan Ganda (PG) dan 10 Uraian (Esai).',
                          'Pilihlah salah satu jawaban yang paling tepat untuk soal Pilihan Ganda: A, B, C, atau D.',
                          'Jawablah soal Uraian dengan menuliskan langkah pengerjaan yang runut, rapi, dan sistematis.',
                          'Periksa kembali seluruh jawaban sebelum diserahkan kepada Pengawas Ujian.',
                        ],
                      },
                      updatedAt: new Date().toISOString(),
                    });
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <span>⚡ Terapkan Paket Lengkap 50 Soal</span>
              </button>

              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Soal Manual</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 h-48 lg:h-full bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 relative overflow-hidden">
            <img
              src="/src/assets/images/smp_exam_banner_1793121609297.jpg"
              alt="Ilustrasi Ujian Standar SMP"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback container
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Collapsible Kop & Scoring Settings */}
        {showKopSettings && (
          <div className="border-t border-slate-200 p-6 bg-slate-50/70 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identitas Sekolah & Standar Penilaian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan (Sekolah)
                </label>
                <input
                  type="text"
                  value={exam.header.schoolName}
                  onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dinas Pendidikan / Instansi Pembina
                </label>
                <input
                  type="text"
                  value={exam.header.agencyName}
                  onChange={(e) => handleHeaderChange('agencyName', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={exam.header.subject}
                  onChange={(e) => handleHeaderChange('subject', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                >
                  <option value="Matematika">Matematika</option>
                  <option value="IPA">IPA</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="IPS">IPS</option>
                  <option value="PPKn">PPKn</option>
                  <option value="Informatika">Informatika</option>
                  <option value="PAI-BP">PAI-BP</option>
                  <option value="Bimbingan Konseling (BK)">Bimbingan Konseling (BK)</option>
                  <option value="Seni Budaya">Seni Budaya</option>
                  <option value="Iqra / BTQ">Iqra / BTQ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenjang / Kelas
                </label>
                <select
                  value={exam.header.grade}
                  onChange={(e) => handleHeaderChange('grade', e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                >
                  <option value="VII">Kelas VII (Fase D)</option>
                  <option value="VIII">Kelas VIII (Fase D)</option>
                  <option value="IX">Kelas IX (Fase D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alokasi Waktu (Menit)
                </label>
                <input
                  type="number"
                  value={exam.header.timeLimitMinutes}
                  onChange={(e) => handleHeaderChange('timeLimitMinutes', Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas KKM / KKTP Standar Nasional
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={exam.header.kkm}
                  onChange={(e) => handleHeaderChange('kkm', Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Pilihan Ganda (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={exam.header.pgWeight}
                  onChange={(e) => {
                    const pg = Number(e.target.value);
                    handleHeaderChange('pgWeight', pg);
                    handleHeaderChange('essayWeight', 100 - pg);
                  }}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Soal Uraian / Esai (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={exam.header.essayWeight}
                  onChange={(e) => {
                    const es = Number(e.target.value);
                    handleHeaderChange('essayWeight', es);
                    handleHeaderChange('pgWeight', 100 - es);
                  }}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guru Penyusun & NIP
                </label>
                <input
                  type="text"
                  value={exam.header.teacherName}
                  onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900 mb-1"
                />
                <input
                  type="text"
                  value={exam.header.teacherNip}
                  onChange={(e) => handleHeaderChange('teacherNip', e.target.value)}
                  placeholder="NIP: 1980xxxx..."
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-blue-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics Row (Zero-Pill Tabular Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Butir Soal</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {totalQuestions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {pgQuestions.length} PG · {essayQuestions.length} Esai
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Batas KKM / KKTP</div>
          <div className="text-2xl font-bold text-blue-900 tabular-nums mt-1">
            {exam.header.kkm}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Standar Ketuntasan Minimal
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Bobot Penilaian</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {exam.header.pgWeight}% : {exam.header.essayWeight}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            PG {exam.header.pgWeight}% · Esai {exam.header.essayWeight}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Alokasi Waktu</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {exam.header.timeLimitMinutes} <span className="text-sm font-normal text-slate-500">menit</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ~{Math.round(exam.header.timeLimitMinutes / Math.max(1, totalQuestions))} mnt/butir
          </div>
        </div>
      </div>

      {/* Form Tambah Soal Manual (Jika aktif) */}
      {isAddingNew && (
        <form onSubmit={handleSaveNewQuestion} className="bg-white border border-blue-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Tambah Butir Soal Baru Secara Mandiri
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bentuk Soal
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as QuestionType)}
                className="w-full text-xs border border-slate-300 rounded p-2"
              >
                <option value="pg">Pilihan Ganda (4 Opsi A-D)</option>
                <option value="esai">Uraian / Esai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Level Kognitif
              </label>
              <select
                value={newCognitive}
                onChange={(e) => setNewCognitive(e.target.value as CognitiveLevel)}
                className="w-full text-xs border border-slate-300 rounded p-2"
              >
                <option value="LOTS">Level 1: LOTS (C1/C2)</option>
                <option value="MOTS">Level 2: MOTS (C3)</option>
                <option value="HOTS">Level 3: HOTS (C4/C5/C6)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bobot Poin Butir
              </label>
              <input
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Wacana / Teks Stimulus (Opsional)
            </label>
            <textarea
              value={newStimulus}
              onChange={(e) => setNewStimulus(e.target.value)}
              placeholder="Masukkan kutipan teks wacana, tabel, atau stimulus konteks..."
              rows={2}
              className="w-full text-xs border border-slate-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kalimat Soal / Pertanyaan *
            </label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Tuliskan butir pertanyaan secara jelas..."
              rows={3}
              required
              className="w-full text-xs border border-slate-300 rounded p-2"
            />
          </div>

          {newType === 'pg' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilihan Jawaban (A, B, C, D) & Tandai Kunci Benar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newCorrectAnswer === 'A'}
                    onChange={() => setNewCorrectAnswer('A')}
                    id="opt-a"
                  />
                  <label htmlFor="opt-a" className="text-xs font-bold w-4">A.</label>
                  <input
                    type="text"
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    placeholder="Teks Opsi A"
                    className="flex-1 text-xs border border-slate-300 rounded p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newCorrectAnswer === 'B'}
                    onChange={() => setNewCorrectAnswer('B')}
                    id="opt-b"
                  />
                  <label htmlFor="opt-b" className="text-xs font-bold w-4">B.</label>
                  <input
                    type="text"
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    placeholder="Teks Opsi B"
                    className="flex-1 text-xs border border-slate-300 rounded p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newCorrectAnswer === 'C'}
                    onChange={() => setNewCorrectAnswer('C')}
                    id="opt-c"
                  />
                  <label htmlFor="opt-c" className="text-xs font-bold w-4">C.</label>
                  <input
                    type="text"
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    placeholder="Teks Opsi C"
                    className="flex-1 text-xs border border-slate-300 rounded p-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newCorrectAnswer === 'D'}
                    onChange={() => setNewCorrectAnswer('D')}
                    id="opt-d"
                  />
                  <label htmlFor="opt-d" className="text-xs font-bold w-4">D.</label>
                  <input
                    type="text"
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    placeholder="Teks Opsi D"
                    className="flex-1 text-xs border border-slate-300 rounded p-2"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pembahasan / Pedoman Penskoran Kunci
            </label>
            <textarea
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              placeholder="Tuliskan kunci pembahasan atau kriteria penskoran..."
              rows={2}
              className="w-full text-xs border border-slate-300 rounded p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded hover:bg-blue-800 cursor-pointer shadow-sm"
            >
              Simpan ke Naskah
            </button>
          </div>
        </form>
      )}

      {/* Daftar Soal dalam Naskah */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Daftar Butir Soal Naskah Ujian
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{exam.questions.length} butir terdaftar</span>
              <span aria-hidden="true">·</span>
              <span>Bobot teralokasi: {totalPoints} poin total</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBank}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tambah dari Bank Soal / AI</span>
            </button>
          </div>
        </div>

        {exam.questions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-700">
              Belum Ada Soal di Naskah Ujian Ini
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Gunakan tombol "Tambah dari Bank Soal / AI" untuk memasukkan soal otomatis berkualitas tinggi atau buat sendiri secara manual.
            </p>
            <button
              onClick={onOpenBank}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors shadow-sm cursor-pointer"
            >
              Buka Bank Soal Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exam.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:border-slate-300 transition-colors space-y-3"
              >
                {/* Header butir soal with unboxed metadata */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">No. {idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-blue-900">
                      {q.type === 'pg' ? 'Pilihan Ganda' : 'Uraian / Esai'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700 font-medium">{q.cognitiveLevel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">{q.bloomCode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-600">{q.points} Poin</span>
                  </div>

                  {/* Actions (Reorder & Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      title="Pindahkan ke atas"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === exam.questions.length - 1}
                      title="Pindahkan ke bawah"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      title="Hapus butir soal"
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stimulus */}
                {q.stimulus && (
                  <div className="p-3 bg-amber-50/60 border-l-2 border-amber-500 rounded-r text-xs text-slate-700 italic">
                    <span className="font-semibold not-italic text-amber-900 block mb-1">
                      Wacana / Konteks:
                    </span>
                    {q.stimulus}
                  </div>
                )}

                {/* Question Text */}
                <p className="text-xs sm:text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                  {q.text}
                </p>

                {/* Options for PG */}
                {q.type === 'pg' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.label}
                        className={`p-2.5 rounded text-xs border ${
                          opt.label === q.correctAnswer
                            ? 'bg-emerald-50/70 border-emerald-300 font-medium text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{opt.label}.</span>
                        <span>{opt.text}</span>
                        {opt.label === q.correctAnswer && (
                          <span className="ml-1 text-[10px] text-emerald-700 font-bold">
                            ✓ (Kunci Jawaban)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Rubrik for Esai */}
                {q.type === 'esai' && q.rubric && q.rubric.length > 0 && (
                  <div className="p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-slate-700 space-y-1.5">
                    <span className="font-semibold text-blue-900 block">
                      Rubrik Penskoran Analitik Standar Nasional (Maks. {q.points} Poin):
                    </span>
                    {q.rubric.map((r, rIdx) => (
                      <div key={rIdx} className="flex justify-between items-center text-[11px]">
                        <span>• {r.criteria}</span>
                        <span className="font-mono tabular-nums text-slate-500">{r.maxPoints} poin</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pembahasan */}
                <div className="pt-1 text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                  <span className="font-semibold text-slate-800">Pembahasan & Dasar Penilaian: </span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
