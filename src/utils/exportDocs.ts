import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { ExamPaper } from '../types/exam';

/**
 * Ekspor Naskah Ujian ke format PDF menggunakan jsPDF
 */
export function exportExamToPDF(exam: ExamPaper, mode: 'paper' | 'kunci' | 'ljk' = 'paper') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // 1. KOP SURAT RESMI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(exam.header.agencyName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(14);
  doc.text(exam.header.schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(
    'Jalan Pendidikan Nasional No. 45 · Telp. (021) 7891234 · Akreditasi A (Unggul)',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 3;

  // Garis Ganda Kop
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.8;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Judul Ujian
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const examTitle =
    mode === 'kunci'
      ? `KUNCI JAWABAN & PEDOMAN PENSKORAN - ${exam.header.examType}`
      : mode === 'ljk'
      ? `LEMBAR JAWABAN KOMPUTER (LJK) - ${exam.header.examType}`
      : `${exam.header.examType} T.A. ${exam.header.academicYear}`;
  doc.text(examTitle, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Tabel Identitas Soal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setDrawColor(180, 180, 180);
  doc.rect(margin, y, contentWidth, 14);

  const col1X = margin + 3;
  const col2X = margin + contentWidth / 2 + 3;
  const tableY1 = y + 4.5;
  const tableY2 = y + 8.5;
  const tableY3 = y + 12.5;

  doc.text(`Mata Pelajaran : ${exam.header.subject}`, col1X, tableY1);
  doc.text(`Kelas / Sem    : Kelas ${exam.header.grade} / ${exam.header.semester}`, col1X, tableY2);
  doc.text(`Kurikulum      : Kurikulum Merdeka`, col1X, tableY3);

  doc.text(`Alokasi Waktu : ${exam.header.timeLimitMinutes} Menit`, col2X, tableY1);
  doc.text(`Batas KKM/KKTP: ${exam.header.kkm} (Skala 100)`, col2X, tableY2);
  doc.text(`Jumlah Soal   : ${exam.questions.length} Butir (PG & Esai)`, col2X, tableY3);

  y += 18;

  // --- MODE: NASKAH SOAL ---
  if (mode === 'paper') {
    // Petunjuk Umum
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PETUNJUK UMUM:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    exam.header.instructions.slice(0, 4).forEach((inst, i) => {
      doc.text(`${i + 1}. ${inst}`, margin + 2, y);
      y += 3.5;
    });
    y += 3;

    const pgQuestions = exam.questions.filter((q) => q.type === 'pg');
    const essayQuestions = exam.questions.filter((q) => q.type === 'esai');

    // BAGIAN I: PG
    if (pgQuestions.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(
        `I. PILIHAN GANDA (Pilihlah salah satu jawaban yang paling tepat: A, B, C, atau D)`,
        margin,
        y
      );
      y += 5;

      pgQuestions.forEach((q, idx) => {
        checkPageBreak(25);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        const qNum = `${idx + 1}. `;
        doc.text(qNum, margin, y);

        doc.setFont('helvetica', 'normal');
        if (q.stimulus) {
          doc.setFont('helvetica', 'italic');
          const stimLines = doc.splitTextToSize(`[Wacana] ${q.stimulus}`, contentWidth - 8);
          doc.text(stimLines, margin + 6, y);
          y += stimLines.length * 3.5 + 1;
          doc.setFont('helvetica', 'normal');
        }

        const textLines = doc.splitTextToSize(q.text, contentWidth - 8);
        doc.text(textLines, margin + 6, y);
        y += textLines.length * 3.8 + 2;

        // Opsi A, B, C, D
        if (q.options && q.options.length > 0) {
          const optWidth = (contentWidth - 8) / 2;
          for (let i = 0; i < q.options.length; i += 2) {
            checkPageBreak(6);
            const opt1 = q.options[i];
            const opt2 = q.options[i + 1];

            if (opt1) {
              const opt1Text = doc.splitTextToSize(`${opt1.label}. ${opt1.text}`, optWidth - 4);
              doc.text(opt1Text, margin + 8, y);
            }
            if (opt2) {
              const opt2Text = doc.splitTextToSize(`${opt2.label}. ${opt2.text}`, optWidth - 4);
              doc.text(opt2Text, margin + 8 + optWidth, y);
            }
            y += 4;
          }
        }
        y += 2.5;
      });
    }

    // BAGIAN II: ESAI
    if (essayQuestions.length > 0) {
      checkPageBreak(15);
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`II. URAIAN / ESAI (Jawablah pertanyaan berikut dengan sistematis!)`, margin, y);
      y += 5;

      essayQuestions.forEach((q, idx) => {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        const qNum = `${pgQuestions.length + idx + 1}. `;
        doc.text(qNum, margin, y);

        doc.setFont('helvetica', 'normal');
        if (q.stimulus) {
          doc.setFont('helvetica', 'italic');
          const stimLines = doc.splitTextToSize(q.stimulus, contentWidth - 8);
          doc.text(stimLines, margin + 6, y);
          y += stimLines.length * 3.5 + 1;
          doc.setFont('helvetica', 'normal');
        }

        const textLines = doc.splitTextToSize(q.text, contentWidth - 8);
        doc.text(textLines, margin + 6, y);
        y += textLines.length * 3.8 + 8; // Ruang kosong untuk menulis
      });
    }

    // Tanda Tangan
    checkPageBreak(30);
    y += 8;
    const signCol1 = margin + 20;
    const signCol2 = pageWidth - margin - 50;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Mengetahui,', signCol1, y);
    doc.text('Guru Mata Pelajaran,', signCol2, y);
    y += 4;
    doc.text('Kepala Sekolah SMP,', signCol1, y);
    doc.text(exam.header.subject, signCol2, y);

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Drs. H. Bambang Sudarsono, M.Pd.', signCol1, y);
    doc.text(exam.header.teacherName, signCol2, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.text('NIP. 19680315 199303 1 003', signCol1, y);
    doc.text(`NIP. ${exam.header.teacherNip}`, signCol2, y);
  }

  // --- MODE: KUNCI JAWABAN ---
  else if (mode === 'kunci') {
    const pgQuestions = exam.questions.filter((q) => q.type === 'pg');
    const essayQuestions = exam.questions.filter((q) => q.type === 'esai');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`A. KUNCI JAWABAN PILIHAN GANDA (Bobot: ${exam.header.pgWeight}%):`, margin, y);
    y += 5;

    // Grid 5 kolom untuk nomor dan kunci
    doc.setFontSize(8);
    let col = 0;
    const colWidth = contentWidth / 5;
    let rowStartY = y;

    pgQuestions.forEach((q, idx) => {
      checkPageBreak(6);
      const curX = margin + col * colWidth;
      doc.setFont('helvetica', 'normal');
      doc.text(`No. ${idx + 1} : `, curX, y);
      doc.setFont('helvetica', 'bold');
      doc.text(q.correctAnswer, curX + 13, y);

      col++;
      if (col >= 5) {
        col = 0;
        y += 4.5;
      }
    });

    if (col !== 0) y += 6;
    else y += 3;

    // Esai Rubrik
    if (essayQuestions.length > 0) {
      checkPageBreak(20);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`B. PEDOMAN PENSKORAN & RUBRIK ESAI (Bobot: ${exam.header.essayWeight}%):`, margin, y);
      y += 5;

      essayQuestions.forEach((eq, idx) => {
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`Soal No. ${pgQuestions.length + idx + 1} (${eq.topic}) - Skor Maks: ${eq.points}`, margin, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const ansLines = doc.splitTextToSize(`Kunci Jawaban: ${eq.correctAnswer}`, contentWidth - 4);
        doc.text(ansLines, margin + 2, y);
        y += ansLines.length * 3.5 + 2;

        if (eq.rubric && eq.rubric.length > 0) {
          eq.rubric.forEach((r) => {
            doc.text(`• ${r.criteria} (Maks. ${r.maxPoints} poin)`, margin + 4, y);
            y += 3.5;
          });
        }
        y += 2;
      });
    }
  }

  // Simpan / Unduh PDF
  const filename = `${exam.header.schoolName.replace(/\s+/g, '_')}_${exam.header.subject}_Kelas_${exam.header.grade}_${mode}.pdf`;
  doc.save(filename);
}

