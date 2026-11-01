import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Announcement } from '../../types';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Calendar,
  AlertCircle,
  Megaphone
} from 'lucide-react';

export const AnnouncementList: React.FC = () => {
  const { announcements, activeUser, deleteAnnouncement, togglePinAnnouncement } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const canPost = activeUser.role === 'admin' || activeUser.role === 'teacher';

  const filtered = announcements.filter((a) => {
    if (selectedAudience === 'all') return true;
    return a.targetAudience === selectedAudience;
  });

  // Sort pinned first
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bảng Tin & Thông Báo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Kênh truyền thông nội bộ, thông báo lịch thi, nghỉ lễ và sự kiện toàn trường
          </p>
        </div>

        {canPost && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn thông báo</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {[
          { id: 'all', label: 'Tất cả thông báo' },
          { id: 'teachers', label: 'Giáo viên' },
          { id: 'students', label: 'Học sinh' },
          { id: 'parents', label: 'Phụ huynh' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedAudience(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedAudience === tab.id
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcement Cards */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Chưa có thông báo nào"
          description="Hiện tại chưa có tin tức hoặc thông báo nào cho nhóm đối tượng này."
        />
      ) : (
        <div className="space-y-3.5">
          {sorted.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white border rounded-xl p-5 transition-colors ${
                ann.isPinned
                  ? 'border-indigo-200 bg-indigo-50/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                        <Pin className="w-3 h-3 fill-indigo-600" />
                        Đã ghim
                      </span>
                    )}
                    <span className="font-semibold text-slate-700">
                      Gửi: {ann.targetAudienceLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">
                      {new Date(ann.publishedAt).toLocaleDateString('vi-VN')}
                    </span>
                    {ann.priority === 'urgent' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-600 font-semibold">Khẩn cấp</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>
                </div>

                {canPost && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePinAnnouncement(ann.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        ann.isPinned
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={ann.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnouncementToDelete(ann)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Người đăng: <strong className="text-slate-600">{ann.authorName}</strong> ({ann.authorRole})</span>
                <span className="font-mono">{new Date(ann.publishedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnnouncementFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!announcementToDelete}
        onClose={() => setAnnouncementToDelete(null)}
        onConfirm={() => {
          if (announcementToDelete) {
            deleteAnnouncement(announcementToDelete.id);
            setAnnouncementToDelete(null);
          }
        }}
        title="Xác Nhận Xóa Thông Báo"
        message={`Bạn có chắc muốn gỡ thông báo "${announcementToDelete?.title}" khỏi bảng tin?`}
      />
    </div>
  );
};
