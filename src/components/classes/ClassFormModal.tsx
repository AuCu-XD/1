import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { SchoolClass } from '../../types';
import { Lock } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: SchoolClass | null;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  initialClass
}) => {
  const { teachers, addClass, updateClass } = useApp();

  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  // Bố cục năm học nhỏ gọn gồm 2 ô: 1 ô nhập năm bắt đầu, 1 ô tự động khóa năm kết thúc (start + 1)
  const [startYear, setStartYear] = useState<string>('2024');
  const [room, setRoom] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(40);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tự động tính năm kết thúc là năm tiếp theo (+1) và không thay đổi được
  const endYear = useMemo(() => {
    const parsed = parseInt(startYear, 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2099) {
      return (parsed + 1).toString();
    }
    return '';
  }, [startYear]);

  useEffect(() => {
    if (initialClass) {
      setName(initialClass.name);
      setGradeLevel(initialClass.gradeLevel);

      // Parse academic year
      const match = initialClass.academicYear.match(/(\d{4})\s*-\s*(\d{4})/);
      if (match) {
        setStartYear(match[1]);
      } else {
        setStartYear('2024');
      }

      setRoom(initialClass.room);
      setHomeroomTeacherId(initialClass.homeroomTeacherId);
      setMaxCapacity(initialClass.maxCapacity);
    } else {
      setName('');
      setGradeLevel(10);
      setStartYear('2024');
      setRoom('');
      setHomeroomTeacherId(teachers[0]?.id || '');
      setMaxCapacity(40);
    }
    setErrors({});
  }, [initialClass, isOpen, teachers]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Vui lòng nhập tên lớp (ví dụ: 10A1 hoặc 10A1 Chuyên Tin)';
    if (!room.trim()) newErrors.room = 'Vui lòng nhập phòng học (ví dụ: Phòng B201)';
    if (maxCapacity < 1 || maxCapacity > 60) newErrors.maxCapacity = 'Sĩ số tối đa từ 1 đến 60 học sinh';

    const parsedStart = parseInt(startYear, 10);
    if (!startYear || isNaN(parsedStart) || parsedStart < 2000 || parsedStart > 2099) {
      newErrors.academicYear = 'Năm học không hợp lệ (nhập năm 2000 - 2099)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const teacher = teachers.find((t) => t.id === homeroomTeacherId);
    const teacherName = teacher ? teacher.fullName : '';
    const academicYear = endYear ? `${startYear} - ${endYear}` : `${startYear} - ${parseInt(startYear, 10) + 1}`;

    if (initialClass) {
      updateClass(initialClass.id, {
        name: name.trim().toUpperCase(),
        gradeLevel,
        academicYear,
        room: room.trim(),
        homeroomTeacherId,
        homeroomTeacherName: teacherName,
        maxCapacity
      });
    } else {
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
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialClass ? 'Chỉnh Sửa Thông Tin Lớp Học' : 'Thêm Lớp Học Mới'}
      subtitle="Thiết lập thông tin khối lớp, niên khóa và giáo viên chủ nhiệm"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: 10A1, 10A1 Chuyên Tin..."
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
          />
          {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Khối lớp <span className="text-rose-500">*</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={10}>Khối 10</option>
              <option value={11}>Khối 11</option>
              <option value={12}>Khối 12</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sĩ số tối đa
            </label>
            <input
              type="number"
              min={10}
              max={60}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800"
            />
            {errors.maxCapacity && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.maxCapacity}</p>
            )}
          </div>
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
            <p className="text-[11px] text-rose-500 mt-1">{errors.academicYear}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Phòng học <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Ví dụ: Phòng B201"
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800"
          />
          {errors.room && <p className="text-[11px] text-rose-500 mt-1">{errors.room}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Giáo viên chủ nhiệm <span className="text-rose-500">*</span>
          </label>
          <select
            value={homeroomTeacherId}
            onChange={(e) => setHomeroomTeacherId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">-- Chọn giáo viên --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.teacherCode} - Môn {t.subjectSpecialty})
              </option>
            ))}
          </select>
          {errors.homeroomTeacherId && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.homeroomTeacherId}</p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            {initialClass ? 'Lưu Thay Đổi' : 'Tạo Lớp'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
