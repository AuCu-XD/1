import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Assignment, AssignmentSubmission } from '../../types';
import { CheckCircle2, Clock, FileText, Check } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface SubmissionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export const SubmissionListModal: React.FC<SubmissionListModalProps> = ({
  isOpen,
  onClose,
  assignment
}) => {
  const { submissions, gradeStudentSubmission } = useApp();

  const [activeSubmission, setActiveSubmission] = useState<AssignmentSubmission | null>(null);
  const [scoreInput, setScoreInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [gradeError, setGradeError] = useState<string | null>(null);

  if (!assignment) return null;

  const assignmentSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);

  const handleSelectToGrade = (sub: AssignmentSubmission) => {
    setActiveSubmission(sub);
    setScoreInput(sub.score !== undefined ? String(sub.score) : '9.0');
    setFeedbackInput(sub.feedback || 'Bài làm tốt, trình bày sạch đẹp.');
    setGradeError(null);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    const num = parseFloat(scoreInput);
    if (isNaN(num) || num < 0 || num > assignment.maxScore) {
      setGradeError(`Điểm số phải từ 0 đến ${assignment.maxScore}`);
      return;
    }

    gradeStudentSubmission(activeSubmission.id, num, feedbackInput.trim());
    setActiveSubmission(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Danh Sách Bài Nộp & Chấm Điểm"
      subtitle={`${assignment.title} · Lớp ${assignment.className} · Thang điểm ${assignment.maxScore}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {assignmentSubmissions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Chưa có học sinh nào nộp bài"
            description="Các bài nộp của học sinh sẽ hiển thị ở đây để giáo viên chấm điểm."
          />
        ) : (
          <div className="space-y-3">
            {assignmentSubmissions.map((sub) => {
              const isGraded = sub.status === 'graded';

              return (
                <div
                  key={sub.id}
                  className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{sub.studentName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{sub.studentCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isGraded ? (
                        <div className="text-right">
                          <span className="text-[11px] font-semibold text-emerald-700 block">
                            ✓ Đã chấm: <strong className="font-mono text-sm">{sub.score}</strong>/{assignment.maxScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-600">
                          Chờ chấm điểm
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectToGrade(sub)}
                        className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        {isGraded ? 'Sửa điểm' : 'Chấm điểm'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="line-clamp-2">{sub.content}</p>
                    {sub.attachmentName && (
                      <div className="mt-1 text-[11px] font-mono text-indigo-600">
                        📎 File: {sub.attachmentName}
                      </div>
                    )}
                  </div>

                  {sub.feedback && (
                    <div className="mt-2 text-[11px] text-slate-600 italic">
                      Nhận xét của giáo viên: "{sub.feedback}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Grading drawer/form inside modal */}
        {activeSubmission && (
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3 mt-4">
            <h4 className="text-xs font-bold text-indigo-900">
              Chấm điểm cho: {activeSubmission.studentName} ({activeSubmission.studentCode})
            </h4>

            {gradeError && (
              <p className="text-xs text-rose-600 font-medium">{gradeError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Điểm số (0 - {assignment.maxScore})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={assignment.maxScore}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nhận xét & Lời phê của giáo viên
                </label>
                <input
                  type="text"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Ví dụ: Lập luận chặt chẽ, bài làm xuất sắc..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveGrade}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Lưu kết quả chấm
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
