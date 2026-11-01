import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Assignment } from '../../types';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

interface StudentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export const StudentSubmitModal: React.FC<StudentSubmitModalProps> = ({
  isOpen,
  onClose,
  assignment
}) => {
  const { activeUser, students, submitAssignmentWork, submissions } = useApp();

  const [content, setContent] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!assignment) return null;

  const currentStudent = students.find((s) => s.studentCode === activeUser.identifier) || students[0];
  const existingSub = submissions.find(
    (s) => s.assignmentId === assignment.id && s.studentId === currentStudent?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !attachmentName.trim()) {
      setError('Vui lòng nhập nội dung bài làm hoặc đính kèm tên file bài nộp');
      return;
    }

    submitAssignmentWork({
      assignmentId: assignment.id,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentCode: currentStudent.studentCode,
      content: content.trim(),
      attachmentName: attachmentName.trim() || undefined,
      status: 'pending'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nộp Bài Tập"
      subtitle={`${assignment.title} · Môn ${assignment.subjectName} · Lớp ${assignment.className}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {existingSub && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
            <span className="font-bold">Lưu ý:</span> Bạn đã nộp bài vào lúc{' '}
            {new Date(existingSub.submittedAt).toLocaleString('vi-VN')}. Nộp lại sẽ cập nhật bài làm mới nhất.
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nội dung bài làm / Lời nhắn gửi giáo viên <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập câu trả lời hoặc tóm tắt nội dung bài làm của em..."
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            File tài liệu bài tập (PDF, Word, Ảnh bài giải)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Ví dụ: TranMinhKhang_BaiTapToan.pdf"
              className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Hỗ trợ ghi nhận tên tệp nộp bài trực tiếp vào hồ sơ học bạ
          </p>
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Xác nhận nộp bài</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
