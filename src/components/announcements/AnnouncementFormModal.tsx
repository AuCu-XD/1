import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { Announcement } from '../../types';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({ isOpen, onClose }) => {
  const { classes, activeUser, addAnnouncement } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('normal');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Vui lòng nhập tiêu đề thông báo';
    if (!content.trim() || content.trim().length < 10) errs.content = 'Nội dung thông báo phải từ 10 ký tự trở lên';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getTargetLabel = (aud: string): string => {
    if (aud === 'all') return 'Toàn trường';
    if (aud === 'teachers') return 'Toàn thể Giáo viên';
    if (aud === 'students') return 'Toàn thể Học sinh';
    if (aud === 'parents') return 'Toàn thể Phụ huynh';
    const foundClass = classes.find((c) => c.id === aud);
    return foundClass ? `Lớp ${foundClass.name}` : 'Nội bộ';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addAnnouncement({
      title: title.trim(),
      content: content.trim(),
      priority,
      targetAudience,
      targetAudienceLabel: getTargetLabel(targetAudience),
      authorName: activeUser.name,
      authorRole: activeUser.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên',
      isPinned
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Soạn Thông Báo & Bản Tin Trường Học"
      subtitle="Gửi thông báo tới các đối tượng giáo viên, học sinh hoặc phụ huynh"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tiêu đề thông báo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Kế hoạch tổ chức Lễ Khai giảng năm học mới..."
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
          />
          {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Đối tượng nhận tin <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">Toàn trường (Tất cả)</option>
              <option value="teachers">Chỉ gửi Giáo viên</option>
              <option value="students">Chỉ gửi Học sinh</option>
              <option value="parents">Chỉ gửi Phụ huynh</option>
              <optgroup label="Gửi riêng theo lớp">
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mức độ quan trọng
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="normal">Bình thường</option>
              <option value="important">Quan trọng</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nội dung chi tiết thông báo <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập toàn văn nội dung thông báo..."
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {errors.content && <p className="text-[11px] text-rose-500 mt-1">{errors.content}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pin-ann"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
          />
          <label htmlFor="pin-ann" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            Ghim thông báo lên đầu trang bảng tin
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            Phát thông báo
          </button>
        </div>
      </form>
    </Modal>
  );
};
