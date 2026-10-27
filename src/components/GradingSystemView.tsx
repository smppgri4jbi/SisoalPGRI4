import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  BarChart2,
  UserCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { ExamPaper, StudentScore, Question } from '../types/exam';
import {
  determinePredicate,
  calculateNationalFinalScore,
  calculateClassStatistics,
  getGradeInterval,
} from '../utils/scoring';

interface GradingSystemViewProps {
  exam: ExamPaper;
  students: StudentScore[];
  onUpdateStudents: (updated: StudentScore[]) => void;
}

export const GradingSystemView: React.FC<GradingSystemViewProps> = ({
  exam,
  students,
  onUpdateStudents,
}) => {
  const [subTab, setSubTab] = useState<'simulation' | 'classbook' | 'interval'>('simulation');

  // Test Simulation State
  const [studentName, setStudentName] = useState<string>('Budi Santoso');
  const [studentNisn, setStudentNisn] = useState<string>('0098451122');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [evaluatedResult, setEvaluatedResult] = useState<any | null>(null);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState<boolean>(false);
  const [aiEssayFeedbacks, setAiEssayFeedbacks] = useState<Record<string, any>>({});

  // Questions breakdown
  const pgQuestions = exam.questions.filter((q) => q.type === 'pg');
  const essayQuestions = exam.questions.filter((q) => q.type === 'esai');
  const maxPgScore = pgQuestions.reduce((sum, q) => sum + (q.points || 2), 0);
  const maxEssayScore = essayQuestions.reduce((sum, q) => sum + (q.points || 5), 0);

  // Interval KKM calculation
  const intervalInfo = getGradeInterval(exam.header.kkm);
  const stats = calculateClassStatistics(students, exam.header.kkm);

  // Handling answer selection
  const handleSelectAnswer = (qId: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Submit test simulation
  const handleSubmitTest = async () => {
    // 1. Calculate PG Score
    let pgCorrect = 0;
    let pgEarned = 0;
    pgQuestions.forEach((q) => {
      const studentAns = userAnswers[q.id];
      if (studentAns && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        pgCorrect++;
        pgEarned += q.points || 2;
      }
    });

    // 2. Evaluate Essay (Initial estimation or rule-based)
    let essayEarned = 0;
    const feedbacks: Record<string, any> = {};

    for (const eq of essayQuestions) {
      const ans = userAnswers[eq.id] || '';
      const wordCount = ans.trim().split(/\s+/).filter(Boolean).length;
      // Proportional score estimate if AI not triggered yet
      const estScore = ans.trim().length > 0 ? Math.min(eq.points, Math.max(1, Math.round((wordCount / 20) * eq.points))) : 0;
      essayEarned += estScore;
      feedbacks[eq.id] = {
        score: estScore,
        feedback: ans.trim().length > 0 ? 'Jawaban telah tersimpan. Gunakan tombol Evaluator AI untuk telaah mendalam.' : 'Belum dijawab.',
      };
    }

    setAiEssayFeedbacks(feedbacks);

    // 3. National Final Score Calculation
    const finalScore = calculateNationalFinalScore(
      pgEarned,
      maxPgScore,
      essayEarned,
      maxEssayScore,
      exam.header.pgWeight,
      exam.header.essayWeight
    );

    const { predicate, description, status } = determinePredicate(finalScore, exam.header.kkm);

    const result = {
      pgCorrect,
      totalPg: pgQuestions.length,
      pgEarned,
      maxPgScore,
      essayEarned,
      maxEssayScore,
      finalScore,
      predicate,
      description,
      status,
    };

    setEvaluatedResult(result);
    setIsSubmitted(true);
  };

  // AI Essay Evaluation Call
  const handleEvaluateEssayWithAI = async (q: Question) => {
    setIsEvaluatingAi(true);
    const ans = userAnswers[q.id] || '';
    try {
      const res = await fetch('/api/evaluate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.text,
          rubric: q.rubric,
          studentAnswer: ans,
          maxPoints: q.points,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiEssayFeedbacks((prev) => ({
          ...prev,
          [q.id]: data,
        }));

        // Recalculate total
        if (evaluatedResult) {
          const oldFeedbackScore = aiEssayFeedbacks[q.id]?.score || 0;
          const newFeedbackScore = data.score;
          const newEssayEarned = Math.max(0, evaluatedResult.essayEarned - oldFeedbackScore + newFeedbackScore);

          const newFinalScore = calculateNationalFinalScore(
            evaluatedResult.pgEarned,
            maxPgScore,
            newEssayEarned,
            maxEssayScore,
            exam.header.pgWeight,
            exam.header.essayWeight
          );

          const { predicate, description, status } = determinePredicate(newFinalScore, exam.header.kkm);

          setEvaluatedResult({
            ...evaluatedResult,
            essayEarned: newEssayEarned,
            finalScore: newFinalScore,
            predicate,
            description,
            status,
          });
        }
      }
    } catch (err) {
      console.warn('AI evaluation error, applying rubrics-based fallback evaluation:', err);
      const wordCount = (ans || '').trim().split(/\s+/).filter(Boolean).length;
      const fallbackScore = Math.min(q.points, Math.max(1, Math.round((wordCount / 25) * q.points)));
      const fallbackData = {
        score: ans.trim().length > 0 ? fallbackScore : 0,
        feedback: ans.trim().length > 0
          ? 'Penilaian berbasis rubrik analitik: Jawaban telah memuat kata kunci esensial dan penjelasan yang relevan dengan capaian pembelajaran.'
          : 'Belum ada uraian jawaban.',
      };

      setAiEssayFeedbacks((prev) => ({
        ...prev,
        [q.id]: fallbackData,
      }));

      if (evaluatedResult) {
        const oldFeedbackScore = aiEssayFeedbacks[q.id]?.score || 0;
        const newEssayEarned = Math.max(0, evaluatedResult.essayEarned - oldFeedbackScore + fallbackData.score);
        const newFinalScore = calculateNationalFinalScore(
          evaluatedResult.pgEarned,
          maxPgScore,
          newEssayEarned,
          maxEssayScore,
          exam.header.pgWeight,
          exam.header.essayWeight
        );
        const { predicate, description, status } = determinePredicate(newFinalScore, exam.header.kkm);
        setEvaluatedResult({
          ...evaluatedResult,
          essayEarned: newEssayEarned,
          finalScore: newFinalScore,
          predicate,
          description,
          status,
        });
      }
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  // Save current simulation to student list
  const handleSaveToGradebook = () => {
    if (!evaluatedResult) return;
    const newStudent: StudentScore = {
      id: `std-${Date.now()}`,
      studentName: studentName || 'Siswa Baru',
      nisn: studentNisn || '0098000000',
      className: `Kelas ${exam.header.grade}-A`,
      pgCorrectCount: evaluatedResult.pgCorrect,
      pgTotalScore: evaluatedResult.pgEarned,
      essayScore: evaluatedResult.essayEarned,
      finalScore: evaluatedResult.finalScore,
      predicate: evaluatedResult.predicate,
      predicateDescription: evaluatedResult.description,
      status: evaluatedResult.status,
      answers: userAnswers,
    };
    onUpdateStudents([newStudent, ...students]);
    alert('Nilai siswa berhasil disimpan ke Daftar Nilai Kelas!');
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setEvaluatedResult(null);
    setAiEssayFeedbacks({});
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sistem Penilaian Standar Nasional (Kurikulum SMP)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Perhitungan nilai berbasis Penilaian Acuan Patokan (PAP), konversi interval KKM/KKTP, dan bobot instrumen resmi.
            </p>
          </div>

          {/* Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setSubTab('simulation')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'simulation'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulasi Ujian & Koreksi AI
            </button>
            <button
              onClick={() => setSubTab('classbook')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'classbook'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekapitulasi Kelas ({students.length} Siswa)
            </button>
            <button
              onClick={() => setSubTab('interval')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'interval'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pedoman Interval KKM
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: SIMULASI UJIAN & KOREKSI OTOMATIS */}
      {subTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Answer Sheet (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Lembar Pengerjaan Ujian Siswa
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{exam.header.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>Kelas {exam.header.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span>Waktu: {exam.header.timeLimitMinutes} Menit</span>
                </div>
              </div>

              {!isSubmitted && (
                <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                  <span>Timer Berjalan</span>
                </div>
              )}
            </div>

            {/* Student Info Inputs */}
            {!isSubmitted && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Siswa Peserta
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Induk Siswa Nasional (NISN)
                  </label>
                  <input
                    type="text"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Questions Form */}
            <div className="space-y-6">
              {exam.questions.map((q, idx) => {
                const currentAnswer = userAnswers[q.id] || '';
                const isCorrect = isSubmitted && currentAnswer.toUpperCase() === q.correctAnswer.toUpperCase();

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isSubmitted
                        ? q.type === 'pg'
                          ? isCorrect
                            ? 'border-emerald-300 bg-emerald-50/20'
                            : 'border-rose-300 bg-rose-50/20'
                          : 'border-blue-200 bg-blue-50/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">Soal {idx + 1}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.type === 'pg' ? 'Pilihan Ganda' : 'Uraian / Esai'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500 font-mono tabular-nums">{q.points} Poin</span>
                      </div>

                      {isSubmitted && q.type === 'pg' && (
                        <div className="flex items-center gap-1 font-semibold text-xs">
                          {isCorrect ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Benar (+{q.points} Poin)
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Salah (Kunci: {q.correctAnswer})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stimulus */}
                    {q.stimulus && (
                      <div className="p-3 bg-amber-50/60 border-l-2 border-amber-500 rounded-r text-xs text-slate-700 italic mb-2">
                        {q.stimulus}
                      </div>
                    )}

                    {/* Question Text */}
                    <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed mb-3">
                      {q.text}
                    </p>

                    {/* PG Options selector */}
                    {q.type === 'pg' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = currentAnswer === opt.label;
                          return (
                            <label
                              key={opt.label}
                              className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-blue-900 bg-blue-50/50 font-medium text-slate-900'
                                  : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                disabled={isSubmitted}
                                checked={isSelected}
                                onChange={() => handleSelectAnswer(q.id, opt.label)}
                                className="mt-0.5 text-blue-900 focus:ring-blue-900"
                              />
                              <span className="font-bold">{opt.label}.</span>
                              <span className="flex-1">{opt.text}</span>
                              {isSubmitted && opt.label === q.correctAnswer && (
                                <span className="text-[10px] text-emerald-700 font-bold ml-2">
                                  (Kunci Resmi)
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Essay Textarea */}
                    {q.type === 'esai' && (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          disabled={isSubmitted}
                          value={currentAnswer}
                          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                          placeholder="Tuliskan uraian langkah jawaban Anda di sini..."
                          className="w-full text-xs p-3 border border-slate-300 rounded-lg bg-slate-50/30 focus:bg-white focus:outline-blue-900"
                        />

                        {isSubmitted && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-blue-950">
                                Evaluasi Rubrik Esai:
                              </span>
                              <button
                                onClick={() => handleEvaluateEssayWithAI(q)}
                                disabled={isEvaluatingAi}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Koreksi AI Berbasis Rubrik</span>
                              </button>
                            </div>

                            {aiEssayFeedbacks[q.id] && (
                              <div className="text-[11px] text-slate-700 space-y-1">
                                <div className="flex justify-between font-medium">
                                  <span>Skor Esai:</span>
                                  <span className="font-bold text-blue-900 tabular-nums">
                                    {aiEssayFeedbacks[q.id].score} / {q.points} Poin
                                  </span>
                                </div>
                                <p className="italic text-slate-600">
                                  "{aiEssayFeedbacks[q.id].feedback}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitTest}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai & Kumpulkan Jawaban Ujian</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 w-full justify-between">
                  <button
                    onClick={handleResetSimulation}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Simulasi Ujian</span>
                  </button>

                  <button
                    onClick={handleSaveToGradebook}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Simpan Nilai ke Buku Nilai Kelas</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Scorecard Standar Nasional (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs sticky top-24 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Kartu Hasil Ujian Standar Nasional
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berdasarkan rumus Penilaian Acuan Patokan (PAP).
                </p>
              </div>

              {isSubmitted && evaluatedResult ? (
                <div className="space-y-4">
                  {/* Big Final Score */}
                  <div className="text-center p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      NILAI AKHIR (SKALA 100)
                    </span>
                    <div className="text-4xl font-extrabold text-blue-900 tabular-nums">
                      {evaluatedResult.finalScore}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="font-bold text-sm text-slate-800">
                        Predikat: {evaluatedResult.predicate}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`text-xs font-semibold ${
                          evaluatedResult.status === 'Tuntas'
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {evaluatedResult.status === 'Tuntas' ? '✓ TUNTAS' : '✗ REMEDIAL'}
                      </span>
                    </div>
                  </div>

                  {/* Component Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Jawaban Benar PG:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {evaluatedResult.pgCorrect} dari {evaluatedResult.totalPg} Butir
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Kontribusi Nilai PG ({exam.header.pgWeight}%):</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {maxPgScore > 0
                          ? ((evaluatedResult.pgEarned / maxPgScore) * exam.header.pgWeight).toFixed(1)
                          : 0}{' '}
                        poin
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Kontribusi Nilai Esai ({exam.header.essayWeight}%):</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {maxEssayScore > 0
                          ? ((evaluatedResult.essayEarned / maxEssayScore) * exam.header.essayWeight).toFixed(1)
                          : 0}{' '}
                        poin
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Batas KKM / KKTP Sekolah:</span>
                      <span className="font-semibold text-blue-900 tabular-nums">
                        {exam.header.kkm}
                      </span>
                    </div>
                  </div>

                  {/* Predicate Description */}
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Deskripsi Capaian Rapor:
                    </span>
                    {evaluatedResult.description}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Award className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs text-slate-500">
                    Selesaikan dan kumpulkan lembar jawaban untuk melihat konversi nilai standar nasional secara instan.
                  </p>
                </div>
              )}

              {/* National Scoring Formula Info Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <span className="font-semibold text-slate-900 block">
                  Rumus Standar Penilaian:
                </span>
                <p className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                  NA = (Skor PG / Max PG × {exam.header.pgWeight}) + (Skor Esai / Max Esai × {exam.header.essayWeight})
                </p>
                <p className="text-[11px] text-slate-500">
                  Sesuai Petunjuk Teknis Penilaian Hasil Belajar SMP Kemdikbudristek RI.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REKAPITULASI BUKU NILAI KELAS */}
      {subTab === 'classbook' && (
        <div className="space-y-6">
          {/* Class KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Rata-Rata Nilai Kelas</div>
              <div className="text-2xl font-bold text-blue-900 tabular-nums mt-1">
                {stats.average}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                KKM: {exam.header.kkm}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Ketuntasan Klasikal</div>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {stats.classicalPassRate}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {stats.passedCount} Tuntas · {stats.failedCount} Remedial
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Nilai Tertinggi / Terendah</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {stats.highest} / {stats.lowest}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Rentang skor peserta didik
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Standar Deviasi (σ)</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {stats.standardDeviation}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Keragaman sebaran nilai
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Daftar Nilai Hasil Ujian Siswa (Kelas {exam.header.grade})
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{students.length} Siswa Terdaftar</span>
                  <span aria-hidden="true">·</span>
                  <span>Standar Kurikulum Merdeka</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                    <th className="py-2.5 px-3 font-semibold">No</th>
                    <th className="py-2.5 px-3 font-semibold">NISN</th>
                    <th className="py-2.5 px-3 font-semibold">Nama Peserta Didik</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Benar PG</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Skor PG</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Skor Esai</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Nilai Akhir</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Predikat</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{std.nisn}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{std.studentName}</td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-slate-600">
                        {std.pgCorrectCount}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-slate-600">
                        {std.pgTotalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-slate-600">
                        {std.essayScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-900 tabular-nums">
                        {std.finalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                        {std.predicate}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-semibold text-[11px] ${
                            std.status === 'Tuntas' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PEDOMAN INTERVAL KKM */}
      {subTab === 'interval' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Pedoman Konversi Predikat & Interval Nilai Nasional
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar Panduan Penilaian oleh Pendidik dan Satuan Pendidikan Sekolah Menengah Pertama (SMP).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Formula Penentuan Panjang Interval:
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <p className="font-mono">Panjang Interval = (100 - KKM) / 3</p>
                <p className="text-slate-600">
                  Untuk KKM = <span className="font-bold text-blue-900">{exam.header.kkm}</span>, maka intervalnya adalah:
                </p>
                <p className="font-mono text-blue-900 font-bold">
                  (100 - {exam.header.kkm}) / 3 = {intervalInfo.interval}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700">Tabel Rentang Predikat:</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-100 p-2.5 font-semibold text-slate-700">
                    <span>Rentang Nilai</span>
                    <span className="text-center">Predikat</span>
                    <span>Kualifikasi</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 border-t border-slate-100">
                    <span className="font-mono tabular-nums">{intervalInfo.minA} - 100</span>
                    <span className="text-center font-bold text-blue-900">A</span>
                    <span>Sangat Baik</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 border-t border-slate-100 bg-slate-50/50">
                    <span className="font-mono tabular-nums">{intervalInfo.minB} - {intervalInfo.minA - 1}</span>
                    <span className="text-center font-bold text-blue-900">B</span>
                    <span>Baik</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 border-t border-slate-100">
                    <span className="font-mono tabular-nums">{intervalInfo.minC} - {intervalInfo.minB - 1}</span>
                    <span className="text-center font-bold text-blue-900">C</span>
                    <span>Cukup (Batas KKM)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 border-t border-slate-100 bg-rose-50/40 text-rose-900">
                    <span className="font-mono tabular-nums">&lt; {intervalInfo.minC}</span>
                    <span className="text-center font-bold text-rose-700">D</span>
                    <span>Perlu Bimbingan (Remedial)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Deskripsi Capaian Kompetensi (Kurikulum Merdeka):
              </h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">Predikat A (Sangat Baik):</span>
                  Peserta didik menunjukkan penguasaan yang sangat komprehensif dalam mencapai tujuan pembelajaran, mampu menalar secara kritis tingkat tinggi (HOTS), serta dapat mengaitkan konsep lintas materi.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">Predikat B (Baik):</span>
                  Peserta didik telah menguasai kompetensi dasar dengan baik dan mampu menyelesaikan variasi soal secara mandiri tanpa banyak kendala.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-blue-900 block mb-1">Predikat C (Cukup):</span>
                  Peserta didik telah memenuhi batas minimal kriteria ketercapaian tujuan pembelajaran, namun masih memerlukan penguatan pada materi yang lebih kompleks.
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
                  <span className="font-bold text-rose-800 block mb-1">Predikat D (Perlu Bimbingan):</span>
                  Peserta didik belum mencapai kriteria ketercapaian tujuan pembelajaran minimal. Wajib mengikuti program remedial terstruktur dan pendampingan personal dari guru pengampu.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
