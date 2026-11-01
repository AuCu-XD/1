import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ThemeMode, NeonColor } from '../../types';
import { Modal } from '../common/Modal';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Eye,
  Palette,
  ShieldCheck,
  Check,
  Ban,
  Info,
  Database,
  Cloud,
  CheckCircle,
  RefreshCw,
  UploadCloud,
  Layers,
  Table,
  ArrowRight
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

export const SystemDataView: React.FC = () => {
  const {
    classes,
    students,
    teachers,
    subjects,
    grades,
    attendance,
    assignments,
    submissions,
    announcements,
    availableUsers,
    firebaseUser,
    isFirestoreSyncing,
    firestoreTableCounts,
    syncAllDataToFirestore,
    refreshFirestoreCounts,
    themeMode,
    neonColor,
    setThemeMode,
    setNeonColor,
    resetAppSettings
  } = useApp();

  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);

  const neonOptions: Array<{
    id: NeonColor;
    label: string;
    sublabel: string;
    colorHex: string;
    borderClass: string;
    textClass: string;
    bgClass: string;
  }> = [
    {
      id: 'none',
      label: 'Không có',
      sublabel: 'Tắt toàn bộ hiệu ứng viền & phát sáng neon',
      colorHex: '#94a3b8',
      borderClass: 'border-slate-300 dark:border-slate-700',
      textClass: 'text-slate-500 dark:text-slate-400',
      bgClass: 'bg-slate-100 dark:bg-slate-800'
    },
    {
      id: 'cyan',
      label: 'Cyan (Lam Ngọc)',
      sublabel: 'Sắc xanh lam neon công nghệ cao, dịu mắt',
      colorHex: '#06b6d4',
      borderClass: 'border-cyan-500 shadow-cyan-500/20',
      textClass: 'text-cyan-600 dark:text-cyan-400',
      bgClass: 'bg-cyan-50 dark:bg-cyan-950/40'
    },
    {
      id: 'emerald',
      label: 'Emerald (Ngọc Bích)',
      sublabel: 'Xanh lục tươi sáng, tự nhiên và hài hòa',
      colorHex: '#10b981',
      borderClass: 'border-emerald-500 shadow-emerald-500/20',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      id: 'violet',
      label: 'Violet (Tím Huyền Bí)',
      sublabel: 'Tím neon sang trọng, nghệ thuật và tương phản tốt',
      colorHex: '#a855f7',
      borderClass: 'border-purple-500 shadow-purple-500/20',
      textClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50 dark:bg-purple-950/40'
    },
    {
      id: 'amber',
      label: 'Amber (Vàng Hổ Phách)',
      sublabel: 'Ánh vàng ấm áp, tạo cảm giác thư giãn buổi tối',
      colorHex: '#f59e0b',
      borderClass: 'border-amber-500 shadow-amber-500/20',
      textClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40'
    },
    {
      id: 'rose',
      label: 'Rose (Hồng Ánh Kim)',
      sublabel: 'Hồng phấn neon hiện đại, cá tính nổi bật',
      colorHex: '#f43f5e',
      borderClass: 'border-rose-500 shadow-rose-500/20',
      textClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50 dark:bg-rose-950/40'
    },
    {
      id: 'sky',
      label: 'Sky (Xanh Da Trời)',
      sublabel: 'Lam da trời thanh dịu, tươi mát và tập trung',
      colorHex: '#0284c7',
      borderClass: 'border-sky-500 shadow-sky-500/20',
      textClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-50 dark:bg-sky-950/40'
    },
    {
      id: 'fuchsia',
      label: 'Fuchsia (Tím Sen)',
      sublabel: 'Tím sen rực rỡ, độc đáo và phong cách',
      colorHex: '#d946ef',
      borderClass: 'border-fuchsia-500 shadow-fuchsia-500/20',
      textClass: 'text-fuchsia-600 dark:text-fuchsia-400',
      bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/40'
    },
    {
      id: 'lime',
      label: 'Lime (Xanh Chanh)',
      sublabel: 'Xanh chanh trẻ trung, năng động và nổi bật nhẹ',
      colorHex: '#84cc16',
      borderClass: 'border-lime-500 shadow-lime-500/20',
      textClass: 'text-lime-600 dark:text-lime-400',
      bgClass: 'bg-lime-50 dark:bg-lime-950/40'
    }
  ];

  const handleConfirmReset = () => {
    resetAppSettings();
    setIsResetConfirmModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Cài Đặt Hệ Thống</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
          Tùy chỉnh sắc thái màu sắc giao diện và sao lưu khôi phục dữ liệu
        </p>
      </div>

      {/* SECTION: Neon Accent Customization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm neon-border transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Màu Neon Cá Nhân Hóa (Tùy chọn hiển thị)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thêm hiệu ứng viền phát sáng và chữ dạ quang neon để cá nhân hoá phong cách giao diện của bạn. Chọn <strong>&quot;Không có&quot;</strong> nếu muốn giao diện tiêu chuẩn, không hiển thị màu neon.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trạng thái:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              neonColor === 'none'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 neon-text'
            }`}>
              {neonColor === 'none' ? <Ban className="w-3.5 h-3.5 text-slate-400" /> : <Sparkles className="w-3.5 h-3.5" />}
              {neonOptions.find(o => o.id === neonColor)?.label}
            </span>
          </div>
        </div>

        {/* Live Neon Preview Banner */}
        <div className={`mt-5 p-4 rounded-xl border transition-all ${
          neonColor === 'none'
            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            : 'bg-slate-900 text-white neon-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: neonOptions.find(o => o.id === neonColor)?.colorHex }} />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block text-slate-400">
                  Xem trước hiệu ứng hiển thị
                </span>
                <span className={`text-sm font-bold ${neonColor !== 'none' ? 'neon-text' : 'text-slate-900 dark:text-white'}`}>
                  {neonColor === 'none'
                    ? 'Chế độ tiêu chuẩn: Các ô và tiêu đề hiển thị viền đơn sắc bình thường'
                    : `Hiệu ứng Neon ${neonOptions.find(o => o.id === neonColor)?.label} đang kích hoạt trên các viền ô & chữ`}
                </span>
              </div>
            </div>
            {neonColor !== 'none' && (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/40 border border-white/10 text-slate-200 hidden sm:inline">
                Glow Active
              </span>
            )}
          </div>
        </div>

        {/* Neon Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {neonOptions.map((opt) => {
            const isSelected = neonColor === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setNeonColor(opt.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${opt.borderClass} ${opt.bgClass} ring-2 ring-indigo-500/20 shadow-sm`
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: opt.colorHex }}
                      />
                      <span className={`font-bold text-xs ${isSelected ? opt.textClass : 'text-slate-900 dark:text-white'}`}>
                        {opt.label}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {opt.sublabel}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className={`font-semibold ${isSelected ? opt.textClass : 'text-slate-500 dark:text-slate-400'}`}>
                    {isSelected ? 'Đang kích hoạt' : 'Bấm để chọn'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2.5: Cloud Firestore & Firebase Auth Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Trung Tâm Đồng Bộ Toàn Bộ Bảng Dữ Liệu Lên Cloud Firestore</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  Đã kết nối Google Cloud
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu trữ vĩnh viễn toàn bộ bảng dữ liệu vào cơ sở dữ liệu Cloud Firestore thời gian thực trên đám mây của Google
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshFirestoreCounts()}
              disabled={isFirestoreSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
              title="Kiểm tra số lượng bản ghi trên Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFirestoreSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Kiểm tra số lượng</span>
            </button>

            <button
              type="button"
              onClick={() => syncAllDataToFirestore()}
              disabled={isFirestoreSyncing}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              title="Đẩy toàn bộ 10 bảng dữ liệu lên Cloud Firestore"
            >
              <UploadCloud className={`w-4 h-4 ${isFirestoreSyncing ? 'animate-bounce' : ''}`} />
              <span>{isFirestoreSyncing ? 'Đang đồng bộ...' : 'Đồng bộ 10/10 Bảng lên Cloud Firestore'}</span>
            </button>
          </div>
        </div>

        {/* Cloud Credentials Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Google Cloud Project ID:
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all select-all">
              {firebaseConfig.projectId}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Firestore Database ID (Custom Enterprise):
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all select-all">
              {firebaseConfig.firestoreDatabaseId}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Tài Khoản Đăng Nhập Firebase:
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
              {firebaseUser ? `${firebaseUser.displayName || firebaseUser.email} (Đã xác thực)` : 'Chưa đăng nhập (Dùng tài khoản khách)'}
            </span>
          </div>
        </div>

        {/* All Tables Synchronization Status Matrix */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Bảng Thống Kê Trạng Thái Đồng Bộ Các Bảng (Collections)</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              11/11 Bảng đã được cấu hình Cloud Firestore
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3.5">STT</th>
                  <th className="py-2.5 px-3.5">Tên Bảng (Collection)</th>
                  <th className="py-2.5 px-3.5">Nghiệp Vụ Ứng Dụng</th>
                  <th className="py-2.5 px-3.5 text-center">Số Bản Ghi Cục Bộ</th>
                  <th className="py-2.5 px-3.5 text-center">Số Bản Ghi Trên Firestore</th>
                  <th className="py-2.5 px-3.5 text-right">Trạng Thái Kết Nối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {[
                  { id: '1', col: 'classes', name: 'Quản lý Lớp học', count: classes.length, icon: '🏫' },
                  { id: '2', col: 'students', name: 'Hồ sơ Học sinh', count: students.length, icon: '🎓' },
                  { id: '3', col: 'teachers', name: 'Đội ngũ Giáo viên', count: teachers.length, icon: '👨‍🏫' },
                  { id: '4', col: 'subjects', name: 'Danh mục Môn học', count: subjects.length, icon: '📚' },
                  { id: '5', col: 'grades', name: 'Sổ điểm & Đánh giá', count: grades.length, icon: '📊' },
                  { id: '6', col: 'attendance', name: 'Điểm danh chuyên cần', count: attendance.length, icon: '📅' },
                  { id: '7', col: 'assignments', name: 'Bài tập về nhà', count: assignments.length, icon: '📝' },
                  { id: '8', col: 'submissions', name: 'Bài nộp của học sinh', count: submissions.length, icon: '📤' },
                  { id: '9', col: 'announcements', name: 'Bảng tin & Thông báo', count: announcements.length, icon: '📢' },
                  { id: '10', col: 'questions', name: 'Ngân hàng câu hỏi', count: 5, icon: '❓' },
                  { id: '11', col: 'users', name: 'Tài khoản & Phân quyền RBAC', count: availableUsers.length, icon: '👤' }
                ].map((t) => {
                  const cloudCount = firestoreTableCounts[t.col];
                  return (
                    <tr key={t.col} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3.5 font-mono text-slate-400">{t.id}</td>
                      <td className="py-2 px-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <span>{t.icon}</span>
                        <span>{t.col}</span>
                      </td>
                      <td className="py-2 px-3.5 font-medium">{t.name}</td>
                      <td className="py-2 px-3.5 text-center font-bold text-slate-900 dark:text-white">
                        {t.count}
                      </td>
                      <td className="py-2 px-3.5 text-center font-mono">
                        {cloudCount === undefined ? (
                          <span className="text-slate-400">Đang kiểm tra...</span>
                        ) : cloudCount >= 0 ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{cloudCount}</span>
                        ) : (
                          <span className="text-amber-500">Cần đăng nhập</span>
                        )}
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã chuyển sang Firestore
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Bottom App Settings Reset Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm neon-border transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Cài Đặt Lại Ứng Dụng (Khôi Phục Giao Diện Mặc Định)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Tùy chọn này sẽ đặt lại toàn bộ màu sắc, hiệu ứng neon và chuyển đổi giao diện về chủ đề màu trắng ban đầu.
              <strong className="text-emerald-600 dark:text-emerald-400 ml-1">
                Toàn bộ dữ liệu lớp học, học sinh, điểm số, bài tập và giáo viên hoàn toàn không bị xoá.
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetConfirmModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-xs shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Cài đặt lại ứng dụng</span>
          </button>
        </div>
      </div>

      {/* Reset Settings Confirmation Modal with thorough description */}
      <Modal
        isOpen={isResetConfirmModalOpen}
        onClose={() => setIsResetConfirmModalOpen(false)}
        title="Xác Nhận Cài Đặt Lại Ứng Dụng"
        subtitle="Khôi phục màu sắc và cài đặt chung về mặc định"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Informational description panel */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-2 leading-relaxed">
              <p className="font-semibold text-sm">
                Bạn sắp thiết lập lại cấu hình giao diện của EduManage Pro:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Chủ đề giao diện:</strong> Đưa về chế độ màu trắng sáng mặc định như hiện tại (Light Mode).
                </li>
                <li>
                  <strong>Hiệu ứng màu Neon:</strong> Đặt về trạng thái <strong>&quot;Không có&quot;</strong> (tắt toàn bộ viền và chữ dạ quang).
                </li>
                <li>
                  <strong>Cài đặt chung:</strong> Các tùy chọn hiển thị và giao diện cá nhân hóa sẽ được đặt về cấu hình ban đầu.
                </li>
              </ul>
            </div>
          </div>

          {/* Safety confirmation assurance */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <strong>An toàn tuyệt đối:</strong> Thao tác này <u>KHÔNG</u> xoá bất kỳ dữ liệu lớp học, điểm số, học sinh hay tài khoản nào trong hệ thống.
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Bạn có chắc chắn muốn xác nhận và thiết lập lại chủ đề, màu sắc của ứng dụng?
          </p>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsResetConfirmModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận thiết lập lại</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
