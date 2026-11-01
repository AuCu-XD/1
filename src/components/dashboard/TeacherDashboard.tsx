import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MetricCard } from '../common/MetricCard';
import {
  Users,
  BookOpen,
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';

interface TeacherDashboardProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { activeUser, classes, students, assignments, submissions, attendance } = useApp();

  // Find teacher's homeroom class
  const homeroomClass = classes.find((c) => c.id === activeUser.classId) || classes[0];
  const classStudents = students.filter((s) => s.classId === homeroomClass?.id);

  // Today attendance check
  const today = '2024-10-03';
  const todayAttendance = attendance.filter((a) => a.classId === homeroomClass?.id && a.date === today);
  const isAttendanceDone = todayAttendance.length > 0;
  const presentStudents = todayAttendance.filter((a) => a.status === 'present').length;

  // Submissions to grade
  const pendingGrading = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Teacher greeting & class overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 neon-card-box">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Cổng Giảng Viên & Giáo Viên Chủ Nhiệm
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Xin chào, {activeUser.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lớp chủ nhiệm: <strong className="font-semibold text-slate-800 dark:text-slate-200">{homeroomClass?.name}</strong> · Phòng {homeroomClass?.room} · Môn phụ trách: Toán học
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
              isAttendanceDone
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{isAttendanceDone ? 'Xem điểm danh hôm nay' : 'Điểm danh ngay'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gradebook')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Nhập sổ điểm</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Sĩ Số Lớp Chủ Nhiệm"
          value={`${classStudents.length} hs`}
          subtext={`Lớp ${homeroomClass?.name} (${homeroomClass?.academicYear})`}
          icon={Users}
        />
        <MetricCard
          label="Điểm Danh Hôm Nay"
          value={isAttendanceDone ? `${presentStudents}/${classStudents.length}` : 'Chưa điểm danh'}
          subtext={isAttendanceDone ? '100% có mặt đúng giờ' : 'Cần điểm danh đầu giờ'}
          icon={CalendarCheck}
        />
        <MetricCard
          label="Bài Tập Cần Chấm"
          value={pendingGrading}
          subtext="Bài nộp mới từ học sinh"
          icon={FileText}
          trend={{ value: `${pendingGrading} bài chờ`, isPositive: false }}
        />
        <MetricCard
          label="Điểm TB Lớp Chủ Nhiệm"
          value="8.4"
          subtext="Học kỳ 1 · Xếp hạng 2 toàn khối"
          icon={BookOpen}
        />
      </div>

      {/* Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homeroom students quick table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 neon-card-box">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Danh Sách Học Sinh Lớp {homeroomClass?.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Xem tất cả ({classStudents.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và Tên</th>
                  <th className="py-2.5 px-3">Điểm TB</th>
                  <th className="py-2.5 px-3">Hạnh Kiểm</th>
                  <th className="py-2.5 px-3">Phụ Huynh</th>
                  <th className="py-2.5 px-3 text-right">SĐT Liên Hệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{s.studentCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{s.fullName}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {s.gpa ? s.gpa.toFixed(1) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{s.conduct || 'Tốt'}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{s.parentName}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {s.parentPhone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Assignment Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between neon-card-box">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bài Tập Đã Giao</h3>
              <button
                type="button"
                onClick={() => onNavigate('assignments')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Giao bài mới
              </button>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 3).map((a) => {
                const subCount = submissions.filter((s) => s.assignmentId === a.id).length;
                return (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50"
                  >
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {a.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      <span>Lớp {a.className} · {a.subjectName}</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {subCount} bài nộp
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('assignments')}
              className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/80 dark:border-slate-700"
            >
              Chấm điểm bài nộp ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
