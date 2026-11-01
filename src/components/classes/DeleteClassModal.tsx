import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SchoolClass } from '../../types';
import { AlertTriangle, Trash2, School, Users, DoorOpen, GraduationCap, Calendar, CheckSquare, Square } from 'lucide-react';

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  classItem: SchoolClass | null;
  studentCount: number;
}

export const DeleteClassModal: React.FC<DeleteClassModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  classItem,
  studentCount
}) => {
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasConfirmedCheckbox(false);
    }
  }, [isOpen, classItem]);

  if (!classItem) return null;

  const canDelete = hasConfirmedCheckbox;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Màn Hình Xác Minh Xóa Lớp Học"
      subtitle="Vui lòng kiểm tra kỹ thông tin trước khi thực hiện xóa"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
            <p className="font-bold text-sm text-rose-800 dark:text-rose-300">
              Bạn có chắc chắn muốn xóa lớp học này không?
            </p>
            <p className="leading-relaxed text-rose-700 dark:text-rose-300/90">
              Hành động này sẽ xóa dữ liệu lớp học khỏi hệ thống. Để bảo vệ dữ liệu, hệ thống yêu cầu bạn xác minh chính xác trước khi hoàn tất xóa.
            </p>
          </div>
        </div>

        {/* Detailed Class Verification Information Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Thông tin lớp cần xóa:
              </span>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              Mã: {classItem.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Tên lớp học</span>
                <strong className="text-slate-900 dark:text-white font-bold text-sm truncate max-w-[150px] block" title={classItem.name}>
                  Lớp {classItem.name}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Khối lớp & Niên khóa</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  Khối {classItem.gradeLevel} · {classItem.academicYear}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Phòng học cố định</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{classItem.room}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Sĩ số học sinh</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {studentCount} / {classItem.maxCapacity} học sinh
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500">Giáo viên chủ nhiệm:</span>
            <strong className="text-slate-800 dark:text-slate-100 font-semibold">{classItem.homeroomTeacherName}</strong>
          </div>
        </div>

        {/* Safety note for students */}
        {studentCount > 0 && (
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            💡 <strong>Lưu ý bảo toàn hồ sơ:</strong> Hiện lớp đang có <strong>{studentCount} học sinh</strong>. Khi xác nhận xóa, các học sinh này sẽ <em>không bị xóa mất</em> mà được tự động chuyển về trạng thái <strong>Chưa xếp lớp</strong> để bạn có thể chuyển sang lớp mới bất kỳ lúc nào.
          </div>
        )}

        {/* Verification Step: Checkbox to confirm only */}
        <div
          onClick={() => setHasConfirmedCheckbox(!hasConfirmedCheckbox)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
            hasConfirmedCheckbox
              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {hasConfirmedCheckbox ? (
            <CheckSquare className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          )}
          <span className="text-xs leading-relaxed font-medium">
            Tôi đã kiểm tra kỹ và xác nhận đồng ý xóa hoàn toàn lớp học <strong className="text-rose-600 dark:text-rose-400 font-bold">"{classItem.name}"</strong> khỏi hệ thống.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Hủy bỏ / Giữ lại lớp
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 dark:disabled:bg-rose-900/40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xác nhận xóa lớp học này</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
