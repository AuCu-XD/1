import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { formatScore, getAcademicClassification } from '../../utils/gradeCalculations';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  CalendarCheck
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { subjects, grades, attendance } = useApp();

  if (!student) return null;

  // Student grades
  const studentGrades = grades.filter((g) => g.studentId === student.id);

  // Student attendance
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const presentDays = studentAttendance.filter((a) => a.status === 'present').length;

  const classification = getAcademicClassification(student.gpa || 8.0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ Sơ Chi Tiết Học Sinh"
      subtitle={`Mã HS: ${student.studentCode} · Niên khóa 2024 - 2025`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Header Profile Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {student.fullName.charAt(student.fullName.lastIndexOf(' ') + 1) || student.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{student.fullName}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{student.gender}</span>
                <span aria-hidden="true">·</span>
                <span>Sinh ngày: {student.dateOfBirth}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Lớp {student.className}</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Điểm trung bình (GPA)</span>
            <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {student.gpa ? student.gpa.toFixed(1) : '-'}
            </span>
            <span className="text-xs font-semibold block text-slate-700 dark:text-slate-300">
              Học lực: {classification.label} · Hạnh kiểm: {student.conduct || 'Tốt'}
            </span>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-900 dark:text-white block">Thông Tin Phụ Huynh & Liên Hệ</span>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Họ tên: {student.parentName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="font-mono">{student.parentPhone}</span>
            </div>
            {student.parentEmail && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{student.parentEmail}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-900 dark:text-white block">Học Vụ & Địa Chỉ</span>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Ngày nhập học: {student.enrollmentDate}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="line-clamp-2">{student.address || 'Chưa cập nhật'}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <span>Trạng thái: <strong className="text-slate-900 dark:text-white">{student.status}</strong></span>
            </div>
          </div>
        </div>

        {/* Academic Transcript Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Bảng Điểm Môn Học (Học kỳ 1)</span>
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Quy chuẩn tính hệ số môn học</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-2.5">Môn học</th>
                  <th className="py-2 px-2.5">Miệng 1</th>
                  <th className="py-2 px-2.5">Miệng 2</th>
                  <th className="py-2 px-2.5">15 Phút 1</th>
                  <th className="py-2 px-2.5">15 Phút 2</th>
                  <th className="py-2 px-2.5">1 Tiết (x2)</th>
                  <th className="py-2 px-2.5">Giữa kỳ (x2)</th>
                  <th className="py-2 px-2.5">Cuối kỳ (x3)</th>
                  <th className="py-2 px-2.5 text-right">ĐTB Môn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjects.map((sub) => {
                  const g = studentGrades.find((grade) => grade.subjectId === sub.id);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-2.5 font-semibold text-slate-900 dark:text-white">{sub.name}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.oralScore1)}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.oralScore2)}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.fifteenMinScore1)}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.fifteenMinScore2)}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.onePeriodScore)}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.midtermScore)}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-300">{formatScore(g?.finalScore)}</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-right tabular-nums">
                        {formatScore(g?.averageScore)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Lịch sử chuyên cần gần nhất:</span>
          </div>
          <span className="text-slate-600 dark:text-slate-300 tabular-nums">
            Có mặt: <strong className="text-emerald-600 dark:text-emerald-400">{presentDays}</strong> buổi · Đi muộn: <strong className="text-amber-600 dark:text-amber-400">{studentAttendance.filter((a) => a.status === 'late').length}</strong> · Vắng: <strong className="text-rose-600 dark:text-rose-400">{studentAttendance.filter((a) => a.status === 'excused' || a.status === 'unexcused').length}</strong>
          </span>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
