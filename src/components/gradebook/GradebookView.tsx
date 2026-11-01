import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Student, Subject, GradeItem } from '../../types';
import { GradeEntryModal } from './GradeEntryModal';
import { ExportImportService } from '../../services/exportImportService';
import { formatScore } from '../../utils/gradeCalculations';
import { EmptyState } from '../common/EmptyState';
import {
  BookOpen,
  Download,
  Edit2,
  TrendingUp,
  Award,
  CheckCircle2,
  Users
} from 'lucide-react';

export const GradebookView: React.FC = () => {
  const { classes, students, subjects, grades, activeUser } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => subjects[0]?.id || '');
  const [selectedSemester, setSelectedSemester] = useState<'HK1' | 'HK2'>('HK1');

  // Modal edit state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const canEdit = activeUser.role === 'admin' || activeUser.role === 'teacher';

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Grades for current class, subject, and semester
  const gradeMap = useMemo(() => {
    const map = new Map<string, GradeItem>();
    grades
      .filter((g) => g.subjectId === selectedSubjectId && g.semester === selectedSemester)
      .forEach((g) => map.set(g.studentId, g));
    return map;
  }, [grades, selectedSubjectId, selectedSemester]);

  // Compute stats
  const stats = useMemo(() => {
    const scores: number[] = [];
    classStudents.forEach((s) => {
      const g = gradeMap.get(s.id);
      if (g && g.averageScore !== undefined) {
        scores.push(g.averageScore);
      }
    });

    if (scores.length === 0) {
      return { count: 0, average: 0, max: 0, min: 0, passRate: 0 };
    }

    const sum = scores.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / scores.length) * 10) / 10;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passed = scores.filter((s) => s >= 5.0).length;
    const passRate = Math.round((passed / scores.length) * 100);

    return { count: scores.length, average, max, min, passRate };
  }, [classStudents, gradeMap]);

  const handleExport = () => {
    if (!selectedSubject || !selectedClass) return;
    const currentClassGrades = Array.from(gradeMap.values());
    ExportImportService.exportGradebookToCsv(
      classStudents,
      currentClassGrades,
      selectedSubject,
      selectedClass.name,
      selectedSemester
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sổ Điểm & Đánh Giá
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Bảng điểm chi tiết các môn học, tính toán trung bình môn và xếp loại học lực
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Xuất bảng điểm CSV</span>
        </button>
      </div>

      {/* Selector Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 neon-card-box">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Class selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Chọn Lớp Học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.room})
                </option>
              ))}
            </select>
          </div>

          {/* Subject selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Bộ Môn
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  Môn {s.name} (Hệ số {s.coefficient})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Học Kỳ
            </label>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedSemester('HK1')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedSemester === 'HK1'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Học kỳ 1
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester('HK2')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedSemester === 'HK2'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Học kỳ 2
              </button>
            </div>
          </div>
        </div>

        {/* Info label */}
        <div className="text-right text-xs text-slate-500 hidden md:block">
          GVCN: <strong className="text-slate-800">{selectedClass?.homeroomTeacherName}</strong>
        </div>
      </div>

      {/* Grade Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Số HS có điểm</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {stats.count}/{classStudents.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">ĐTB Cả Lớp</span>
          <span className="text-lg font-bold text-indigo-600 tabular-nums">
            {stats.average > 0 ? stats.average.toFixed(1) : '-'}
          </span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Điểm cao nhất</span>
          <span className="text-lg font-bold text-emerald-600 tabular-nums">
            {stats.max > 0 ? stats.max.toFixed(1) : '-'}
          </span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Tỷ lệ Đạt (≥ 5.0)</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {stats.count > 0 ? `${stats.passRate}%` : '-'}
          </span>
        </div>
      </div>

      {/* Grade Table */}
      {classStudents.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Không có học sinh trong lớp"
          description="Vui lòng chọn lớp học khác hoặc thêm học sinh vào lớp này."
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">STT</th>
                  <th className="py-3 px-3">Mã HS</th>
                  <th className="py-3 px-3">Họ và Tên</th>
                  <th className="py-3 px-2.5 text-center">Miệng 1</th>
                  <th className="py-3 px-2.5 text-center">Miệng 2</th>
                  <th className="py-3 px-2.5 text-center">15 Phút 1</th>
                  <th className="py-3 px-2.5 text-center">15 Phút 2</th>
                  <th className="py-3 px-2.5 text-center">1 Tiết (x2)</th>
                  <th className="py-3 px-2.5 text-center">Giữa kỳ (x2)</th>
                  <th className="py-3 px-2.5 text-center">Cuối kỳ (x3)</th>
                  <th className="py-3 px-3 text-center font-bold text-indigo-700">ĐTB Môn</th>
                  {canEdit && <th className="py-3 px-3 text-right">Nhập điểm</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((s, idx) => {
                  const g = gradeMap.get(s.id);
                  const avg = g?.averageScore;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{s.studentCode}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.fullName}</td>

                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700">
                        {formatScore(g?.oralScore1)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700">
                        {formatScore(g?.oralScore2)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700">
                        {formatScore(g?.fifteenMinScore1)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700">
                        {formatScore(g?.fifteenMinScore2)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700 font-medium">
                        {formatScore(g?.onePeriodScore)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700 font-medium">
                        {formatScore(g?.midtermScore)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono tabular-nums text-slate-700 font-medium">
                        {formatScore(g?.finalScore)}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700 text-sm tabular-nums">
                        {formatScore(avg)}
                      </td>

                      {canEdit && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Sửa điểm</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Entry Modal */}
      <GradeEntryModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        subject={selectedSubject}
        semester={selectedSemester}
      />
    </div>
  );
};
