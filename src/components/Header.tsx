import React from 'react';
import { BookOpen, Sparkles, Printer, GraduationCap, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'builder' | 'bank' | 'grading' | 'analysis' | 'print';
  onSelectTab: (tab: 'builder' | 'bank' | 'grading' | 'analysis' | 'print') => void;
  onNewExam: () => void;
  examTitle: string;
  totalQuestions: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onNewExam,
  examTitle,
  totalQuestions,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                SiUjian SMP PGRI 4 JAMBI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
                Standar Nasional & Kurikulum Merdeka
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single line whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('builder')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'builder'
                  ? 'border-blue-900 text-blue-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Penyusun Naskah
            </button>
            <button
              onClick={() => onSelectTab('bank')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === 'bank'
                  ? 'border-blue-900 text-blue-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Bank Soal & AI
            </button>
            <button
              onClick={() => onSelectTab('grading')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'grading'
                  ? 'border-blue-900 text-blue-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Penilaian Standar
            </button>
            <button
              onClick={() => onSelectTab('analysis')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 ${
                activeTab === 'analysis'
                  ? 'border-blue-900 text-blue-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Analisis Butir
            </button>
            <button
              onClick={() => onSelectTab('print')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === 'print'
                  ? 'border-blue-900 text-blue-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Cetak & LJK
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNewExam}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Naskah Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 border-t border-slate-100 gap-4 text-xs font-medium no-scrollbar">
          <button
            onClick={() => onSelectTab('builder')}
            className={`whitespace-nowrap ${activeTab === 'builder' ? 'text-blue-900 font-bold' : 'text-slate-500'}`}
          >
            Penyusun ({totalQuestions})
          </button>
          <button
            onClick={() => onSelectTab('bank')}
            className={`whitespace-nowrap flex items-center gap-1 ${activeTab === 'bank' ? 'text-blue-900 font-bold' : 'text-slate-500'}`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Bank Soal & AI
          </button>
          <button
            onClick={() => onSelectTab('grading')}
            className={`whitespace-nowrap ${activeTab === 'grading' ? 'text-blue-900 font-bold' : 'text-slate-500'}`}
          >
            Penilaian
          </button>
          <button
            onClick={() => onSelectTab('analysis')}
            className={`whitespace-nowrap ${activeTab === 'analysis' ? 'text-blue-900 font-bold' : 'text-slate-500'}`}
          >
            Analisis Butir
          </button>
          <button
            onClick={() => onSelectTab('print')}
            className={`whitespace-nowrap ${activeTab === 'print' ? 'text-blue-900 font-bold' : 'text-slate-500'}`}
          >
            Cetak & LJK
          </button>
        </div>
      </div>
    </header>
  );
};
