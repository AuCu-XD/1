import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Copy,
  CheckCircle2,
  Send,
  Bot,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  Check,
  Search,
  BrainCircuit
} from 'lucide-react';

// Hàm kiểm tra tính hợp lệ về mặt ngữ nghĩa và sư phạm của từ khóa / chủ đề
const validateTopic = (topic: string): { isValid: boolean; reason?: string } => {
  const cleaned = topic.trim();

  // 1. Quá ngắn hoặc trống
  if (cleaned.length < 4) {
    return {
      isValid: false,
      reason: 'Từ khóa quá ngắn (dưới 4 ký tự). Vui lòng nhập tên chủ đề hoặc khái niệm học tập cụ thể.'
    };
  }

  // 2. Ký tự lặp lại vô nghĩa (ví dụ: aaaaa, 111111, .....)
  if (/^(.)\1{3,}$/i.test(cleaned)) {
    return {
      isValid: false,
      reason: 'Phát hiện chuỗi ký tự lặp lại vô nghĩa. Vui lòng nhập từ khóa có nghĩa.'
    };
  }

  // 3. Chuỗi gõ bàn phím ngẫu nhiên (keyboard mashing: asdfgh, qwerty, zxcvb, jklfds, test123...)
  const gibberishPatterns = [
    /^asdf/i,
    /^qwerty/i,
    /^zxcv/i,
    /^jkl/i,
    /^[bcdfghjklmnpqrstvwxyz]{6,}$/i, // Không có nguyên âm tiếng Việt/Anh
    /^[0-9]+$/, // Toàn chữ số vô nghĩa
    /^test+$/i
  ];

  for (const pattern of gibberishPatterns) {
    if (pattern.test(cleaned)) {
      return {
        isValid: false,
        reason: 'Từ khóa nhập vào không có cấu trúc ngữ nghĩa tiếng Việt/tiếng Anh hoặc không liên quan đến bài học.'
      };
    }
  }

  // 4. Kiểm tra có ít nhất một nguyên âm hoặc từ ngữ có ý nghĩa
  const hasVowelsOrWords = /[a-zà-ỹ0-9\s]{3,}/i.test(cleaned);
  if (!hasVowelsOrWords) {
    return {
      isValid: false,
      reason: 'Chủ đề chứa nhiều ký tự đặc biệt vô nghĩa. Vui lòng nhập tên bài học rõ ràng.'
    };
  }

  return { isValid: true };
};

