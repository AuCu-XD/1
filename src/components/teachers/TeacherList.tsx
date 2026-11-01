import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Teacher } from '../../types';
import { TeacherFormModal } from './TeacherFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  BookOpen
} from 'lucide-react';

export const TeacherList: React.FC = () => {
  const { teachers, activeUser, deleteTeacher } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const isAdmin = activeUser.role === 'admin';

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm);

    const matchesSubject = selectedSubject === 'all' || t.subjectSpecialty === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(teachers.map((t) => t.subjectSpecialty)));

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Đội Ngũ Giáo Viên
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Hồ sơ cán bộ giáo viên, phân công bộ môn và giáo viên chủ nhiệm toàn trường
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingTeacher(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giáo viên</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 neon-card-box">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên giáo viên, mã GV, email, số điện thoại..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-white"
          >
            <option value="all">Tất cả bộ môn</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>
                Môn {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Grid */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Không tìm thấy giáo viên"
          description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc bộ môn."
          actionLabel={isAdmin ? 'Thêm giáo viên mới' : undefined}
          onAction={() => {
            setSearchTerm('');
            setSelectedSubject('all');
            if (isAdmin) {
              setEditingTeacher(null);
              setIsFormOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100 text-sm">
                      {t.fullName.charAt(t.fullName.lastIndexOf(' ') + 1) || t.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{t.fullName}</h3>
                      <span className="text-[11px] font-mono text-slate-400 block">{t.teacherCode}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeacher(t);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Chỉnh sửa giáo viên"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeacherToDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa giáo viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Chuyên môn: <strong className="text-slate-800">{t.subjectSpecialty}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{t.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {t.isHomeroom && t.homeroomClassName ? (
                  <span className="font-semibold text-indigo-700">
                    GVCN Lớp {t.homeroomClassName}
                  </span>
                ) : (
                  <span className="text-slate-400">Giáo viên bộ môn</span>
                )}
                <span className="text-[11px] text-slate-500">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Form Modal */}
      <TeacherFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTeacher(null);
        }}
        initialTeacher={editingTeacher}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={() => {
          if (teacherToDelete) {
            deleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          }
        }}
        title="Xác Nhận Xóa Giáo Viên"
        message={`Bạn có chắc muốn xóa giáo viên ${teacherToDelete?.fullName} (${teacherToDelete?.teacherCode}) khỏi hệ thống trường học?`}
      />
    </div>
  );
};
