import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { NavigationTab } from './Sidebar';
import { Menu, ArrowRightLeft, Bell, Sparkles, ArrowUp, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { RoleSwitcherModal } from './RoleSwitcherModal';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  onSelectTab?: (tab: NavigationTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentTab, onOpenMobileSidebar, onSelectTab }) => {
  const { activeUser, firebaseUser, signInWithGoogle, signOutGoogle, isFirebaseAuthLoading } = useApp();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isScrolledPastTitle, setIsScrolledPastTitle] = useState(false);

  // Theo dõi vị trí cuộn trang để làm hiệu ứng "bay lên trên" vào thanh header khi chữ lớn đã bị che hoàn toàn
  useEffect(() => {
    const handleScroll = () => {
      // Khi đã cuộn qua hơn 55px (làm che phần chữ lớn ở trang), chữ nhỏ sẽ vuốt nhẹ bay lên cạnh tên EduManage Pro
      const scrolled = window.scrollY > 55;
      setIsScrolledPastTitle(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentTab]);

  // Khi chuyển tab, tự động cuộn lên đầu và reset trạng thái tiêu đề thanh header
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsScrolledPastTitle(false);
  }, [currentTab]);

  const getBreadcrumbTitle = (tab: NavigationTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Bảng điều khiển';
      case 'classes':
        return 'Quản lý lớp học';
      case 'students':
        return 'Học Sinh/Phụ huynh';
      case 'teachers':
        return 'Đội ngũ giáo viên';
      case 'gradebook':
        return 'Sổ điểm & Đánh giá';
      case 'attendance':
        return 'Điểm danh chuyên cần';
      case 'timetable':
        return 'Thời khóa biểu trực tiếp';
      case 'assignments':
        return activeUser.role === 'student' ? 'Bài tập về nhà' : 'Giao bài tập';
      case 'quiz':
        return activeUser.role === 'student' ? 'Kiểm tra / Quiz' : 'Tự động chấm bài';
      case 'question_bank':
        return 'Ngân hàng câu hỏi';
      case 'digital_resources':
        return 'Học liệu số';
      case 'ai_assistant':
        return 'AI Hỗ trợ giảng dạy';
      case 'behavior_discipline':
        return 'Hành vi & Nề nếp';
      case 'smart_alerts':
        return 'Thông tin học sinh';
      case 'classroom_tools':
        return 'Công cụ tương tác lớp học';
      case 'lucky_wheel':
        return 'Vòng quay may mắn';
      case 'random_student':
        return 'Chọn học sinh ngẫu nhiên';
      case 'classroom_timer':
        return 'Đồng hồ bấm giờ & Đếm ngược';
      case 'reports':
        return 'Báo cáo tổng kết';
      case 'announcements':
        return 'Bảng tin & Thông báo';
      case 'system_data':
        return 'Cài đặt giao diện & Hệ thống';
      default:
        return 'Hệ thống';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      case 'parent':
        return 'Phụ huynh';
      default:
        return role;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors neon-border">
        {/* Zone 1 & 2: Mobile toggle + Breadcrumb Title with Scroll-Reveal Fly-Up Animation */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            {/* Tên ứng dụng luôn hiển thị */}
            <button
              type="button"
              onClick={() => onSelectTab?.('dashboard')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors shrink-0"
              title="Về màn hình chính (Bảng điều khiển)"
            >
              EduManage Pro
            </button>

            {/* Khi ở trên đầu: ẨN chữ bên cạnh EduManage Pro. Khi kéo xuống che chữ lớn: Vuốt nhẹ bay lên trên như ảnh mẫu số 4 */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out transform ${
                isScrolledPastTitle
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
              }`}
            >
              <span className="text-slate-300 dark:text-slate-600 font-bold" aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 truncate max-w-[200px] sm:max-w-none shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer neon-text group flex items-center gap-1.5"
                title="Nhấp để cuộn nhanh lên đầu trang"
              >
                <span>{getBreadcrumbTitle(currentTab)}</span>
                <ArrowUp className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Zone 3: Quick Action, Google Auth & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Google Auth Button */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-lg text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold hidden lg:inline max-w-[130px] truncate" title={firebaseUser.email || ''}>
                {firebaseUser.displayName?.split(' ').slice(-1)[0] || 'Google'}
              </span>
              <button
                type="button"
                onClick={signOutGoogle}
                title={`Đăng xuất khỏi ${firebaseUser.email}`}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isFirebaseAuthLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-2xs hover:shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
              title="Đăng nhập tài khoản Google để đồng bộ Cloud Firestore"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập Google</span>
            </button>
          )}

          {/* Role Switcher Button */}
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-colors whitespace-nowrap"
            title="Đổi vai trò người dùng"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Đổi vai trò:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {getRoleDisplayName(activeUser.role)}
            </span>
          </button>

          {/* User Avatar & Name badge with graceful long name handling */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {activeUser.avatar ? (
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                {activeUser.name.charAt(activeUser.name.lastIndexOf(' ') + 1) || activeUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden md:block text-left min-w-0">
              <span
                className="block text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[150px] sm:max-w-[200px]"
                title={activeUser.name}
              >
                {activeUser.name}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {activeUser.identifier || activeUser.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Dialog */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onRoleSelect={() => onSelectTab?.('dashboard')}
      />
    </>
  );
};
