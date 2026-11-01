import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  School,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Lock,
  Check,
  UserPlus,
  Users
} from 'lucide-react';
import { TeacherFormModal } from '../teachers/TeacherFormModal';

interface AddNewClassTabProps {
  onSuccess: (newClassId: string) => void;
  onCancel: () => void;
}

export const AddNewClassTab: React.FC<AddNewClassTabProps> = ({ onSuccess, onCancel }) => {
  const { teachers, addClass, classes } = useApp();

  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(10);

  // Bố cục năm học nhỏ gọn gồm 2 ô: 1 ô nhập năm bắt đầu, 1 ô tự động khóa năm kết thúc (start + 1)
  const [startYear, setStartYear] = useState<string>('2024');

  const [room, setRoom] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState(() => teachers[0]?.id || '');
  const [maxCapacity, setMaxCapacity] = useState<number>(40);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động tính năm kết thúc là năm tiếp theo (+1) và không thay đổi được
  const endYear = useMemo(() => {
    const parsed = parseInt(startYear, 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2099) {
      return (parsed + 1).toString();
    }
    return '';
  }, [startYear]);

  // Chuỗi niên khóa được lưu
  const academicYear = endYear ? `${startYear} - ${endYear}` : '';

  // Quick suggestions based on existing classes
  const handleApplyPreset = (presetName: string, grade: number, defaultRoom: string) => {
    setName(presetName);
    setGradeLevel(grade);
    setRoom(defaultRoom);
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Vui lòng nhập tên lớp học (ví dụ: 10A3 hoặc 10A1 Chuyên Tin)';
    } else if (name.trim().length > 50) {
      errs.name = 'Tên lớp học không nên vượt quá 50 ký tự';
    } else if (classes.some((c) => c.name.toUpperCase() === name.trim().toUpperCase())) {
      errs.name = `Tên lớp "${name.trim().toUpperCase()}" đã tồn tại trong trường`;
    }

    if (!room.trim()) {
      errs.room = 'Vui lòng nhập phòng học (ví dụ: Phòng B203)';
    }

    if (!homeroomTeacherId) {
      errs.homeroomTeacherId = 'Vui lòng chỉ định giáo viên chủ nhiệm';
    }

    if (maxCapacity < 10 || maxCapacity > 60) {
      errs.maxCapacity = 'Sĩ số tối đa từ 10 đến 60 học sinh';
    }

    // Điều kiện năm học nhập thủ công & tự động năm kết thúc
    const parsedStart = parseInt(startYear, 10);
    if (!startYear || isNaN(parsedStart) || parsedStart < 2000 || parsedStart > 2099) {
      errs.academicYear = 'Vui lòng nhập năm bắt đầu hợp lệ (từ 2000 đến 2099)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const teacher = teachers.find((t) => t.id === homeroomTeacherId);
    const teacherName = teacher ? teacher.fullName : '';

    const newClassId = `class-${Date.now()}`;
    addClass({
      name: name.trim().toUpperCase(),
      gradeLevel,
      academicYear,
      room: room.trim(),
      homeroomTeacherId,
      homeroomTeacherName: teacherName,
      studentCount: 0,
      maxCapacity
    });

    setIsSubmitting(false);
    onSuccess(newClassId);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs max-w-3xl mx-auto neon-card-box">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Thêm Mới Lớp Học Vào Hệ Thống</span>
          </h3>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Gợi ý khởi tạo nhanh theo khối:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyPreset('10A3', 10, 'Phòng B203')}
            className="px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            + Lớp 10A3 (Phòng B203)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('11A2', 11, 'Phòng C303')}
            className="px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            + Lớp 11A2 (Phòng C303)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('12A2', 12, 'Phòng A102')}
            className="px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            + Lớp 12A2 (Phòng A102)
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Class Name (with support for longer names) & Grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tên lớp học <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {name.length}/50 ký tự
              </span>
            </div>
            <input
              type="text"
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: 10A3 hoặc 10A1 Chuyên Tin - Tự Nhiên..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            {name.trim() && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">
                <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate">Hiển thị chuẩn: <strong>Lớp {name.trim().toUpperCase()}</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Khối lớp <span className="text-rose-500">*</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value={10}>Khối 10 (THPT)</option>
              <option value={11}>Khối 11 (THPT)</option>
              <option value={12}>Khối 12 (THPT)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Room & Compact Academic Year (Bố cục 2 ô: 1 ô nhập năm bắt đầu thủ công, 1 ô tự động khóa năm kết thúc) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phòng học cố định <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Ví dụ: Phòng B203, Phòng A102..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            {errors.room && <p className="text-[11px] text-rose-500 mt-1">{errors.room}</p>}
          </div>

          {/* Ô NĂM HỌC NHỎ GỌN NHƯ CÁC Ô KHÁC - 2 Ô: NHẬP TAY NĂM BẮT ĐẦU & TỰ ĐỘNG KHÓA NĂM TIẾP THEO */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Năm học (Niên khóa) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="2024"
                  min={2000}
                  max={2099}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 bg-white dark:bg-slate-800"
                  title="Nhập thủ công năm bắt đầu"
                />
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-0.5 block truncate">Năm bắt đầu (Nhập tay)</span>
              </div>
              <div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={endYear}
                  placeholder="Tự động..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 cursor-not-allowed select-none shadow-2xs"
                  title="Tự động tính năm tiếp theo và không thể thay đổi"
                />
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-0.5 truncate">
                  <Lock className="w-2.5 h-2.5 shrink-0" /> Tự động khóa (+1)
                </span>
              </div>
            </div>
            {errors.academicYear && (
              <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.academicYear}</p>
            )}
          </div>
        </div>

        {/* Row 3: Homeroom Teacher with "+ Thêm giáo viên" action */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Giáo viên chủ nhiệm (GVCN)</span>
              <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsTeacherModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
              title="Mở màn hình nhập thông tin để thêm giáo viên mới vào hệ thống"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Thêm giáo viên</span>
            </button>
          </div>
          <select
            value={homeroomTeacherId}
            onChange={(e) => {
              if (e.target.value === '__NEW_TEACHER__') {
                setIsTeacherModalOpen(true);
              } else {
                setHomeroomTeacherId(e.target.value);
              }
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">-- Chọn giáo viên chủ nhiệm từ danh sách --</option>
            <option value="__NEW_TEACHER__" className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950">
              ➕ Thêm giáo viên mới vào hệ thống...
            </option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                {t.fullName} ({t.teacherCode} · Môn {t.subjectSpecialty} · {t.phone})
              </option>
            ))}
          </select>
          {errors.homeroomTeacherId && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.homeroomTeacherId}</p>
          )}
        </div>

        {/* Row 4: Sĩ số tối đa - Kéo dài toàn bộ sang bên phải */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Sĩ số tối đa của lớp học <span className="text-rose-500">*</span>
          </label>

          <div className="relative">
            <input
              type="number"
              min={10}
              max={60}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              placeholder="Ví dụ: 40, 45..."
              className="w-full pl-3.5 pr-32 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 bg-white dark:bg-slate-800 shadow-2xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded pointer-events-none select-none">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>học sinh / lớp</span>
            </div>
          </div>

          {errors.maxCapacity && (
            <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.maxCapacity}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Hủy thao tác
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo lớp học'}</span>
          </button>
        </div>
      </form>

      {/* Màn hình ghi thông tin Thêm giáo viên mới */}
      <TeacherFormModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onTeacherCreated={(newTeacher) => {
          setHomeroomTeacherId(newTeacher.id);
          setIsTeacherModalOpen(false);
        }}
      />
    </div>
  );
};
