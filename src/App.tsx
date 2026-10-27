import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExamBuilder } from './components/ExamBuilder';
import { QuestionBankView } from './components/QuestionBankView';
import { GradingSystemView } from './components/GradingSystemView';
import { ItemAnalysisView } from './components/ItemAnalysisView';
import { PrintExportView } from './components/PrintExportView';
import {
  INITIAL_EXAM_PAPER,
  INITIAL_QUESTIONS_BANK,
  INITIAL_STUDENT_SCORES,
} from './data/defaultBank';
import { ExamPaper, Question, StudentScore, SubjectType, GradeLevel } from './types/exam';

export default function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'bank' | 'grading' | 'analysis' | 'print'>('builder');

  // Exam state with local persistence
  const [exam, setExam] = useState<ExamPaper>(() => {
    try {
      const saved = localStorage.getItem('siujian_exam_data');
      return saved ? JSON.parse(saved) : INITIAL_EXAM_PAPER;
    } catch {
      return INITIAL_EXAM_PAPER;
    }
  });

  // Question bank state with local persistence
  const [bankQuestions, setBankQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('siujian_bank_data');
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS_BANK;
    } catch {
      return INITIAL_QUESTIONS_BANK;
    }
  });

  // Student grades state with local persistence
  const [students, setStudents] = useState<StudentScore[]>(() => {
    try {
      const saved = localStorage.getItem('siujian_students_data');
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_SCORES;
    } catch {
      return INITIAL_STUDENT_SCORES;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('siujian_exam_data', JSON.stringify(exam));
    } catch (e) {
      console.warn('Failed saving exam to localStorage', e);
    }
  }, [exam]);

  useEffect(() => {
    try {
      localStorage.setItem('siujian_bank_data', JSON.stringify(bankQuestions));
    } catch (e) {
      console.warn('Failed saving bank to localStorage', e);
    }
  }, [bankQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem('siujian_students_data', JSON.stringify(students));
    } catch (e) {
      console.warn('Failed saving students to localStorage', e);
    }
  }, [students]);

  // Add question to active exam
  const handleAddToExam = (question: Question) => {
    if (exam.questions.some((q) => q.id === question.id)) return;
    setExam((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
      updatedAt: new Date().toISOString(),
    }));
  };

  // Create new exam paper with 50 questions
  const handleNewExam = () => {
    const subjectPrompt = prompt(
      'Pilih Mata Pelajaran untuk Naskah Baru:\n1. Matematika\n2. IPA\n3. Bahasa Indonesia\n4. Bahasa Inggris\n5. IPS\n6. PPKn\n7. Informatika\n8. Bimbingan Konseling (BK)\n9. Seni Budaya\n10. Iqra / BTQ',
      'Bimbingan Konseling (BK)'
    );
    if (!subjectPrompt) return;

    let matchedSubject: SubjectType = 'Bimbingan Konseling (BK)';
    const clean = subjectPrompt.trim().toLowerCase();
    if (clean.includes('mat')) matchedSubject = 'Matematika';
    else if (clean.includes('ipa')) matchedSubject = 'IPA';
    else if (clean.includes('ing')) matchedSubject = 'Bahasa Inggris';
    else if (clean.includes('indo')) matchedSubject = 'Bahasa Indonesia';
    else if (clean.includes('ips')) matchedSubject = 'IPS';
    else if (clean.includes('pkn') || clean.includes('pancasila')) matchedSubject = 'PPKn';
    else if (clean.includes('infor')) matchedSubject = 'Informatika';
    else if (clean.includes('bk') || clean.includes('konseling')) matchedSubject = 'Bimbingan Konseling (BK)';
    else if (clean.includes('seni') || clean.includes('budaya')) matchedSubject = 'Seni Budaya';
    else if (clean.includes('iqra') || clean.includes('btq') || clean.includes('qur')) matchedSubject = 'Iqra / BTQ';

    import('./data/defaultBank').then(({ generateFull50ExamPackage }) => {
      const full50 = generateFull50ExamPackage(matchedSubject, exam.header.grade);
      const newPaper: ExamPaper = {
        id: `exam-${Date.now()}`,
        title: `Penilaian Sumatif Akhir Semester (SAS) ${matchedSubject}`,
        header: {
          ...exam.header,
          subject: matchedSubject,
          timeLimitMinutes: 120,
          examType: `PENILAIAN SUMATIF AKHIR SEMESTER (SAS) ${matchedSubject.toUpperCase()}`,
        },
        questions: full50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setExam(newPaper);
      setActiveTab('builder');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 3-Zone Clean Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewExam={handleNewExam}
        examTitle={exam.title}
        totalQuestions={exam.questions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'builder' && (
          <ExamBuilder
            exam={exam}
            onUpdateExam={setExam}
            onOpenBank={() => setActiveTab('bank')}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankView
            bankQuestions={bankQuestions}
            onAddToExam={handleAddToExam}
            examQuestionIds={exam.questions.map((q) => q.id)}
            activeSubject={exam.header.subject}
            activeGrade={exam.header.grade}
          />
        )}

        {activeTab === 'grading' && (
          <GradingSystemView
            exam={exam}
            students={students}
            onUpdateStudents={setStudents}
          />
        )}

        {activeTab === 'analysis' && (
          <ItemAnalysisView exam={exam} students={students} />
        )}

        {activeTab === 'print' && <PrintExportView exam={exam} />}
      </main>

      {/* Quiet, unpretentious footer conforming to Anti-Slop Discipline */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SiUjian SMP PGRI 4 JAMBI</span>
            <span aria-hidden="true">·</span>
            <span>Sistem Pembuatan Soal & Penilaian Standar Nasional</span>
            <span aria-hidden="true">·</span>
            <span>Kurikulum Merdeka & K13</span>
          </div>
          <div>
            <span>Sesuai Panduan Pembelajaran dan Asesmen Pusmendik Kemdikbudristek RI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
