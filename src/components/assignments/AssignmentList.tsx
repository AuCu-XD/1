import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Assignment } from '../../types';
import { AssignmentFormModal } from './AssignmentFormModal';
import { SubmissionListModal } from './SubmissionListModal';
import { StudentSubmitModal } from './StudentSubmitModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Award,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AssignmentList: React.FC = () => {
  const {
    assignments,
    classes,
    subjects,
    submissions,
    activeUser,
    students,
    deleteAssignment,
    gradeStudentSubmission,
    switchRole
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  // Interactive Open/Close sub-screens state for assignments
  const [expandedAssignmentIds, setExpandedAssignmentIds] = useState<Set<string>>(new Set());

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingSubmissionsAssignment, setViewingSubmissionsAssignment] = useState<Assignment | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Inline grading state
  const [inlineScore, setInlineScore] = useState<Record<string, number>>({});
  const [inlineFeedback, setInlineFeedback] = useState<Record<string, string>>({});

  const isAdmin = activeUser.role === 'admin';
  const isTeacher = activeUser.role === 'teacher';
  const isStudent = activeUser.role === 'student';
  const isParent = activeUser.role === 'parent';
  const canCreate = isAdmin || isTeacher;

  const currentStudent = students.find((s) => s.studentCode === activeUser.identifier) || students[0];

  const filteredAssignments = assignments.filter((a) => {
    const matchClass = selectedClassId === 'all' || a.classId === selectedClassId;
    const matchSubject = selectedSubjectId === 'all' || a.subjectId === selectedSubjectId;
    return matchClass && matchSubject;
  });

  // Gộp 2 nút mở/đóng tất cả thành 1 nút toggle có 2 chức năng
  const isAllExpanded =
    filteredAssignments.length > 0 &&
    filteredAssignments.every((a) => expandedAssignmentIds.has(a.id));

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedAssignmentIds(new Set());
    } else {
      setExpandedAssignmentIds(new Set(filteredAssignments.map((a) => a.id)));
    }
  };

  const toggleAssignmentExpansion = (assignmentId: string) => {
    setExpandedAssignmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
      }
      return next;
    });
  };

  const handleInlineGrade = (subId: string, _maxScore: number) => {
    const score = inlineScore[subId] ?? 9;
    const feedback = inlineFeedback[subId] ?? 'Bài làm đạt yêu cầu.';
    gradeStudentSubmission(subId, score, feedback);
  };

  // MÀN HÌNH DÀNH RIÊNG CHO TÀI KHOẢN PHỤ HUYNH
  // Tài khoản phụ huynh KHÔNG CÓ màn hình giao/nộp bài tập, chỉ có thể xem điểm con của mình
  if (isParent) {
    const childStudent = students[0]; // Học sinh quan hệ là con của phụ huynh
    const childSubmissions = submissions.filter((sub) => sub.studentId === childStudent.id);

    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                Quyền hạn tài khoản Phụ huynh: Chế độ chỉ xem điểm số của con
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                Tài khoản Phụ huynh không quản lý giao bài hoặc làm bài tập. Hệ thống chỉ cho phép phụ huynh theo dõi tiến độ học tập và điểm số các bài tập của con mình (<strong>{childStudent.fullName}</strong> - Lớp {childStudent.classId}).
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => switchRole('teacher')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
                >
                  Chuyển sang quyền Giáo viên (để giao bài)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Khung xem điểm bài tập của con */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Bảng Điểm Bài Tập Của Con: {childStudent.fullName}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mã định danh học sinh: {childStudent.studentCode} · Điểm trung bình bài tập: <strong className="text-indigo-600 font-bold">8.8/10</strong>
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.map((assignment) => {
              const submission = childSubmissions.find((s) => s.assignmentId === assignment.id);
              const subject = subjects.find((sub) => sub.id === assignment.subjectId);

              return (
                <div key={assignment.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{subject?.name || 'Môn học'}</span>
                      <span>·</span>
                      <span>Hạn nộp: {assignment.dueDate}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {submission && submission.score !== undefined ? (
                      <div>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                          {submission.score}/{assignment.maxScore} điểm
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {submission.feedback || 'Đạt yêu cầu chuẩn'}
                        </p>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        Đang làm bài
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isStudent ? 'Bài Tập Về Nhà' : 'Giao Bài Tập'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {isStudent
              ? 'Danh sách bài tập cần hoàn thành, xem hạn nộp và điểm số đánh giá từ giáo viên'
              : 'Giao bài tập từ tài khoản Giáo viên đến học sinh, theo dõi tiến độ nộp bài và chấm điểm'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Nút gộp chung 2 chức năng Ẩn / Hiện tất cả */}
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors border shadow-2xs ${
              isAllExpanded
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
            title={isAllExpanded ? 'Đóng tất cả chi tiết bài tập' : 'Mở rộng tất cả chi tiết bài tập'}
          >
            {isAllExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Đóng tất cả</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Hiện tất cả</span>
              </>
            )}
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setEditingAssignment(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Giao bài tập mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Lọc theo lớp học:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-44 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.gradeLevel} Khối)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Lọc theo môn học:
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full sm:w-44 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="Chưa có bài tập nào"
          description={canCreate ? 'Nhấn "Giao bài tập mới" để gửi bài tập đến học sinh.' : 'Hiện tại chưa có bài tập nào cần làm.'}
          icon={FileText}
          actionLabel={canCreate ? 'Giao bài tập ngay' : undefined}
          onAction={
            canCreate
              ? () => {
                  setEditingAssignment(null);
                  setIsFormOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((assignment) => {
            const assignmentSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);
            const mySubmission = isStudent
              ? assignmentSubmissions.find((s) => s.studentId === currentStudent.id)
              : null;
            const targetClass = classes.find((c) => c.id === assignment.classId);
            const targetSubject = subjects.find((s) => s.id === assignment.subjectId);
            const isExpanded = expandedAssignmentIds.has(assignment.id);

            return (
              <div
                key={assignment.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => toggleAssignmentExpansion(assignment.id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {targetClass?.name || 'Tất cả lớp'}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {targetSubject?.name || 'Môn học'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        Hạn: {assignment.dueDate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {assignment.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                    {isStudent ? (
                      mySubmission ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã nộp bài {mySubmission.score !== undefined && `(${mySubmission.score}/${assignment.maxScore}đ)`}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSubmittingAssignment(assignment)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                        >
                          Nộp bài làm
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingSubmissionsAssignment(assignment)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          DS nộp bài ({assignmentSubmissions.length})
                        </button>

                        {canCreate && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAssignment(assignment);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Sửa bài tập"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAssignmentToDelete(assignment)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Xóa bài tập"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Sub-screen expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        Nội dung hướng dẫn chi tiết
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                        {assignment.description}
                      </p>
                    </div>

                    {/* Quick grading table for teacher if there are submissions */}
                    {canCreate && assignmentSubmissions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Chấm điểm nhanh ({assignmentSubmissions.length} học sinh đã nộp)
                          </h4>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                          {assignmentSubmissions.map((sub) => {
                            const student = students.find((s) => s.id === sub.studentId);
                            return (
                              <div key={sub.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {student?.fullName || 'Học sinh'}
                                  </span>
                                  <span className="text-slate-400 text-[11px] block mt-0.5">
                                    Nộp lúc: {sub.submittedAt} · {sub.content ? sub.content.slice(0, 40) + '...' : 'Đã nộp bài làm'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={assignment.maxScore}
                                    defaultValue={sub.score ?? 9}
                                    onChange={(e) =>
                                      setInlineScore((prev) => ({ ...prev, [sub.id]: Number(e.target.value) }))
                                    }
                                    className="w-16 px-2 py-1 border rounded text-center font-bold text-indigo-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Nhận xét..."
                                    defaultValue={sub.feedback || ''}
                                    onChange={(e) =>
                                      setInlineFeedback((prev) => ({ ...prev, [sub.id]: e.target.value }))
                                    }
                                    className="w-36 sm:w-48 px-2 py-1 border rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleInlineGrade(sub.id, assignment.maxScore)}
                                    className="px-2.5 py-1 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                                  >
                                    Lưu
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tạo/sửa bài tập */}
      <AssignmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAssignment(null);
        }}
        initialAssignment={editingAssignment}
      />

      {/* Modal xem danh sách nộp bài */}
      {viewingSubmissionsAssignment && (
        <SubmissionListModal
          assignment={viewingSubmissionsAssignment}
          isOpen={true}
          onClose={() => setViewingSubmissionsAssignment(null)}
        />
      )}

      {/* Modal học sinh nộp bài */}
      {submittingAssignment && (
        <StudentSubmitModal
          assignment={submittingAssignment}
          isOpen={true}
          onClose={() => setSubmittingAssignment(null)}
        />
      )}

      {/* Modal xác nhận xóa bài tập */}
      <ConfirmModal
        isOpen={!!assignmentToDelete}
        title="Xóa bài tập"
        message={`Bạn có chắc chắn muốn xóa bài tập "${assignmentToDelete?.title}"? Tất cả bài làm của học sinh sẽ bị mất.`}
        confirmLabel="Xác nhận xóa"
        isDanger={true}
        onConfirm={() => {
          if (assignmentToDelete) {
            deleteAssignment(assignmentToDelete.id);
            setAssignmentToDelete(null);
          }
        }}
        onClose={() => setAssignmentToDelete(null)}
      />
    </div>
  );
};
