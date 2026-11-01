import { GradeItem, Subject } from '../types';

export interface ScoreComponent {
  score?: number;
  weight: number;
}

/**
 * Tính điểm trung bình môn học theo quy định chuẩn:
 * - Điểm miệng (hệ số 1)
 * - Điểm 15 phút (hệ số 1)
 * - Điểm 1 tiết (hệ số 2)
 * - Điểm thi giữa kỳ (hệ số 2)
 * - Điểm thi cuối kỳ (hệ số 3)
 */
export function calculateSubjectAverage(grade: GradeItem): number | undefined {
  const components: ScoreComponent[] = [
    { score: grade.oralScore1, weight: 1 },
    { score: grade.oralScore2, weight: 1 },
    { score: grade.fifteenMinScore1, weight: 1 },
    { score: grade.fifteenMinScore2, weight: 1 },
    { score: grade.onePeriodScore, weight: 2 },
    { score: grade.midtermScore, weight: 2 },
    { score: grade.finalScore, weight: 3 },
  ];

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const comp of components) {
    if (typeof comp.score === 'number' && !isNaN(comp.score) && comp.score >= 0 && comp.score <= 10) {
      totalWeightedScore += comp.score * comp.weight;
      totalWeight += comp.weight;
    }
  }

  if (totalWeight === 0) return undefined;
  return Math.round((totalWeightedScore / totalWeight) * 10) / 10;
}

/**
 * Xếp loại học lực theo thông tư chuẩn Bộ Giáo Dục:
 * Xuất sắc: ĐTB >= 9.0 và tất cả môn >= 8.0
 * Giỏi: ĐTB >= 8.0 và Toán hoặc Văn >= 8.0 và tất cả môn >= 6.5
 * Khá: ĐTB >= 6.5 và Toán hoặc Văn >= 6.5 và tất cả môn >= 5.0
 * Trung bình: ĐTB >= 5.0 và Toán hoặc Văn >= 5.0 và tất cả môn >= 3.5
 * Yếu: còn lại
 */
export function getAcademicClassification(gpa: number): {
  label: string;
  color: string;
} {
  if (gpa >= 9.0) {
    return { label: 'Xuất sắc', color: 'text-indigo-700' };
  } else if (gpa >= 8.0) {
    return { label: 'Giỏi', color: 'text-emerald-700' };
  } else if (gpa >= 6.5) {
    return { label: 'Khá', color: 'text-sky-700' };
  } else if (gpa >= 5.0) {
    return { label: 'Trung bình', color: 'text-amber-700' };
  } else {
    return { label: 'Yếu', color: 'text-rose-700' };
  }
}

/**
 * Tính điểm trung bình tất cả các môn của một học sinh
 */
export function calculateStudentOverallGPA(
  studentGrades: GradeItem[],
  subjects: Subject[]
): number | undefined {
  if (!studentGrades || studentGrades.length === 0) return undefined;

  let totalPoints = 0;
  let totalCoefficients = 0;

  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  for (const grade of studentGrades) {
    const avg = grade.averageScore !== undefined ? grade.averageScore : calculateSubjectAverage(grade);
    if (avg !== undefined) {
      const subject = subjectMap.get(grade.subjectId);
      const coeff = subject ? subject.coefficient : 1;
      totalPoints += avg * coeff;
      totalCoefficients += coeff;
    }
  }

  if (totalCoefficients === 0) return undefined;
  return Math.round((totalPoints / totalCoefficients) * 10) / 10;
}

export function formatScore(score?: number): string {
  if (score === undefined || score === null || isNaN(score)) return '-';
  return score.toFixed(1);
}