// Hàm nhận diện môn học và trọng tâm từ khóa để đưa ra giải pháp thông minh
const analyzeSubjectFocus = (topic: string): { subject: string; coreTopic: string; gradeLevel: string } => {
  const lower = topic.toLowerCase();

  if (/toán|hàm số|phương trình|parabol|hình học|tích phân|đạo hàm|vectơ|bất đẳng thức|ma trận/i.test(lower)) {
    return { subject: 'Toán học', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }
  if (/lý|vật lý|dao động|newton|quang học|điện xoay chiều|lực|chuyển động|sóng cơ/i.test(lower)) {
    return { subject: 'Vật lý', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }
  if (/hóa|hóa học|este|axit|bazơ|bảng tuần hoàn|phản ứng|dung dịch|kim loại|ion/i.test(lower)) {
    return { subject: 'Hóa học', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }
  if (/sinh|sinh học|tế bào|adn|di truyền|quang hợp|tiến hóa|sinh thái/i.test(lower)) {
    return { subject: 'Sinh học', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }
  if (/văn|ngữ văn|nghị luận|tác phẩm|truyện kiều|văn học|thơ|tác giả|phân tích/i.test(lower)) {
    return { subject: 'Ngữ văn', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }
  if (/anh|tiếng anh|english|grammar|tenses|vocabulary|reading|conditionals|passive/i.test(lower)) {
    return { subject: 'Tiếng Anh', coreTopic: topic, gradeLevel: 'Toàn cấp THPT' };
  }
  if (/sử|lịch sử|kháng chiến|cách mạng|chiến tranh|chiến dịch/i.test(lower)) {
    return { subject: 'Lịch sử', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }
  if (/địa|địa lý|khí hậu|địa hình|dân cư|kinh tế vùng/i.test(lower)) {
    return { subject: 'Địa lý', coreTopic: topic, gradeLevel: 'Lớp 10 - 12' };
  }

  return { subject: 'Chuyên đề Tích hợp', coreTopic: topic, gradeLevel: 'Khối THPT' };
};

export const AIAssistantModule: React.FC = () => {
  const { addToast } = useApp();

  const [activeTask, setActiveTask] = useState<'lesson_plan' | 'quiz_gen' | 'report_comment' | 'tutor'>('lesson_plan');
  const [topicInput, setTopicInput] = useState('Hàm số bậc hai và ứng dụng thực tế (Toán 10)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generatedResult, setGeneratedResult] = useState<string>(`I. MỤC TIÊU BÀI DẠY (Chuẩn Công văn 5512/BGDĐT):
1. Về Kiến thức:
- Nắm vững dạng tổng quát hàm số y = ax² + bx + c (a ≠ 0), bảng biến thiên và hình dáng parabol.
- Xác định chính xác toạ độ đỉnh I(-b/2a; -Δ/4a) và trục đối xứng x = -b/2a.
2. Về Năng lực cần phát triển:
- Năng lực mô hình hoá toán học: Ứng dụng parabol để giải bài toán đường cong cầu vòm và quỹ đạo ném bóng rổ.
- Năng lực tư duy logic phản biện thông qua phân tích chiều biến thiên khi a > 0 và a < 0.
3. Về Phẩm chất:
- Chăm chỉ, tích cực làm việc nhóm và trung thực trong quá trình thực hành.

II. THIẾT BỊ DẠY HỌC & HỌC LIỆU SỐ:
- Slide trình chiếu đa phương tiện PowerPoint (20 slides), phần mềm hình học trực quan GeoGebra.

III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN):
1. Hoạt động 1 (Khởi động - 7 phút): Xem video đài phun nước và cầu Cổng Vàng San Francisco, đặt vấn đề tìm phương trình toán học mô tả đường cong.
2. Hoạt động 2 (Hình thành kiến thức mới - 20 phút): Khảo sát sự biến thiên của đồ thị parabol với hệ số a dương và âm.
3. Hoạt động 3 (Luyện tập - 12 phút): Cho học sinh làm nhanh 4 câu hỏi trắc nghiệm trên hệ thống EduManage Quiz.
4. Hoạt động 4 (Vận dụng thực tiễn - 6 phút): Giao bài toán kinh tế tính toán doanh thu cực đại của doanh nghiệp.`);

  // Các chủ đề gợi ý chuẩn
  const sampleTopics = [
    'Hàm số bậc hai và parabol (Toán 10)',
    'Các định luật Newton & lực ma sát (Vật lý 10)',
    'Phản ứng este hóa và lipid (Hóa học 12)',
    'Nghị luận xã hội về ý chí vươn lên (Ngữ văn 11)',
    'Câu điều kiện kết hợp Mixed Conditionals (Tiếng Anh)'
  ];

  // Xử lý tạo nội dung thông minh với AI
  const handleGenerate = () => {
    // 1. KIỂM DUYỆT TÍNH HỢP LỆ VỀ Ý NGHĨA CỦA CHỦ ĐỀ
    const validation = validateTopic(topicInput);

    if (!validation.isValid) {
      setErrorMessage(
        validation.reason ||
          'Chủ đề/Từ khóa không hợp lệ! Vui lòng nhập từ khóa có ý nghĩa học tập rõ ràng.'
      );
      addToast({
        type: 'error',
        title: 'Từ khóa không hợp lệ',
        message: 'AI không thể xử lý từ khóa rác hoặc vô nghĩa. Vui lòng nhập lại.'
      });
      return;
    }

    // Nếu hợp lệ -> Xóa lỗi và kích hoạt AI phân tích từ khóa
    setErrorMessage(null);
    setIsGenerating(true);

    const { subject, coreTopic, gradeLevel } = analyzeSubjectFocus(topicInput);

    setTimeout(() => {
      setIsGenerating(false);

      if (activeTask === 'lesson_plan') {
        setGeneratedResult(`KẾ HOẠCH BÀI DẠY (CHỦ ĐỀ: ${coreTopic.toUpperCase()})
Môn: ${subject} · Cấp độ: ${gradeLevel} · Chuẩn Công văn 5512/BGDĐT

I. MỤC TIÊU CẦN ĐẠT:
1. Kiến thức cốt lõi:
- Nắm vững bản chất khái niệm, định lý trọng tâm và quy tắc vận dụng của "${coreTopic}".
- Nhận biết các dạng bài toán điển hình và các bẫy sai lầm phổ biến khi giải bài.
2. Phát triển phẩm chất và năng lực:
- Năng lực giải quyết vấn đề và sáng tạo trong tình huống học tập.
- Năng lực tự chủ và tự học qua phiếu học tập phân hóa.

II. HỌC LIỆU VÀ THIẾT BỊ:
- Bài giảng số, thiết bị trình chiếu, phiếu thảo luận nhóm 4 học sinh.

III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG:
- Hoạt động 1 (Khởi động - 5 phút): Tình huống thực tiễn kích thích tò mò khoa học.
- Hoạt động 2 (Khám phá kiến thức - 18 phút): Làm việc với tư liệu bài học, hình thành khái niệm.
- Hoạt động 3 (Luyện tập - 15 phút): Giải quyết 3 bài tập mẫu phân cấp từ Nhận biết đến Vận dụng.
- Hoạt động 4 (Vận dụng - 7 phút): Nhiệm vụ dự án nhỏ áp dụng vào đời sống hàng ngày.`);
      } else if (activeTask === 'quiz_gen') {
        setGeneratedResult(`MA TRẬN VÀ BỘ CÂU HỎI TRẮC NGHIỆM PHÂN HÓA: "${coreTopic.toUpperCase()}"
Môn học: ${subject} · Chuẩn ma trận đánh giá năng lực 2026

Câu 1 (Mức độ Nhận biết):
Khẳng định nào sau đây là định nghĩa chuẩn xác nhất về ${coreTopic}?
A. Phát biểu chuẩn xác theo chương trình giáo dục phổ thông (ĐÁP ÁN ĐÚNG)
B. Phát biểu thiếu điều kiện xác định cơ bản
C. Khái niệm tương đương nhưng sai về dấu và chiều biến thiên
D. Đáp án không có căn cứ khoa học
-> Lời giải chi tiết: Khái niệm được định nghĩa rõ ràng theo sách giáo khoa môn ${subject}.

Câu 2 (Mức độ Thông hiểu):
Khi thay đổi điều kiện ban đầu của bài toán ${coreTopic}, kết quả sẽ thay đổi ra sao?
A. Giá trị biến thiên tỷ lệ thuận với hệ số đầu vào (ĐÁP ÁN ĐÚNG)
B. Luôn luôn giữ nguyên giá trị không đổi
C. Giảm về 0 bất kể điều kiện
D. Đạt cực tiểu tại điểm đối xứng âm
-> Lời giải chi tiết: Dựa trên tính chất định lý đã học, kết quả phụ thuộc trực tiếp vào tham số.

Câu 3 (Mức độ Vận dụng):
Một ứng dụng thực tế của "${coreTopic}" xuất hiện trong đời sống. Kết quả tối ưu nhất là:
A. 15.6 đơn vị
B. 24.8 đơn vị (ĐÁP ÁN ĐÚNG)
C. 32.0 đơn vị
D. 48.5 đơn vị
-> Lời giải chi tiết: Lập phương trình mô hình hóa toán học/khoa học để tìm giá trị tối ưu.`);
      } else if (activeTask === 'report_comment') {
        setGeneratedResult(`GỢI Ý NHẬN XÉT HỌC BẠ VÀ ĐÁNH GIÁ SƯ PHẠM (CHỦ ĐỀ: ${coreTopic.toUpperCase()} - MÔN: ${subject})
Căn cứ theo Thông tư đánh giá học sinh của Bộ Giáo dục & Đào tạo:

1. Dành cho nhóm học sinh Xuất sắc / Giỏi:
"Em nắm rất chắc lý thuyết và bản chất của ${coreTopic}, có tư duy logic sắc bén, kỹ năng giải quyết bài tập nâng cao mạch lạc. Em luôn gương mẫu hỗ trợ các bạn trong nhóm và có tiềm năng lớn tham gia kỳ thi học sinh giỏi cấp trường."

2. Dành cho nhóm học sinh Khá:
"Em chăm ngoan, có ý thức học tập tốt, hoàn thành đầy đủ các nhiệm vụ học tập của chủ đề ${coreTopic}. Cần chú ý rèn luyện thêm tính cẩn thận trong các phép tính chi tiết và tích cực phát biểu xây dựng bài hơn."

3. Dành cho nhóm học sinh cần hỗ trợ thêm:
"Em có thái độ học tập nghiêm túc và có nhiều nỗ lực vươn lên. Ở phần kiến thức ${coreTopic}, em nên dành thêm thời gian ôn tập lại các công thức cơ bản và mạnh dạn trao đổi với thầy cô khi gặp bài tập khó."`);
      } else {
        setGeneratedResult(`HƯỚNG DẪN GIẢI CHI TIẾT & PHƯƠNG PHÁP HỌC TẬP TỐI ƯU
Chuyên đề: "${coreTopic}" · Môn học: ${subject}

Bước 1: Phân tích kỹ dữ kiện đề bài:
- Liệt kê toàn bộ đại lượng đã biết và các điều kiện ràng buộc trong đề bài.
- Chuyển đổi toàn bộ đơn vị đo lường về hệ chuẩn SI.

Bước 2: Lựa chọn công thức và nguyên lý áp dụng:
- Sử dụng trực tiếp nguyên lý nền tảng của ${coreTopic}.
- Thiết lập phương trình hoặc hệ phương trình liên hệ giữa các ẩn số.

Bước 3: Biến đổi và tính toán:
- Thực hiện các phép suy luận logic, giải phương trình và đối chiếu với tập nghiệm khả dĩ.

Bước 4: Kiểm tra kết quả và liên hệ thực tiễn:
- Đánh giá tính hợp lý của đáp số trong thực tế để đưa ra kết luận chính xác.`);
      }

      addToast({
        type: 'success',
        title: 'AI đã tạo giải pháp thông minh',
        message: `Đã phân tích trọng tâm "${coreTopic}" (${subject}) thành công.`
      });
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    addToast({
      type: 'info',
      title: 'Đã sao chép văn bản',
      message: 'Nội dung phản hồi từ AI đã được lưu vào bộ nhớ tạm.'
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>AI Hỗ Trợ Giảng Dạy & Học Tập</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Trí tuệ nhân tạo nhận diện từ khóa trọng tâm, thẩm định ngữ nghĩa và kiến tạo giải pháp sư phạm thông minh
          </p>
        </div>
      </div>

      {/* Task Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'lesson_plan', label: 'Soạn giáo án CV 5512', icon: BookOpen, desc: 'Kế hoạch bài dạy chuẩn Bộ GD' },
          { id: 'quiz_gen', label: 'Sinh câu hỏi trắc nghiệm', icon: HelpCircle, desc: '4 mức độ nhận thức phân hóa' },
          { id: 'report_comment', label: 'Viết nhận xét học bạ', icon: FileText, desc: 'Lời phê chuẩn theo thông tư' },
          { id: 'tutor', label: 'Trợ giảng phương pháp', icon: Lightbulb, desc: 'Hướng dẫn giải chi tiết từng bước' }
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = activeTask === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTask(t.id as any)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="font-bold text-xs block">{t.label}</span>
              <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* CẢNH BÁO TỪ KHÓA KHÔNG HỢP LỆ THEO YÊU CẦU NGƯỜI DÙNG */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700/80 rounded-2xl flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
              Cảnh báo: Từ khóa hoặc chủ đề không hợp lệ!
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 pt-1 font-medium">
              👉 Vui lòng nhập lại tên bài học có ý nghĩa sư phạm, hoặc chọn một trong các chủ đề gợi ý bên dưới.
            </p>
          </div>
        </div>
      )}

      {/* Input prompt area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          Chủ đề bài học hoặc từ khóa cần AI xử lý:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <BrainCircuit className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
            <input
              type="text"
              value={topicInput}
              onChange={(e) => {
                setTopicInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
              placeholder="Ví dụ: Định luật bảo toàn năng lượng, Bảng tuần hoàn hóa học, Hàm số bậc 2..."
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            disabled={isGenerating || !topicInput.trim()}
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{isGenerating ? 'AI đang phân tích...' : 'Tạo giải pháp thông minh'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Gợi ý chủ đề nhanh:</span>
          {sampleTopics.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopicInput(topic);
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* AI Output Window */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                Giải Pháp Sư Phạm Thông Minh Từ AI:
              </span>
              <span className="text-[11px] text-slate-400">
                Đã phân tích trọng tâm và cấu trúc hóa nội dung
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép nội dung</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans whitespace-pre-line leading-relaxed max-h-[460px] overflow-y-auto">
          {generatedResult}
        </pre>
      </div>
    </div>
  );
};
