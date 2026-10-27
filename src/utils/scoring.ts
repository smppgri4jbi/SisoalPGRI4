import { Question, StudentScore, ItemAnalysisData } from '../types/exam';

/**
 * Menghitung interval predikat nilai berdasarkan standar KKM / KKTP nasional:
 * Interval = (100 - KKM) / 3
 */
export function getGradeInterval(kkm: number) {
  const interval = (100 - kkm) / 3;
  return {
    interval: Number(interval.toFixed(1)),
    minA: Math.round(100 - interval),
    minB: Math.round(100 - 2 * interval),
    minC: Math.round(kkm),
  };
}

/**
 * Menentukan Predikat (A, B, C, D) dan Deskripsi Capaian Nasional
 */
export function determinePredicate(score: number, kkm: number = 75): {
  predicate: 'A' | 'B' | 'C' | 'D';
  description: string;
  status: 'Tuntas' | 'Remedial';
} {
  const roundedScore = Math.round(score * 10) / 10;
  const { minA, minB, minC } = getGradeInterval(kkm);

  if (roundedScore >= minA) {
    return {
      predicate: 'A',
      description: 'Sangat Baik (Menunjukkan penguasaan kompetensi materi secara komprehensif dan mendalam).',
      status: 'Tuntas',
    };
  } else if (roundedScore >= minB) {
    return {
      predicate: 'B',
      description: 'Baik (Menunjukkan penguasaan kompetensi materi yang baik dan mampu menyelesaikan sebagian besar variasi soal).',
      status: 'Tuntas',
    };
  } else if (roundedScore >= minC) {
    return {
      predicate: 'C',
      description: 'Cukup (Menunjukkan penguasaan kompetensi dasar yang mencukupi batas minimal kelulusan).',
      status: 'Tuntas',
    };
  } else {
    return {
      predicate: 'D',
      description: 'Perlu Bimbingan (Belum mencapai batas ketuntasan minimal, memerlukan remedial dan pembimbingan terarah).',
      status: 'Remedial',
    };
  }
}

/**
 * Menghitung Nilai Akhir Standar Nasional (Skala 0 - 100)
 * Nilai = (Skor PG / Max PG * Bobot PG) + (Skor Esai / Max Esai * Bobot Esai)
 */
export function calculateNationalFinalScore(
  pgEarned: number,
  pgMaxPossible: number,
  essayEarned: number,
  essayMaxPossible: number,
  pgWeight: number = 70,
  essayWeight: number = 30
): number {
  const pgPart = pgMaxPossible > 0 ? (pgEarned / pgMaxPossible) * pgWeight : 0;
  const essayPart = essayMaxPossible > 0 ? (essayEarned / essayMaxPossible) * essayWeight : 0;

  if (pgMaxPossible > 0 && essayMaxPossible === 0) {
    return Math.round((pgEarned / pgMaxPossible) * 100 * 10) / 10;
  }
  if (pgMaxPossible === 0 && essayMaxPossible > 0) {
    return Math.round((essayEarned / essayMaxPossible) * 100 * 10) / 10;
  }

  const total = pgPart + essayPart;
  return Math.round(total * 10) / 10;
}

/**
 * Menghitung statistik kelas (Mean, Median, Standar Deviasi, Ketuntasan Klasikal)
 */
export function calculateClassStatistics(scores: StudentScore[], kkm: number) {
  if (scores.length === 0) {
    return {
      count: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      passedCount: 0,
      failedCount: 0,
      classicalPassRate: 0,
      standardDeviation: 0,
    };
  }

  const finalScores = scores.map((s) => s.finalScore);
  const sum = finalScores.reduce((acc, curr) => acc + curr, 0);
  const average = Math.round((sum / finalScores.length) * 10) / 10;
  const highest = Math.max(...finalScores);
  const lowest = Math.min(...finalScores);

  const passedCount = scores.filter((s) => s.finalScore >= kkm).length;
  const failedCount = scores.length - passedCount;
  const classicalPassRate = Math.round((passedCount / scores.length) * 100);

  const variance =
    finalScores.reduce((acc, curr) => acc + Math.pow(curr - average, 2), 0) /
    finalScores.length;
  const standardDeviation = Math.round(Math.sqrt(variance) * 10) / 10;

  return {
    count: scores.length,
    average,
    highest,
    lowest,
    passedCount,
    failedCount,
    classicalPassRate,
    standardDeviation,
  };
}

