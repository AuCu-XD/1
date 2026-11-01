import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Student } from '../../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudent?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  initialStudent
}) => {
  const { classes, students, addStudent, updateStudent } = useApp();

  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [classId, setClassId] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<Student['status']>('Đang học');
  const [conduct, setConduct] = useState<Student['conduct']>('Tốt');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialStudent) {
      setStudentCode(initialStudent.studentCode);
      setFullName(initialStudent.fullName);
      setGender(initialStudent.gender);
      setDateOfBirth(initialStudent.dateOfBirth);
      setClassId(initialStudent.classId);
      setParentName(initialStudent.parentName);
      setParentPhone(initialStudent.parentPhone);
      setParentEmail(initialStudent.parentEmail || '');
      setAddress(initialStudent.address);
      setStatus(initialStudent.status);
      setConduct(initialStudent.conduct || 'Tốt');
    } else {
      // Auto generate code
      const nextNum = students.length + 1;
      const formattedNum = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : nextNum;
      setStudentCode(`HS-2024-${formattedNum}`);
      setFullName('');
      setGender('Nam');
      setDateOfBirth('2008-01-01');
      setClassId(classes[0]?.id || '');
      setParentName('');
      setParentPhone('');
      setParentEmail('');
      setAddress('');
      setStatus('Đang học');
      setConduct('Tốt');
    }
    setErrors({});
  }, [initialStudent, isOpen, classes, students.length]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!studentCode.trim()) {
      newErrors.studentCode = 'Mã học sinh không được để trống';
    } else if (
      !initialStudent &&
      students.some((s) => s.studentCode.toUpperCase() === studentCode.trim().toUpperCase())
    ) {
      newErrors.studentCode = 'Mã học sinh đã tồn tại trong hệ thống';
    }

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Họ và tên học sinh phải từ 3 ký tự trở lên';
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày tháng năm sinh';
    }

    if (!classId) {
      newErrors.classId = 'Vui lòng phân lớp cho học sinh';
    }

    if (!parentName.trim()) {
      newErrors.parentName = 'Vui lòng nhập tên người giám hộ / phụ huynh';
    }

    if (!parentPhone.trim() || !/^[0-9+ ]{9,15}$/.test(parentPhone.trim())) {
      newErrors.parentPhone = 'Số điện thoại phụ huynh không hợp lệ (9-15 chữ số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const targetClass = classes.find((c) => c.id === classId);
    const className = targetClass ? targetClass.name : '';

    if (initialStudent) {
      updateStudent(initialStudent.id, {
        studentCode: studentCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        gender,
        dateOfBirth,
        classId,
        className,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        address: address.trim(),
        status,
        conduct
      });
    } else {
      addStudent({
        studentCode: studentCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        gender,
        dateOfBirth,
        classId,
        className,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        address: address.trim(),
        status,
        conduct,
        enrollmentDate: new Date().toISOString().split('T')[0],
        gpa: 8.0
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialStudent ? 'Cập Nhật Hồ Sơ Học Sinh' : 'Tiếp Nhận Học Sinh Mới'}
      subtitle="Nhập đầy đủ thông tin học sinh và thông tin liên hệ của phụ huynh"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Student Code & Full name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mã học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Ví dụ: HS-2024-001"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
            {errors.studentCode && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.studentCode}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Trần Minh Khang"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>
            )}
          </div>
        </div>

        {/* Row 2: Gender, DOB, Class */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Giới tính <span className="text-rose-500">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ngày sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {errors.dateOfBirth && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lớp học <span className="text-rose-500">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.room})
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.classId}</p>
            )}
          </div>
        </div>

        {/* Row 3: Parent details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ tên phụ huynh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn Bình"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {errors.parentName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.parentName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại PH <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="Ví dụ: 0903123456"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {errors.parentPhone && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.parentPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email phụ huynh
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Row 4: Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Địa chỉ thường trú
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Row 5: Status & Conduct */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Trạng thái học tập
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Student['status'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Đang học">Đang học</option>
              <option value="Nghỉ phép">Nghỉ phép</option>
              <option value="Đã chuyển trường">Đã chuyển trường</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hạnh kiểm
            </label>
            <select
              value={conduct}
              onChange={(e) => setConduct(e.target.value as Student['conduct'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Tốt">Tốt</option>
              <option value="Khá">Khá</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Yếu">Yếu</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            {initialStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
