import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MetricCard } from '../common/MetricCard';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';
import { getAcademicClassification } from '../../utils/gradeCalculations';

interface AdminDashboardProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { students, teachers, classes, attendance, announcements, grades } = useApp();

  // Metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  // Today attendance
  const today = '2024-10-03';
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 98;

  // Academic distribution
  const gradeDistribution = {
    xuatSac: 0,
    gioi: 0,
    kha: 0,
    trungBinh: 0,
    yeu: 0
  };

  students.forEach((s) => {
    if (s.gpa !== undefined) {
      if (s.gpa >= 9.0) gradeDistribution.xuatSac++;
      else if (s.gpa >= 8.0) gradeDistribution.gioi++;
      else if (s.gpa >= 6.5) gradeDistribution.kha++;
      else if (s.gpa >= 5.0) gradeDistribution.trungBinh++;
      else gradeDistribution.yeu++;
    }
  });

  const maxGradeCount = Math.max(
    ...Object.values(gradeDistribution),
    1
  );

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 neon-card-box">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bảng Điều Khiển Quản Trị
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Năm học 2024 - 2025 · Học kỳ 1 · Cập nhật số liệu tự động theo thời gian thực toàn trường
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gradebook')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Xem sổ điểm</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tổng Số Học Sinh"
          value={totalStudents}
          subtext="Toàn bộ 3 khối 10, 11, 12"
          icon={Users}
          trend={{ value: '+12% so năm trước', isPositive: true }}
        />
        <MetricCard
          label="Đội Ngũ Giáo Viên"
          value={totalTeachers}
          subtext="100% đạt chuẩn và trên chuẩn"
          icon={GraduationCap}
        />
        <MetricCard
          label="Tổng Số Lớp Học"
          value={totalClasses}
          subtext="Sĩ số trung bình 38 hs/lớp"
          icon={School}
        />
        <MetricCard
          label="Tỷ Lệ Chuyên Cần Hôm Nay"
          value={`${attendanceRate}%`}
          subtext={`${presentCount}/${todayAttendance.length || totalStudents} học sinh có mặt`}
          icon={CalendarCheck}
          trend={{ value: 'Ổn định', isPositive: true }}
        />
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Grade Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 neon-card-box">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Phân Phối Học Lực Toàn Trường (HK1)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gradebook')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean Histogram Visual */}
          <div className="space-y-4 pt-2">
            {[
              { label: 'Xuất sắc (ĐTB ≥ 9.0)', count: gradeDistribution.xuatSac, color: 'bg-indigo-600' },
              { label: 'Giỏi (8.0 ≤ ĐTB < 9.0)', count: gradeDistribution.gioi, color: 'bg-emerald-600' },
              { label: 'Khá (6.5 ≤ ĐTB < 8.0)', count: gradeDistribution.kha, color: 'bg-sky-600' },
              { label: 'Trung bình (5.0 ≤ ĐTB < 6.5)', count: gradeDistribution.trungBinh, color: 'bg-amber-600' },
              { label: 'Yếu (ĐTB < 5.0)', count: gradeDistribution.yeu, color: 'bg-rose-600' }
            ].map((item) => {
              const percent = Math.round((item.count / totalStudents) * 100) || 0;
              const barWidth = Math.max(8, Math.round((item.count / maxGradeCount) * 100));

              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      <strong className="font-semibold text-slate-900 dark:text-white">{item.count}</strong> học sinh ({percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Classes Roster & Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 flex flex-col neon-card-box">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Danh Sách Lớp Học</h3>
            <button
              type="button"
              onClick={() => onNavigate('classes')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{cls.name}</span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {cls.studentCount}/{cls.maxCapacity} hs
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>GVCN: {cls.homeroomTeacherName}</span>
                  <span>{cls.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements & Recent Notices */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 neon-card-box">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thông Báo Mới Nhất</h3>
          <button
            type="button"
            onClick={() => onNavigate('announcements')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Quản lý bảng tin
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                  {ann.targetAudienceLabel}
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {ann.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                {ann.authorName} · {ann.publishedAt.slice(0, 10)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
