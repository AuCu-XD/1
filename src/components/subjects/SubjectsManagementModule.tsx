import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Subject } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldAlert,
  Layers,
  GraduationCap,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  FileQuestion
} from 'lucide-react';

interface SubjectsManagementModuleProps {
  onNavigateToQuestionBank?: () => void;
}

export const SubjectsManagementModule: React.FC<SubjectsManagementModuleProps> = ({
  onNavigateToQuestionBank
}) => {
  const { subjects, teachers, activeUser, addSubject, updateSubject, deleteSubject, addToast } = useApp();

  // RBAC: Chỉ Quản trị viên và Giáo viên được phép truy cập
  const canManage = activeUser.role === 'admin' || activeUser.role === 'teacher';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCoeff, setFilterCoeff] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectCoeff, setSubjectCoeff] = useState<number>(1);
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(3);

  // Delete confirmation
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  if (!canManage) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Quyền truy cập bị giới hạn</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Chỉ tài khoản <strong>Quản trị viên</strong> và <strong>Giáo viên</strong> mới có quyền xem và cấu hình danh mục Quản lý môn học.
          Vui lòng chuyển đổi vai trò ở góc phải phía trên để tiếp tục.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectCoeff(1);
    setPeriodsPerWeek(3);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj: Subject) => {
    setEditingSubject(subj);
    setSubjectName(subj.name);
    setSubjectCode(subj.code);
    setSubjectCoeff(subj.coefficient);
    setPeriodsPerWeek(subj.periodsPerWeek);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = subjectName.trim();
    if (!trimmedName) {
      addToast({
        type: 'error',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập tên môn học.'
      });
      return;
    }

    const autoCode = subjectCode.trim() || trimmedName.slice(0, 3).toUpperCase();

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: trimmedName,
        code: autoCode,
        coefficient: subjectCoeff,
        periodsPerWeek: periodsPerWeek || 3
      });
    } else {
      addSubject({
        name: trimmedName,
        code: autoCode,
        coefficient: subjectCoeff,
        periodsPerWeek: periodsPerWeek || 3
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    deleteSubject(id);
    setDeletingSubjectId(null);
  };

  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch =
      subj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subj.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoeff =
      filterCoeff === 'all' || subj.coefficient.toString() === filterCoeff;
    return matchesSearch && matchesCoeff;
  });

  const coeff2Count = subjects.filter((s) => s.coefficient === 2).length;
  const coeff1Count = subjects.filter((s) => s.coefficient === 1).length;
  const totalPeriods = subjects.reduce((acc, curr) => acc + (curr.periodsPerWeek || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Quản Lý Môn Học
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subjects.length} môn
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Danh mục môn học chính khóa, hệ số tính điểm và số tiết/tuần trong chương trình đào tạo
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToQuestionBank && (
            <button
              type="button"
              onClick={onNavigateToQuestionBank}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <FileQuestion className="w-4 h-4 text-indigo-400" />
              <span>Ngân hàng câu hỏi</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm môn học mới</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng số môn</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{subjects.length}</p>
          <span className="text-[11px] text-slate-500">Môn học hiện hành</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Môn hệ số 2</span>
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{coeff2Count}</p>
          <span className="text-[11px] text-slate-500">Toán, Văn, Ngoại ngữ...</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Môn hệ số 1</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{coeff1Count}</p>
          <span className="text-[11px] text-slate-500">Môn tính điểm tiêu chuẩn</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng số tiết/tuần</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 font-mono">{totalPeriods}</p>
          <span className="text-[11px] text-slate-500">Khung chương trình chuẩn</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên môn học hoặc mã môn..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Lọc hệ số:</span>
          <select
            value={filterCoeff}
            onChange={(e) => setFilterCoeff(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              Tất cả hệ số
            </option>
            <option value="2" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              Hệ số 2
            </option>
            <option value="1" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              Hệ số 1
            </option>
          </select>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subj) => {
          const matchingTeachers = teachers.filter(
            (t) => t.subjectSpecialty && subj.name.toLowerCase().includes(t.subjectSpecialty.toLowerCase())
          );

          return (
            <div
              key={subj.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
                    {subj.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{subj.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">Mã: {subj.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(subj)}
                    title="Chỉnh sửa môn học"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSubjectId(subj.id)}
                    title="Xóa môn học"
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Hệ số tính điểm</span>
                  <span
                    className={`inline-block font-bold text-xs ${
                      subj.coefficient === 2 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    Hệ số {subj.coefficient}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Số tiết / tuần</span>
                  <span className="font-bold text-sky-400 text-xs">
                    {subj.periodsPerWeek} tiết/tuần
                  </span>
                </div>
              </div>

              {matchingTeachers.length > 0 && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">
                    Phụ trách: {matchingTeachers.map((t) => t.fullName).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
          <p className="text-sm font-semibold text-slate-300">Không tìm thấy môn học nào</p>
          <p className="text-xs text-slate-500">Thử tìm kiếm với từ khóa khác hoặc bấm nút thêm môn học mới.</p>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Môn Học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingSubject ? 'Chỉnh Sửa Môn Học' : 'Thêm Mới Môn Học'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cập nhật danh mục môn học trong toàn trường
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên môn học <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Ví dụ: Tin học ứng dụng, Kỹ năng sống..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mã môn học
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="VD: TIN, KNS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hệ số môn
                  </label>
                  <select
                    value={subjectCoeff}
                    onChange={(e) => setSubjectCoeff(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value={1} className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Hệ số 1
                    </option>
                    <option value={2} className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Hệ số 2
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Số tiết / tuần
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={periodsPerWeek}
                  onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  {editingSubject ? 'Cập nhật môn học' : 'Lưu môn học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Xác nhận xóa môn học?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hành động này sẽ xóa môn học khỏi danh mục đào tạo của hệ thống.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubjectId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deletingSubjectId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
