import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MetricCard } from '../common/MetricCard';
import {
  Heart,
  BookOpen,
  CalendarCheck,
  PhoneCall,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';
import { getAcademicClassification } from '../../utils/gradeCalculations';

interface ParentDashboardProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { activeUser, students, teachers, grades, subjects, attendance, announcements } = useApp();

  // Child linked to parent
  const child = students.find((s) => s.id === activeUser.childId) || students[0];

  // Homeroom teacher
  const homeroomTeacher = teachers.find((t) => t.isHomeroom && t.homeroomClassName === child?.className) || teachers[0];

  // Grades & attendance
  const childGrades = grades.filter((g) => g.studentId === child?.id);
  const childAttendance = attendance.filter((a) => a.studentId === child?.id);
  const presentCount = childAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate =
    childAttendance.length > 0 ? Math.round((presentCount / childAttendance.length) * 100) : 100;

  const classification = getAcademicClassification(child?.gpa || 8.0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Sổ Liên Lạc Điện Tử Dành Cho Phụ Huynh
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Kính chào phụ huynh học sinh {child?.fullName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lớp: <strong className="text-slate-800 dark:text-slate-200">{child?.className}</strong> · Mã học sinh: <strong className="font-mono text-slate-800 dark:text-slate-200">{child?.studentCode}</strong> · Năm học 2024 - 2025
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('gradebook')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Xem chi tiết sổ điểm</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Điểm Trung Bình (GPA)"
          value={child?.gpa ? child.gpa.toFixed(1) : '8.8'}
          subtext={`Xếp loại học lực: ${classification.label}`}
          icon={BookOpen}
        />
        <MetricCard
          label="Tỷ Lệ Chuyên Cần"
          value={`${attendanceRate}%`}
          subtext="Đi học đúng giờ, đầy đủ"
          icon={CalendarCheck}
        />
        <MetricCard
          label="Hạnh Kiểm Đánh Giá"
          value={child?.conduct || 'Tốt'}
          subtext="Chấp hành tốt nội quy"
          icon={UserCheck}
        />
        <MetricCard
          label="Giáo Viên Chủ Nhiệm"
          value={homeroomTeacher?.fullName || 'Thầy An'}
          subtext={`SĐT: ${homeroomTeacher?.phone || '0912 345 678'}`}
          icon={PhoneCall}
        />
      </div>

      {/* Detail grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child transcript overview */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kết Quả Học Tập Học Kỳ 1 Của Con
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gradebook')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Xem chi tiết các cột điểm
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Môn học</th>
                  <th className="py-2.5 px-3">Hệ số</th>
                  <th className="py-2.5 px-3">Điểm TB môn</th>
                  <th className="py-2.5 px-3">Đánh giá chung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const g = childGrades.find((gr) => gr.subjectId === sub.id);
                  const avg = g?.averageScore;
                  const status =
                    avg && avg >= 8.0
                      ? 'Nắm vững kiến thức, tiếp thu nhanh'
                      : avg && avg >= 6.5
                      ? 'Hoàn thành tốt các mục tiêu bài học'
                      : 'Đang duy trì ổn định';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{sub.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">x{sub.coefficient}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 tabular-nums text-sm">
                        {avg ? avg.toFixed(1) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher contact card & school announcements */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
              Liên Hệ Giáo Viên Chủ Nhiệm
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Họ và tên giáo viên:</span>
                <span className="font-bold text-slate-800 text-sm">{homeroomTeacher?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                <span className="font-mono font-semibold text-indigo-600 text-sm">
                  {homeroomTeacher?.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email liên hệ:</span>
                <span className="text-slate-700">{homeroomTeacher?.email}</span>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-lg text-indigo-900 text-xs leading-relaxed border border-indigo-100/60">
                Phụ huynh có thể liên hệ trực tiếp thầy giáo chủ nhiệm qua Zalo/Điện thoại trong giờ hành chính từ 07:30 đến 17:00 hàng ngày.
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3">
              Thông Báo Nhà Trường Dành Cho Phụ Huynh
            </h3>
            <div className="space-y-3">
              {announcements
                .filter((a) => a.targetAudience === 'all' || a.targetAudience === 'parents')
                .slice(0, 2)
                .map((a) => (
                  <div key={a.id} className="text-xs">
                    <h4 className="font-semibold text-slate-900 line-clamp-1">{a.title}</h4>
                    <p className="text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{a.content}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{a.publishedAt.slice(0, 10)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
