import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  LayoutDashboard,
  School,
  Users,
  CalendarCheck,
  Calendar,
  FileText,
  FileCheck2,
  HelpCircle,
  FolderArchive,
  Sparkles,
  BookOpen,
  UserCheck,
  Award,
  AlertTriangle,
  Wrench,
  Compass,
  Shuffle,
  Clock,
  Bell,
  BarChart3,
  Settings,
  X,
  Info,
  ChevronDown,
  ChevronRight,
  PlusCircle
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'attendance'
  | 'timetable'
  | 'assignments'
  | 'quiz'
  | 'question_bank'
  | 'digital_resources'
  | 'ai_assistant'
  | 'gradebook'
  | 'behavior_discipline'
  | 'smart_alerts'
  | 'classroom_tools'
  | 'lucky_wheel'
  | 'random_student'
  | 'classroom_timer'
  | 'announcements'
  | 'reports'
  | 'system_data'
  | 'subjects_management';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const { activeUser, classes, assignments } = useApp();

  // Open all 5 main groups by default (as shown in the user's screenshot where all groups have chevron 'v')
  const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(
    new Set(['lop_hoc', 'day_hoc', 'theo_doi', 'tien_ich', 'giao_tiep'])
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId); // Click lần 2: Đóng lại
      } else {
        next.add(groupId); // Click lần 1: Mở ra
      }
      return next;
    });
  };

  const isGroupOpen = (groupId: string) => openGroupIds.has(groupId);

  const handleSelectTab = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel - Full Theme support: Clean White in Light Mode, Rich Slate in Dark Mode */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-r border-slate-200/90 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/90 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              E
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight block leading-tight">
                EduManage Pro
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                Học Đường Thông Minh
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-indigo-200 dark:border-indigo-500/30">
              {activeUser.name.charAt(activeUser.name.lastIndexOf(' ') + 1) || activeUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{activeUser.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeUser.role === 'admin' && 'Ban Giám Hiệu'}
                {activeUser.role === 'teacher' && 'Giáo viên bộ môn'}
                {activeUser.role === 'student' && `Học sinh ${activeUser.identifier || ''}`}
                {activeUser.role === 'parent' && 'Phụ huynh học sinh'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List - Exact 1:1 match with user screenshot */}
        <div className="flex-1 px-3 py-1 space-y-2 overflow-y-auto">
          {/* Quick Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Bảng điều khiển</span>
          </button>

          {/* GROUP 1: LỚP HỌC (4) - Thay thế cho lịch khóa biểu lẻ với tab Thời khóa biểu tập trung */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleGroup('lop_hoc')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white tracking-wider uppercase transition-colors"
            >
              <span>LỚP HỌC (4)</span>
              <span className="flex items-center">
                {isGroupOpen('lop_hoc') ? (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {isGroupOpen('lop_hoc') && (
              <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-3 mt-0.5 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => handleSelectTab('classes')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'classes'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lớp của tôi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('students')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'students'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Học Sinh/Phụ huynh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('attendance')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'attendance'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Điểm danh</span>
                </button>

                {/* Tab Thời khoá biểu theo ảnh ghi chú của người dùng */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('timetable')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'timetable'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Thời khóa biểu</span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 2: DẠY & HỌC (Reordered & role-tailored per user request) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleGroup('day_hoc')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white tracking-wider uppercase transition-colors"
            >
              <span>DẠY & HỌC ({activeUser.role === 'parent' ? 3 : (activeUser.role === 'admin' || activeUser.role === 'teacher' ? 6 : 4)})</span>
              <span className="flex items-center">
                {isGroupOpen('day_hoc') ? (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {isGroupOpen('day_hoc') && (
              <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-3 mt-0.5 animate-in fade-in duration-150">
                {/* 1. VỊ TRÍ TRÊN CÙNG: Ngân hàng câu hỏi */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('question_bank')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'question_bank'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ngân hàng câu hỏi</span>
                </button>

                {/* 2. VỊ TRÍ TIẾP THEO: Giao bài tập (Chỉ hiện cho GV/Admin và Học sinh; Phụ huynh KHÔNG CÓ) */}
                {activeUser.role !== 'parent' && (
                  <button
                    type="button"
                    onClick={() => handleSelectTab('assignments')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                      currentTab === 'assignments'
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4" />
                      <span>{activeUser.role === 'student' ? 'Bài tập về nhà' : 'Giao bài tập'}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {assignments.length}
                    </span>
                  </button>
                )}

                {/* 3. VỊ TRÍ THỨ 3: Tự động chấm bài (Giáo viên) / Kiểm tra & Quiz (Học sinh); Phụ huynh KHÔNG CÓ */}
                {activeUser.role !== 'parent' && (
                  <button
                    type="button"
                    onClick={() => handleSelectTab('quiz')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                      currentTab === 'quiz'
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{activeUser.role === 'student' ? 'Kiểm tra / Quiz' : 'Tự động chấm bài'}</span>
                  </button>
                )}

                {/* 4. VỊ TRÍ THỨ 4: Học liệu số */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('digital_resources')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'digital_resources'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>Học liệu số</span>
                </button>

                {/* 5. VỊ TRÍ AI Hỗ Trợ */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('ai_assistant')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'ai_assistant'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold">AI Hỗ trợ</span>
                </button>

                {/* 6. VỊ TRÍ DƯỚI CÙNG: Quản lý môn học (Chỉ hiển thị cho Giáo viên và Quản trị viên) */}
                {(activeUser.role === 'admin' || activeUser.role === 'teacher') && (
                  <button
                    type="button"
                    onClick={() => handleSelectTab('subjects_management')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                      currentTab === 'subjects_management'
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Quản lý môn học</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* GROUP 3: THEO DÕI & ĐÁNH GIÁ (4) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleGroup('theo_doi')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white tracking-wider uppercase transition-colors"
            >
              <span>THEO DÕI & ĐÁNH GIÁ (4)</span>
              <span className="flex items-center">
                {isGroupOpen('theo_doi') ? (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {isGroupOpen('theo_doi') && (
              <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-3 mt-0.5 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => handleSelectTab('gradebook')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'gradebook'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Sổ điểm điện tử</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('attendance')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'attendance'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Chuyên cần</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('behavior_discipline')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'behavior_discipline'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Hành vi & Nề nếp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('smart_alerts')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                    currentTab === 'smart_alerts'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Cảnh báo thông minh</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                    3
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 4: TIỆN ÍCH LỚP HỌC (4) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleGroup('tien_ich')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white tracking-wider uppercase transition-colors"
            >
              <span>TIỆN ÍCH LỚP HỌC (4)</span>
              <span className="flex items-center">
                {isGroupOpen('tien_ich') ? (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {isGroupOpen('tien_ich') && (
              <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-3 mt-0.5 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => handleSelectTab('classroom_tools')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'classroom_tools'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Công cụ tương tác</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('lucky_wheel')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'lucky_wheel'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Vòng quay may mắn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('random_student')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'random_student'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Chọn học sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('classroom_timer')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'classroom_timer'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Đồng hồ bấm giờ</span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 5: GIAO TIẾP & BÁO CÁO (3) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleGroup('giao_tiep')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white tracking-wider uppercase transition-colors"
            >
              <span>GIAO TIẾP & BÁO CÁO (3)</span>
              <span className="flex items-center">
                {isGroupOpen('giao_tiep') ? (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {isGroupOpen('giao_tiep') && (
              <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-3 mt-0.5 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => handleSelectTab('announcements')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'announcements'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Thông báo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('reports')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'reports'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  <span>Báo cáo tổng kết</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('system_data')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2.5 ${
                    currentTab === 'system_data'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Cài đặt</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center justify-between">
            <span>Năm học 2024 - 2025</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">HK1</span>
          </div>
        </div>
      </aside>
    </>
  );
};
