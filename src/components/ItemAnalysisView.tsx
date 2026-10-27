import React from 'react';
import { ExamPaper, StudentScore, ItemAnalysisData } from '../types/exam';
import { calculateItemAnalysis } from '../utils/scoring';

interface ItemAnalysisViewProps {
  exam: ExamPaper;
  students: StudentScore[];
}

export const ItemAnalysisView: React.FC<ItemAnalysisViewProps> = ({
  exam,
  students,
}) => {
  const analysisData: ItemAnalysisData[] = calculateItemAnalysis(exam.questions, students);

  const acceptedCount = analysisData.filter((d) => d.recommendation === 'Diterima').length;
  const reviseCount = analysisData.filter((d) => d.recommendation === 'Revisi Pengecoh').length;
  const rejectCount = analysisData.filter((d) => d.recommendation === 'Revisi Total / Dibuang').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Analisis Kualitas Butir Soal (Item Analysis Standar Nasional)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluasi psikometrik reliabilitas butir soal mencakup Tingkat Kesukaran (P), Daya Pembeda (D), dan Fungsi Distraktor berdasarkan data respon {students.length} siswa.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Soal Diterima (Bagus)</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {acceptedCount} <span className="text-sm font-normal text-slate-500">butir</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Daya pembeda baik & tingkat kesukaran proporsional
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Perlu Revisi Pengecoh</div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums mt-1">
            {reviseCount} <span className="text-sm font-normal text-slate-500">butir</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Opsi pengecoh kurang berfungsi optimal
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Perlu Diganti / Ditolak</div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums mt-1">
            {rejectCount} <span className="text-sm font-normal text-slate-500">butir</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Terlalu mudah/sulit atau daya pembeda negatif
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Tabel Hasil Uji Butir Soal
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Metode Kelompok Ekstrem Atas-Bawah 27%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="py-2.5 px-3 font-semibold">No</th>
                <th className="py-2.5 px-3 font-semibold">Bentuk</th>
                <th className="py-2.5 px-3 font-semibold">Kunci</th>
                <th className="py-2.5 px-3 font-semibold text-center">Tingkat Kesukaran (P)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kategori P</th>
                <th className="py-2.5 px-3 font-semibold text-center">Daya Pembeda (D)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kategori D</th>
                <th className="py-2.5 px-3 font-semibold text-center">Sebaran Opsi (A/B/C/D)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysisData.map((item) => (
                <tr key={item.questionId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                    {item.questionNumber}
                  </td>
                  <td className="py-3 px-3 uppercase text-slate-600 font-medium">
                    {item.type}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-900">
                    {item.type === 'pg' ? item.correctAnswer : 'Rubrik'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold tabular-nums text-slate-800">
                    {item.difficultyIndex}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-medium ${
                        item.difficultyCategory === 'Sedang'
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.difficultyCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold tabular-nums text-slate-800">
                    {item.discriminationIndex}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-medium ${
                        item.discriminationCategory === 'Sangat Baik' || item.discriminationCategory === 'Baik'
                          ? 'text-emerald-700'
                          : item.discriminationCategory === 'Cukup'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {item.discriminationCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                    {item.type === 'pg' ? (
                      <span>
                        {item.distractorAnalysis.A}% / {item.distractorAnalysis.B}% / {item.distractorAnalysis.C}% / {item.distractorAnalysis.D}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block font-semibold text-[11px] ${
                        item.recommendation === 'Diterima'
                          ? 'text-emerald-700'
                          : item.recommendation === 'Revisi Pengecoh'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {item.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Kriteria Acuan Interpretasi Analisis Butir Soal (Puspendik Kemdikbud):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Tingkat Kesukaran (P):</span>
            <p>• P &gt; 0,70 : Soal Terlalu Mudah (kurang merangsang daya pikir siswa)</p>
            <p>• 0,30 ≤ P ≤ 0,70 : Soal Sedang (Ideal untuk asesmen standar)</p>
            <p>• P &lt; 0,30 : Soal Terlalu Sukar (mungkin terjadi miskonsepsi)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900 block">Daya Pembeda (D):</span>
            <p>• D ≥ 0,40 : Sangat Baik (Mampu membedakan kelompok tinggi & rendah)</p>
            <p>• 0,30 ≤ D &lt; 0,40 : Baik (Dapat langsung digunakan)</p>
            <p>• 0,20 ≤ D &lt; 0,30 : Cukup (Perlu perbaikan redaksi atau pengecoh)</p>
            <p>• D &lt; 0,20 : Buruk (Harus dibuang atau direvisi menyeluruh)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
