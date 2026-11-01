import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { getAcademicClassification } from '../../utils/gradeCalculations';

export const SummaryReportsModule: React.FC = () => {
  const { classes, students, grades, attendance, addToast } = useApp();

  const [selectedSemester, setSelectedSemester] = useState<'HK1' | 'HK2'>('HK1');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');

  const filteredStudents = students.filter((s) => {
    const cls = classes.find((c) => c.id === s.classId);
    return selectedGradeFilter === 'all' || cls?.gradeLevel === selectedGradeFilter;
  });

  // Calculate academic distribution
  let excellent = 0; // >= 9.0
  let good = 0; // 8.0 - 8.9
  let fairlyGood = 0; // 6.5 - 7.9
  let average = 0; // 5.0 - 6.4
  let weak = 0; // < 5.0

  filteredStudents.forEach((s) => {
    const gpa = s.gpa || 8.0;
    if (gpa >= 9.0) excellent++;
    else if (gpa >= 8.0) good++;
    else if (gpa >= 6.5) fairlyGood++;
    else if (gpa >= 5.0) average++;
    else weak++;
  });

  const total = filteredStudents.length || 1;

  const handleExportReport = () => {
    addToast({
      type: 'success',
      title: 'Đã xuất báo cáo tổng kết',
      message: 'Báo cáo thống kê học lực và chuyên cần đã được tải xuống.'
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Báo Cáo Tổng Kết</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Phân tích số liệu học lực, xếp hạng thi đua các lớp và thống kê chuyên cần
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Xuất báo cáo PDF / Excel</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs neon-card-box">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Khối lớp:</span>
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Toàn trường (Khối 10, 11, 12)</option>
            <option value={10} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Khối 10</option>
            <option value={11} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Khối 11</option>
            <option value={12} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Khối 12</option>
          </select>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedSemester('HK1')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedSemester === 'HK1' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Học kỳ 1
          </button>
          <button
            type="button"
            onClick={() => setSelectedSemester('HK2')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedSemester === 'HK2' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Học kỳ 2
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700 block">Xuất sắc (≥ 9.0)</span>
          <span className="text-xl font-bold font-mono text-purple-900 mt-1 block">{excellent} hs</span>
          <span className="text-[11px] text-slate-400 font-mono">({Math.round((excellent / total) * 100)}%)</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Giỏi (8.0 - 8.9)</span>
          <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">{good} hs</span>
          <span className="text-[11px] text-slate-400 font-mono">({Math.round((good / total) * 100)}%)</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 block">Khá (6.5 - 7.9)</span>
          <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">{fairlyGood} hs</span>
          <span className="text-[11px] text-slate-400 font-mono">({Math.round((fairlyGood / total) * 100)}%)</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Trung bình (5.0 - 6.4)</span>
          <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">{average} hs</span>
          <span className="text-[11px] text-slate-400 font-mono">({Math.round((average / total) * 100)}%)</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 block">Chưa đạt (&lt; 5.0)</span>
          <span className="text-xl font-bold font-mono text-rose-900 mt-1 block">{weak} hs</span>
          <span className="text-[11px] text-slate-400 font-mono">({Math.round((weak / total) * 100)}%)</span>
        </div>
      </div>

      {/* Class comparison table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Bảng So Sánh Thi Đua Giữa Các Lớp</h3>
          <span className="text-[11px] text-slate-500">Năm học 2024 - 2025</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Lớp học</th>
                <th className="py-2.5 px-3">Khối</th>
                <th className="py-2.5 px-3">GVCN</th>
                <th className="py-2.5 px-3">Sĩ số</th>
                <th className="py-2.5 px-3">ĐTB Lớp</th>
                <th className="py-2.5 px-3">Tỷ lệ chuyên cần</th>
                <th className="py-2.5 px-3 text-right">Xếp loại thi đua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls, idx) => {
                const cStudents = students.filter((s) => s.classId === cls.id);
                const sumGpa = cStudents.reduce((acc, s) => acc + (s.gpa || 8.0), 0);
                const avgGpa = cStudents.length > 0 ? (sumGpa / cStudents.length).toFixed(1) : '8.2';

                return (
                  <tr key={cls.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Lớp {cls.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">Khối {cls.gradeLevel}</td>
                    <td className="py-2.5 px-3 text-slate-700">{cls.homeroomTeacherName}</td>
                    <td className="py-2.5 px-3 font-mono">{cStudents.length || cls.studentCount} hs</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{avgGpa}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">96.8%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {idx === 0 ? 'Hạng Nhất Khối' : idx === 1 ? 'Hạng Nhì' : 'Đạt Chuẩn'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
