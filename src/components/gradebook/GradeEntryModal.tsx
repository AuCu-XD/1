import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Student, Subject, GradeItem } from '../../types';
import { calculateSubjectAverage } from '../../utils/gradeCalculations';

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  subject: Subject | null;
  semester: 'HK1' | 'HK2';
}

export const GradeEntryModal: React.FC<GradeEntryModalProps> = ({
  isOpen,
  onClose,
  student,
  subject,
  semester
}) => {
  const { grades, saveStudentGrade } = useApp();

  const [oralScore1, setOralScore1] = useState<string>('');
  const [oralScore2, setOralScore2] = useState<string>('');
  const [fifteenMinScore1, setFifteenMinScore1] = useState<string>('');
  const [fifteenMinScore2, setFifteenMinScore2] = useState<string>('');
  const [onePeriodScore, setOnePeriodScore] = useState<string>('');
  const [midtermScore, setMidtermScore] = useState<string>('');
  const [finalScore, setFinalScore] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student && subject) {
      const g = grades.find(
        (item) =>
          item.studentId === student.id &&
          item.subjectId === subject.id &&
          item.semester === semester
      );

      setOralScore1(g?.oralScore1 !== undefined ? String(g.oralScore1) : '');
      setOralScore2(g?.oralScore2 !== undefined ? String(g.oralScore2) : '');
      setFifteenMinScore1(g?.fifteenMinScore1 !== undefined ? String(g.fifteenMinScore1) : '');
      setFifteenMinScore2(g?.fifteenMinScore2 !== undefined ? String(g.fifteenMinScore2) : '');
      setOnePeriodScore(g?.onePeriodScore !== undefined ? String(g.onePeriodScore) : '');
      setMidtermScore(g?.midtermScore !== undefined ? String(g.midtermScore) : '');
      setFinalScore(g?.finalScore !== undefined ? String(g.finalScore) : '');
    }
    setError(null);
  }, [student, subject, semester, grades, isOpen]);

  const parseScore = (val: string): number | undefined => {
    if (!val.trim()) return undefined;
    const num = parseFloat(val);
    if (isNaN(num)) return undefined;
    return Math.round(num * 10) / 10;
  };

  const validateScoreRange = (val?: number): boolean => {
    if (val === undefined) return true;
    return val >= 0 && val <= 10;
  };

  // Preview live calculated average
  const previewAverage = (() => {
    const tempGrade: GradeItem = {
      id: 'temp',
      studentId: student?.id || '',
      subjectId: subject?.id || '',
      semester,
      academicYear: '2024 - 2025',
      oralScore1: parseScore(oralScore1),
      oralScore2: parseScore(oralScore2),
      fifteenMinScore1: parseScore(fifteenMinScore1),
      fifteenMinScore2: parseScore(fifteenMinScore2),
      onePeriodScore: parseScore(onePeriodScore),
      midtermScore: parseScore(midtermScore),
      finalScore: parseScore(finalScore)
    };
    return calculateSubjectAverage(tempGrade);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !subject) return;

    const o1 = parseScore(oralScore1);
    const o2 = parseScore(oralScore2);
    const f1 = parseScore(fifteenMinScore1);
    const f2 = parseScore(fifteenMinScore2);
    const op = parseScore(onePeriodScore);
    const mid = parseScore(midtermScore);
    const fin = parseScore(finalScore);

    const allScores = [o1, o2, f1, f2, op, mid, fin];
    const invalid = allScores.some((s) => !validateScoreRange(s));

    if (invalid) {
      setError('Điểm số phải nằm trong thang điểm từ 0.0 đến 10.0');
      return;
    }

    saveStudentGrade({
      studentId: student.id,
      subjectId: subject.id,
      semester,
      academicYear: '2024 - 2025',
      oralScore1: o1,
      oralScore2: o2,
      fifteenMinScore1: f1,
      fifteenMinScore2: f2,
      onePeriodScore: op,
      midtermScore: mid,
      finalScore: fin
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập / Sửa Điểm Môn Học"
      subtitle={`Học sinh: ${student?.fullName} (${student?.studentCode}) · Môn: ${subject?.name} · ${semester}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Oral scores */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Điểm kiểm tra miệng (Hệ số 1)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={oralScore1}
              onChange={(e) => setOralScore1(e.target.value)}
              placeholder="Lần 1 (0 - 10)"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={oralScore2}
              onChange={(e) => setOralScore2(e.target.value)}
              placeholder="Lần 2 (0 - 10)"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>
        </div>

        {/* 15-min scores */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Điểm kiểm tra 15 phút (Hệ số 1)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={fifteenMinScore1}
              onChange={(e) => setFifteenMinScore1(e.target.value)}
              placeholder="Lần 1 (0 - 10)"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={fifteenMinScore2}
              onChange={(e) => setFifteenMinScore2(e.target.value)}
              placeholder="Lần 2 (0 - 10)"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>
        </div>

        {/* 1-period & Midterm (Coefficient 2) */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kiểm tra 1 tiết (Hệ số 2)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={onePeriodScore}
              onChange={(e) => setOnePeriodScore(e.target.value)}
              placeholder="Điểm 1 tiết"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thi giữa kỳ (Hệ số 2)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={midtermScore}
              onChange={(e) => setMidtermScore(e.target.value)}
              placeholder="Điểm giữa kỳ"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Final Exam (Coefficient 3) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Thi cuối kỳ (Hệ số 3)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={finalScore}
            onChange={(e) => setFinalScore(e.target.value)}
            placeholder="Điểm cuối kỳ (0 - 10)"
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
          />
        </div>

        {/* Live average score banner */}
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 rounded-lg flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
            Điểm trung bình môn tạm tính:
          </span>
          <span className="text-base font-bold font-mono text-indigo-700 dark:text-indigo-300 tabular-nums">
            {previewAverage !== undefined ? previewAverage.toFixed(1) : '-'}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            Lưu điểm số
          </button>
        </div>
      </form>
    </Modal>
  );
};
