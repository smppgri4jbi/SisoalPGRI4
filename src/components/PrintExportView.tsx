import React, { useState } from 'react';
import { Printer, Download, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { ExamPaper } from '../types/exam';
import { exportExamToPDF, exportExamToDOCX } from '../utils/exportDocs';

interface PrintExportViewProps {
  exam: ExamPaper;
}

export const PrintExportView: React.FC<PrintExportViewProps> = ({ exam }) => {
  const [printMode, setPrintMode] = useState<'paper' | 'ljk' | 'kisikisi' | 'kunci'>('paper');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  const pgQuestions = exam.questions.filter((q) => q.type === 'pg');
  const essayQuestions = exam.questions.filter((q) => q.type === 'esai');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsExportingPdf(true);
    try {
      exportExamToPDF(exam, printMode === 'kisikisi' ? 'paper' : printMode);
    } catch (err) {
      console.error('Error generating PDF with jsPDF:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDOCX = async () => {
    setIsExportingDocx(true);
    try {
      await exportExamToDOCX(exam);
    } catch (err) {
      console.error('Error generating DOCX with docx library:', err);
      alert('Terjadi kendala saat menghasilkan dokumen DOCX. Anda dapat menggunakan tombol Unduh PDF.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden on print) */}
      <div className="print:hidden bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cetak Naskah & Ekspor Dokumen Resmi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unduh naskah soal lengkap dalam format PDF (jsPDF) atau Word DOCX (docx) siap cetak dan edit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setPrintMode('paper')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                printMode === 'paper' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Naskah Soal
            </button>
            <button
              onClick={() => setPrintMode('ljk')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                printMode === 'ljk' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lembar Jawaban (LJK)
            </button>
            <button
              onClick={() => setPrintMode('kisikisi')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                printMode === 'kisikisi' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kisi-Kisi Ujian
            </button>
            <button
              onClick={() => setPrintMode('kunci')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                printMode === 'kunci' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kunci & Rubrik
            </button>
          </div>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Menyusun...' : 'Unduh PDF'}</span>
          </button>

          {/* Download DOCX button */}
          <button
            onClick={handleDownloadDOCX}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingDocx ? 'Membuat Word...' : 'Unduh Word (.docx)'}</span>
          </button>

          {/* Native Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Langsung</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE CONTAINER (A4 Sheet layout) */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-900">
        {/* KOP SURAT RESMI STANDAR NASIONAL */}
        <div className="border-b-[3px] border-double border-slate-900 pb-3 text-center mb-6">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-800">
            {exam.header.agencyName}
          </div>
          <div className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-slate-950 mt-0.5">
            {exam.header.schoolName}
          </div>
          <div className="text-xs text-slate-600 italic mt-0.5">
            Jalan Pendidikan Nasional No. 45 · Telp. (021) 7891234 · Akreditasi A (Unggul)
          </div>
          <div className="mt-2 pt-2 border-t border-slate-400 font-bold text-sm sm:text-base uppercase tracking-wider text-slate-900">
            {exam.header.examType} TAHUN AJARAN {exam.header.academicYear}
          </div>
        </div>

        {/* IDENTITAS SOAL TABLE */}
        <div className="grid grid-cols-2 text-xs border border-slate-400 mb-6 divide-x divide-slate-400">
          <div className="p-2.5 space-y-1">
            <div className="flex">
              <span className="w-28 font-semibold">Mata Pelajaran</span>
              <span>: {exam.header.subject}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Kelas / Semester</span>
              <span>: {exam.header.grade} / {exam.header.semester}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Kurikulum</span>
              <span>: Kurikulum Merdeka</span>
            </div>
          </div>
          <div className="p-2.5 space-y-1">
            <div className="flex">
              <span className="w-28 font-semibold">Hari / Tanggal</span>
              <span>: Sesuai Jadwal Asesmen</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Alokasi Waktu</span>
              <span>: {exam.header.timeLimitMinutes} Menit</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold">Batas KKM/KKTP</span>
              <span>: {exam.header.kkm} (Skala 100)</span>
            </div>
          </div>
        </div>

        {/* MODE 1: NASKAH SOAL */}
        {printMode === 'paper' && (
          <div className="space-y-6">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded text-[11px] leading-relaxed">
              <div className="font-bold uppercase tracking-wider text-slate-800 mb-1">
                Petunjuk Umum:
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                {exam.header.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>
            </div>

            {pgQuestions.length > 0 && (
              <div className="space-y-5">
                <div className="border-b border-slate-400 pb-1 font-bold text-xs uppercase tracking-wider text-slate-900">
                  I. Pilihlah salah satu jawaban yang paling tepat dengan memberi tanda silang (X) pada huruf A, B, C, atau D pada lembar jawaban!
                </div>

                <div className="space-y-5">
                  {pgQuestions.map((q, idx) => (
                    <div key={q.id} className="text-xs space-y-2 leading-relaxed">
                      <div className="flex gap-2">
                        <span className="font-bold shrink-0">{idx + 1}.</span>
                        <div className="space-y-1.5 flex-1">
                          {q.stimulus && (
                            <p className="italic text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                              {q.stimulus}
                            </p>
                          )}
                          <p className="font-medium text-slate-900">{q.text}</p>
                        </div>
                      </div>

                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-6">
                          {q.options.map((opt) => (
                            <div key={opt.label} className="flex gap-2">
                              <span className="font-bold">{opt.label}.</span>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {essayQuestions.length > 0 && (
              <div className="space-y-5 pt-4">
                <div className="border-b border-slate-400 pb-1 font-bold text-xs uppercase tracking-wider text-slate-900">
                  II. Jawablah pertanyaan-pertanyaan berikut dengan uraian yang jelas, lengkap, dan sistematis!
                </div>

                <div className="space-y-5">
                  {essayQuestions.map((q, idx) => (
                    <div key={q.id} className="text-xs space-y-2 leading-relaxed">
                      <div className="flex gap-2">
                        <span className="font-bold shrink-0">{pgQuestions.length + idx + 1}.</span>
                        <div className="space-y-1.5 flex-1">
                          {q.stimulus && (
                            <p className="italic text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                              {q.stimulus}
                            </p>
                          )}
                          <p className="font-medium text-slate-900 whitespace-pre-line">{q.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: LEMBAR JAWABAN KOMPUTER (LJK) & SISWA */}
        {printMode === 'ljk' && (
          <div className="space-y-6">
            <div className="text-center font-bold text-sm uppercase tracking-wider border-b border-slate-400 pb-2">
              LEMBAR JAWABAN PESERTA ASESMEN STANDAR (LJK-SMP)
            </div>

            <div className="border border-slate-400 p-4 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">Nama Peserta :</span>
                  <div className="border-b border-dotted border-slate-600 flex-1 h-5"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">Nomor Ujian :</span>
                  <div className="border-b border-dotted border-slate-600 flex-1 h-5"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-semibold">Kelas / Ruang :</span>
                  <div className="border-b border-dotted border-slate-600 flex-1 h-5"></div>
                </div>
              </div>
              <div className="border border-slate-300 p-2 text-center flex flex-col justify-between">
                <span className="font-bold text-[11px]">TANDA TANGAN PESERTA</span>
                <div className="h-10"></div>
                <div className="border-t border-slate-400 text-[10px] text-slate-500">
                  (Nama Terang & Tanda Tangan)
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-xs uppercase mb-3">
                Jawaban Soal Pilihan Ganda:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {pgQuestions.map((q, idx) => (
                  <div key={q.id} className="flex items-center gap-2 p-1.5 border border-slate-200 rounded">
                    <span className="font-bold w-6 text-right tabular-nums">{idx + 1}.</span>
                    <div className="flex gap-1.5 font-bold">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div
                          key={opt}
                          className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-[10px]"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {essayQuestions.length > 0 && (
              <div className="pt-4 space-y-4">
                <div className="font-bold text-xs uppercase">
                  Jawaban Soal Uraian / Esai:
                </div>
                {essayQuestions.map((eq, i) => (
                  <div key={eq.id} className="border border-slate-300 rounded p-3 text-xs space-y-2">
                    <div className="font-semibold text-slate-800">
                      Nomor {pgQuestions.length + i + 1}:
                    </div>
                    <div className="h-28 border-b border-dotted border-slate-300"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 3: KISI-KISI SOAL UJIAN */}
        {printMode === 'kisikisi' && (
          <div className="space-y-4">
            <div className="text-center font-bold text-sm uppercase tracking-wider border-b border-slate-400 pb-2">
              FORMAT KISI-KISI PENULISAN SOAL ASESMEN SMP
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-400">
                    <th className="p-2 border-r border-slate-400 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-400">Capaian Pembelajaran / Materi</th>
                    <th className="p-2 border-r border-slate-400">Indikator Soal</th>
                    <th className="p-2 border-r border-slate-400 text-center">Level</th>
                    <th className="p-2 border-r border-slate-400 text-center">Bentuk</th>
                    <th className="p-2 text-center w-16">No Soal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {exam.questions.map((q, idx) => (
                    <tr key={q.id}>
                      <td className="p-2 border-r border-slate-300 text-center font-bold tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-300">
                        <span className="font-bold block text-slate-900">{q.topic}</span>
                        <span className="text-[11px] text-slate-600">{q.competency || 'Kompetensi Inti Fase D'}</span>
                      </td>
                      <td className="p-2 border-r border-slate-300 text-[11px]">
                        Disajikan masalah kontekstual, peserta didik mampu menyelesaikan solusi secara tepat.
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center font-semibold text-blue-900">
                        {q.cognitiveLevel} ({q.bloomCode})
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center uppercase font-medium">
                        {q.type}
                      </td>
                      <td className="p-2 text-center font-bold tabular-nums">
                        {idx + 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODE 4: KUNCI JAWABAN & PEDOMAN PENSKORAN */}
        {printMode === 'kunci' && (
          <div className="space-y-5">
            <div className="text-center font-bold text-sm uppercase tracking-wider border-b border-slate-400 pb-2">
              KUNCI JAWABAN & PEDOMAN PENSKORAN RESMI
            </div>

            {pgQuestions.length > 0 && (
              <div>
                <div className="font-bold text-xs uppercase mb-2">
                  A. Kunci Jawaban Soal Pilihan Ganda (Bobot: {exam.header.pgWeight}%):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {pgQuestions.map((q, idx) => (
                    <div key={q.id} className="p-2 border border-slate-300 rounded flex justify-between items-center">
                      <span className="font-bold text-slate-700">No. {idx + 1}</span>
                      <span className="font-bold font-mono text-base text-blue-900">
                        {q.correctAnswer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {essayQuestions.length > 0 && (
              <div className="pt-3 space-y-4">
                <div className="font-bold text-xs uppercase">
                  B. Pedoman Penskoran Soal Uraian / Esai (Bobot: {exam.header.essayWeight}%):
                </div>
                {essayQuestions.map((eq, i) => (
                  <div key={eq.id} className="border border-slate-300 rounded p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center font-semibold text-slate-900">
                      <span>Nomor {pgQuestions.length + i + 1} ({eq.topic})</span>
                      <span className="font-mono tabular-nums">Skor Maksimal: {eq.points}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="font-bold block text-slate-800">Kunci Jawaban Uraian:</span>
                      <p className="whitespace-pre-line text-slate-700">{eq.correctAnswer}</p>
                    </div>

                    {eq.rubric && eq.rubric.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold block text-slate-800">Rincian Rubrik Penskoran:</span>
                        {eq.rubric.map((r, rIdx) => (
                          <div key={rIdx} className="flex justify-between text-[11px] py-1 border-b border-slate-100">
                            <span>• {r.criteria}</span>
                            <span className="font-mono tabular-nums font-semibold">Skor: {r.maxPoints}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Tandatangan Guru & Kepala Sekolah */}
        <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-2 text-center text-xs">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah SMP</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Drs. H. Bambang Sudarsono, M.Pd.</p>
            <p className="font-mono text-[11px]">NIP. 19680315 199303 1 003</p>
          </div>
          <div>
            <p>Guru Mata Pelajaran,</p>
            <p className="font-bold">{exam.header.subject}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{exam.header.teacherName}</p>
            <p className="font-mono text-[11px]">NIP. {exam.header.teacherNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
