import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Student, AttendanceRecord, AttendanceStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { StudentDetailModal } from '../students/StudentDetailModal';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  Users,
  Calendar,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
  UserCheck
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const { classes, students, attendance, saveAttendanceBatch, activeUser, switchRole, addToast } = useApp();

  // Mặc định lấy ngày hôm nay định dạng YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || 'class-10a1');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Đảm bảo selectedClassId luôn hợp lệ khi danh sách lớp học sẵn sàng
  useEffect(() => {
    if ((!selectedClassId || !classes.some(c => c.id === selectedClassId)) && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Local state lưu trạng thái và ghi chú của từng học sinh
  const [localStatuses, setLocalStatuses] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  const canEdit = activeUser.role === 'admin' || activeUser.role === 'teacher';

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Lọc học sinh thuộc lớp đang chọn (khớp cả theo classId hoặc className để không sót học sinh nào)
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(
      (s) => s.classId === selectedClassId || (currentClass && s.className === currentClass.name)
    );
  }, [students, selectedClassId, currentClass]);

  // Nạp dữ liệu điểm danh đã lưu vào local state khi chuyển ngày hoặc lớp
  useEffect(() => {
    const existing = attendance.filter(
      (a) => (a.classId === selectedClassId || (currentClass && a.classId === currentClass.name)) &&
             a.date === selectedDate
    );
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};

    classStudents.forEach((s) => {
      const rec = existing.find((r) => r.studentId === s.id);
      if (rec) {
        // Chỉ lưu ghi chú nếu trạng thái là có phép hoặc không phép
        const hasNote = rec.status === 'excused' || rec.status === 'unexcused';
        initialMap[s.id] = {
          status: rec.status,
          note: hasNote ? (rec.note || '') : ''
        };
      } else {
        // Mặc định ban đầu là Có mặt
        initialMap[s.id] = { status: 'present', note: '' };
      }
    });

    setLocalStatuses(initialMap);
    setIsSavedFeedback(false);
  }, [selectedClassId, selectedDate, classStudents, attendance, currentClass]);

  // Chuyển đổi trạng thái điểm danh
  // QUY TẮC: ai trong trạng thái có mặt/đi muộn thì phần ghi chú không hiện lên (note = '')
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setLocalStatuses((prev) => {
      const current = prev[studentId] || { status: 'present', note: '' };
      // Nếu chuyển sang có mặt hoặc đi muộn: xóa nội dung ghi chú theo đúng nghiệp vụ
      const nextNote = (newStatus === 'present' || newStatus === 'late') ? '' : current.note;
      return {
        ...prev,
        [studentId]: {
          status: newStatus,
          note: nextNote
        }
      };
    });
    setIsSavedFeedback(false);
  };

  // Cập nhật ghi chú cho học sinh (chỉ hiển thị khi có phép hoặc không phép)
  const handleNoteChange = (studentId: string, note: string) => {
    setLocalStatuses((prev) => {
      const current = prev[studentId] || { status: 'excused', note: '' };
      return {
        ...prev,
        [studentId]: {
          ...current,
          note
        }
      };
    });
    setIsSavedFeedback(false);
  };

  // Đánh dấu cả lớp có mặt
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = { status: 'present', note: '' };
    });
    setLocalStatuses(updated);
    setIsSavedFeedback(false);
    addToast({
      type: 'info',
      title: 'Đã cập nhật',
      message: `Đã đánh dấu tất cả ${classStudents.length} học sinh Có mặt.`
    });
  };

  // Lưu điểm danh vào hệ thống
  const handleSave = () => {
    if (classStudents.length === 0) return;

    const recordsToSave: AttendanceRecord[] = classStudents.map((s) => {
      const entry = localStatuses[s.id] || { status: 'present', note: '' };
      return {
        id: `att-${s.id}-${selectedDate}`,
        date: selectedDate,
        classId: selectedClassId,
        studentId: s.id,
        studentName: s.fullName,
        studentCode: s.studentCode,
        status: entry.status,
        note: (entry.status === 'excused' || entry.status === 'unexcused') ? (entry.note || '') : ''
      };
    });

    saveAttendanceBatch(recordsToSave);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 3000);
  };

  // Thống kê nhanh sĩ số & tỉ lệ chuyên cần
  const counters = useMemo(() => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let unexcused = 0;

    Object.values(localStatuses).forEach((item) => {
      if (item.status === 'present') present++;
      else if (item.status === 'late') late++;
      else if (item.status === 'excused') excused++;
      else if (item.status === 'unexcused') unexcused++;
    });

    const total = classStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return { present, late, excused, unexcused, total, rate };
  }, [localStatuses, classStudents.length]);

  return (
    <div className="space-y-6">
      {/* Thông báo nếu tài khoản chưa có quyền giáo viên/admin */}
      {!canEdit && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
              Bạn đang ở vai trò <strong className="font-bold uppercase">({activeUser.role})</strong> (chế độ xem). Để thao tác lưu điểm danh và duyệt lý do nghỉ, vui lòng chuyển sang quyền Giáo viên hoặc Ban Giám Hiệu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchRole('teacher')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
          >
            Chuyển quyền Giáo viên
          </button>
        </div>
      )}

      {/* 1. Header trên cùng (Chữ to, rõ ràng theo phong cách đồng bộ) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Điểm Danh Chuyên Cần
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Sổ theo dõi chuyên cần điện tử, cập nhật sĩ số và phân loại lý do nghỉ học chính xác theo từng hàng
          </p>
        </div>

        {/* Nút hành động trên cùng */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs"
                title="Đánh dấu tất cả học sinh trong lớp là có mặt"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cả lớp có mặt</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs ${
                  isSavedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isSavedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã lưu thành công!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu điểm danh</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Chế độ chỉ xem (Khóa chỉnh sửa)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DÒNG ĐIỀU KHIỂN & CHỈ SỐ HÀNG NGANG TRÊN CÙNG (ĐÃ ĐƯỢC CHỈNH TO, SẮC NÉT & KHÔNG BỊ CHÌM MÀU) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Bộ chọn Ngày & Lớp học */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Chọn Ngày */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                Ngày Điểm Danh
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    selectedDate === todayStr
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Hôm nay
                </button>
              </div>
            </div>

            {/* Chọn Lớp Học */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                Lớp Học
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name} ({c.room || 'Phòng học'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DÒNG THỐNG KÊ HÀNG NGANG (To hơn, màu sắc rực rỡ và rõ ràng trên cả nền sáng lẫn tối) */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Có mặt */}
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-300 dark:border-emerald-600/80 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Có mặt:</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs sm:text-sm">
                {counters.present}
              </span>
            </div>

            {/* Đi muộn */}
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 border border-amber-300 dark:border-amber-600/80 text-amber-900 dark:text-amber-200 flex items-center gap-2 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Đi muộn:</span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-600 text-white font-extrabold text-xs sm:text-sm">
                {counters.late}
              </span>
            </div>

            {/* Có phép */}
            <div className="px-3.5 py-2 rounded-xl bg-sky-500/15 dark:bg-sky-500/25 border border-sky-300 dark:border-sky-600/80 text-sky-900 dark:text-sky-200 flex items-center gap-2 shadow-2xs">
              <CalendarCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Có phép:</span>
              <span className="px-2 py-0.5 rounded-lg bg-sky-600 text-white font-extrabold text-xs sm:text-sm">
                {counters.excused}
              </span>
            </div>

            {/* Không phép */}
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/15 dark:bg-rose-500/25 border border-rose-300 dark:border-rose-600/80 text-rose-900 dark:text-rose-200 flex items-center gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Không phép:</span>
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-xs sm:text-sm">
                {counters.unexcused}
              </span>
            </div>

            {/* Sĩ số & Tỉ lệ chuyên cần */}
            <div className="px-4 py-2 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-300 dark:border-indigo-600/80 text-indigo-950 dark:text-indigo-200 flex items-center gap-2 shadow-2xs">
              <span className="text-xs sm:text-sm font-bold">Sĩ số: {counters.total} HS</span>
              <span className="h-4 w-px bg-indigo-300 dark:bg-indigo-700" />
              <span className="text-xs sm:text-sm font-bold">Tỉ lệ:</span>
              <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                {counters.rate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BẢNG ĐIỂM DANH: GIAO DIỆN PHẦN TRẮNG VÀ XÁM (THEO ĐÚNG TIÊU CHUẨN ĐÃ CHỈ) */}
      {classStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title={`Chưa có danh sách học sinh trong lớp ${currentClass?.name || ''}`}
          description="Vui lòng chọn lớp học khác có học sinh hoặc chuyển sang phần Quản lí Học sinh để phân lớp."
        />
      ) : (
        /* Vùng xám bên ngoài bao bọc các hàng học sinh màu trắng */
        <div className="bg-slate-300 dark:bg-slate-700/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-slate-600 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs sm:text-sm border-separate border-spacing-y-2.5 sm:border-spacing-y-3">
              <thead>
                {/* HÀNG TIÊU ĐỀ BẢNG TRÊN CÙNG: ĐÃ ĐƯỢC CHỈNH TO VÀ RÕ NÉT */}
                <tr className="text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm tracking-wide">
                  <th className="py-3 px-3.5 w-12 text-center">STT</th>
                  <th className="py-3 px-3.5 w-32">Mã HS</th>
                  <th className="py-3 px-3.5 w-56">Họ và Tên Học Sinh</th>
                  <th className="py-3 px-3.5 text-center w-80">Trạng Thái Điểm Danh</th>
                  <th className="py-3 px-3.5">Ghi Chú / Lý Do Vắng (Có phép & Không phép)</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, idx) => {
                  const entry = localStatuses[s.id] || { status: 'present', note: '' };
                  const isPresentOrLate = entry.status === 'present' || entry.status === 'late';
                  const isExcused = entry.status === 'excused';
                  const isUnexcused = entry.status === 'unexcused';

                  return (
                    <tr
                      key={s.id}
                      className="group transition-all duration-150"
                    >
                      {/* Cột 1: STT */}
                      <td className="py-3.5 px-3.5 text-center first:rounded-l-2xl border-y first:border-l border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold tabular-nums group-hover:border-indigo-400">
                        {idx + 1}
                      </td>

                      {/* Cột 2: Mã HS */}
                      <td className="py-3.5 px-3.5 border-y border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 font-bold group-hover:border-indigo-400">
                        {s.studentCode}
                      </td>

                      {/* Cột 3: Họ và Tên */}
                      <td className="py-3.5 px-3.5 border-y border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white group-hover:border-indigo-400">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {s.fullName.slice(-1)}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetail(s)}
                            className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Bấm để xem hồ sơ học sinh & liên hệ phụ huynh"
                          >
                            <span className="block font-bold text-slate-900 dark:text-white leading-tight">
                              {s.fullName}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              PH: {s.parentName || 'Chưa cập nhật'} · {s.parentPhone || ''}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Cột 4: Bộ chọn Trạng thái điểm danh (4 nút bấm tiện lợi khi có quyền, hoặc Thẻ trạng thái khi chỉ xem) */}
                      <td className="py-3.5 px-3.5 border-y border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-indigo-400 text-center">
                        {canEdit ? (
                          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                            {/* 1. Có mặt */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.id, 'present')}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                entry.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs scale-102'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                              }`}
                            >
                              Có mặt
                            </button>

                            {/* 2. Đi muộn */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.id, 'late')}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                entry.status === 'late'
                                  ? 'bg-amber-600 text-white shadow-xs scale-102'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                              }`}
                            >
                              Đi muộn
                            </button>

                            {/* 3. Có phép */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.id, 'excused')}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                entry.status === 'excused'
                                  ? 'bg-sky-600 text-white shadow-xs scale-102'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                              }`}
                            >
                              Có phép
                            </button>

                            {/* 4. Không phép */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.id, 'unexcused')}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                entry.status === 'unexcused'
                                  ? 'bg-rose-600 text-white shadow-xs scale-102'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                              }`}
                            >
                              Không phép
                            </button>
                          </div>
                        ) : (
                          /* Hiển thị cố định cho chế độ chỉ xem của Học sinh / Phụ huynh */
                          <div className="inline-flex items-center justify-center">
                            {entry.status === 'present' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Có mặt
                              </span>
                            )}
                            {entry.status === 'late' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs shadow-2xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                Đi muộn
                              </span>
                            )}
                            {entry.status === 'excused' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 font-bold text-xs shadow-2xs">
                                <CalendarCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                                Có phép
                              </span>
                            )}
                            {entry.status === 'unexcused' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-bold text-xs shadow-2xs">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                Không phép
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Cột 5: GHI CHÚ / LÝ DO VẮNG (NGHIỆP VỤ: CÓ MẶT/ĐI MUỘN THÌ ẨN, CÓ PHÉP & KHÔNG PHÉP THÌ HIỆN) */}
                      <td className="py-3.5 px-3.5 last:rounded-r-2xl border-y last:border-r border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-indigo-400">
                        {isPresentOrLate ? (
                          /* TRẠNG THÁI CÓ MẶT / ĐI MUỘN: PHẦN GHI CHÚ KHÔNG HIỆN LÊN THEO ĐÚNG YÊU CẦU */
                          <div className="flex items-center gap-2 py-1">
                            {entry.status === 'present' ? (
                              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium italic">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500/80 shrink-0" />
                                <span>Có mặt — Không cần ghi chú</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium italic">
                                <Clock className="w-4 h-4 text-amber-500/80 shrink-0" />
                                <span>Đi muộn — Không cần ghi chú</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* TRẠNG THÁI CÓ PHÉP HOẶC KHÔNG PHÉP: HIỆN PHẦN GHI CHÚ RIÊNG CỦA TỪNG HÀNG */
                          canEdit ? (
                            <div className="space-y-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={entry.note}
                                  onChange={(e) => handleNoteChange(s.id, e.target.value)}
                                  placeholder={
                                    isExcused
                                      ? "Lý do có phép: Bị sốt, khám bệnh, việc gia đình, đám tang..."
                                      : "Lý do vắng không phép: Chưa liên lạc được, gia đình chưa rõ..."
                                  }
                                  className={`w-full px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border-2 shadow-2xs focus:outline-none focus:ring-2 transition-all ${
                                    isExcused
                                      ? 'border-sky-400 dark:border-sky-500 bg-sky-50/60 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-sky-500'
                                      : 'border-rose-400 dark:border-rose-500 bg-rose-50/60 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-rose-500'
                                  }`}
                                />
                              </div>

                              {/* Gợi ý lý do nhanh bằng 1 click */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                  Lý do nhanh:
                                </span>
                                {(isExcused
                                  ? ['Bị sốt / ốm', 'Khám bệnh', 'Việc gia đình', 'Có đơn xin phép']
                                  : ['Chưa liên lạc được', 'Gia đình chưa báo', 'Trốn tiết / Vắng tự do', 'Đang gọi phụ huynh']
                                ).map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleNoteChange(s.id, tag)}
                                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold transition-all ${
                                      entry.note === tag
                                        ? isExcused
                                          ? 'bg-sky-600 text-white border-sky-600'
                                          : 'bg-rose-600 text-white border-rose-600'
                                        : isExcused
                                          ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-slate-700'
                                          : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* Chế độ chỉ xem đối với học sinh/phụ huynh: hiển thị lý do dạng badge đọc */
                            <div className="py-1">
                              {entry.note ? (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                                  isExcused
                                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800'
                                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                                }`}>
                                  <span>Lý do:</span>
                                  <strong>{entry.note}</strong>
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                                  Chưa ghi nhận lý do cụ thể
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal chi tiết học sinh khi bấm vào tên học sinh trên bảng điểm danh */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          isOpen={true}
          onClose={() => setSelectedStudentForDetail(null)}
        />
      )}
    </div>
  );
};
