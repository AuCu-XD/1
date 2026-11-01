import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Assignment } from '../../types';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssignment?: Assignment | null;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  initialAssignment
}) => {
  const { classes, subjects, activeUser, addAssignment, updateAssignment } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState<number>(10);
  const [attachmentName, setAttachmentName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAssignment) {
      setTitle(initialAssignment.title);
      setDescription(initialAssignment.description);
      setClassId(initialAssignment.classId);
      setSubjectId(initialAssignment.subjectId);
      setDueDate(initialAssignment.dueDate.slice(0, 16));
      setMaxScore(initialAssignment.maxScore);
      setAttachmentName(initialAssignment.attachmentName || '');
    } else {
      setTitle('');
      setDescription('');
      setClassId(classes[0]?.id || '');
      setSubjectId(subjects[0]?.id || '');
      // Default due 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().slice(0, 16));
      setMaxScore(10);
      setAttachmentName('');
    }
    setErrors({});
  }, [initialAssignment, isOpen, classes, subjects]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề bài tập';
    if (!description.trim()) newErrors.description = 'Vui lòng nhập hướng dẫn làm bài';
    if (!classId) newErrors.classId = 'Vui lòng chọn lớp được giao';
    if (!subjectId) newErrors.subjectId = 'Vui lòng chọn môn học';
    if (!dueDate) newErrors.dueDate = 'Vui lòng chọn hạn chót nộp bài';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const targetClass = classes.find((c) => c.id === classId);
    const targetSubject = subjects.find((s) => s.id === subjectId);

    if (initialAssignment) {
      updateAssignment(initialAssignment.id, {
        title: title.trim(),
        description: description.trim(),
        classId,
        className: targetClass?.name || '',
        subjectId,
        subjectName: targetSubject?.name || '',
        dueDate,
        maxScore,
        attachmentName: attachmentName.trim() || undefined
      });
    } else {
      addAssignment({
        title: title.trim(),
        description: description.trim(),
        classId,
        className: targetClass?.name || '',
        subjectId,
        subjectName: targetSubject?.name || '',
        teacherId: activeUser.id,
        teacherName: activeUser.name,
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate,
        maxScore,
        attachmentName: attachmentName.trim() || undefined
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAssignment ? 'Chỉnh Sửa Bài Tập' : 'Giao Bài Tập Mới'}
      subtitle="Thiết lập nội dung yêu cầu, thời hạn nộp và tài liệu hướng dẫn"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tiêu đề bài tập <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Ôn tập chương 2 - Hàm số bậc hai"
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
          />
          {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Giao cho lớp <span className="text-rose-500">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Môn học <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  Môn {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hạn chót nộp bài <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {errors.dueDate && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thang điểm tối đa
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Mô tả yêu cầu và hướng dẫn làm bài <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nêu rõ bài tập từ trang bao nhiêu, yêu cầu làm ra vở hay file đính kèm..."
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {errors.description && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tên file tài liệu đính kèm (nếu có)
          </label>
          <input
            type="text"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="Ví dụ: De_Kiem_Tra_Mau.pdf"
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
            {initialAssignment ? 'Lưu thay đổi' : 'Giao bài tập'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
