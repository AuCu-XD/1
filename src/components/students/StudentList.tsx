import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Student } from '../../types';
import { StudentFormModal } from './StudentFormModal';
import { StudentImportModal } from './StudentImportModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ExportImportService } from '../../services/exportImportService';
import {
  Users,
  UserCheck,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CalendarCheck,
  Phone,
  Mail,
  MapPin,
  Maximize2,
  Minimize2,
  MessageSquare,
  Send,
  Copy,
  Check,
  Award,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { getAcademicClassification, formatScore } from '../../utils/gradeCalculations';

export const StudentList: React.FC = () => {
  const { students, classes, subjects, grades, attendance, activeUser, deleteStudent, addToast } = useApp();

  // Active Tab: 'students' (Học sinh) | 'parents' (Phụ huynh) - Matching Image 2
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Interactive Open/Close state for student internal screens
  const [expandedStudentIds, setExpandedStudentIds] = useState<Set<string>>(new Set());
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Quick message modal for parents
  const [messagingParent, setMessagingParent] = useState<Student | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageChannel, setMessageChannel] = useState<'zalo' | 'sms'>('zalo');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const isAdmin = activeUser.role === 'admin';
  const isTeacher = activeUser.role === 'teacher';
  const canModify = isAdmin || isTeacher;

  // Filtered list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentPhone.includes(searchTerm) ||
        s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchTerm, selectedClassId, selectedStatus]);

  // Pagination slice
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId); // Click lần 2: Đóng lại
      } else {
        next.add(studentId); // Click lần 1: Mở ra
      }
      return next;
    });
  };

  const toggleParentExpansion = (studentId: string) => {
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (activeTab === 'students') {
      setExpandedStudentIds(new Set(paginatedStudents.map((s) => s.id)));
    } else {
      setExpandedParentIds(new Set(paginatedStudents.map((s) => s.id)));
    }
  };

  const handleCollapseAll = () => {
    setExpandedStudentIds(new Set());
    setExpandedParentIds(new Set());
  };

  const isAllExpanded = useMemo(() => {
    if (paginatedStudents.length === 0) return false;
    const currentSet = activeTab === 'students' ? expandedStudentIds : expandedParentIds;
    return paginatedStudents.every((s) => currentSet.has(s.id));
  }, [activeTab, paginatedStudents, expandedStudentIds, expandedParentIds]);

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      handleCollapseAll();
    } else {
      handleExpandAll();
    }
  };

  const handleExportCsv = () => {
    const className = classes.find((c) => c.id === selectedClassId)?.name || 'Toan_Truong';
    ExportImportService.exportStudentsToCsv(filteredStudents, className);
  };

  const handleCopyPhone = (phone: string, name: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    addToast({
      type: 'success',
      title: 'Đã sao chép số điện thoại',
      message: `Đã lưu số ${phone} của phụ huynh ${name} vào bộ nhớ tạm.`
    });
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const handleOpenMessageModal = (student: Student) => {
    setMessagingParent(student);
    setMessageContent(
      `Kính gửi phụ huynh em ${student.fullName} (Lớp ${student.className}), nhà trường xin thông báo tình hình học tập và nề nếp tháng này của em hiện đạt mức tốt. Trân trọng cảm ơn quý phụ huynh đồng hành!`
    );
  };

  const handleSendMessage = () => {
    if (!messagingParent) return;
    addToast({
      type: 'success',
      title: `Đã gửi thông điệp ${messageChannel.toUpperCase()} thành công`,
      message: `Thông điệp đã được gửi trực tiếp tới phụ huynh ${messagingParent.parentName} (${messagingParent.parentPhone}).`
    });
    setMessagingParent(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header: Quản lí Học Sinh, Phụ Huynh (To hơn theo yêu cầu) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Học Sinh/Phụ huynh
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Hồ sơ học sinh toàn diện, danh bạ phụ huynh và sổ liên lạc điện tử kết nối nhà trường - gia đình
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* Quick toggle open/close all (Gộp chung thành 1 nút có 2 chức năng: ẩn/hiện tất cả) */}
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all shadow-2xs ${
              isAllExpanded
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={isAllExpanded ? "Thu gọn / Ẩn tất cả hồ sơ" : "Mở rộng / Hiện tất cả hồ sơ"}
          >
            {isAllExpanded ? (
              <>
                <Minimize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Ẩn tất cả</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Hiện tất cả</span>
              </>
            )}
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            title="Xuất dữ liệu học sinh ra file CSV"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Xuất CSV</span>
          </button>

          {/* Import button */}
          {canModify && (
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
              title="Nhập danh sách học sinh từ file CSV"
            >
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Nhập file</span>
            </button>
          )}

          {/* Add Student */}
          {canModify && (
            <button
              type="button"
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher: Học sinh & Phụ huynh (Có dạng Tab như hình đính kèm Image 2) */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-700/80 shadow-md">
          {/* Tab 1: Học sinh */}
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'students'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'students' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Học sinh</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
              activeTab === 'students' ? 'text-indigo-300' : 'text-slate-500'
            }`}>
              ({filteredStudents.length})
            </span>
          </button>

          {/* Tab 2: Phụ huynh (Theo hình ảnh đính kèm) */}
          <button
            type="button"
            onClick={() => setActiveTab('parents')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'parents'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'parents' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Phụ huynh</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
              activeTab === 'parents' ? 'text-indigo-300' : 'text-slate-500'
            }`}>
              ({filteredStudents.length})
            </span>
          </button>
        </div>

        {/* Quick summary stats pill */}
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Tổng số: <strong className="text-slate-900 dark:text-white font-bold">{students.length}</strong> học sinh</span>
          <span aria-hidden="true">·</span>
          <span><strong className="text-slate-900 dark:text-white font-bold">{classes.length}</strong> lớp học</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 neon-card-box">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              activeTab === 'students'
                ? "Tìm theo mã học sinh, họ tên, số điện thoại phụ huynh, địa chỉ..."
                : "Tìm theo tên phụ huynh, số điện thoại, tên con, email, địa chỉ..."
            }
            className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs font-medium"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang học">Đang học</option>
            <option value="Nghỉ phép">Nghỉ phép</option>
            <option value="Đã chuyển trường">Đã chuyển trường</option>
          </select>
        </div>
      </div>

      {/* Main Table Container: Phần Trắng và Xám (Khớp chính xác với ảnh ghi chú đính kèm Image 1) */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={activeTab === 'students' ? Users : UserCheck}
          title={activeTab === 'students' ? "Không tìm thấy học sinh nào" : "Không tìm thấy thông tin phụ huynh nào"}
          description="Vui lòng thử lại với từ khóa tìm kiếm hoặc bộ lọc lớp học khác."
          actionLabel={canModify ? 'Tiếp nhận học sinh mới' : undefined}
          onAction={() => {
            setSearchTerm('');
            setSelectedClassId('all');
            setSelectedStatus('all');
            if (canModify) {
              setEditingStudent(null);
              setIsFormOpen(true);
            }
          }}
        />
      ) : (
        /* Vùng xám bên ngoài chứa các thẻ học sinh màu trắng (phần trắng và xám) */
        <div className="bg-slate-300 dark:bg-slate-700/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-slate-600 shadow-sm">
          <div className="overflow-x-auto">
            {activeTab === 'students' ? (
              /* TAB 1: DANH SÁCH HỌC SINH (Thẻ trắng trên nền xám theo ảnh Image 1) */
              <table className="w-full min-w-[1050px] text-left text-xs sm:text-sm border-separate border-spacing-y-2.5 sm:border-spacing-y-3">
                <thead>
                  <tr className="text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm tracking-wide">
                    <th className="py-2.5 px-3 w-8"></th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Mã HS</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Họ và Tên</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Lớp</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Giới tính</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Điểm TB</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Học lực</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Phụ huynh</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Màn hình / Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s) => {
                    const isExpanded = expandedStudentIds.has(s.id);
                    const classification = getAcademicClassification(s.gpa || 8.0);
                    const studentGrades = grades.filter((g) => g.studentId === s.id);
                    const studentAttendance = attendance.filter((a) => a.studentId === s.id);

                    return (
                      <React.Fragment key={s.id}>
                        {/* Hàng học sinh màu trắng (phần trắng) nổi bật trên nền xám */}
                        <tr
                          onClick={() => toggleStudentExpansion(s.id)}
                          className="cursor-pointer transition-all shadow-xs hover:shadow-md group"
                        >
                          {/* Chevron icon */}
                          <td className="py-3.5 px-3 first:rounded-l-xl bg-white text-slate-400 group-hover:text-indigo-600 whitespace-nowrap">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-indigo-600 font-bold" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </td>

                          {/* Mã HS */}
                          <td className="py-3.5 px-3 font-mono text-slate-800 font-bold bg-white text-xs sm:text-sm whitespace-nowrap">
                            {s.studentCode}
                          </td>

                          {/* Họ và Tên */}
                          <td className="py-3.5 px-3 font-bold text-slate-900 bg-white text-sm sm:text-base group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                            <span className="whitespace-nowrap" title={s.fullName}>
                              {s.fullName}
                            </span>
                          </td>

                          {/* Lớp */}
                          <td className="py-3.5 px-3 font-bold text-blue-600 bg-white text-xs sm:text-sm whitespace-nowrap">
                            {s.className}
                          </td>

                          {/* Giới tính */}
                          <td className="py-3.5 px-3 text-slate-700 font-medium bg-white text-xs sm:text-sm whitespace-nowrap">
                            {s.gender}
                          </td>

                          {/* Điểm TB */}
                          <td className="py-3.5 px-3 font-mono font-bold text-indigo-700 bg-white tabular-nums text-sm sm:text-base whitespace-nowrap">
                            {s.gpa ? s.gpa.toFixed(1) : '-'}
                          </td>

                          {/* Học lực */}
                          <td className={`py-3.5 px-3 font-semibold ${classification.color} bg-white text-xs sm:text-sm whitespace-nowrap`}>
                            <span className="whitespace-nowrap">{classification.label}</span>
                          </td>

                          {/* Phụ huynh */}
                          <td className="py-3.5 px-3 bg-white text-slate-700 whitespace-nowrap">
                            <span className="font-semibold text-slate-900 block text-xs sm:text-sm whitespace-nowrap" title={s.parentName}>
                              {s.parentName}
                            </span>
                            <span className="block text-[11px] sm:text-xs font-mono text-slate-500 tracking-wide whitespace-nowrap">
                              {s.parentPhone}
                            </span>
                          </td>

                          {/* Trạng thái - đảm bảo không bao giờ bị rớt dòng thành Đang \n học */}
                          <td className="py-3.5 px-3 bg-white whitespace-nowrap">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 inline-flex items-center justify-center shadow-2xs whitespace-nowrap">
                              {s.status}
                            </span>
                          </td>

                          {/* Màn hình / Thao tác (Nút Mở màu xanh dương nhẹ theo ảnh) */}
                          <td className="py-3.5 px-3 text-right last:rounded-r-xl bg-white whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleStudentExpansion(s.id)}
                                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors border shadow-2xs whitespace-nowrap ${
                                  isExpanded
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-indigo-50/90 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                }`}
                                title={isExpanded ? 'Đóng màn hình học sinh' : 'Mở màn hình chi tiết học sinh'}
                              >
                                {isExpanded ? 'Đóng' : 'Mở'}
                              </button>

                              {canModify && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStudent(s);
                                      setIsFormOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Chỉnh sửa thông tin học sinh"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setStudentToDelete(s)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Xóa học sinh"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Màn hình chi tiết mở rộng ngay dưới thẻ học sinh */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="p-4 sm:p-5 rounded-2xl bg-white text-slate-900 shadow-md border border-indigo-200">
                              <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                      {s.fullName.charAt(s.fullName.lastIndexOf(' ') + 1) || s.fullName.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                                        Màn hình chi tiết: {s.fullName} ({s.studentCode})
                                      </h4>
                                      <span className="text-xs text-slate-500">
                                        Sinh ngày: {s.dateOfBirth} · Địa chỉ: {s.address} · Lớp: {s.className}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleStudentExpansion(s.id)}
                                    className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                                  >
                                    ✕ Đóng màn hình này
                                  </button>
                                </div>

                                {/* Inline mini-transcript */}
                                <div>
                                  <span className="text-xs font-bold text-slate-800 block mb-2">
                                    Bảng điểm chi tiết các môn học (HK1):
                                  </span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                                    {subjects.map((sub) => {
                                      const g = studentGrades.find((grade) => grade.subjectId === sub.id);
                                      return (
                                        <div key={sub.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-2xs">
                                          <span className="text-[11px] text-slate-600 block truncate font-medium">{sub.name}</span>
                                          <span className="font-mono font-bold text-indigo-700 text-xs sm:text-sm tabular-nums">
                                            {formatScore(g?.averageScore)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Attendance & Parent Quick Contact */}
                                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CalendarCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                      Chuyên cần: <strong>{studentAttendance.filter((a) => a.status === 'present').length}</strong> buổi có mặt · <strong>{studentAttendance.filter((a) => a.status === 'late').length}</strong> đi muộn · <strong>{studentAttendance.filter((a) => a.status === 'excused' || a.status === 'unexcused').length}</strong> vắng
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-600">Phụ huynh: <strong>{s.parentName}</strong></span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPhone(s.parentPhone, s.parentName)}
                                      className="flex items-center gap-1 font-mono font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200"
                                      title="Nhấp để sao chép số điện thoại"
                                    >
                                      {copiedPhone === s.parentPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      <span>{s.parentPhone}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* TAB 2: DANH SÁCH PHỤ HUYNH (Theo yêu cầu thêm 1 Tab Phụ huynh) */
              <table className="w-full min-w-[1150px] text-left text-xs sm:text-sm border-separate border-spacing-y-2.5 sm:border-spacing-y-3">
                <thead>
                  <tr className="text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm tracking-wide">
                    <th className="py-2.5 px-3 w-8"></th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Phụ huynh đại diện</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Học sinh (Con)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Lớp học</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Số điện thoại liên hệ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Email liên hệ</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Địa chỉ thường trú</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Kênh liên lạc</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Thao tác nhanh</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s) => {
                    const isExpanded = expandedParentIds.has(s.id);
                    return (
                      <React.Fragment key={`parent-${s.id}`}>
                        {/* Hàng phụ huynh màu trắng nổi bật trên nền xám */}
                        <tr
                          onClick={() => toggleParentExpansion(s.id)}
                          className="cursor-pointer transition-all shadow-xs hover:shadow-md group"
                        >
                          {/* Chevron icon */}
                          <td className="py-3.5 px-3 first:rounded-l-xl bg-white text-slate-400 group-hover:text-indigo-600 whitespace-nowrap">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-indigo-600 font-bold" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </td>

                          {/* Phụ huynh đại diện */}
                          <td className="py-3.5 px-3 bg-white whitespace-nowrap">
                            <div className="flex items-center gap-2.5 whitespace-nowrap">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                                {s.parentName.charAt(s.parentName.lastIndexOf(' ') + 1) || s.parentName.charAt(0)}
                              </div>
                              <div className="whitespace-nowrap">
                                <span className="font-bold text-slate-900 block text-sm sm:text-base group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                                  {s.parentName}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap block">
                                  Phụ huynh học sinh
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Học sinh (Con) */}
                          <td className="py-3.5 px-3 bg-white whitespace-nowrap">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm whitespace-nowrap">
                              {s.fullName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap block">
                              Mã: {s.studentCode}
                            </span>
                          </td>

                          {/* Lớp học */}
                          <td className="py-3.5 px-3 bg-white font-bold text-blue-600 text-xs sm:text-sm whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-bold whitespace-nowrap inline-block">
                              {s.className}
                            </span>
                          </td>

                          {/* Số điện thoại */}
                          <td className="py-3.5 px-3 bg-white whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <a
                                href={`tel:${s.parentPhone}`}
                                className="font-mono font-bold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                                title="Nhấp để thực hiện cuộc gọi"
                              >
                                <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="whitespace-nowrap">{s.parentPhone}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopyPhone(s.parentPhone, s.parentName)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors shrink-0"
                                title="Sao chép SĐT"
                              >
                                {copiedPhone === s.parentPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-3 bg-white text-slate-600 text-xs whitespace-nowrap">
                            <span className="whitespace-nowrap block" title={s.parentEmail}>
                              {s.parentEmail || 'Chưa cập nhật'}
                            </span>
                          </td>

                          {/* Địa chỉ */}
                          <td className="py-3.5 px-3 bg-white text-slate-700 text-xs whitespace-nowrap">
                            <span className="whitespace-nowrap block font-medium" title={s.address}>
                              {s.address}
                            </span>
                          </td>

                          {/* Kênh liên lạc */}
                          <td className="py-3.5 px-3 bg-white whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="whitespace-nowrap">Zalo & SMS</span>
                            </span>
                          </td>

                          {/* Thao tác nhanh */}
                          <td className="py-3.5 px-3 text-right last:rounded-r-xl bg-white whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              {/* Nút gửi tin nhắn Zalo/SMS */}
                              <button
                                type="button"
                                onClick={() => handleOpenMessageModal(s)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                                title="Gửi tin nhắn thông báo hoặc Zalo tới phụ huynh"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="whitespace-nowrap">Nhắn tin</span>
                              </button>

                              {/* Nút xem chi tiết con */}
                              <button
                                type="button"
                                onClick={() => setViewingStudent(s)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                                title="Xem toàn bộ hồ sơ học sinh"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Sửa thông tin */}
                              {canModify && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStudent(s);
                                    setIsFormOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                                  title="Chỉnh sửa thông tin phụ huynh và học sinh"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Màn hình trao đổi phụ huynh mở rộng */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="p-4 sm:p-5 rounded-2xl bg-white text-slate-900 shadow-md border border-emerald-200">
                              <div className="space-y-3 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                                    <span className="font-bold text-sm text-slate-900">
                                      Sổ liên lạc gia đình: Phụ huynh {s.parentName} · Con: {s.fullName} ({s.className})
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleParentExpansion(s.id)}
                                    className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                                  >
                                    ✕ Thu gọn
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="font-bold text-slate-800 block mb-1">📞 Kết nối liên lạc</span>
                                    <p className="text-slate-600">SĐT chính: <strong className="text-slate-900">{s.parentPhone}</strong></p>
                                    <p className="text-slate-600">Email: <strong className="text-slate-900">{s.parentEmail || 'Chưa có'}</strong></p>
                                    <p className="text-slate-600">Địa chỉ: <strong className="text-slate-900">{s.address}</strong></p>
                                  </div>

                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="font-bold text-slate-800 block mb-1">🎓 Tình hình học tập của con</span>
                                    <p className="text-slate-600">Điểm trung bình (GPA): <strong className="text-indigo-600 font-bold font-mono">{s.gpa ? s.gpa.toFixed(1) : '-'}</strong></p>
                                    <p className="text-slate-600">Hạnh kiểm: <strong className="text-emerald-700">{s.conduct || 'Tốt'}</strong></p>
                                    <p className="text-slate-600">Trạng thái: <strong className="text-slate-900">{s.status}</strong></p>
                                  </div>

                                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col justify-between">
                                    <div>
                                      <span className="font-bold text-emerald-900 block mb-1">💬 Hành động kết nối</span>
                                      <p className="text-emerald-800 text-[11px]">
                                        Gửi thông báo nhanh về lịch học, điểm thi hoặc gửi tin nhắn SMS/Zalo trao đổi.
                                      </p>
                                    </div>
                                    <div className="pt-2 flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenMessageModal(s)}
                                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                                      >
                                        Soạn tin nhắn ngay
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-300 dark:border-slate-600 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span>
                Hiển thị trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong> (
                {filteredStudents.length} mục)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 border border-slate-400 dark:border-slate-500 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-800 dark:text-slate-100" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 border border-slate-400 dark:border-slate-500 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4 text-slate-800 dark:text-slate-100" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Message Modal for Parent Communication */}
      {messagingParent && (
        <Modal
          isOpen={!!messagingParent}
          onClose={() => setMessagingParent(null)}
          title={`Gửi Tin Nhắn Cho Phụ Huynh: ${messagingParent.parentName}`}
          subtitle={`Học sinh: ${messagingParent.fullName} · Lớp: ${messagingParent.className} · SĐT: ${messagingParent.parentPhone}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Chọn kênh gửi tin nhắn:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMessageChannel('zalo')}
                  className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                    messageChannel === 'zalo'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>💬 Zalo Connect</span>
                  {messageChannel === 'zalo' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setMessageChannel('sms')}
                  className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                    messageChannel === 'sms'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>📱 SMS Brandname</span>
                  {messageChannel === 'sms' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              </div>
            </div>

            {/* Message Templates */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Mẫu thông báo nhanh:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMessageContent(
                      `Kính gửi phụ huynh em ${messagingParent.fullName}, nhà trường gửi bảng điểm học tập định kỳ và nề nếp chuyên cần của em tháng này. Điểm GPA hiện tại: ${messagingParent.gpa || 8.0}. Trân trọng!`
                    )
                  }
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
                >
                  📊 Thông báo điểm & chuyên cần
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessageContent(
                      `Kính mời quý phụ huynh em ${messagingParent.fullName} tham dự buổi họp phụ huynh trực tuyến lớp ${messagingParent.className} vào lúc 08:30 sáng Chủ Nhật tuần này. Trân trọng kính mời!`
                    )
                  }
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
                >
                  🗓️ Mời họp phụ huynh
                </button>
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Nội dung tin nhắn:
              </label>
              <textarea
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMessagingParent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi tin nhắn</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        initialStudent={editingStudent}
      />

      {/* CSV Import Modal */}
      <StudentImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* Detail Modal */}
      <StudentDetailModal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        title="Xác Nhận Xóa Hồ Sơ Học Sinh"
        message={`Bạn có chắc chắn muốn xóa học sinh ${studentToDelete?.fullName} (Mã: ${studentToDelete?.studentCode}) khỏi hệ thống? Dữ liệu điểm và chuyên cần liên quan sẽ bị xóa.`}
      />
    </div>
  );
};
