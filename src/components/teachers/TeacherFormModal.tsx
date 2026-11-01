import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Teacher } from '../../types';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTeacher?: Teacher | null;
  onTeacherCreated?: (teacher: Teacher) => void;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  initialTeacher,
  onTeacherCreated
}) => {
  const { teachers, classes, subjects, addTeacher, updateTeacher } = useApp();

  const [teacherCode, setTeacherCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subjectSpecialty, setSubjectSpecialty] = useState('');
  const [isHomeroom, setIsHomeroom] = useState(false);
  const [homeroomClassName, setHomeroomClassName] = useState('');
  const [status, setStatus] = useState<Teacher['status']>('Đang công tác');
  const [joinDate, setJoinDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTeacher) {
      setTeacherCode(initialTeacher.teacherCode);
      setFullName(initialTeacher.fullName);
      setEmail(initialTeacher.email);
      setPhone(initialTeacher.phone);
      setSubjectSpecialty(initialTeacher.subjectSpecialty);
      setIsHomeroom(initialTeacher.isHomeroom);
      setHomeroomClassName(initialTeacher.homeroomClassName || '');
      setStatus(initialTeacher.status);
      setJoinDate(initialTeacher.joinDate);
    } else {
      const nextNum = teachers.length + 1;
      const formattedNum = nextNum < 10 ? `10${nextNum}` : nextNum;
      setTeacherCode(`GV-${formattedNum}`);
      setFullName('');
      setEmail('');
      setPhone('');
      setSubjectSpecialty(subjects[0]?.name || 'Toán học');
      setIsHomeroom(false);
      setHomeroomClassName('');
      setStatus('Đang công tác');
      setJoinDate('2022-09-01');
    }
    setErrors({});
  }, [initialTeacher, isOpen, teachers.length, subjects]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!teacherCode.trim()) {
      newErrors.teacherCode = 'Mã giáo viên không được để trống';
    } else if (
      !initialTeacher &&
      teachers.some((t) => t.teacherCode.toUpperCase() === teacherCode.trim().toUpperCase())
    ) {
      newErrors.teacherCode = 'Mã giáo viên đã tồn tại';
    }

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Họ và tên giáo viên phải từ 3 ký tự trở lên';
    }

    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!phone.trim() || !/^[0-9+ ]{9,15}$/.test(phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (9-15 chữ số)';
    }

    if (!subjectSpecialty) {
      newErrors.subjectSpecialty = 'Vui lòng chọn bộ môn giảng dạy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialTeacher) {
      updateTeacher(initialTeacher.id, {
        teacherCode: teacherCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subjectSpecialty,
        isHomeroom,
        homeroomClassName: isHomeroom ? homeroomClassName : undefined,
        status,
        joinDate
      });
    } else {
      const createdTeacher = addTeacher({
        teacherCode: teacherCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subjectSpecialty,
        isHomeroom,
        homeroomClassName: isHomeroom ? homeroomClassName : undefined,
        status,
        joinDate
      });
      if (onTeacherCreated) {
        onTeacherCreated(createdTeacher);
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTeacher ? 'Chỉnh Sửa Thông Tin Giáo Viên' : 'Thêm Giáo Viên Mới'}
      subtitle="Thiết lập thông tin cán bộ giảng dạy và phân công chuyên môn"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mã giáo viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value)}
              placeholder="Ví dụ: GV-105"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {errors.teacherCode && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.teacherCode}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ và tên giáo viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Thầy Trần Quang Tuấn"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email công vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuan.tq@edumanage.edu.vn"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {errors.phone && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Chuyên môn giảng dạy <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectSpecialty}
              onChange={(e) => setSubjectSpecialty(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  Môn {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trạng thái công tác
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Teacher['status'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="Đang công tác">Đang công tác</option>
              <option value="Nghỉ phép">Nghỉ phép</option>
              <option value="Thỉnh giảng">Thỉnh giảng</option>
            </select>
          </div>
        </div>

        {/* Homeroom Assignment */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isHomeroom}
              onChange={(e) => setIsHomeroom(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:bg-slate-700"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Kiêm nhiệm giáo viên chủ nhiệm (GVCN)
            </span>
          </label>

          {isHomeroom && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Chọn lớp chủ nhiệm
              </label>
              <select
                value={homeroomClassName}
                onChange={(e) => setHomeroomClassName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Chọn lớp chủ nhiệm --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    Lớp {c.name} ({c.room})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            {initialTeacher ? 'Lưu thay đổi' : 'Thêm giáo viên'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