/**
 * Menghitung Analisis Butir Soal Standar Nasional
 */
export function calculateItemAnalysis(
  questions: Question[],
  students: StudentScore[]
): ItemAnalysisData[] {
  if (students.length === 0 || questions.length === 0) return [];

  const sortedStudents = [...students].sort((a, b) => b.finalScore - a.finalScore);
  const totalStudents = sortedStudents.length;

  const groupSize = Math.max(1, Math.round(totalStudents * 0.27));
  const upperGroup = sortedStudents.slice(0, groupSize);
  const lowerGroup = sortedStudents.slice(totalStudents - groupSize);

  return questions.map((q, idx) => {
    let correctCount = 0;
    let upperCorrect = 0;
    let lowerCorrect = 0;
    const optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

    students.forEach((s) => {
      const studentAns = s.answers[q.id];
      if (studentAns) {
        if (q.type === 'pg' && optionCounts[studentAns] !== undefined) {
          optionCounts[studentAns]++;
        }
        if (studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
          correctCount++;
        }
      }
    });

    upperGroup.forEach((s) => {
      if ((s.answers[q.id] || '').trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        upperCorrect++;
      }
    });

    lowerGroup.forEach((s) => {
      if ((s.answers[q.id] || '').trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        lowerCorrect++;
      }
    });

    const pValue = totalStudents > 0 ? correctCount / totalStudents : 0;
    const difficultyIndex = Math.round(pValue * 100) / 100;
    let difficultyCategory: 'Mudah' | 'Sedang' | 'Sukar' = 'Sedang';
    if (difficultyIndex >= 0.7) {
      difficultyCategory = 'Mudah';
    } else if (difficultyIndex < 0.3) {
      difficultyCategory = 'Sukar';
    }

    const dValue = groupSize > 0 ? (upperCorrect - lowerCorrect) / groupSize : 0;
    const discriminationIndex = Math.round(dValue * 100) / 100;
    let discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Buruk' = 'Baik';
    if (discriminationIndex >= 0.4) {
      discriminationCategory = 'Sangat Baik';
    } else if (discriminationIndex >= 0.3) {
      discriminationCategory = 'Baik';
    } else if (discriminationIndex >= 0.2) {
      discriminationCategory = 'Cukup';
    } else {
      discriminationCategory = 'Buruk';
    }

    const distractorAnalysis: Record<string, number> = {};
    ['A', 'B', 'C', 'D'].forEach((opt) => {
      distractorAnalysis[opt] = totalStudents > 0 ? Math.round((optionCounts[opt] / totalStudents) * 100) : 0;
    });

    let recommendation: 'Diterima' | 'Revisi Pengecoh' | 'Revisi Total / Dibuang' = 'Diterima';
    if (discriminationIndex < 0.2 || difficultyIndex < 0.1 || difficultyIndex > 0.95) {
      recommendation = 'Revisi Total / Dibuang';
    } else if (discriminationIndex < 0.3) {
      recommendation = 'Revisi Pengecoh';
    } else {
      recommendation = 'Diterima';
    }

    return {
      questionId: q.id,
      questionNumber: idx + 1,
      text: q.text,
      type: q.type,
      correctAnswer: q.correctAnswer,
      difficultyIndex,
      difficultyCategory,
      discriminationIndex,
      discriminationCategory,
      distractorAnalysis,
      recommendation,
    };
  });
}
