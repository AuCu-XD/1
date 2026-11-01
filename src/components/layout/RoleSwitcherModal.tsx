import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { ShieldCheck, GraduationCap, User, Users, Check, LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '../../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect?: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose, onRoleSelect }) => {
  const { activeUser, availableUsers, setActiveUser, firebaseUser, signInWithGoogle, signOutGoogle } = useApp();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return ShieldCheck;
      case 'teacher':
        return GraduationCap;
      case 'student':
        return User;
      case 'parent':
        return Users;
      default:
        return User;
    }
  };

  const getRoleDescription = (u: UserProfile) => {
    switch (u.role) {
      case 'admin':
        return 'Toàn quyền quản trị trường học: xem thống kê, lớp học, học sinh, giáo viên, cấu hình dữ liệu.';
      case 'teacher':
        return 'Giáo viên Toán & GVCN lớp 10A1: điểm danh hôm nay, nhập sổ điểm môn Toán, giao bài tập.';
      case 'student':
        return 'Học sinh Trần Minh Khang (10A1): xem điểm thi, nộp bài tập, theo dõi chuyên cần cá nhân.';
      case 'parent':
        return 'Phụ huynh học sinh Trần Minh Khang: theo dõi kết quả rèn luyện, chuyên cần, nhận thông báo.';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chuyển Đổi Tài Khoản / Vai Trò"
      subtitle="Trải nghiệm và kiểm thử các phân quyền RBAC khác nhau trong hệ thống"
      maxWidth="lg"
    >
      <div className="space-y-3">
        {/* Firebase Google Auth Card */}
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt="Google avatar"
                className="w-10 h-10 rounded-full object-cover border border-indigo-300 dark:border-indigo-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                G
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span>{firebaseUser ? firebaseUser.displayName || 'Tài khoản Google' : 'Firebase Authentication'}</span>
                {firebaseUser && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Đã kết nối
                  </span>
                )}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {firebaseUser ? firebaseUser.email : 'Đăng nhập để đồng bộ dữ liệu vào Cloud Firestore cá nhân'}
              </p>
            </div>
          </div>

          <div>
            {firebaseUser ? (
              <button
                type="button"
                onClick={signOutGoogle}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập Google</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Hoặc chọn vai trò mẫu thử nghiệm (RBAC):
        </div>
        {availableUsers.map((user) => {
          const Icon = getRoleIcon(user.role);
          const isCurrent = activeUser.id === user.id;

          return (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                setActiveUser(user);
                onRoleSelect?.();
                onClose();
              }}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h4>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3.5 h-3.5" />
                      Đang kích hoạt
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {user.email} · {user.identifier}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {getRoleDescription(user)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
