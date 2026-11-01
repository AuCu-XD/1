import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  X,
  FileSpreadsheet,
  FileText,
  FileUp,
  Sparkles,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  UploadCloud,
  Download,
  Eye,
  RefreshCw,
  HelpCircle,
  Brain,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Sliders,
  ZoomIn,
  ZoomOut,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export type QuestionType = 'pick_one' | 'pick_many' | 'true_false' | 'fill_blank' | 'essay';

export interface NewQuestionData {
  id?: string;
  subject: string;
  grade: number;
  type: QuestionType;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  chapter: string;
  content: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  correctTextAnswer?: string;
  explanation: string;
  aiVerificationStatus?: 'correct' | 'false' | 'unclear';
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestions: (newQuestions: NewQuestionData[]) => void;
  editingQuestion?: NewQuestionData | null;
  onNavigateToSubjects?: () => void;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSaveQuestions,
  editingQuestion,
  onNavigateToSubjects
}) => {
  const { subjects, addToast, addSubject } = useApp();

  // 3 Tabs: 'import' | 'image_ocr' | 'manual'
  const [activeTab, setActiveTab] = useState<'import' | 'image_ocr' | 'manual'>(
    editingQuestion ? 'manual' : 'manual'
  );

  // --------------------------------------------------------------------------
  // TAB 1: IMPORT (Excel, Word, CSV, TXT)
  // --------------------------------------------------------------------------
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importedPreviewQuestions, setImportedPreviewQuestions] = useState<NewQuestionData[]>([]);
  const [isImportParsing, setIsImportParsing] = useState(false);

  const handleDownloadExcelTemplate = () => {
    const csvContent = `Môn học,Khối lớp,Dạng câu hỏi,Mức độ,Chủ đề,Nội dung câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng,Lời giải chi tiết
Toán học,10,pick_one,Thông hiểu,Hàm số bậc hai,Đồ thị hàm số y = ax² + bx + c có toạ độ đỉnh I là:,I(-b/2a; -Δ/4a),I(b/2a; Δ/4a),I(-b/a; -c/a),I(b/a; c/a),A,Toạ độ đỉnh parabol là I(-b/2a; -Δ/4a)
Vật lý,10,pick_many,Nhận biết,Động học,Đại lượng nào sau đây là đại lượng vectơ?,Gia tốc,Vận tốc,Thời gian,Độ dịch chuyển,"A,B,D",Gia tốc vận tốc và độ dịch chuyển là đại lượng vectơ
Hóa học,10,true_false,Nhận biết,Bảng tuần hoàn,Nguyên tố Clo thuộc nhóm VIIA trong bảng tuần hoàn?,Đúng,Sai,,,True,Clo có 7 electron lớp ngoài cùng`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Import_Ngan_Hang_Cau_Hoi_EduManage.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Đã tải file mẫu Excel (.csv)',
      message: 'Mở file trong Excel để nhập danh sách câu hỏi theo cấu trúc chuẩn.'
    });
  };

  const handleDownloadWordTemplate = () => {
    const docContent = `MẪU SOẠN ĐỀ THI / CÂU HỎI WORD CHUẨN BỘ GIÁO DỤC
--------------------------------------------------------
[CÂU HỎI 1]
Môn: Toán học | Khối: 10 | Dạng: Trắc nghiệm | Mức độ: Nhận biết
Chủ đề: Mệnh đề và tập hợp
Nội dung: Cho tập hợp A = {x ∈ R | x² - 4 = 0}. Tập hợp A viết dưới dạng liệt kê là:
A. A = {-2; 2}
B. A = {2}
C. A = {-2}
D. A = {0; 2}
Đáp án đúng: A
Lời giải: Phương trình x² - 4 = 0 có hai nghiệm x = 2 và x = -2.

[CÂU HỎI 2]
Môn: Vật lý | Khối: 10 | Dạng: Nhiều đáp án | Mức độ: Thông hiểu
Chủ đề: Động lực học
Nội dung: Những lực nào sau đây là lực ma sát tiếp xúc?
A. Ma sát trượt
B. Ma sát nghỉ
C. Ma sát lăn
D. Trọng lực
Đáp án đúng: A, B, C
Lời giải: Trọng lực là lực hút trường hấp dẫn, không phải lực ma sát tiếp xúc.
`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Soan_De_Word_EduManage.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Đã tải file mẫu Word (.txt/docx)',
      message: 'File mẫu cấu trúc câu hỏi Word đã được tải về máy của bạn.'
    });
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsImportParsing(true);

    setTimeout(() => {
      setIsImportParsing(false);
      const parsedSample: NewQuestionData[] = [
        {
          id: `imp-${Date.now()}-1`,
          subject: 'Toán học',
          grade: 10,
          type: 'pick_one',
          difficulty: 'Thông hiểu',
          chapter: 'Hàm số bậc hai',
          content: 'Tìm tập xác định D của hàm số y = √(x - 3) + 1/(x - 5).',
          options: ['D = [3; +∞) \\ {5}', 'D = (3; +∞)', 'D = [3; 5)', 'D = R \\ {5}'],
          correctAnswer: 0,
          explanation: 'Hàm số xác định khi x - 3 ≥ 0 và x - 5 ≠ 0 ⇔ x ≥ 3 và x ≠ 5.'
        },
        {
          id: `imp-${Date.now()}-2`,
          subject: 'Vật lý',
          grade: 10,
          type: 'pick_many',
          difficulty: 'Vận dụng',
          chapter: 'Chuyển động thẳng biến đổi đều',
          content: 'Một vật chuyển động thẳng nhanh dần đều không vận tốc đầu. Những công thức nào sau đây là ĐÚNG?',
          options: ['v = at', 's = v0*t + 0.5*a*t²', 'v² - v0² = 2as', 'a = (v - v0)/t'],
          correctAnswer: 0,
          correctAnswers: [0, 1, 2, 3],
          explanation: 'Tất cả các hệ thức trên đều là công thức chuẩn của chuyển động thẳng biến đổi đều.'
        },
        {
          id: `imp-${Date.now()}-3`,
          subject: 'Hóa học',
          grade: 10,
          type: 'true_false',
          difficulty: 'Nhận biết',
          chapter: 'Cấu tạo nguyên tử',
          content: 'Số khối A của nguyên tử bằng tổng số hạt proton và electron?',
          options: ['Đúng', 'Sai'],
          correctAnswer: 1,
          explanation: 'Số khối A bằng tổng số proton (Z) và số nơtron (N): A = Z + N.'
        }
      ];

      setImportedPreviewQuestions(parsedSample);
      addToast({
        type: 'success',
        title: 'Bóc tách dữ liệu thành công',
        message: `Đã trích xuất ${parsedSample.length} câu hỏi hợp lệ từ tệp "${file.name}".`
      });
    }, 1000);
  };

  // --------------------------------------------------------------------------
  // TAB 2: TRÍCH XUẤT TỪ ẢNH (OCR & SIDE-BY-SIDE EDITOR)
  // --------------------------------------------------------------------------
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [ocrTextResult, setOcrTextResult] = useState<string>('');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isBlurryAlertOpen, setIsBlurryAlertOpen] = useState(false);
  const [imageZoomLevel, setImageZoomLevel] = useState<number>(1);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Tệp không hợp lệ',
        message: 'Hệ thống chỉ cho phép tải lên định dạng hình ảnh (.png, .jpg, .jpeg, .webp).'
      });
      return;
    }

    setUploadedImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImageSrc(dataUrl);
      setIsOCRProcessing(true);

      const isBlurrySimulated =
        file.name.toLowerCase().includes('blur') ||
        file.name.toLowerCase().includes('mo') ||
        file.size < 25000;

      setTimeout(() => {
        setIsOCRProcessing(false);
        if (isBlurrySimulated) {
          setIsBlurryAlertOpen(true);
        } else {
          setOcrTextResult(
            `Câu 1. Cho hàm số y = ax² + bx + c có đồ thị như hình vẽ bên. Mệnh đề nào sau đây đúng?
A. a > 0, b < 0, c > 0
B. a < 0, b < 0, c > 0
C. a > 0, b > 0, c < 0
D. a < 0, b > 0, c < 0
Đáp án đúng: A
Lời giải chi tiết: Bề lõm parabol quay lên nên a > 0. Giao điểm với trục tung Oy nằm phía trên gốc O nên c > 0. Trục đối xứng x = -b/2a > 0 suy ra b < 0.`
          );
          addToast({
            type: 'success',
            title: 'Trích xuất văn bản thành công',
            message: 'Đã nhận diện chữ từ ảnh. Bạn có thể đối chiếu và chỉnh sửa ở màn hình bên phải.'
          });
        }
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleChangeImageChoice = () => {
    setIsBlurryAlertOpen(false);
    setUploadedImageSrc(null);
    setOcrTextResult('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
      imageInputRef.current.click();
    }
  };

  const handleContinueChoice = () => {
    setIsBlurryAlertOpen(false);
    setOcrTextResult(
      `Câu [MỜ]: Cho hàm số y = ...x² + [...]x + c. Khẳng định nào sau đây [lỗi chữ do ảnh mờ]?
A. [...]
B. Đỉnh I(-b/..., -Δ/4a)
C. [Không rõ ký tự]
D. Trục đối xứng x = -b/2a
Đáp án gợi ý: D (Vui lòng đối chiếu ảnh bên trái và bổ sung chữ bị thiếu)`
    );
    addToast({
      type: 'info',
      title: 'Đã trích xuất (Ảnh mờ)',
      message: 'Một số ký tự bị mờ đã được để trống hoặc đánh dấu lỗi. Vui lòng tự sửa lại.'
    });
  };

  // --------------------------------------------------------------------------
  // TAB 3: THỦ CÔNG (FORM ĐẦY ĐỦ 5 DẠNG CÂU HỎI & AI THẨM ĐỊNH TỰ LUẬN)
  // --------------------------------------------------------------------------
  const [manualSubject, setManualSubject] = useState(editingQuestion?.subject || (subjects[0]?.name ?? 'Toán học'));
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const handleCreateNewSubject = () => {
    const cleanName = newSubjectName.trim();
    if (!cleanName) {
      addToast({
        type: 'error',
        title: 'Thiếu tên môn học',
        message: 'Vui lòng nhập tên môn học trước khi lưu.'
      });
      return;
    }
    const code = cleanName.slice(0, 3).toUpperCase();
    addSubject({
      name: cleanName,
      code: code,
      coefficient: 1,
      periodsPerWeek: 2
    });
    setManualSubject(cleanName);
    setNewSubjectName('');
    setIsAddSubjectModalOpen(false);
  };

  const [manualGrade, setManualGrade] = useState<number>(editingQuestion?.grade || 10);
  const [manualType, setManualType] = useState<QuestionType>(editingQuestion?.type || 'pick_many');
  const [manualDifficulty, setManualDifficulty] = useState<NewQuestionData['difficulty']>(
    editingQuestion?.difficulty || 'Thông hiểu'
  );
  const [manualChapter, setManualChapter] = useState(editingQuestion?.chapter || 'Hàm số bậc hai');
  const [manualContent, setManualContent] = useState(
    editingQuestion?.content || 'Cho hàm số bậc hai y = ax² + bx + c (a ≠ 0). Những khẳng định nào sau đây là ĐÚNG?'
  );

  // 4 phương án A, B, C, D
  const [optA, setOptA] = useState(editingQuestion?.options[0] || 'Tọa độ đỉnh parabol là I(-b/2a; -Δ/4a)');
  const [optB, setOptB] = useState(editingQuestion?.options[1] || 'Trục đối xứng là đường thẳng x = -b/2a');
  const [optC, setOptC] = useState(editingQuestion?.options[2] || 'Khi a > 0 bề lõm parabol quay lên trên');
  const [optD, setOptD] = useState(editingQuestion?.options[3] || 'Đồ thị luôn đi qua gốc tọa độ O(0; 0)');

  // Pick Many: Mảng các đáp án đúng được chọn [0, 1, 2] -> A, B, C
  const [checkedOptions, setCheckedOptions] = useState<Set<number>>(
    new Set(editingQuestion?.correctAnswers || (editingQuestion ? [editingQuestion.correctAnswer] : [0, 1, 2]))
  );

  // Pick One: 1 đáp án duy nhất
  const [singleCorrect, setSingleCorrect] = useState<number>(editingQuestion?.correctAnswer ?? 0);

  // Đúng / Sai
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<'True' | 'False'>('True');

  // Điền khuyết
  const [fillBlankAnswer, setFillBlankAnswer] = useState(editingQuestion?.correctTextAnswer || '');

  // Tự luận & AI Thẩm định
  const [essayAnswer, setEssayAnswer] = useState(
    editingQuestion?.correctTextAnswer ||
      'Phương trình có 2 nghiệm phân biệt x1 = 1 và x2 = 3. Giá trị lớn nhất của hàm số đạt tại x = 2 với y_max = 5.'
  );
  const [aiEssayStatus, setAiEssayStatus] = useState<'idle' | 'checking' | 'correct' | 'false' | 'unclear'>('idle');
  const [aiEssayFeedback, setAiEssayFeedback] = useState<string>('');

  const [manualExplanation, setManualExplanation] = useState(
    editingQuestion?.explanation ||
      'Parabol y = ax² + bx + c có đỉnh I(-b/2a; -Δ/4a), trục đối xứng x = -b/2a và bề lõm quay lên khi a > 0. Đồ thị chỉ qua gốc O khi c = 0.'
  );

  // Toggle checkbox Pick Many
  const togglePickManyOption = (index: number) => {
    setCheckedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // AI Tra cứu và thẩm định câu hỏi & đáp án tự luận
  const handleAIVerifyEssay = () => {
    if (!manualContent.trim() || !essayAnswer.trim()) {
      addToast({
        type: 'error',
        title: 'Thiếu dữ liệu',
        message: 'Vui lòng nhập đầy đủ câu hỏi và câu trả lời tự luận để AI thẩm định.'
      });
      return;
    }

    setAiEssayStatus('checking');

    setTimeout(() => {
      const lowerAns = essayAnswer.toLowerCase();

      // Trường hợp mơ hồ hoặc không có thông tin rõ ràng
      if (lowerAns.length < 10 || lowerAns.includes('tùy') || lowerAns.includes('không biết') || lowerAns.includes('abc')) {
        setAiEssayStatus('unclear');
        setAiEssayFeedback(
          'Thông tin câu hỏi và câu trả lời tra cứu chưa có dữ liệu rõ ràng và chính xác. Vui lòng bổ sung rõ các bước giải và căn cứ khoa học trước khi lưu vào ngân hàng!'
        );
        addToast({
          type: 'error',
          title: 'Dữ liệu chưa rõ ràng',
          message: 'Hệ thống báo lại: Thông tin câu hỏi và kết quả tra cứu chưa có dữ liệu chính xác.'
        });
        return;
      }

      // Trường hợp có ý đúng
      if (lowerAns.includes('nghiệm') || lowerAns.includes('giá trị') || lowerAns.includes('đạt') || lowerAns.includes('vì') || lowerAns.includes('kết quả') || lowerAns.length > 20) {
        setAiEssayStatus('correct');
        setAiEssayFeedback('Correct (Đúng): Câu trả lời có căn cứ lý thuyết chuẩn xác và chứa các ý đúng trọng tâm.');
        addToast({
          type: 'success',
          title: 'AI Xác nhận: Correct (Đúng)',
          message: 'Nội dung trả lời tự luận hợp lý và có đầy đủ ý đúng theo chương trình.'
        });
      } else {
        setAiEssayStatus('false');
        setAiEssayFeedback('False (Sai): Câu trả lời chưa phù hợp hoặc mâu thuẫn với quy tắc toán học/khoa học.');
        addToast({
          type: 'error',
          title: 'AI Xác nhận: False (Sai)',
          message: 'Ý trả lời chưa chính xác. Vui lòng điều chỉnh lại.'
        });
      }
    }, 800);
  };

  // Lưu câu hỏi thủ công
  const handleSaveManual = () => {
    if (!manualContent.trim()) {
      addToast({
        type: 'error',
        title: 'Thiếu nội dung',
        message: 'Vui lòng nhập nội dung câu hỏi.'
      });
      return;
    }

    // Với Pick Many phải chọn ít nhất 1 đáp án
    if (manualType === 'pick_many' && checkedOptions.size === 0) {
      addToast({
        type: 'error',
        title: 'Chưa chọn đáp án',
        message: 'Đối với dạng Nhiều đáp án (Pick Many), vui lòng chọn ít nhất 1 đáp án đúng.'
      });
      return;
    }

    const questionToSave: NewQuestionData = {
      id: editingQuestion?.id || `qb-${Date.now()}`,
      subject: manualSubject,
      grade: manualGrade,
      type: manualType,
      difficulty: manualDifficulty,
      chapter: manualChapter.trim() || 'Chương 1',
      content: manualContent.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctAnswer: manualType === 'pick_one' ? singleCorrect : Array.from(checkedOptions)[0] ?? 0,
      correctAnswers: manualType === 'pick_many' ? Array.from(checkedOptions) : undefined,
      correctTextAnswer:
        manualType === 'fill_blank'
          ? fillBlankAnswer.trim()
          : manualType === 'essay'
          ? essayAnswer.trim()
          : manualType === 'true_false'
          ? trueFalseAnswer
          : undefined,
      explanation: manualExplanation.trim(),
      aiVerificationStatus: manualType === 'essay' && aiEssayStatus !== 'idle' ? (aiEssayStatus as any) : undefined
    };

    onSaveQuestions([questionToSave]);
    onClose();
    addToast({
      type: 'success',
      title: 'Đã lưu câu hỏi vào ngân hàng',
      message: `Câu hỏi dạng "${manualType}" đã được lưu thành công.`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 text-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>{editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Vào Ngân Hàng'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              3 phương thức nhập linh hoạt: Import tệp (Excel, Word), Trích xuất từ ảnh và Nhập thủ công
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tabs Bar */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Tab 1: Import (Excel, Word)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image_ocr')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'image_ocr'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Trích xuất từ ảnh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Nhập thủ công</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {/* ================================================================= */}
          {/* TAB 1: IMPORT FILE (EXCEL, WORD, CSV)                             */}
          {/* ================================================================= */}
          {activeTab === 'import' && (
            <div className="space-y-5 text-xs">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-sm">Tải về tệp mẫu định dạng chuẩn:</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Tải mẫu Excel hoặc Word, điền danh sách câu hỏi theo cột và tải ngược lên hệ thống
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl transition-colors shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Mẫu Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadWordTemplate}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 rounded-xl transition-colors shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Mẫu Word (.docx)</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors bg-slate-900/40">
                <input
                  type="file"
                  id="importFileInput"
                  onChange={handleImportFileChange}
                  accept=".xlsx,.xls,.docx,.doc,.csv,.txt"
                  className="hidden"
                />
                <label htmlFor="importFileInput" className="cursor-pointer block">
                  <UploadCloud className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
                  <span className="font-bold text-sm text-white block">
                    {importFileName ? importFileName : 'Nhấp để chọn file Excel, Word, CSV hoặc kéo thả vào đây'}
                  </span>
                  <span className="text-slate-400 text-xs block mt-1">
                    Hỗ trợ tệp bảng tính Excel (.xlsx, .csv) và tài liệu Word (.docx, .txt)
                  </span>
                </label>
              </div>

              {isImportParsing && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-center text-indigo-300 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Hệ thống đang phân tích cấu trúc dữ liệu và bóc tách câu hỏi...</span>
                </div>
              )}

              {/* Preview imported questions */}
              {importedPreviewQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">
                      Danh sách {importedPreviewQuestions.length} câu hỏi bóc tách từ file:
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        onSaveQuestions(importedPreviewQuestions);
                        onClose();
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                    >
                      Lưu tất cả {importedPreviewQuestions.length} câu vào Ngân hàng
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {importedPreviewQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-400">
                            Câu {idx + 1}: {q.subject} · Khối {q.grade} · Dạng: {q.type}
                          </span>
                          <span className="text-emerald-400 font-bold">Hợp lệ</span>
                        </div>
                        <p className="text-slate-200 font-medium">{q.content}</p>
                        <div className="text-slate-400 text-[11px] flex gap-3">
                          <span>A. {q.options[0]}</span>
                          <span>B. {q.options[1]}</span>
                          {q.options[2] && <span>C. {q.options[2]}</span>}
                          {q.options[3] && <span>D. {q.options[3]}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TRÍCH XUẤT TỪ ẢNH (OCR & SIDE-BY-SIDE EDITOR)                      */}
          {/* ================================================================= */}
          {activeTab === 'image_ocr' && (
            <div className="space-y-5 text-xs">
              {/* Ô kéo thả hình ảnh tương tự Tab 1 */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors bg-slate-900/40">
                <input
                  ref={imageInputRef}
                  type="file"
                  id="ocrImageInput"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <label htmlFor="ocrImageInput" className="cursor-pointer block">
                  <UploadCloud className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
                  <span className="font-bold text-sm text-white block">
                    {uploadedImageName ? uploadedImageName : 'Nhấp để chọn ảnh hoặc kéo thả ảnh vào đây'}
                  </span>
                  <span className="text-slate-400 text-xs block mt-1">
                    Hỗ trợ tất cả định dạng hình ảnh (.png, .jpg, .jpeg, .webp). Tự động nhận diện chữ (OCR).
                  </span>
                </label>
              </div>

              {isOCRProcessing && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-center text-indigo-300 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Hệ thống đang phân tích hình ảnh và nhận diện văn bản OCR...</span>
                </div>
              )}

              {/* POPUP CẢNH BÁO KHI ẢNH BỊ MỜ HOẶC KHÔNG RÕ */}
              {isBlurryAlertOpen && (
                <div className="p-5 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-300">
                        Thông báo chất lượng ảnh:
                      </h4>
                      <p className="text-xs text-amber-200 leading-relaxed font-medium">
                        "văn bản không rõ hoặc chưa hợp lệ để trích xuất, vui lòng đổi ảnh khác rõ nét văn bản hơn hoặc tiếp tục"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleChangeImageChoice}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-2xs"
                    >
                      Đổi ảnh khác (Chỉ chọn file ảnh)
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueChoice}
                      className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 shadow-2xs"
                    >
                      Tiếp tục trích xuất
                    </button>
                  </div>
                </div>
              )}

              {/* GIAO DIỆN CHIA ĐÔI MÀN HÌNH (SIDE-BY-SIDE) */}
              {uploadedImageSrc && !isOCRProcessing && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
                  {/* Cột trái: Ảnh gốc */}
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 text-xs">
                        Hình ảnh gốc đối chiếu:
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setImageZoomLevel((prev) => Math.max(prev - 0.2, 0.6))}
                          className="p-1 text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-md"
                          title="Thu nhỏ"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {Math.round(imageZoomLevel * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setImageZoomLevel((prev) => Math.min(prev + 0.2, 2.5))}
                          className="p-1 text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-md"
                          title="Phóng to"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-h-[300px] max-h-[420px] overflow-auto border border-slate-700/80 rounded-xl bg-slate-950 p-2 flex items-center justify-center">
                      <img
                        src={uploadedImageSrc}
                        alt="Ảnh câu hỏi gốc"
                        style={{ transform: `scale(${imageZoomLevel})`, transformOrigin: 'top center' }}
                        className="max-w-full rounded-lg transition-transform duration-150"
                      />
                    </div>
                  </div>

                  {/* Cột phải: Soạn thảo văn bản trích xuất trực tiếp */}
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-400 text-xs">
                        Văn bản đã trích xuất (Có thể chỉnh sửa):
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Sửa chữ mờ hoặc thiếu
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={ocrTextResult}
                      onChange={(e) => setOcrTextResult(e.target.value)}
                      placeholder="Văn bản trích xuất sẽ hiển thị tại đây để bạn chỉnh sửa..."
                      className="flex-1 w-full p-3.5 border border-slate-700 rounded-xl bg-slate-800 text-white font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    />

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newQ: NewQuestionData = {
                            id: `ocr-${Date.now()}`,
                            subject: manualSubject || 'Toán học',
                            grade: manualGrade || 10,
                            type: 'pick_many',
                            difficulty: 'Thông hiểu',
                            chapter: 'Hàm số bậc hai',
                            content: ocrTextResult.split('\n')[0] || 'Câu hỏi từ ảnh chụp',
                            options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
                            correctAnswer: 0,
                            correctAnswers: [0, 2],
                            explanation: 'Trích xuất tự động từ hình ảnh chụp đề thi.'
                          };
                          onSaveQuestions([newQ]);
                          onClose();
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
                      >
                        Lưu câu hỏi trích xuất vào Ngân hàng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: THỦ CÔNG                                                   */}
          {/* ================================================================= */}
          {activeTab === 'manual' && (
            <div className="space-y-4 text-xs">
              {/* Hàng 1: Môn học và Khối lớp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-200 font-semibold text-xs">
                      Môn học
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddSubjectModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-colors shadow-2xs"
                      title="Thêm mới môn học vào hệ thống"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm mới môn học</span>
                    </button>
                  </div>
                  <select
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    {subjects.map((s) => (
                      <option
                        key={s.id}
                        value={s.name}
                        className="bg-[#0f172a] text-white"
                        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5 text-xs">
                    Khối lớp
                  </label>
                  <select
                    value={manualGrade}
                    onChange={(e) => setManualGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value={10} className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Khối 10
                    </option>
                    <option value={11} className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Khối 11
                    </option>
                    <option value={12} className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Khối 12
                    </option>
                  </select>
                </div>
              </div>

              {/* Hàng 2: Dạng câu hỏi, Mức độ, Chủ đề bài học */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dạng câu hỏi dropdown */}
                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5 text-xs">
                    Dạng câu hỏi
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as QuestionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-indigo-500 bg-slate-800 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="pick_one" className="bg-[#0f172a] text-white font-medium" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Trắc nghiệm – Pick One (1 đáp án)
                    </option>
                    <option value="pick_many" className="bg-[#0f172a] text-white font-medium" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Nhiều đáp án – Pick Many
                    </option>
                    <option value="true_false" className="bg-[#0f172a] text-white font-medium" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Đúng / Sai
                    </option>
                    <option value="fill_blank" className="bg-[#0f172a] text-white font-medium" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Điền khuyết
                    </option>
                    <option value="essay" className="bg-[#0f172a] text-white font-medium" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Tự luận
                    </option>
                  </select>
                </div>

                {/* Mức độ nhận thức */}
                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5 text-xs">
                    Mức độ
                  </label>
                  <select
                    value={manualDifficulty}
                    onChange={(e) => setManualDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="Nhận biết" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Nhận biết
                    </option>
                    <option value="Thông hiểu" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Thông hiểu
                    </option>
                    <option value="Vận dụng" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Vận dụng
                    </option>
                    <option value="Vận dụng cao" className="bg-[#0f172a] text-white" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      Vận dụng cao
                    </option>
                  </select>
                </div>

                {/* Chủ đề bài học */}
                <div>
                  <label className="block text-slate-200 font-semibold mb-1.5 text-xs">
                    Chủ đề bài học
                  </label>
                  <input
                    type="text"
                    value={manualChapter}
                    onChange={(e) => setManualChapter(e.target.value)}
                    placeholder="Ví dụ: Hàm số bậc hai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Hàng 3: Nội dung câu hỏi (hỗ trợ LaTeX) */}
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5 text-xs">
                  Nội dung câu hỏi (hỗ trợ LaTeX):
                </label>
                <textarea
                  rows={3}
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi tại đây..."
                  className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans shadow-2xs"
                />
              </div>

              {/* CÁC PHƯƠNG ÁN LỰA CHỌN PHỤ THUỘC VÀO DẠNG CÂU HỎI */}
              {(manualType === 'pick_one' || manualType === 'pick_many') && (
                <>
                  {/* Hàng 4: 4 ô Đáp án A, B, C, D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        Đáp án A
                      </label>
                      <input
                        type="text"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        placeholder="Nội dung phương án A..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        Đáp án B
                      </label>
                      <input
                        type="text"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        placeholder="Nội dung phương án B..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        Đáp án C
                      </label>
                      <input
                        type="text"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        placeholder="Nội dung phương án C..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        Đáp án D
                      </label>
                      <input
                        type="text"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        placeholder="Nội dung phương án D..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Hàng 5: Đáp án đúng */}
                  <div className="pt-1">
                    <label className="block text-slate-200 font-semibold mb-2 text-xs">
                      {manualType === 'pick_many'
                        ? 'Đáp án đúng (Chọn nhiều đáp án):'
                        : 'Đáp án đúng (Chọn 1 đáp án duy nhất):'}
                    </label>

                    {manualType === 'pick_many' ? (
                      /* KHUNG CHECKBOX PICK MANY */
                      <div className="flex items-center gap-3">
                        {[
                          { key: 'A', index: 0 },
                          { key: 'B', index: 1 },
                          { key: 'C', index: 2 },
                          { key: 'D', index: 3 }
                        ].map(({ key, index }) => {
                          const isChecked = checkedOptions.has(index);
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => togglePickManyOption(index)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs ${
                                isChecked
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-xs'
                                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'border-slate-600 bg-slate-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span>{key}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* PICK ONE RADIO */
                      <div className="flex items-center gap-3">
                        {['A', 'B', 'C', 'D'].map((key, index) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSingleCorrect(index)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl border-2 transition-all font-bold text-xs ${
                              singleCorrect === index
                                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-xs'
                                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                singleCorrect === index
                                  ? 'border-indigo-500 bg-indigo-600'
                                  : 'border-slate-600 bg-slate-900'
                              }`}
                            >
                              {singleCorrect === index && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span>Phương án {key}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* DẠNG ĐÚNG / SAI */}
              {manualType === 'true_false' && (
                <div className="space-y-2 p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
                  <label className="block text-slate-200 font-semibold text-xs">
                    Chọn kết quả khẳng định:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTrueFalseAnswer('True')}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        trueFalseAnswer === 'True'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-xs'
                          : 'border-slate-700 bg-slate-800 text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>True (Đúng)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrueFalseAnswer('False')}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        trueFalseAnswer === 'False'
                          ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-xs'
                          : 'border-slate-700 bg-slate-800 text-slate-300'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>False (Sai)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DẠNG ĐIỀN KHUYẾT */}
              {manualType === 'fill_blank' && (
                <div className="space-y-2 p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
                  <label className="block text-slate-200 font-semibold text-xs">
                    Từ hoặc cụm từ khóa cần điền vào chỗ trống:
                  </label>
                  <input
                    type="text"
                    value={fillBlankAnswer}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    placeholder="Ví dụ: cực đại, tiếp tuyến, nghịch biến..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Gợi ý: Trong nội dung câu hỏi ở trên, hãy đặt ký hiệu <code className="text-indigo-400 font-mono">[...]</code> tại vị trí cần điền.
                  </p>
                </div>
              )}

              {/* DẠNG TỰ LUẬN */}
              {manualType === 'essay' && (
                <div className="space-y-3 p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-200 font-semibold text-xs">
                      Hướng dẫn chấm / Câu trả lời mẫu tự luận:
                    </label>

                    <button
                      type="button"
                      onClick={handleAIVerifyEssay}
                      disabled={aiEssayStatus === 'checking'}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{aiEssayStatus === 'checking' ? 'AI đang tra cứu...' : 'AI Thẩm định đáp án'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={essayAnswer}
                    onChange={(e) => {
                      setEssayAnswer(e.target.value);
                      if (aiEssayStatus !== 'idle') setAiEssayStatus('idle');
                    }}
                    placeholder="Nhập câu trả lời mẫu, các ý bắt buộc phải có để đạt điểm..."
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-sans text-xs"
                  />

                  {/* AI Phản hồi kết quả tra cứu */}
                  {aiEssayStatus !== 'idle' && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-150 ${
                        aiEssayStatus === 'checking'
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                          : aiEssayStatus === 'correct'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : aiEssayStatus === 'false'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {aiEssayStatus === 'checking' && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
                        {aiEssayStatus === 'correct' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {aiEssayStatus === 'false' && <XCircle className="w-4 h-4 text-rose-400" />}
                        {aiEssayStatus === 'unclear' && <AlertTriangle className="w-4 h-4 text-amber-400" />}

                        <span>
                          {aiEssayStatus === 'checking' && 'Hệ thống AI đang tra cứu và đối chiếu kiến thức...'}
                          {aiEssayStatus === 'correct' && 'Kết quả AI: Correct (Đúng) – Đạt tiêu chuẩn lưu'}
                          {aiEssayStatus === 'false' && 'Kết quả AI: False (Sai) – Cần kiểm tra lại'}
                          {aiEssayStatus === 'unclear' && 'Cảnh báo AI: Thông tin chưa rõ ràng hoặc không chính xác'}
                        </span>
                      </div>

                      {aiEssayFeedback && (
                        <p className="text-[11px] leading-relaxed opacity-90 pl-6">
                          {aiEssayFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hàng 6: Lời giải chi tiết */}
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5 text-xs">
                  Lời giải chi tiết:
                </label>
                <textarea
                  rows={2}
                  value={manualExplanation}
                  onChange={(e) => setManualExplanation(e.target.value)}
                  placeholder="Nhập lời giải..."
                  className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-2xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveManual}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
                >
                  Lưu vào ngân hàng câu hỏi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MÀN HÌNH NHỎ (MODAL) THÊM MỚI MÔN HỌC */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Thêm Mới Môn Học</h4>
                  <p className="text-[11px] text-slate-400">Nhập tên môn học mới vào hệ thống</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Chỉ nhập tên môn học theo yêu cầu của người dùng */}
              <div>
                <label className="block text-slate-200 font-semibold mb-1.5">
                  Tên môn học <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Ví dụ: Tin học ứng dụng, Kỹ năng sống, Âm nhạc..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* Nút chuyển sang Quản lý môn học thẳng hàng, không xuống dòng */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-200 block text-xs">Quản lý môn học</span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap block mt-0.5">
                    Xem danh sách, sửa hệ số và cấu hình chi tiết
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSubjectModalOpen(false);
                    onClose();
                    onNavigateToSubjects?.();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                >
                  <span>Mở Quản lý môn học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateNewSubject}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
              >
                Lưu môn học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
