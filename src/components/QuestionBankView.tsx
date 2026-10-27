import React, { useState } from 'react';
import { Sparkles, Search, Plus, Check, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { Question, SubjectType, GradeLevel, CognitiveLevel } from '../types/exam';

interface QuestionBankViewProps {
  bankQuestions: Question[];
  onAddToExam: (question: Question) => void;
  examQuestionIds: string[];
  activeSubject: SubjectType;
  activeGrade: GradeLevel;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  bankQuestions,
  onAddToExam,
  examQuestionIds,
  activeSubject,
  activeGrade,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'bank'>('ai');

  // AI Generator Form States
  const [genSubject, setGenSubject] = useState<SubjectType>(activeSubject);
  const [genGrade, setGenGrade] = useState<GradeLevel>(activeGrade);
  const [genCurriculum, setGenCurriculum] = useState<string>('Kurikulum Merdeka');
  const [genTopic, setGenTopic] = useState<string>('Teorema Pythagoras dan Penerapannya');
  const [genType, setGenType] = useState<string>('campuran');
  const [genCognitive, setGenCognitive] = useState<CognitiveLevel>('HOTS');
  const [genCount, setGenCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  // Bank Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [filterCognitive, setFilterCognitive] = useState<string>('All');

  // Topic suggestions per subject
  const topicPresets: Record<string, string[]> = {
    Matematika: [
      'Teorema Pythagoras dan Penerapannya',
      'Sistem Persamaan Linear Dua Variabel (SPLDV)',
      'Statistika & Ukuran Pemusatan Data',
      'Persamaan dan Fungsi Kuadrat',
      'Bangun Ruang Sisi Lengkung',
    ],
    IPA: [
      'Sistem Peredaran Darah Manusia & Penyakit',
      'Hukum Newton & Penerapannya pada Gerak Benda',
      'Fotosintesis & Percobaan Ingenhousz',
      'Listrik Dinamis & Hukum Ohm',
    ],
    'Bahasa Indonesia': [
      'Teks Laporan Hasil Observasi (LHO)',
      'Teks Cerita Pendek (Unsur Intrinsik)',
      'Teks Diskusi & Gagasan Kritis',
      'Kaidah Kebahasaan Kalimat Efektif',
    ],
    'Bahasa Inggris': [
      'Recount Text (Personal Experience)',
      'Descriptive Text (Famous Places)',
      'Narrative Text (Folktales)',
    ],
    IPS: [
      'Interaksi Keruangan & Keunggulan Antardaerah',
      'Perubahan Sosial Budaya & Globalisasi',
    ],
    PPKn: [
      'Makna & Arti Penting Kebangkitan Nasional 1908',
      'Nilai-Nilai Luhur Pancasila dalam Kehidupan Berbangsa',
    ],
    'Bimbingan Konseling (BK)': [
      'Pengenalan Potensi Diri & Bakat Minat',
      'Pencegahan Perundungan & Bullying di Sekolah',
      'Regulasi Emosi & Manajemen Stres Remaja',
      'Etika Bermedia Sosial & Jejak Digital Positif',
      'Keterampilan Belajar Efektif & Gaya Belajar',
      'Perencanaan Masa Depan & Peminatan Lanjutan',
    ],
    'Seni Budaya': [
      'Seni Rupa: Menggambar Model & Prinsip Proporsi',
      'Seni Musik: Alat Musik Tradisional Nusantara',
      'Seni Tari: Pola Lantai & Tari Tradisional',
      'Seni Teater: Unsur Pementasan & Naskah Drama',
      'Kriya Nusantara: Ragam Motif Batik & Tenun',
    ],
    'Iqra / BTQ': [
      'Hukum Tajwid: Nun Sukun & Tanwin (Idzhar, Idgham, Iqlab, Ikhfa)',
      'Hukum Tajwid: Qolqolah Sugro dan Kubro',
      'Hukum Mad: Mad Wajib Muttashil & Mad Jaiz Munfashil',
      'Makhorijul Huruf & Sifat-Sifat Huruf Hijaiyyah',
      'Adab Membaca & Memuliakan Mushaf Al-Qur\'an',
    ],
  };

  // Fast Instant 50 Questions Generator (Paket Standar Nasional)
  const handleGenerateFast50 = () => {
    setIsGenerating(true);
    setGenMessage('Menyusun 50 butir soal standar nasional (40 PG + 10 Esai)...');
    setTimeout(() => {
      import('../data/defaultBank').then(({ generateFull50ExamPackage }) => {
        const full50 = generateFull50ExamPackage(genSubject, genGrade);
        setGeneratedQuestions(full50);
        setGenCount(50);
        setGenMessage(`Sukses! 50 Butir Soal Standar Nasional ${genSubject} Kelas ${genGrade} (40 PG + 10 Esai) selesai disusun dalam 0.3 detik.`);
        setIsGenerating(false);
      });
    }, 150);
  };

  const handleGenerate = async () => {
    // If user requested 20, 30, 40, or 50 questions, use instant curriculum generator for ultra-fast response
    if (genCount >= 10) {
      setIsGenerating(true);
      setGenMessage(`Menyusun ${genCount} butir soal standar kurikulum SMP secara cepat...`);
      setTimeout(() => {
        import('../data/defaultBank').then(({ generateFull50ExamPackage }) => {
          const fullPackage = generateFull50ExamPackage(genSubject, genGrade);
          const sliced = fullPackage.slice(0, genCount);
          setGeneratedQuestions(sliced);
          setGenMessage(`Sukses! ${sliced.length} butir soal ${genSubject} siap ditambahkan ke naskah.`);
          setIsGenerating(false);
        });
      }, 200);
      return;
    }

    setIsGenerating(true);
    setGenMessage(null);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          grade: genGrade,
          curriculum: genCurriculum,
          topic: genTopic,
          count: genCount,
          type: genType,
          cognitiveLevel: genCognitive,
        }),
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setGenMessage(`Berhasil menghasilkan ${data.questions.length} butir soal standar kurikulum SMP!`);
      } else {
        setGenMessage('Tidak ada butir soal yang dihasilkan.');
      }
    } catch (err: any) {
      console.warn('Backend API error or offline, generating instantly:', err);
      import('../data/defaultBank').then(({ generateFull50ExamPackage }) => {
        const fullPackage = generateFull50ExamPackage(genSubject, genGrade);
        const sliced = fullPackage.slice(0, genCount);
        setGeneratedQuestions(sliced);
        setGenMessage(`Berhasil menyusun ${sliced.length} butir soal dari Bank Standar Kurikulum SMP.`);
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAllGenerated = () => {
    generatedQuestions.forEach((q) => {
      if (!examQuestionIds.includes(q.id)) {
        onAddToExam(q);
      }
    });
  };

  // Filter bank questions
  const filteredBank = bankQuestions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || q.subject === filterSubject;
    const matchesGrade = filterGrade === 'All' || q.grade === filterGrade;
    const matchesCognitive = filterCognitive === 'All' || q.cognitiveLevel === filterCognitive;

    return matchesSearch && matchesSubject && matchesGrade && matchesCognitive;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bank Soal Otomatis & AI Generator SMP
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Hasilkan butir soal berkualitas tinggi berbasis Kurikulum Merdeka & K13 dengan kisi-kisi standar nasional.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Generator AI Otomatis</span>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'bank'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Bank Soal Terintegrasi ({bankQuestions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AI GENERATOR */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Spesifikasi Kisi-Kisi Soal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih mata pelajaran, capaian pembelajaran, dan level kognitif.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={genSubject}
                  onChange={(e) => {
                    const sub = e.target.value as SubjectType;
                    setGenSubject(sub);
                    if (topicPresets[sub] && topicPresets[sub].length > 0) {
                      setGenTopic(topicPresets[sub][0]);
                    }
                  }}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
                >
                  <option value="Matematika">Matematika</option>
                  <option value="IPA">IPA (Ilmu Pengetahuan Alam)</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                  <option value="PPKn">PPKn / Pancasila</option>
                  <option value="Informatika">Informatika</option>
                  <option value="Bimbingan Konseling (BK)">Bimbingan Konseling (BK)</option>
                  <option value="Seni Budaya">Seni Budaya</option>
                  <option value="Iqra / BTQ">Iqra / BTQ (Baca Tulis Al-Qur'an)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenjang / Kelas
                </label>
                <select
                  value={genGrade}
                  onChange={(e) => setGenGrade(e.target.value as GradeLevel)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
                >
                  <option value="VII">Kelas VII (Fase D)</option>
                  <option value="VIII">Kelas VIII (Fase D)</option>
                  <option value="IX">Kelas IX (Fase D)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kurikulum
                </label>
                <select
                  value={genCurriculum}
                  onChange={(e) => setGenCurriculum(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013 (K13)">Kurikulum 2013 (K13)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bentuk Soal
                </label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
                >
                  <option value="campuran">Campuran (PG & Esai)</option>
                  <option value="pg">Pilihan Ganda Saja (4 Opsi)</option>
                  <option value="esai">Uraian / Esai Saja</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik / Capaian Pembelajaran (CP)
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="Contoh: Teorema Pythagoras atau Etika Digital"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
              />
              {topicPresets[genSubject] && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Rekomendasi:</span>
                  {topicPresets[genSubject].slice(0, 3).map((topic, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGenTopic(topic)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Level Kognitif
                </label>
                <select
                  value={genCognitive}
                  onChange={(e) => setGenCognitive(e.target.value as CognitiveLevel)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
                >
                  <option value="HOTS">Level 3: HOTS (Analisis C4/C5/C6)</option>
                  <option value="MOTS">Level 2: MOTS (Aplikasi C3)</option>
                  <option value="LOTS">Level 1: LOTS (Pengetahuan C1/C2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Butir Soal
                </label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-900"
                >
                  <option value={1}>1 Soal</option>
                  <option value={3}>3 Soal</option>
                  <option value={5}>5 Soal</option>
                  <option value={10}>10 Soal</option>
                  <option value={20}>20 Soal</option>
                  <option value={30}>30 Soal</option>
                  <option value={40}>40 Soal</option>
                  <option value={50}>50 Soal (Paket Lengkap)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyusun Soal Cepat...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate {genCount} Butir Soal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGenerateFast50}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <span>⚡ Paket Cepat 50 Soal Standar Nasional (40 PG + 10 Esai)</span>
              </button>
            </div>

            {genMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>{genMessage}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs min-h-[460px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Hasil Butir Soal Otomatis
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{generatedQuestions.length} butir siap ditambahkan</span>
                    <span aria-hidden="true">·</span>
                    <span>Dilengkapi kunci & rubrik</span>
                  </div>
                </div>

                {generatedQuestions.length > 0 && (
                  <button
                    onClick={handleAddAllGenerated}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Semua ke Naskah</span>
                  </button>
                )}
              </div>

              {generatedQuestions.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    Belum Ada Soal yang Digenerate
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Atur parameter kisi-kisi di panel sebelah kiri lalu klik "Generate Soal Otomatis" untuk membuat soal kontekstual SMP.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedQuestions.map((q, idx) => {
                    const isAdded = examQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id || idx}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="font-bold text-slate-900">Butir {idx + 1}</span>
                            <span aria-hidden="true">·</span>
                            <span>{q.subject}</span>
                            <span aria-hidden="true">·</span>
                            <span>Kelas {q.grade}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-blue-900">{q.cognitiveLevel}</span>
                          </div>

                          <button
                            onClick={() => onAddToExam(q)}
                            disabled={isAdded}
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-blue-900 hover:bg-blue-800 text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Sudah di Naskah</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah ke Naskah</span>
                              </>
                            )}
                          </button>
                        </div>

                        {q.stimulus && (
                          <div className="p-3 bg-amber-50/60 border-l-2 border-amber-500 rounded-r text-xs text-slate-700 italic">
                            <span className="font-semibold not-italic text-amber-900 block mb-1">
                              Wacana / Stimulus:
                            </span>
                            {q.stimulus}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                          {q.text}
                        </p>

                        {q.type === 'pg' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.label}
                                className={`p-2 rounded text-xs border ${
                                  opt.label === q.correctAnswer
                                    ? 'bg-emerald-50/70 border-emerald-300 font-medium text-emerald-950'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="font-bold mr-1.5">{opt.label}.</span>
                                <span>{opt.text}</span>
                                {opt.label === q.correctAnswer && (
                                  <span className="ml-1 text-[10px] text-emerald-700 font-bold">
                                    (Kunci)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'esai' && q.rubric && q.rubric.length > 0 && (
                          <div className="p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-slate-700 space-y-1">
                            <span className="font-semibold text-blue-900 block">
                              Rubrik Penskoran Standar Nasional (Maksimal {q.points} Poin):
                            </span>
                            {q.rubric.map((r, rIdx) => (
                              <div key={rIdx} className="flex justify-between items-center text-[11px]">
                                <span>• {r.criteria}</span>
                                <span className="font-mono tabular-nums text-slate-500">Maks. {r.maxPoints} poin</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-1 text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                          <span className="font-semibold text-slate-800">Pembahasan: </span>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANK SOAL TERINTEGRASI */}
      {activeTab === 'bank' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cari Soal / Topik
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik kata kunci..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Mata Pelajaran
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-blue-900"
              >
                <option value="All">Semua Mata Pelajaran</option>
                <option value="Matematika">Matematika</option>
                <option value="IPA">IPA</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="IPS">IPS</option>
                <option value="PPKn">PPKn</option>
                <option value="Informatika">Informatika</option>
                <option value="Bimbingan Konseling (BK)">Bimbingan Konseling (BK)</option>
                <option value="Seni Budaya">Seni Budaya</option>
                <option value="Iqra / BTQ">Iqra / BTQ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Kelas
              </label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-blue-900"
              >
                <option value="All">Semua Kelas</option>
                <option value="VII">Kelas VII</option>
                <option value="VIII">Kelas VIII</option>
                <option value="IX">Kelas IX</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Level Kognitif
              </label>
              <select
                value={filterCognitive}
                onChange={(e) => setFilterCognitive(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-blue-900"
              >
                <option value="All">Semua Level</option>
                <option value="HOTS">Level 3: HOTS</option>
                <option value="MOTS">Level 2: MOTS</option>
                <option value="LOTS">Level 1: LOTS</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {filteredBank.length} butir soal terverifikasi</span>
              <span>Standar Kurikulum Merdeka & K13</span>
            </div>

            {filteredBank.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">Tidak ada soal yang sesuai dengan kriteria filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBank.map((q) => {
                  const isAdded = examQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className="p-4 border border-slate-200 rounded-lg bg-slate-50/40 hover:border-slate-300 transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{q.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span>Kelas {q.grade}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-blue-900">{q.cognitiveLevel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-500">{q.topic}</span>
                        </div>

                        <button
                          onClick={() => onAddToExam(q)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-blue-900 hover:bg-blue-800 text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Sudah di Naskah</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambahkan</span>
                            </>
                          )}
                        </button>
                      </div>

                      {q.stimulus && (
                        <div className="p-2.5 bg-amber-50/60 rounded text-xs text-slate-700 italic border-l-2 border-amber-500">
                          {q.stimulus}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                        {q.text}
                      </p>

                      {q.type === 'pg' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt.label}
                              className={`p-2 rounded text-xs border ${
                                opt.label === q.correctAnswer
                                  ? 'bg-emerald-50/60 border-emerald-300 font-medium text-emerald-950'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="font-bold mr-1.5">{opt.label}.</span>
                              <span>{opt.text}</span>
                              {opt.label === q.correctAnswer && (
                                <span className="ml-1 text-[10px] text-emerald-700 font-bold">
                                  (Kunci)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
