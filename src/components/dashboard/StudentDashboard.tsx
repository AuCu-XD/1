import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MetricCard } from '../common/MetricCard';
import {
  Award,
  BookOpen,
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';
import { getAcademicClassification } from '../../utils/gradeCalculations';

interface StudentDashboardProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { activeUser, students, grades, subjects, assignments, submissions, attendance } = useApp();

  // Find the student entity matching this user
  const currentStudent = students.find((s) => s.studentCode === activeUser.identifier) || students[0];

  // Grades for current student
  const myGrades = grades.filter((g) => g.studentId === currentStudent?.id);

  // Assignments for current student's class
  const classAssignments = assignments.filter((a) => a.classId === currentStudent?.classId);

  // My submissions
  const mySubmissions = submissions.filter((s) => s.studentId === currentStudent?.id);
  const submittedIds = new Set(mySubmissions.map((s) => s.assignmentId));

  const pendingAssignments = classAssignments.filter((a) => !submittedIds.has(a.id));

  // Attendance rate
  const myAttendance = attendance.filter((a) => a.studentId === currentStudent?.id);
  const presentDays = myAttendance.filter((a) => a.status === 'present').length;
  const attendancePercent =
    myAttendance.length > 0 ? Math.round((presentDays / myAttendance.length) * 100) : 100;

  const classification = getAcademicClassification(currentStudent?.gpa || 8.0);

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 neon-card-box">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Góc Học Tập Cá Nhân
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Chào {currentStudent?.fullName}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mã học sinh: <strong className="font-mono text-slate-800 dark:text-slate-200">{currentStudent?.studentCode}</strong> · Lớp {currentStudent?.className} · GVCN: Thầy Nguyễn Văn An
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('assignments')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Nộp bài tập</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gradebook')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Xem bảng điểm</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Điểm Trung Bình (GPA)"
          value={currentStudent?.gpa ? currentStudent.gpa.toFixed(1) : '8.8'}
          subtext={`Xếp loại: ${classification.label}`}
          icon={Award}
          trend={{ value: 'Top 5 lớp', isPositive: true }}
        />
        <MetricCard
          label="Bài Tập Cần Hoàn Thành"
          value={pendingAssignments.length}
          subtext="Bài tập còn trong hạn nộp"
          icon={FileText}
          trend={{ value: `${pendingAssignments.length} bài chưa nộp`, isPositive: pendingAssignments.length === 0 }}
        />
        <MetricCard
          label="Chuyên Cần Đi Học"
          value={`${attendancePercent}%`}
          subtext={`${presentDays}/${myAttendance.length || 1} buổi có mặt`}
          icon={CalendarCheck}
        />
        <MetricCard
          label="Hạnh Kiểm Rèn Luyện"
          value={currentStudent?.conduct || 'Tốt'}
          subtext="Đạt chuẩn thi đua tháng 10"
          icon={Award}
        />
      </div>

      {/* Main Grid: Pending Homework & My Subject Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Assignments */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 neon-card-box">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nhiệm Vụ Học Tập & Bài Tập</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Xem tất cả ({classAssignments.length})
            </button>
          </div>

          <div className="space-y-3">
            {classAssignments.map((a) => {
              const submission = mySubmissions.find((s) => s.assignmentId === a.id);
              const isDone = !!submission;

              return (
                <div
                  key={a.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{a.subjectName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</span>
                      <span aria-hidden="true">·</span>
                      <span>GV: {a.teacherName}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{a.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {a.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isDone ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã nộp bài
                        </span>
                        {submission.score !== undefined && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Điểm: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{submission.score}</strong>/10
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate('assignments')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                      >
                        Nộp bài
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Grades Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between neon-card-box">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Điểm Môn Học (HK1)</h3>
              <button
                type="button"
                onClick={() => onNavigate('gradebook')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Chi tiết
              </button>
            </div>

            <div className="space-y-2.5">
              {subjects.map((sub) => {
                const grade = myGrades.find((g) => g.subjectId === sub.id);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.name}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Hệ số {sub.coefficient}</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums text-sm">
                      {grade?.averageScore ? grade.averageScore.toFixed(1) : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Điểm trung bình các môn: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{currentStudent?.gpa?.toFixed(1) || '8.8'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
