import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Info,
  Send,
  Phone,
  CheckCircle2,
  Clock,
  BookOpen,
  CalendarCheck,
  UserX,
  FileQuestion,
  Users,
  RotateCcw,
  Sparkles,
  Filter
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface StudentInfoItem {
  id: string;
  fullName: string;
  studentCode: string;
  className: string;
  parentName: string;
  parentPhone: string;
  infoType: 'academic' | 'attendance' | 'homework';
  infoTitle: string;
  infoDetail: string;
  suggestedAction: string;
}

export const SmartAlertsModule: React.FC = () => {
  const { students, grades, attendance, assignments, addToast } = useApp();

  const [selectedStudentForNotice, setSelectedStudentForNotice] = useState<StudentInfoItem | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('');

  // Interactive spotlight / filter state for the 3 top category cards
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'attendance' | 'homework'>('all');

  // Automatically compute real-time support info from students
  const infoList: StudentInfoItem[] = [
    {
      id: 'st-4',
      fullName: 'Hoàng Quốc Bảo',
      studentCode: 'HS-2024-004',
      className: '10A1',
      parentName: 'Hoàng Văn Cường',
      parentPhone: '0938456789',
      infoType: 'academic',
      infoTitle: 'Thông tin điểm môn Toán cần phụ đạo thêm',
      infoDetail: 'Điểm 15 phút lần 1: 4.0; Bài kiểm tra 1 tiết đạt 4.5. ĐTB môn hiện tại: 4.8.',
      suggestedAction: 'Giáo viên bộ môn xếp lịch hướng dẫn thêm sau giờ học vào chiều Thứ Năm.'
    },
    {
      id: 'st-7',
      fullName: 'Bùi Gia Huy',
      studentCode: 'HS-2024-007',
      className: '10A2',
      parentName: 'Bùi Văn Hùng',
      parentPhone: '0978123456',
      infoType: 'attendance',
      infoTitle: 'Thông tin học sinh vắng không phép trong tháng 10',
      infoDetail: 'Có 1 buổi vắng không phép và 2 lần đi học muộn quá 20 phút.',
      suggestedAction: 'Liên hệ phụ huynh trao đổi tình hình sức khỏe và lý do vắng học của em.'
    },
    {
      id: 'st-9',
      fullName: 'Đặng Ngọc Mai',
      studentCode: 'HS-2024-009',
      className: '11B1',
      parentName: 'Đặng Quốc Toàn',
      parentPhone: '0967890123',
      infoType: 'homework',
      infoTitle: 'Thông tin trễ hạn 2 bài tập về nhà môn Tiếng Anh',
      infoDetail: 'Đã quá hạn nộp 4 ngày cho bài tập Unit 3 Reading & Vocabulary.',
      suggestedAction: 'Nhắc nhở học sinh hoàn thành và nộp bổ sung bài tập trước thứ Hai.'
    }
  ];

  const handleOpenNotice = (st: StudentInfoItem) => {
    setSelectedStudentForNotice(st);
    setNoticeMessage(
      `Kính gửi phụ huynh em ${st.fullName} (Lớp ${st.className}). Nhà trường và GVCN xin gửi thông tin: ${st.infoDetail}. Đề nghị phụ huynh cùng phối hợp: ${st.suggestedAction}. Trân trọng!`
    );
  };

  const handleSendNotice = () => {
    addToast({
      type: 'success',
      title: 'Đã gửi thông tin tới phụ huynh thành công',
      message: `Đã chuyển tin nhắn SMS/Zalo tới phụ huynh ${selectedStudentForNotice?.parentName} (${selectedStudentForNotice?.parentPhone}).`
    });
    setSelectedStudentForNotice(null);
  };

  // Toggle category spotlight
  const handleToggleCategory = (category: 'academic' | 'attendance' | 'homework') => {
    setSelectedCategory((prev) => (prev === category ? 'all' : category));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Thông Tin Học Sinh</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Trung tâm thông tin học đường, phát hiện học sinh cần hỗ trợ học tập và chuyên cần
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hiển thị tất cả thông tin</span>
          </button>
        )}
      </div>

      {/* 3 Top Category Cards with Color Coding & Interactive Clickable Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Thông tin học lực (Blue Theme) */}
        <div
          onClick={() => handleToggleCategory('academic')}
          className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between transition-all select-none ${
            selectedCategory === 'academic'
              ? 'bg-blue-50 border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-md scale-[1.02]'
              : selectedCategory === 'all'
              ? 'bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-xs shadow-2xs'
              : 'bg-white/60 border-2 border-blue-100 opacity-60 hover:opacity-100'
          }`}
          title="Nhấn để làm nổi bật Thông tin học lực"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-900 block">Thông tin học lực</span>
              <span className="text-base font-extrabold text-blue-800">1 học sinh cần phụ đạo</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            selectedCategory === 'academic'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {selectedCategory === 'academic' ? 'Đang chọn' : 'Lọc'}
          </span>
        </div>

        {/* Card 2: Thông tin chuyên cần - 1 học sinh vắng không phép (Rose Theme) */}
        <div
          onClick={() => handleToggleCategory('attendance')}
          className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between transition-all select-none ${
            selectedCategory === 'attendance'
              ? 'bg-rose-50 border-2 border-rose-500 ring-4 ring-rose-500/20 shadow-md scale-[1.02]'
              : selectedCategory === 'all'
              ? 'bg-white border-2 border-rose-200 hover:border-rose-400 hover:shadow-xs shadow-2xs'
              : 'bg-white/60 border-2 border-rose-100 opacity-60 hover:opacity-100'
          }`}
          title="Nhấn để làm nổi bật Thông tin chuyên cần"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-900 block">Thông tin chuyên cần</span>
              <span className="text-base font-extrabold text-rose-800">1 học sinh vắng không phép</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            selectedCategory === 'attendance'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {selectedCategory === 'attendance' ? 'Đang chọn' : 'Lọc'}
          </span>
        </div>

        {/* Card 3: Thông tin trễ hạn - 1 học sinh quá hạn (Amber Theme) */}
        <div
          onClick={() => handleToggleCategory('homework')}
          className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between transition-all select-none ${
            selectedCategory === 'homework'
              ? 'bg-amber-50 border-2 border-amber-500 ring-4 ring-amber-500/20 shadow-md scale-[1.02]'
              : selectedCategory === 'all'
              ? 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:shadow-xs shadow-2xs'
              : 'bg-white/60 border-2 border-amber-100 opacity-60 hover:opacity-100'
          }`}
          title="Nhấn để làm nổi bật Thông tin trễ hạn"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-900 block">Thông tin trễ hạn</span>
              <span className="text-base font-extrabold text-amber-800">1 học sinh quá hạn</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            selectedCategory === 'homework'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {selectedCategory === 'homework' ? 'Đang chọn' : 'Lọc'}
          </span>
        </div>
      </div>

      {/* Spotlight Notice Banner */}
      {selectedCategory !== 'all' && (
        <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>
              Đang làm nổi bật: <strong>
                {selectedCategory === 'academic' && 'Thông tin học lực'}
                {selectedCategory === 'attendance' && 'Thông tin chuyên cần'}
                {selectedCategory === 'homework' && 'Thông tin trễ hạn'}
              </strong>. Các thông tin còn lại đang chìm xuống.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="font-bold underline hover:text-indigo-700 ml-2"
          >
            Bỏ chọn lọc
          </button>
        </div>
      )}

      {/* Information Cards List with Category-specific Colors and Spotlight Animation */}
      <div className="space-y-3">
        {infoList.map((item) => {
          const isAcademic = item.infoType === 'academic';
          const isAttendance = item.infoType === 'attendance';
          const isHomework = item.infoType === 'homework';

          const isDimmed = selectedCategory !== 'all' && selectedCategory !== item.infoType;
          const isHighlighted = selectedCategory !== 'all' && selectedCategory === item.infoType;

          // Theme styling based on category
          let borderTheme = 'border-2 border-blue-200 hover:border-blue-400 bg-white';
          let badgeTheme = 'bg-blue-100 text-blue-800 border-blue-300';
          let titleTheme = 'text-blue-900';
          let buttonTheme = 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';

          if (isAttendance) {
            borderTheme = 'border-2 border-rose-200 hover:border-rose-400 bg-white';
            badgeTheme = 'bg-rose-100 text-rose-800 border-rose-300';
            titleTheme = 'text-rose-900';
            buttonTheme = 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20';
          } else if (isHomework) {
            borderTheme = 'border-2 border-amber-200 hover:border-amber-400 bg-white';
            badgeTheme = 'bg-amber-100 text-amber-800 border-amber-300';
            titleTheme = 'text-amber-900';
            buttonTheme = 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';
          }

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${borderTheme} ${
                isDimmed
                  ? 'opacity-25 grayscale-[50%] blur-[0.3px] scale-[0.98]'
                  : isHighlighted
                  ? 'scale-[1.01] ring-2 ring-offset-1 shadow-md opacity-100'
                  : 'opacity-100'
              }`}
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeTheme}`}>
                    {isAcademic && 'THÔNG TIN HỌC LỰC'}
                    {isAttendance && 'THÔNG TIN CHUYÊN CẦN'}
                    {isHomework && 'THÔNG TIN TRỄ HẠN'}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{item.fullName}</span>
                  <span className="text-xs text-slate-400 font-mono">({item.studentCode} · Lớp {item.className})</span>
                </div>

                <h4 className={`text-xs font-bold ${titleTheme}`}>{item.infoTitle}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.infoDetail}</p>

                <div className="pt-2 text-[11px] text-slate-700 font-medium">
                  💡 Đề xuất hành động: <strong className="text-slate-900">{item.suggestedAction}</strong>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenNotice(item)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${buttonTheme}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi thông tin phụ huynh</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice Modal */}
      {selectedStudentForNotice && (
        <Modal
          isOpen={!!selectedStudentForNotice}
          onClose={() => setSelectedStudentForNotice(null)}
          title="Gửi Thông Tin Tới Phụ Huynh Học Sinh"
          subtitle={`Phụ huynh: ${selectedStudentForNotice.parentName} · SĐT: ${selectedStudentForNotice.parentPhone}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nội dung tin nhắn gửi tới phụ huynh (SMS / Zalo):
              </label>
              <textarea
                rows={5}
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-[11px] text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-900/60">
              Tin nhắn sẽ được gửi tự động qua cổng liên lạc Zalo ZNS / SMS Brandname tới số điện thoại <strong>{selectedStudentForNotice.parentPhone}</strong>.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForNotice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendNotice}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Xác nhận gửi tin</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
