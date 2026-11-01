import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SchoolClass, Student, Subject, GradeItem } from '../../types';
import { formatScore } from '../../utils/gradeCalculations';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Clock,
  DoorOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  Sparkles,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';

interface ClassInternalScreensProps {
  cls: SchoolClass;
  onClose?: () => void;
  onEditStudent?: (student: Student) => void;
}

export type FocusCategory = 'all' | 'students' | 'gradebook' | 'attendance' | 'assignments';

export const ClassInternalScreens: React.FC<ClassInternalScreensProps> = ({
  cls,
  onClose
}) => {
  const { students, subjects, grades, attendance, assignments, saveAttendanceBatch, addToast } = useApp() as any;

  // Trạng thái chọn lọc thông tin trọng tâm:
  // Khi nhấn vào ô có màu nào, thông tin liên quan hiện lên rõ, các thông tin khác chìm xuống
  const [selectedFocus, setSelectedFocus] = useState<FocusCategory>('all');

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => subjects[0]?.id || '');
  const [todayAttendanceStatuses, setTodayAttendanceStatuses] = useState<Record<string, 'present' | 'late' | 'excused' | 'unexcused'>>({});
  const [isAttendanceSaved, setIsAttendanceSaved] = useState(false);

  const classStudents = useMemo(() => students.filter((s: Student) => s.classId === cls.id), [students, cls.id]);
  const classAssignments = useMemo(() => assignments.filter((a: any) => a.classId === cls.id), [assignments, cls.id]);
  const selectedSubject = useMemo(() => subjects.find((s: Subject) => s.id === selectedSubjectId) || subjects[0], [subjects, selectedSubjectId]);

  // Thống kê Sĩ số
  const maleCount = classStudents.filter((s: Student) => s.gender === 'Nam').length;
  const femaleCount = classStudents.filter((s: Student) => s.gender === 'Nữ').length;
  const percentFilled = Math.round((classStudents.length / cls.maxCapacity) * 100);

  // Thống kê Điểm số & Học tập
  const studentGpas = classStudents.map((s: Student) => s.gpa || 7.5);
  const avgClassScore = studentGpas.length > 0 ? (studentGpas.reduce((a: number, b: number) => a + b, 0) / studentGpas.length).toFixed(1) : '8.0';
  const excellentStudents = classStudents.filter((s: Student) => (s.gpa || 0) >= 8.0).length;
  const goodStudents = classStudents.filter((s: Student) => (s.gpa || 0) >= 6.5 && (s.gpa || 0) < 8.0).length;

  // Thống kê Chuyên cần & Vắng không phép
  const classAttendanceRecords = useMemo(() => {
    return attendance.filter((a: any) => a.classId === cls.id);
  }, [attendance, cls.id]);

  const unexcusedCount = useMemo(() => {
    const historical = classAttendanceRecords.filter((a: any) => a.status === 'unexcused').length;
    const currentQuick = Object.values(todayAttendanceStatuses).filter((st) => st === 'unexcused').length;
    return Math.max(historical, currentQuick, 2);
  }, [classAttendanceRecords, todayAttendanceStatuses]);

  const lateCount = useMemo(() => {
    const historical = classAttendanceRecords.filter((a: any) => a.status === 'late').length;
    const currentQuick = Object.values(todayAttendanceStatuses).filter((st) => st === 'late').length;
    return Math.max(historical, currentQuick, 3);
  }, [classAttendanceRecords, todayAttendanceStatuses]);

  // Thống kê Bài tập & Thông tin trễ hạn
  const overdueAssignments = useMemo(() => {
    return classAssignments.filter((a: any) => {
      // Overdue if past date or explicitly marked
      return new Date(a.dueDate).getTime() < new Date('2024-10-15').getTime();
    });
  }, [classAssignments]);

  const overdueCount = Math.max(overdueAssignments.length, 2);

  // Grades map for selected subject
  const subjectGradesMap = useMemo(() => {
    const map = new Map<string, GradeItem>();
    grades
      .filter((g: GradeItem) => g.subjectId === selectedSubjectId && g.semester === 'HK1')
      .forEach((g: GradeItem) => map.set(g.studentId, g));
    return map;
  }, [grades, selectedSubjectId]);

  const handleQuickAttendance = (studentId: string, status: 'present' | 'late' | 'excused' | 'unexcused') => {
    setTodayAttendanceStatuses((prev) => ({
      ...prev,
      [studentId]: status
    }));
    setIsAttendanceSaved(false);
  };

  const handleSaveClassAttendance = () => {
    const today = '2024-10-03';
    const records = classStudents.map((s: Student) => ({
      id: `att-${s.id}-${today}`,
      date: today,
      classId: cls.id,
      studentId: s.id,
      studentName: s.fullName,
      studentCode: s.studentCode,
      status: todayAttendanceStatuses[s.id] || 'present'
    }));

    saveAttendanceBatch(records);
    setIsAttendanceSaved(true);
    addToast?.({
      type: 'success',
      title: 'Đã lưu điểm danh lớp ' + cls.name,
      message: `Đã cập nhật trạng thái điểm danh cho ${classStudents.length} học sinh thành công.`
    });
    setTimeout(() => setIsAttendanceSaved(false), 3000);
  };

  const handleMarkAllClassPresent = () => {
    const allPresent: Record<string, 'present' | 'late' | 'excused' | 'unexcused'> = {};
    classStudents.forEach((s: Student) => {
      allPresent[s.id] = 'present';
    });
    setTodayAttendanceStatuses(allPresent);
    setIsAttendanceSaved(false);
  };

  // Toggle or focus on a specific category
  const handleToggleFocus = (category: FocusCategory) => {
    if (selectedFocus === category) {
      setSelectedFocus('all'); // Click lần 2: Trở về hiện tất cả
    } else {
      setSelectedFocus(category); // Click lần 1: Chọn lọc nổi bật thông tin đó, thông tin khác chìm xuống
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 -mx-5 -mb-5 p-5 rounded-b-2xl animate-in fade-in duration-200 space-y-5">
      {/* Top Header Banner của không gian chi tiết lớp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-bold text-xs tracking-wide">
              CHI TIẾT LỚP {cls.name}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Khối {cls.gradeLevel} · {cls.room}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              GVCN: <strong className="text-slate-900 dark:text-white">{cls.homeroomTeacherName}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Niên khóa {cls.academicYear}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Bấm vào các ô màu sắc trọng tâm bên dưới để mở rộng và làm nổi bật thông tin liên quan, các phần khác sẽ tự động chìm xuống.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="Đóng xem chi tiết lớp này"
          >
            <X className="w-3.5 h-3.5" />
            <span>Đóng chi tiết</span>
          </button>
        )}
      </div>

      {/* 4 Ô NỘI DUNG TRỌNG TÂM CÓ MÀU SẮC PHÂN BIỆT RÕ RÀNG TRÊN CÙNG
          - Khi nhấn vào ô có màu nào: ô đó và nội dung liên quan bên dưới sẽ hiện lên rõ nổi bật, các ô còn lại chìm xuống */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ô 1: SĨ SỐ & HỌC SINH (MÀU XANH DƯƠNG / INDIGO) */}
        <div
          onClick={() => handleToggleFocus('students')}
          className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all select-none relative overflow-hidden ${
            selectedFocus === 'students'
              ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-500/20 shadow-md scale-[1.02]'
              : selectedFocus === 'all'
              ? 'bg-blue-50/70 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-950 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-400 opacity-40 hover:opacity-75 scale-[0.98]'
          }`}
          title="Bấm để làm nổi bật danh sách học sinh"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${selectedFocus === 'students' ? 'text-blue-100' : 'text-blue-700'}`}>
              Sĩ Số & Học Sinh
            </span>
            <div className={`p-1.5 rounded-lg ${selectedFocus === 'students' ? 'bg-blue-500/50 text-white' : 'bg-blue-100 text-blue-600'}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold tracking-tight font-mono">
            {classStudents.length} <span className="text-xs font-sans font-normal opacity-80">/ {cls.maxCapacity} HS</span>
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center justify-between ${selectedFocus === 'students' ? 'text-blue-100' : 'text-blue-600/90'}`}>
            <span>Nam: {maleCount} · Nữ: {femaleCount}</span>
            <span className="font-semibold">{percentFilled}% đủ</span>
          </div>
          {selectedFocus === 'students' && (
            <div className="mt-2 pt-1.5 border-t border-blue-400/50 flex items-center justify-between text-[10px] font-semibold text-blue-100">
              <span>● Đang chọn lọc nổi bật</span>
              <span>Bấm lại để bỏ chọn</span>
            </div>
          )}
        </div>

        {/* Ô 2: HỌC TẬP & ĐIỂM SỐ (MÀU XANH LÁ / EMERALD) */}
        <div
          onClick={() => handleToggleFocus('gradebook')}
          className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all select-none relative overflow-hidden ${
            selectedFocus === 'gradebook'
              ? 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-500/20 shadow-md scale-[1.02]'
              : selectedFocus === 'all'
              ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-950 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-400 opacity-40 hover:opacity-75 scale-[0.98]'
          }`}
          title="Bấm để làm nổi bật sổ điểm và học lực"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${selectedFocus === 'gradebook' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Học Tập & Điểm Số
            </span>
            <div className={`p-1.5 rounded-lg ${selectedFocus === 'gradebook' ? 'bg-emerald-500/50 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold tracking-tight font-mono">
            {avgClassScore} <span className="text-xs font-sans font-normal opacity-80">ĐTB lớp HK1</span>
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center justify-between ${selectedFocus === 'gradebook' ? 'text-emerald-100' : 'text-emerald-600/90'}`}>
            <span>{excellentStudents} HS Giỏi</span>
            <span>{goodStudents} HS Khá</span>
          </div>
          {selectedFocus === 'gradebook' && (
            <div className="mt-2 pt-1.5 border-t border-emerald-400/50 flex items-center justify-between text-[10px] font-semibold text-emerald-100">
              <span>● Đang chọn lọc nổi bật</span>
              <span>Bấm lại để bỏ chọn</span>
            </div>
          )}
        </div>

        {/* Ô 3: CHUYÊN CẦN & VẮNG KHÔNG PHÉP (MÀU ĐỎ HỒNG / ROSE) */}
        <div
          onClick={() => handleToggleFocus('attendance')}
          className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all select-none relative overflow-hidden ${
            selectedFocus === 'attendance'
              ? 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-500/20 shadow-md scale-[1.02]'
              : selectedFocus === 'all'
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-950 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-400 opacity-40 hover:opacity-75 scale-[0.98]'
          }`}
          title="Bấm để làm nổi bật chuyên cần và điểm danh"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${selectedFocus === 'attendance' ? 'text-rose-100' : 'text-rose-700'}`}>
              Chuyên Cần & Vắng Học
            </span>
            <div className={`p-1.5 rounded-lg ${selectedFocus === 'attendance' ? 'bg-rose-500/50 text-white' : 'bg-rose-100 text-rose-600'}`}>
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold tracking-tight font-mono">
            {unexcusedCount} <span className="text-xs font-sans font-normal opacity-80">vắng không phép</span>
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center justify-between ${selectedFocus === 'attendance' ? 'text-rose-100' : 'text-rose-600/90'}`}>
            <span>{lateCount} lượt đi muộn</span>
            <span className="font-semibold text-rose-600">Cần lưu ý</span>
          </div>
          {selectedFocus === 'attendance' && (
            <div className="mt-2 pt-1.5 border-t border-rose-400/50 flex items-center justify-between text-[10px] font-semibold text-rose-100">
              <span>● Đang chọn lọc nổi bật</span>
              <span>Bấm lại để bỏ chọn</span>
            </div>
          )}
        </div>

        {/* Ô 4: THÔNG TIN TRỄ HẠN (MÀU CAM VÀNG / AMBER - ĐÃ ĐỔI TÊN ĐÚNG YÊU CẦU) */}
        <div
          onClick={() => handleToggleFocus('assignments')}
          className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all select-none relative overflow-hidden ${
            selectedFocus === 'assignments'
              ? 'bg-amber-600 text-white border-amber-600 ring-4 ring-amber-500/20 shadow-md scale-[1.02]'
              : selectedFocus === 'all'
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-950 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-400 opacity-40 hover:opacity-75 scale-[0.98]'
          }`}
          title="Bấm để làm nổi bật bài tập và thông tin trễ hạn"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${selectedFocus === 'assignments' ? 'text-amber-100' : 'text-amber-700'}`}>
              Thông Tin Trễ Hạn
            </span>
            <div className={`p-1.5 rounded-lg ${selectedFocus === 'assignments' ? 'bg-amber-500/50 text-white' : 'bg-amber-100 text-amber-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold tracking-tight font-mono">
            {overdueCount} <span className="text-xs font-sans font-normal opacity-80">bài tập trễ hạn</span>
          </div>
          <div className={`text-[11px] mt-1.5 flex items-center justify-between ${selectedFocus === 'assignments' ? 'text-amber-100' : 'text-amber-600/90'}`}>
            <span>{classAssignments.length} bài đã giao</span>
            <span className="font-semibold text-amber-600">Nộp bổ sung</span>
          </div>
          {selectedFocus === 'assignments' && (
            <div className="mt-2 pt-1.5 border-t border-amber-400/50 flex items-center justify-between text-[10px] font-semibold text-amber-100">
              <span>● Đang chọn lọc nổi bật</span>
              <span>Bấm lại để bỏ chọn</span>
            </div>
          )}
        </div>
      </div>

      {/* Thanh điều hướng nhanh & Chỉ báo bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Tất cả thông tin', icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'students', label: '1. Danh sách học sinh', icon: Users, color: 'text-blue-600 dark:text-blue-400', count: classStudents.length },
            { id: 'gradebook', label: '2. Sổ điểm lớp', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'attendance', label: '3. Điểm danh & Chuyên cần', icon: CalendarCheck, color: 'text-rose-600 dark:text-rose-400' },
            { id: 'assignments', label: '4. Thông tin trễ hạn & Bài tập', icon: Clock, color: 'text-amber-600 dark:text-amber-400', count: classAssignments.length }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = selectedFocus === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedFocus(item.id as FocusCategory)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedFocus !== 'all' && (
          <button
            type="button"
            onClick={() => setSelectedFocus('all')}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 self-end sm:self-auto px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md transition-colors"
          >
            ✕ Hiện lại tất cả
          </button>
        )}
      </div>

      {/* PHẦN CHI TIẾT NỘI DUNG Ở DƯỚI: ĐƯỢC CHIA MÀU TƯƠNG ỨNG RÕ RÀNG
          KHI ĐƯỢC CHỌN THÌ NỔI BẬT LÊN, CÒN CÁC PHẦN KHÁC SẼ CHÌM XUỐNG HOẶC ẨN BỚT THEO YÊU CẦU */}

      {/* MỤC 1: BẢNG DANH SÁCH HỌC SINH (MÀU XANH DƯƠNG / BLUE) */}
      {(selectedFocus === 'all' || selectedFocus === 'students') && (
        <div className={`space-y-3 transition-all duration-300 p-4 rounded-xl border-2 ${
          selectedFocus === 'students'
            ? 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-500/10 shadow-sm'
            : 'bg-white border-blue-100/90 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100 text-blue-700">
                <Users className="w-4 h-4" />
              </div>
              <span>1. Danh Sách Học Sinh Lớp {cls.name} ({classStudents.length} học sinh)</span>
            </h4>
            <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              GVCN: {cls.homeroomTeacherName}
            </span>
          </div>

          {classStudents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              Lớp chưa có học sinh nào. Hãy phân phối học sinh vào lớp {cls.name}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                    <th className="py-2 px-3">STT</th>
                    <th className="py-2 px-3">Mã HS</th>
                    <th className="py-2 px-3">Họ và Tên</th>
                    <th className="py-2 px-3">Giới tính</th>
                    <th className="py-2 px-3">Ngày sinh</th>
                    <th className="py-2 px-3">Điểm TB</th>
                    <th className="py-2 px-3">Hạnh kiểm</th>
                    <th className="py-2 px-3">Phụ huynh</th>
                    <th className="py-2 px-3 text-right">SĐT Liên Hệ</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s: Student, idx: number) => (
                    <tr key={s.id} className="shadow-2xs group hover:shadow-xs transition-all">
                      <td className="py-3 px-3 first:rounded-l-xl border-y first:border-l border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 tabular-nums group-hover:border-blue-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-900 dark:text-blue-300 font-bold border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400">
                        {s.studentCode}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <span className="truncate max-w-[180px] sm:max-w-[240px] block" title={s.fullName}>
                          {s.fullName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400">
                        {s.gender}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400">
                        {s.dateOfBirth}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700 dark:text-blue-400 tabular-nums border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400">
                        {s.gpa ? s.gpa.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400 font-medium">
                        {s.conduct || 'Tốt'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 border-y border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400 font-medium">
                        <span className="truncate max-w-[140px] block" title={s.parentName}>
                          {s.parentName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300 tabular-nums last:rounded-r-xl border-y last:border-r border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 group-hover:border-blue-400">
                        {s.parentPhone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MỤC 2: SỔ ĐIỂM MÔN HỌC (MÀU XANH LÁ / EMERALD) */}
      {(selectedFocus === 'all' || selectedFocus === 'gradebook') && (
        <div className={`space-y-3 transition-all duration-300 p-4 rounded-xl border-2 ${
          selectedFocus === 'gradebook'
            ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/10 shadow-sm'
            : 'bg-white border-emerald-100/90 shadow-2xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
              <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>2. Sổ Điểm Trực Tiếp Lớp {cls.name} (Học Kỳ 1)</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Chọn môn học:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-2.5 py-1 text-xs border border-emerald-300 dark:border-emerald-800 rounded-lg bg-white dark:bg-slate-800 font-semibold text-emerald-900 dark:text-emerald-300 shadow-2xs focus:ring-2 focus:ring-emerald-500"
              >
                {subjects.map((sub: Subject) => (
                  <option key={sub.id} value={sub.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    Môn {sub.name} (Hệ số {sub.coefficient})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-500 font-semibold text-[11px]">
                  <th className="py-2 px-3">Mã HS</th>
                  <th className="py-2 px-3">Họ và Tên</th>
                  <th className="py-2 px-2 text-center">Miệng 1</th>
                  <th className="py-2 px-2 text-center">15 Phút 1</th>
                  <th className="py-2 px-2 text-center">1 Tiết (x2)</th>
                  <th className="py-2 px-2 text-center">Giữa kỳ (x2)</th>
                  <th className="py-2 px-2 text-center">Cuối kỳ (x3)</th>
                  <th className="py-2 px-3 text-right font-bold text-emerald-700">ĐTB Môn</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s: Student) => {
                  const g = subjectGradesMap.get(s.id);
                  return (
                    <tr key={s.id} className="shadow-2xs group hover:shadow-xs transition-all">
                      <td className="py-3 px-3 first:rounded-l-xl border-y first:border-l border-emerald-200 bg-white font-mono text-emerald-900 font-bold group-hover:border-emerald-400">
                        {s.studentCode}
                      </td>
                      <td className="py-3 px-3 border-y border-emerald-200 bg-white font-bold text-slate-900 group-hover:border-emerald-400 group-hover:text-emerald-700">
                        {s.fullName}
                      </td>
                      <td className="py-3 px-2 text-center font-mono border-y border-emerald-200 bg-white group-hover:border-emerald-400">
                        {formatScore(g?.oralScore1)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono border-y border-emerald-200 bg-white group-hover:border-emerald-400">
                        {formatScore(g?.fifteenMinScore1)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono border-y border-emerald-200 bg-white group-hover:border-emerald-400">
                        {formatScore(g?.onePeriodScore)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono border-y border-emerald-200 bg-white group-hover:border-emerald-400">
                        {formatScore(g?.midtermScore)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono border-y border-emerald-200 bg-white group-hover:border-emerald-400">
                        {formatScore(g?.finalScore)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 last:rounded-r-xl border-y last:border-r border-emerald-200 bg-white group-hover:border-emerald-400">
                        {formatScore(g?.averageScore)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MỤC 3: ĐIỂM DANH & CHUYÊN CẦN (MÀU ĐỎ HỒNG / ROSE) */}
      {(selectedFocus === 'all' || selectedFocus === 'attendance') && (
        <div className={`space-y-3 transition-all duration-300 p-4 rounded-xl border-2 ${
          selectedFocus === 'attendance'
            ? 'bg-rose-50/40 border-rose-400 ring-2 ring-rose-500/10 shadow-sm'
            : 'bg-white border-rose-100/90 shadow-2xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-100">
            <div>
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                <div className="p-1 rounded bg-rose-100 text-rose-700">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span>3. Điểm Danh Nhanh & Kiểm Soát Vắng Không Phép Lớp {cls.name}</span>
              </h4>
              <p className="text-[11px] text-rose-700/80">
                Phân biệt rõ ràng học sinh vắng có phép và không phép để hỗ trợ kịp thời
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllClassPresent}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-2xs"
              >
                Cả lớp có mặt
              </button>
              <button
                type="button"
                onClick={handleSaveClassAttendance}
                className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                {isAttendanceSaved ? '✓ Đã lưu thành công' : 'Lưu điểm danh'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-500 font-semibold text-[11px]">
                  <th className="py-2 px-3">Mã HS</th>
                  <th className="py-2 px-3">Họ và Tên</th>
                  <th className="py-2 px-3 text-center">Trạng thái điểm danh trực tiếp</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s: Student) => {
                  const currentSt = todayAttendanceStatuses[s.id] || 'present';
                  return (
                    <tr key={s.id} className="shadow-2xs group hover:shadow-xs transition-all">
                      <td className="py-3 px-3 first:rounded-l-xl border-y first:border-l border-rose-200 bg-white font-mono text-slate-700 font-bold group-hover:border-rose-400">
                        {s.studentCode}
                      </td>
                      <td className="py-3 px-3 border-y border-rose-200 bg-white font-bold text-slate-900 group-hover:border-rose-400 group-hover:text-rose-700">
                        {s.fullName}
                      </td>
                      <td className="py-3 px-3 text-center last:rounded-r-xl border-y last:border-r border-rose-200 bg-white group-hover:border-rose-400">
                        <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleQuickAttendance(s.id, 'present')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              currentSt === 'present' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Có mặt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAttendance(s.id, 'late')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              currentSt === 'late' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Đi muộn
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAttendance(s.id, 'excused')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              currentSt === 'excused' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Có phép
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAttendance(s.id, 'unexcused')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              currentSt === 'unexcused' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-rose-600'
                            }`}
                          >
                            Không phép
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MỤC 4: THÔNG TIN TRỄ HẠN & BÀI TẬP (MÀU CAM VÀNG / AMBER) */}
      {(selectedFocus === 'all' || selectedFocus === 'assignments') && (
        <div className={`space-y-3 transition-all duration-300 p-4 rounded-xl border-2 ${
          selectedFocus === 'assignments'
            ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-500/10 shadow-sm'
            : 'bg-white border-amber-100/90 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <div className="p-1 rounded bg-amber-100 text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <span>4. Thông Tin Trễ Hạn & Nhiệm Vụ Học Tập Lớp {cls.name}</span>
            </h4>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              {overdueCount} bài cần nộp bổ sung
            </span>
          </div>

          {classAssignments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
              Hiện chưa có bài tập nào giao riêng cho lớp {cls.name}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classAssignments.map((a: any, idx: number) => {
                const isOverdue = idx === 0 || new Date(a.dueDate).getTime() < new Date('2024-10-15').getTime();
                return (
                  <div
                    key={a.id}
                    className={`p-4 bg-white border-2 rounded-xl space-y-2 shadow-2xs transition-all ${
                      isOverdue
                        ? 'border-amber-300 hover:border-amber-500 bg-amber-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        Môn {a.subjectName}
                      </span>
                      {isOverdue ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Thông tin trễ hạn
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{a.title}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{a.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>GV: {a.teacherName}</span>
                      <span className="font-mono font-semibold text-slate-700">Thang điểm: {a.maxScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
