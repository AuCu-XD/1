import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SchoolClass, Student } from '../../types';
import { ClassFormModal } from './ClassFormModal';
import { AddNewClassTab } from './AddNewClassTab';
import { DeleteClassModal } from './DeleteClassModal';
import { EmptyState } from '../common/EmptyState';
import { ClassInternalScreens } from './ClassInternalScreens';
import {
  School,
  Search,
  Users,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  BookOpen,
  PlusCircle,
  Eye
} from 'lucide-react';

type ClassModuleTab = 'my_classes' | 'add_new_class';

export const ClassList: React.FC = () => {
  const { classes, students, activeUser, deleteClass } = useApp();

  // Top level 2 tabs: "Lớp của tôi" & "Thêm mới lớp học"
  const [activeTab, setActiveTab] = useState<ClassModuleTab>('my_classes');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Expand / Collapse state for internal screens (Click lần 1: mở ra, Click lần 2: đóng lại)
  // DEFAULT: EMPTY SET (Tất cả lớp học chỉ hiển thị thanh ngang gọn gàng khi vào màn hình, nhấn vào mới mở chi tiết)
  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(new Set());

  // Delete modal state
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  const canManageClass = activeUser.role === 'admin' || activeUser.role === 'teacher';

  // Filtering
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.homeroomTeacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = selectedGrade === 'all' || cls.gradeLevel === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const getRosterStudents = (classId: string): Student[] => {
    return students.filter((s) => s.classId === classId);
  };

  /**
   * Chức năng Đóng / Mở (Click lần 1: Mở ra màn hình bên trong; Click lần 2: Đóng lại)
   */
  const toggleClassExpansion = (classId: string) => {
    setExpandedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) {
        next.delete(classId); // Click lần 2: Đóng lại tất cả màn hình bên trong
      } else {
        next.add(classId); // Click lần 1: Mở ra màn hình bên trong
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedClassIds(new Set(filteredClasses.map((c) => c.id)));
  };

  const handleCollapseAll = () => {
    setExpandedClassIds(new Set());
  };

  const handleClassCreatedSuccess = (_newClassId: string) => {
    setActiveTab('my_classes');
    // Khi đến màn hình chỉ hiện phần ngang, nhấn vào mới mở chi tiết
    setExpandedClassIds(new Set());
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Top Primary Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản Lý Lớp Học
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Danh sách khối lớp, phòng học chuyên biệt và phân công giáo viên chủ nhiệm
          </p>
        </div>

        {/* 2 Primary Tabs: "Lớp của tôi" & "Thêm mới lớp học" */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('my_classes')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'my_classes'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Lớp của tôi</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'my_classes' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {classes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add_new_class')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'add_new_class'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm mới lớp học</span>
          </button>
        </div>
      </div>

      {/* Tab 2: Thêm mới lớp học View */}
      {activeTab === 'add_new_class' ? (
        <AddNewClassTab
          onSuccess={handleClassCreatedSuccess}
          onCancel={() => setActiveTab('my_classes')}
        />
      ) : (
        /* Tab 1: Lớp của tôi View */
        <div className="space-y-4">
          {/* Quick Actions & Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 neon-card-box">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên lớp, GVCN, phòng học..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Grade tabs filter & Expand/Collapse All */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                {(['all', 10, 11, 12] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedGrade === grade
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {grade === 'all' ? 'Tất cả khối' : `Khối ${grade}`}
                  </button>
                ))}
              </div>

              {/* Quick toggle all buttons */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
                  title="Mở tất cả màn hình bên trong của các lớp"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline">Mở tất cả</span>
                </button>

                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
                  title="Đóng tất cả màn hình bên trong của các lớp"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Đóng tất cả</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of Classes with Open/Close Internal Screens */}
          {filteredClasses.length === 0 ? (
            <EmptyState
              icon={School}
              title="Không tìm thấy lớp học nào"
              description="Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang tab 'Thêm mới lớp học' để tạo lớp."
              actionLabel="Tạo lớp học mới"
              onAction={() => setActiveTab('add_new_class')}
            />
          ) : (
            <div className="space-y-4">
              {filteredClasses.map((cls) => {
                const isExpanded = expandedClassIds.has(cls.id);
                const roster = getRosterStudents(cls.id);
                const actualCount = roster.length > 0 ? roster.length : cls.studentCount;

                return (
                  <div
                    key={cls.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 transition-all neon-card-box ${
                      isExpanded
                        ? 'border-2 border-indigo-400 dark:border-indigo-500/80 ring-4 ring-indigo-500/10 shadow-sm'
                        : 'border-2 border-indigo-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Header Row: Clickable to Toggle Open/Close - Supports long names gracefully */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        onClick={() => toggleClassExpansion(cls.id)}
                        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                        title={isExpanded ? 'Click để đóng lại' : 'Click để mở màn hình bên trong'}
                      >
                        {/* Class Name Badge with graceful support for long names */}
                        <div
                          className={`min-w-10 max-w-[180px] sm:max-w-[220px] px-3 h-10 rounded-xl flex items-center justify-center font-bold text-xs tracking-tight transition-colors shrink-0 text-center truncate shadow-2xs ${
                            isExpanded
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-100 dark:group-hover:bg-slate-700'
                          }`}
                          title={cls.name}
                        >
                          {cls.name}
                        </div>

                        {/* Title and Class Information row with wrapping and tooltips */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                          <span
                            className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-xs sm:max-w-md block"
                            title={`Lớp ${cls.name}`}
                          >
                            Lớp {cls.name}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            Khối {cls.gradeLevel} · {cls.room}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            Năm học: <strong className="text-slate-800 dark:text-slate-200 font-medium">{cls.academicYear}</strong>
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[220px]" title={cls.homeroomTeacherName}>
                            GVCN: <strong className="text-slate-800 dark:text-slate-200 font-medium">{cls.homeroomTeacherName}</strong>
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums whitespace-nowrap">
                            Sĩ số: <strong className="text-slate-800 dark:text-slate-200 font-medium">{actualCount}/{cls.maxCapacity}</strong> học sinh
                          </span>
                        </div>
                      </div>

                      {/* Actions & Interactive Open/Close Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClass(cls);
                              setIsFormOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition-colors border border-amber-200 dark:border-amber-800/70 shadow-2xs"
                            title="Sửa thông tin lớp học"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Sửa lớp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setClassToDelete(cls)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/60 shadow-2xs"
                            title="Xóa lớp học (Mở màn hình xác minh)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Xóa lớp</span>
                          </button>
                        </div>

                        {/* Prominent Open / Close Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleClassExpansion(cls.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                            isExpanded
                              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700/80 shadow-2xs'
                          }`}
                          title={isExpanded ? 'Click để đóng lại' : 'Click để xem chi tiết từng lớp học'}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 text-white" />
                              <span className="truncate max-w-[150px]">Đóng chi tiết</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Xem chi tiết</span>
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Internal Screens (Expands on Click 1, Collapses on Click 2) */}
                    {isExpanded && (
                      <ClassInternalScreens
                        cls={cls}
                        onClose={() => toggleClassExpansion(cls.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Class Modal */}
      <ClassFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClass(null);
        }}
        initialClass={editingClass}
      />

      {/* Dedicated Verification Modal for Deleting Class */}
      <DeleteClassModal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        classItem={classToDelete}
        studentCount={classToDelete ? getRosterStudents(classToDelete.id).length : 0}
        onConfirm={() => {
          if (classToDelete) {
            deleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
      />
    </div>
  );
};