/**
 * Ekspor Naskah Ujian ke format Microsoft Word DOCX menggunakan pustaka docx
 */
export async function exportExamToDOCX(exam: ExamPaper) {
  const pgQuestions = exam.questions.filter((q) => q.type === 'pg');
  const essayQuestions = exam.questions.filter((q) => q.type === 'esai');

  const children: any[] = [];

  // Kop Surat Paragraf
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: exam.header.agencyName.toUpperCase(),
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: exam.header.schoolName.toUpperCase(),
          bold: true,
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Jalan Pendidikan Nasional No. 45 · Telp. (021) 7891234 · Akreditasi A (Unggul)',
          italics: true,
          size: 16,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '========================================================================',
          bold: true,
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${exam.header.examType} TAHUN AJARAN ${exam.header.academicYear}`,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({ text: '' })
  );

  // Tabel Identitas Soal
  const metadataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: `Mata Pelajaran : ${exam.header.subject}`, bold: true, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Kelas / Sem    : Kelas ${exam.header.grade} / ${exam.header.semester}`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Kurikulum      : Kurikulum Merdeka`, size: 18 })] }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: `Alokasi Waktu : ${exam.header.timeLimitMinutes} Menit`, bold: true, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Batas KKM/KKTP: ${exam.header.kkm} (Skala 100)`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Jumlah Butir  : ${exam.questions.length} Butir Soal`, size: 18 })] }),
            ],
          }),
        ],
      }),
    ],
  });
  children.push(metadataTable);
  children.push(new Paragraph({ text: '' }));

  // Petunjuk Umum
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'PETUNJUK UMUM:', bold: true, size: 18 })],
    })
  );
  exam.header.instructions.forEach((inst, i) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. ${inst}`, size: 16 })],
      })
    );
  });
  children.push(new Paragraph({ text: '' }));

  // BAGIAN I: PG
  if (pgQuestions.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'I. PILIHAN GANDA (Pilihlah salah satu jawaban yang paling tepat: A, B, C, atau D)',
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    );

    pgQuestions.forEach((q, idx) => {
      if (q.stimulus) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `[Wacana/Stimulus] ${q.stimulus}`, italics: true, size: 16 })],
          })
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${idx + 1}. `, bold: true, size: 18 }),
            new TextRun({ text: q.text, size: 18 }),
          ],
        })
      );

      if (q.options) {
        q.options.forEach((opt) => {
          children.push(
            new Paragraph({
              indent: { left: 720 },
              children: [
                new TextRun({ text: `${opt.label}. `, bold: true, size: 18 }),
                new TextRun({ text: opt.text, size: 18 }),
              ],
            })
          );
        });
      }
      children.push(new Paragraph({ text: '' }));
    });
  }

  // BAGIAN II: ESAI
  if (essayQuestions.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'II. URAIAN / ESAI (Jawablah pertanyaan berikut dengan langkah sistematis)',
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    );

    essayQuestions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${pgQuestions.length + idx + 1}. `, bold: true, size: 18 }),
            new TextRun({ text: q.text, size: 18 }),
          ],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Jawaban:' }),
        new Paragraph({ text: '_________________________________________________________________________________' }),
        new Paragraph({ text: '_________________________________________________________________________________' }),
        new Paragraph({ text: '' })
      );
    });
  }

  // Tanda Tangan
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Mengetahui,', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Kepala Sekolah SMP', bold: true, size: 18 })] }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ children: [new TextRun({ text: 'Drs. H. Bambang Sudarsono, M.Pd.', bold: true, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: 'NIP. 19680315 199303 1 003', size: 16 })] }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Guru Mata Pelajaran,', size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: exam.header.subject, bold: true, size: 18 })] }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ children: [new TextRun({ text: exam.header.teacherName, bold: true, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${exam.header.teacherNip}`, size: 16 })] }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(new Paragraph({ text: '' }));
  children.push(signatureTable);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${exam.header.schoolName.replace(/\s+/g, '_')}_${exam.header.subject}_Kelas_${exam.header.grade}_50_Soal.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
