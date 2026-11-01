import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  FolderArchive,
  FileText,
  Video,
  Presentation,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  FileCheck,
  Link as LinkIcon,
  UploadCloud,
  ExternalLink,
  ShieldAlert,
  Trash2,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';

export interface DigitalResource {
  id: string;
  title: string;
  subject: string;
  grade: number;
  type: 'slides' | 'pdf' | 'video' | 'exam' | 'lesson_plan';
  fileSize: string;
  author: string;
  downloadsCount: number;
  uploadedAt: string;
  description?: string;
  externalLink?: string;
  fileName?: string;
  contentPreview?: string;
}

export const DigitalResourcesModule: React.FC = () => {
  const { subjects, activeUser, addToast, switchRole } = useApp();

  // Phân quyền: Chỉ tài khoản Quản trị viên và Giáo viên mới được phép quản trị/thêm giáo án
  const canManage = activeUser.role === 'admin' || activeUser.role === 'teacher';

  const [resources, setResources] = useState<DigitalResource[]>([
    {
      id: 'res-1',
      title: 'Giáo án điện tử: Hàm số bậc hai và đồ thị parabol (Chuẩn CV 5512)',
      subject: 'Toán học',
      grade: 10,
      type: 'slides',
      fileSize: '14.2 MB',
      author: 'Thầy Nguyễn Văn An',
      downloadsCount: 142,
      uploadedAt: '2024-09-18',
      fileName: 'GiaoAn_Toan10_HamSoBacHai.pptx',
      externalLink: 'https://youtube.com/watch?v=example_math10',
      description: 'Giáo án soạn theo chuẩn Công văn 5512 của Bộ GD&ĐT gồm 4 hoạt động: Khởi động, Khám phá, Luyện tập, Vận dụng.',
      contentPreview: `KẾ HOẠCH BÀI DẠY: HÀM SỐ BẬC HAI VÀ ĐỒ THỊ
Môn: Toán học 10 - Tiết: 18, 19
I. MỤC TIÊU BÀI DẠY:
1. Kiến thức: Nắm vững bảng biến thiên, toạ độ đỉnh I(-b/2a; -Δ/4a) và trục đối xứng.
2. Kỹ năng: Vẽ thành thạo parabol, xét dấu hệ số a và ứng dụng tìm giá trị lớn nhất/nhỏ nhất.
II. HỌC LIỆU & THIẾT BỊ:
- Bài giảng trình chiếu PowerPoint 25 slides tương tác.
- Phần mềm hình học GeoGebra minh họa trực quan.`
    },
    {
      id: 'res-2',
      title: 'Sổ tay công thức Vật lý 10: Động lực học & Các định luật Newton',
      subject: 'Vật lý',
      grade: 10,
      type: 'pdf',
      fileSize: '4.8 MB',
      author: 'Cô Trần Thị Lan',
      downloadsCount: 268,
      uploadedAt: '2024-09-20',
      fileName: 'SoTay_VatLy10_CacDinhLuatNewton.pdf',
      description: 'Tổng hợp sơ đồ tư duy, công thức 3 định luật Newton, lực ma sát, lực hướng tâm và ví dụ minh họa.',
      contentPreview: `TÀI LIỆU ÔN TẬP VẬT LÝ 10
Chuyên đề: CÁC ĐỊNH LUẬT NEWTON
- Định luật I Newton (Quán tính): Khi một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực có hợp lực bằng 0 thì vật giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều.
- Định luật II Newton: Gia tốc a = F / m.
- Định luật III Newton: F_AB = - F_BA.`
    },
    {
      id: 'res-3',
      title: 'Video thí nghiệm: Sự chuyển dịch cân bằng hóa học trong dung dịch',
      subject: 'Hóa học',
      grade: 10,
      type: 'video',
      fileSize: '85.0 MB',
      author: 'Thầy Lê Hoàng Long',
      downloadsCount: 110,
      uploadedAt: '2024-09-25',
      fileName: 'ThiNghiem_HoaHoc_CanBangDungDich.mp4',
      externalLink: 'https://youtube.com/watch?v=example_chemistry_exp',
      description: 'Video chất lượng cao quay cận cảnh hiện tượng đổi màu chất chỉ thị khi thay đổi nhiệt độ và nồng độ.',
      contentPreview: `THÍ NGHIỆM HÓA HỌC TRỰC QUAN:
- Thí nghiệm 1: Phản ứng thuận nghịch giữa khí NO2 (màu nâu đỏ) và N2O4 (không màu).
- Thí nghiệm 2: Sự chuyển dịch cân bằng ion trong dung dịch FeCl3 và KSCN khi thêm muối.`
    },
    {
      id: 'res-4',
      title: 'Bộ đề thi thử giữa học kỳ 1 môn Tiếng Anh có đáp án & ma trận',
      subject: 'Tiếng Anh',
      grade: 10,
      type: 'exam',
      fileSize: '22.5 MB',
      author: 'Cô Phạm Hồng Nhung',
      downloadsCount: 325,
      uploadedAt: '2024-10-01',
      fileName: 'BoDeThiGiuaKy_TiengAnh10.docx',
      description: 'Đề thi 50 câu trắc nghiệm bao phủ kiến thức Unit 1 - Unit 3 kèm ma trận phân hóa câu hỏi.',
      contentPreview: `MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ TIẾNG ANH 10:
- Phonetics: 4 câu (Nhận biết 2, Thông hiểu 2)
- Vocabulary & Grammar: 16 câu (Nhận biết 6, Thông hiểu 6, Vận dụng 4)
- Reading Comprehension: 10 câu
- Writing transformation: 10 câu`
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Modal thêm giáo án
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Toán học');
  const [newGrade, setNewGrade] = useState(10);
  const [newType, setNewType] = useState<DigitalResource['type']>('slides');
  const [newAuthor, setNewAuthor] = useState(activeUser.name);
  const [newDescription, setNewDescription] = useState('');
  const [newExternalLink, setNewExternalLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  // Modal xem trước tài liệu
  const [previewingResource, setPreviewingResource] = useState<DigitalResource | null>(null);

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = selectedType === 'all' || r.type === selectedType;
    const matchSub = selectedSubject === 'all' || r.subject === selectedSubject;
    return matchSearch && matchType && matchSub;
  });

  const getTypeIcon = (type: DigitalResource['type']) => {
    switch (type) {
      case 'slides':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-indigo-600" />;
      case 'exam':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
      case 'lesson_plan':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
    }
  };

  // Xử lý chọn file từ máy tính
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Thêm giáo án mới
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast({
        type: 'error',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập tiêu đề bài giảng hoặc giáo án.'
      });
      return;
    }

    const newRes: DigitalResource = {
      id: `res-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      grade: newGrade,
      type: newType,
      fileSize: uploadedFile ? uploadedFile.size : '8.5 MB',
      fileName: uploadedFile ? uploadedFile.name : `${newTitle.trim().replace(/\s+/g, '_')}.docx`,
      author: newAuthor.trim() || activeUser.name,
      downloadsCount: 0,
      uploadedAt: new Date().toISOString().split('T')[0],
      description: newDescription.trim() || 'Giáo án điện tử đã được kiểm duyệt chuyên môn.',
      externalLink: newExternalLink.trim() || undefined,
      contentPreview: `GIÁO ÁN ĐIỆN TỬ: ${newTitle.toUpperCase()}
Môn: ${newSubject} - Khối: ${newGrade}
Tác giả: ${newAuthor.trim() || activeUser.name}
Nội dung: ${newDescription.trim() || 'Tài liệu bài giảng trực tuyến và phiếu học tập đi kèm.'}`
    };

    setResources((prev) => [newRes, ...prev]);
    setIsAddModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewExternalLink('');
    setUploadedFile(null);

    addToast({
      type: 'success',
      title: 'Đã thêm giáo án thành công',
      message: `Giáo án "${newRes.title}" đã được lưu vào kho Học liệu số.`
    });
  };

  // Tải file thực tế về máy tính (thực thi tải blob file thật)
  const handleDownload = (res: DigitalResource) => {
    const fileContent = `${res.title}
Môn học: ${res.subject} (Khối ${res.grade})
Tác giả: ${res.author}
Ngày cập nhật: ${res.uploadedAt}
----------------------------------------
MÔ TẢ CHI TIẾT:
${res.description || 'Chưa có mô tả'}

${res.externalLink ? `LIÊN KẾT BÀI GIẢNG TRỰC TUYẾN:\n${res.externalLink}\n` : ''}
NỘI DUNG GIÁO ÁN TÓM LƯỢC:
${res.contentPreview || 'Nội dung chi tiết được lưu trong hệ thống EduManage Pro.'}
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Cập nhật số lượt tải
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );

    addToast({
      type: 'success',
      title: 'Đã tải tài liệu về máy',
      message: `Tệp "${link.download}" đã được tải xuống máy tính của bạn.`
    });
  };

  return (
    <div className="space-y-5">
      {/* Cảnh báo phân quyền đối với học sinh/phụ huynh */}
      {!canManage && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
              Bạn đang ở chế độ tra cứu học tập <strong className="font-bold uppercase">({activeUser.role === 'student' ? 'Học sinh' : 'Phụ huynh'})</strong>. Chỉ tài khoản <strong>Giáo viên</strong> và <strong>Quản trị viên</strong> mới được phép tải lên và quản trị các giáo án giảng dạy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchRole('teacher')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
          >
            Chuyển quyền Giáo viên
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderArchive className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Học Liệu Số & Quản Lý Giáo Án</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Kho lưu trữ bài giảng điện tử, video thí nghiệm, giáo án CV 5512 và tài liệu học tập dùng chung
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giáo án mới</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tài liệu bài giảng, giáo án, video thí nghiệm..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả định dạng</option>
          <option value="slides">Bài giảng PowerPoint (.pptx)</option>
          <option value="lesson_plan">Kế hoạch bài dạy (Giáo án Word)</option>
          <option value="pdf">Tài liệu tham khảo (.pdf)</option>
          <option value="video">Video bài học & Thí nghiệm</option>
          <option value="exam">Đề thi & Ma trận kiểm tra</option>
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả môn học</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name}>
              Môn {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between shadow-2xs space-y-4"
          >
            <div>
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700">
                  {getTypeIcon(res.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{res.subject}</span>
                    <span>·</span>
                    <span>Khối {res.grade}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-500">{res.fileSize}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                    {res.title}
                  </h3>
                  {res.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {res.description}
                    </p>
                  )}
                </div>
              </div>

              {res.externalLink && (
                <div className="mt-2 text-[11px] flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 truncate bg-indigo-50/50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-md">
                  <LinkIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">Đính kèm liên kết ngoài: {res.externalLink}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                Tác giả: <strong className="text-slate-700 dark:text-slate-300">{res.author}</strong> ({res.downloadsCount} tải)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewingResource(res)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  title="Xem trước nội dung giáo án"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(res)}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
                  title="Tải tệp tài liệu về máy"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Giáo Án Mới */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Thêm Giáo Án / Học Liệu Giảng Dạy"
        >
          <form onSubmit={handleAddResource} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tiêu đề bài giảng / Kế hoạch bài dạy (*):
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Kế hoạch bài dạy: Hàm số bậc hai (CV 5512)..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Môn học:
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      Môn {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Khối lớp:
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Định dạng học liệu:
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="slides">Bài giảng PowerPoint (.pptx)</option>
                  <option value="lesson_plan">Giáo án / Kế hoạch bài dạy (.docx)</option>
                  <option value="pdf">Tài liệu chuyên đề (.pdf)</option>
                  <option value="video">Video bài giảng (.mp4)</option>
                  <option value="exam">Đề kiểm tra & Ma trận</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Tác giả / Giáo viên biên soạn:
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tải tệp từ máy tính */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tải lên tệp giáo án từ máy tính:
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.mp4,.zip"
                />
                <label htmlFor="fileUpload" className="cursor-pointer block">
                  <UploadCloud className="w-7 h-7 mx-auto text-indigo-500 mb-1.5" />
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                    {uploadedFile ? uploadedFile.name : 'Bấm để chọn file từ máy tính'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {uploadedFile ? `Dung lượng: ${uploadedFile.size}` : 'Hỗ trợ PowerPoint (.pptx), Word (.docx), PDF, Video (.mp4)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Đính kèm liên kết trực tuyến nếu không tải video từ máy lên */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span>Đính kèm liên kết trực tuyến (nếu không có video tải từ máy):</span>
                <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={newExternalLink}
                  onChange={(e) => setNewExternalLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... hoặc https://drive.google.com/..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tóm tắt mục tiêu & nội dung bài giảng:
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Mô tả các hoạt động học tập, mục tiêu kiến thức năng lực..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                Lưu vào kho học liệu
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Xem Trước Tài Liệu */}
      {previewingResource && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewingResource(null)}
          title={`Xem trước tài liệu: ${previewingResource.title}`}
        >
          <div className="space-y-4 text-xs">
            {/* Meta bar */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {previewingResource.subject} · Khối {previewingResource.grade}
                </span>
                <p className="text-slate-500 text-[11px]">
                  Tác giả: <strong>{previewingResource.author}</strong> · Dung lượng: {previewingResource.fileSize}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(previewingResource)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải về máy</span>
              </button>
            </div>

            {/* Liên kết ngoài nếu có */}
            {previewingResource.externalLink && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                  <LinkIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium truncate max-w-xs">
                    Liên kết trực tuyến: {previewingResource.externalLink}
                  </span>
                </div>
                <a
                  href={previewingResource.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline shrink-0"
                >
                  <span>Mở xem video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Preview content window */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 max-h-72 overflow-y-auto space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Nội dung chi tiết & Kế hoạch bài dạy:</span>
              </h4>
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-sans whitespace-pre-line leading-relaxed">
                {previewingResource.contentPreview || previewingResource.description || 'Tài liệu đang mở ở chế độ xem trước.'}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewingResource(null)}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
