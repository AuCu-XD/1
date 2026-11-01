import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  BookOpen,
  Tag,
  Download,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  Check,
  XCircle,
  FileText,
  Brain,
  Database,
  RefreshCw,
  Activity,
  Layers,
  X
} from 'lucide-react';
import { AddQuestionModal, NewQuestionData, QuestionType } from './AddQuestionModal';
import {
  fetchQuestionsFromFirestore,
  saveQuestionToFirestore,
  saveQuestionsBatchToFirestore,
  deleteQuestionFromFirestore,
  seedQuestionsIfEmpty,
  runQuestionBankFirestoreTest,
  FirestoreFullTestResult
} from '../../lib/firebase';
import firebaseConfig from '../../../firebase-applet-config.json';

export interface QuestionItem {
  id: string;
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
  authorId?: string;
  authorEmail?: string;
  updatedAt?: string;
}

export interface QuestionBankModuleProps {
  onNavigateToSubjects?: () => void;
}

const INITIAL_SAMPLE_QUESTIONS: QuestionItem[] = [
  {
    id: 'qb-1',
    subject: 'Toán học',
    grade: 10,
    type: 'pick_many',
    difficulty: 'Thông hiểu',
    chapter: 'Hàm số bậc hai',
    content: 'Cho hàm số bậc hai y = ax² + bx + c (a ≠ 0). Những khẳng định nào sau đây là ĐÚNG?',
    options: [
      'Tọa độ đỉnh parabol là I(-b/2a; -Δ/4a)',
      'Trục đối xứng là đường thẳng x = -b/2a',
      'Khi a > 0 bề lõm parabol quay lên trên',
      'Đồ thị luôn đi qua gốc tọa độ O(0; 0)'
    ],
    correctAnswer: 0,
    correctAnswers: [0, 1, 2],
    explanation: 'Parabol y = ax² + bx + c có đỉnh I(-b/2a; -Δ/4a), trục đối xứng x = -b/2a và bề lõm quay lên khi a > 0.'
  },
  {
    id: 'qb-2',
    subject: 'Toán học',
    grade: 10,
    type: 'pick_one',
    difficulty: 'Nhận biết',
    chapter: 'Mệnh đề và tập hợp',
    content: 'Cho tập hợp A = {x ∈ R | x² - 4 = 0}. Tập hợp A viết dưới dạng liệt kê các phần tử là:',
    options: ['A = {-2; 2}', 'A = {2}', 'A = {-2}', 'A = {0; 2}'],
    correctAnswer: 0,
    explanation: 'Phương trình x² - 4 = 0 có hai nghiệm phân biệt x = 2 và x = -2.'
  },
  {
    id: 'qb-3',
    subject: 'Vật lý',
    grade: 10,
    type: 'true_false',
    difficulty: 'Nhận biết',
    chapter: 'Động học chất điểm',
    content: 'Gia tốc rơi tự do g ở gần mặt đất có giá trị xấp xỉ bằng 9.8 m/s² và có phương thẳng đứng, chiều từ trên xuống dưới?',
    options: ['Đúng (True)', 'Sai (False)'],
    correctAnswer: 0,
    correctTextAnswer: 'True',
    explanation: 'Gia tốc trọng trường gần mặt đất là g ≈ 9.8 m/s² theo phương thẳng đứng hướng tâm Trái Đất.'
  },
  {
    id: 'qb-4',
    subject: 'Tiếng Anh',
    grade: 10,
    type: 'fill_blank',
    difficulty: 'Thông hiểu',
    chapter: 'Family Life',
    content: 'In my family, both my parents [...] hands to do the heavy lifting and household chores.',
    options: ['join', 'shake', 'give', 'hold'],
    correctAnswer: 0,
    correctTextAnswer: 'join',
    explanation: 'Cụm thành ngữ cố định "join hands" nghĩa là chung tay, cùng nhau làm việc.'
  },
  {
    id: 'qb-5',
    subject: 'Toán học',
    grade: 10,
    type: 'essay',
    difficulty: 'Vận dụng cao',
    chapter: 'Ứng dụng thực tế Parabol',
    content: 'Một chiếc cổng chào hình parabol có chiều rộng ở chân cổng là 8m và chiều cao đỉnh là 6m. Hãy viết phương trình của parabol và tính độ cao của cổng tại điểm cách chân cổng 2m.',
    options: [],
    correctAnswer: 0,
    correctTextAnswer: 'Phương trình parabol là y = -3/8 x² + 6 (gốc tọa độ tại trung điểm chân cổng). Độ cao tại điểm cách chân cổng 2m (tương ứng x = 2) là y = 4.5 mét.',
    explanation: 'Thiết lập hệ trục tọa độ với gốc O tại trung điểm chân cổng. Đỉnh I(0, 6) và qua điểm (4, 0). Suy ra a = -6/16 = -3/8. Tại x = 2, y = -3/8(4) + 6 = 4.5m.',
    aiVerificationStatus: 'correct'
  }
];

export const QuestionBankModule: React.FC<QuestionBankModuleProps> = ({ onNavigateToSubjects }) => {
  const { subjects, activeUser, switchRole, addToast, firebaseUser } = useApp();

  // Quyền: Chỉ tài khoản Giáo viên và Quản trị viên mới được thay đổi, chỉnh sửa và thêm câu hỏi
  const canManage = activeUser.role === 'admin' || activeUser.role === 'teacher';

  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_SAMPLE_QUESTIONS);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Diagnostic Test State
  const [isTestingFirestore, setIsTestingFirestore] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<FirestoreFullTestResult | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set(['qb-1']));

  // Tải dữ liệu thật từ Cloud Firestore khi mở màn hình
  const loadQuestionsFromCloud = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsSyncing(true);
    else setIsLoadingFirestore(true);

    try {
      const cloudData = await seedQuestionsIfEmpty(INITIAL_SAMPLE_QUESTIONS);
      if (cloudData && cloudData.length > 0) {
        setQuestions(cloudData);
      }
      if (isManualRefresh) {
        addToast({
          type: 'success',
          title: 'Đã làm mới từ Cloud Firestore',
          message: `Đã đồng bộ ${cloudData.length} câu hỏi mới nhất từ đám mây.`
        });
      }
    } catch (err: any) {
      console.warn('Lỗi khi tải câu hỏi từ Cloud Firestore:', err);
      if (isManualRefresh) {
        addToast({
          type: 'error',
          title: 'Không thể đồng bộ Firestore',
          message: err?.message || 'Vui lòng kiểm tra kết nối mạng hoặc phiên đăng nhập.'
        });
      }
    } finally {
      setIsLoadingFirestore(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadQuestionsFromCloud();
  }, []);

  const toggleQuestionExpansion = (id: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddModal = () => {
    if (!canManage) return;
    setEditingQuestion(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (q: QuestionItem) => {
    if (!canManage) return;
    setEditingQuestion(q);
    setIsAddModalOpen(true);
  };

  // Xóa câu hỏi khỏi Cloud Firestore
  const handleDeleteQuestion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManage) return;

    // Cập nhật giao diện tức thì
    setQuestions((prev) => prev.filter((q) => q.id !== id));

    try {
      await deleteQuestionFromFirestore(id);
      addToast({
        type: 'info',
        title: 'Đã xóa câu hỏi trên Cloud Firestore',
        message: 'Dữ liệu câu hỏi đã được đồng bộ xóa sạch khỏi máy chủ Google.'
      });
    } catch (err: any) {
      console.error('Lỗi xóa Firestore:', err);
      addToast({
        type: 'error',
        title: 'Lỗi đồng bộ xóa Firestore',
        message: err?.message || 'Không thể xóa dữ liệu trên đám mây.'
      });
    }
  };

  // Lưu một hoặc nhiều câu hỏi vào Cloud Firestore
  const handleSaveQuestions = async (newQuestions: NewQuestionData[]) => {
    if (!canManage) return;

    if (editingQuestion) {
      // Cập nhật câu hỏi đang sửa
      const updated = newQuestions[0];
      const updatedItem: QuestionItem = {
        ...editingQuestion,
        ...updated,
        id: editingQuestion.id,
        authorId: activeUser.id,
        authorEmail: activeUser.email,
        updatedAt: new Date().toISOString()
      };

      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? updatedItem : q))
      );

      try {
        await saveQuestionToFirestore(updatedItem);
        addToast({
          type: 'success',
          title: 'Đã cập nhật trên Cloud Firestore',
          message: 'Thông tin câu hỏi đã được lưu lâu dài vào Firestore.'
        });
      } catch (err: any) {
        console.error('Lỗi cập nhật Firestore:', err);
        addToast({
          type: 'error',
          title: 'Lỗi lưu Firestore',
          message: err?.message || 'Không thể lưu câu hỏi vào đám mây.'
        });
      }
    } else {
      // Thêm các câu hỏi mới
      const formattedItems: QuestionItem[] = newQuestions.map((nq, i) => ({
        id: nq.id || `qb-${Date.now()}-${i}`,
        subject: nq.subject,
        grade: nq.grade,
        type: nq.type,
        difficulty: nq.difficulty,
        chapter: nq.chapter,
        content: nq.content,
        options: nq.options || [],
        correctAnswer: nq.correctAnswer ?? 0,
        correctAnswers: nq.correctAnswers,
        correctTextAnswer: nq.correctTextAnswer,
        explanation: nq.explanation || 'Lời giải chi tiết.',
        aiVerificationStatus: nq.aiVerificationStatus,
        authorId: activeUser.id,
        authorEmail: activeUser.email,
        updatedAt: new Date().toISOString()
      }));

      setQuestions((prev) => [...formattedItems, ...prev]);

      try {
        if (formattedItems.length === 1) {
          await saveQuestionToFirestore(formattedItems[0]);
        } else {
          await saveQuestionsBatchToFirestore(formattedItems);
        }
        addToast({
          type: 'success',
          title: 'Đã lưu vào Cloud Firestore',
          message: `Đã lưu thành công ${formattedItems.length} câu hỏi vào Cloud Firestore.`
        });
      } catch (err: any) {
        console.error('Lỗi thêm mới Firestore:', err);
        addToast({
          type: 'error',
          title: 'Lỗi lưu Firestore',
          message: err?.message || 'Không thể lưu câu hỏi vào đám mây.'
        });
      }
    }
  };

  // Chạy quy trình kiểm thử 4 bước Firestore (Tạo -> Đọc -> Sửa -> Xóa)
  const handleRunDiagnosticTest = async () => {
    setIsTestingFirestore(true);
    try {
      const result = await runQuestionBankFirestoreTest();
      setTestResult(result);
      setIsTestModalOpen(true);
      if (result.overallSuccess) {
        addToast({
          type: 'success',
          title: 'Kiểm thử Firestore đạt 100%',
          message: 'Cả 4 bước Tạo, Đọc, Sửa, Xóa đều đã thực thi thành công trên Google Cloud!'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Kiểm thử chưa đạt',
          message: 'Một số bước kiểm thử bị lỗi hoặc bị từ chối quyền.'
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Lỗi kiểm thử',
        message: e?.message || 'Không thể chạy quy trình kiểm thử.'
      });
    } finally {
      setIsTestingFirestore(false);
    }
  };

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = selectedSubject === 'all' || q.subject === selectedSubject;
    const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchType = selectedType === 'all' || q.type === selectedType;
    return matchSearch && matchSub && matchDiff && matchType;
  });

  const getDifficultyBadge = (diff: QuestionItem['difficulty']) => {
    switch (diff) {
      case 'Nhận biết':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Thông hiểu':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Vận dụng':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Vận dụng cao':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'pick_one':
        return { label: 'Pick One (1 đáp án)', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' };
      case 'pick_many':
        return { label: 'Nhiều đáp án (Pick Many)', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700' };
      case 'true_false':
        return { label: 'Đúng / Sai', color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
      case 'fill_blank':
        return { label: 'Điền khuyết', color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' };
      case 'essay':
        return { label: 'Tự luận', color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
      default:
        return { label: 'Trắc nghiệm', color: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Cloud Firestore Status & Self-Test Banner */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Cloud Firestore Database:</span>
                <span className="font-mono text-indigo-400 font-semibold">{firebaseConfig.projectId}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Đang lưu trữ <strong className="text-white font-mono">{questions.length}</strong> câu hỏi thực tế trên Cloud Firestore. Tải lại trang dữ liệu vẫn giữ nguyên vẹn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => loadQuestionsFromCloud(true)}
            disabled={isSyncing || isLoadingFirestore}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Tải lại danh sách từ Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>

          <button
            type="button"
            onClick={handleRunDiagnosticTest}
            disabled={isTestingFirestore}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-2xs hover:shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
            title="Chạy quy trình kiểm thử tạo, đọc, sửa, xóa câu hỏi trên Firestore"
          >
            <Activity className={`w-3.5 h-3.5 ${isTestingFirestore ? 'animate-spin' : ''}`} />
            <span>{isTestingFirestore ? 'Đang kiểm thử...' : 'Kiểm thử 4 bước Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Cảnh báo phân quyền đối với học sinh/phụ huynh */}
      {!canManage && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
              Bạn đang ở chế độ xem / luyện tập <strong className="font-bold uppercase">({activeUser.role === 'student' ? 'Học sinh' : 'Phụ huynh'})</strong>. Chỉ tài khoản <strong>Giáo viên</strong> và <strong>Quản trị viên</strong> mới được thay đổi, chỉnh sửa và thêm câu hỏi vào ngân hàng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchRole('teacher')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            Chuyển quyền Giáo viên
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Ngân Hàng Câu Hỏi</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Kho lưu trữ câu hỏi Cloud Firestore đa dạng (Pick One, Pick Many, Đúng/Sai, Điền khuyết, Tự luận) với 3 phương thức nhập thông minh
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập / Thêm câu hỏi (3 phương thức)</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi, chủ đề bài học..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all" className="bg-[#0f172a] text-white">Tất cả dạng câu hỏi</option>
          <option value="pick_one" className="bg-[#0f172a] text-white">Trắc nghiệm – Pick One</option>
          <option value="pick_many" className="bg-[#0f172a] text-white">Nhiều đáp án – Pick Many</option>
          <option value="true_false" className="bg-[#0f172a] text-white">Đúng / Sai</option>
          <option value="fill_blank" className="bg-[#0f172a] text-white">Điền khuyết</option>
          <option value="essay" className="bg-[#0f172a] text-white">Tự luận</option>
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all" className="bg-[#0f172a] text-white">Tất cả môn học</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name} className="bg-[#0f172a] text-white">
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all" className="bg-[#0f172a] text-white">Tất cả mức độ</option>
          <option value="Nhận biết" className="bg-[#0f172a] text-white">Nhận biết</option>
          <option value="Thông hiểu" className="bg-[#0f172a] text-white">Thông hiểu</option>
          <option value="Vận dụng" className="bg-[#0f172a] text-white">Vận dụng</option>
          <option value="Vận dụng cao" className="bg-[#0f172a] text-white">Vận dụng cao</option>
        </select>
      </div>

      {/* Question Cards List */}
      <div className="space-y-3.5">
        {filtered.map((q, index) => {
          const typeBadge = getTypeLabel(q.type);
          const isExpanded = expandedQuestionIds.has(q.id);

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-5 transition-all shadow-xs space-y-3"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Câu {index + 1}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {q.subject} · Khối {q.grade}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeBadge.color}`}>
                    {typeBadge.label}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyBadge(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {q.chapter}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(q)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteQuestion(q.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Xóa câu hỏi khỏi Cloud Firestore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleQuestionExpansion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {q.content}
              </div>

              {/* Chi tiết câu trả lời khi mở rộng */}
              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  {/* Trắc nghiệm Pick One & Pick Many */}
                  {(q.type === 'pick_one' || q.type === 'pick_many') && q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const optLetter = String.fromCharCode(65 + optIdx);
                        const isCorrect =
                          q.type === 'pick_many'
                            ? q.correctAnswers?.includes(optIdx)
                            : q.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                              isCorrect
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 font-semibold'
                                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {optLetter}
                            </span>
                            <span className="flex-1 mt-0.5">{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dạng Đúng / Sai */}
                  {q.type === 'true_false' && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Khẳng định trên là:</span>
                      <span
                        className={`font-bold px-3 py-1 rounded-lg text-xs ${
                          q.correctTextAnswer === 'True' || q.correctAnswer === 0
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                        }`}
                      >
                        {q.correctTextAnswer === 'True' || q.correctAnswer === 0 ? 'ĐÚNG (True)' : 'SAI (False)'}
                      </span>
                    </div>
                  )}

                  {/* Dạng Điền khuyết */}
                  {q.type === 'fill_blank' && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Từ khóa cần điền vào [...] :</span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-3 py-1 rounded-lg border border-purple-300">
                        {q.correctTextAnswer || 'Chưa thiết lập'}
                      </span>
                    </div>
                  )}

                  {/* Dạng Tự luận */}
                  {q.type === 'essay' && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <span className="text-slate-500 font-semibold block">Hướng dẫn chấm / Câu trả lời mẫu:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed">
                        {q.correctTextAnswer || 'Học sinh trình bày đúng các bước giải và kết luận.'}
                      </p>
                    </div>
                  )}

                  {/* Lời giải chi tiết */}
                  {q.explanation && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
                      <strong className="text-indigo-900 dark:text-indigo-300 block mb-0.5">Lời giải chi tiết:</strong>
                      <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Nhập Câu Hỏi */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingQuestion(null);
        }}
        onSaveQuestions={handleSaveQuestions}
        editingQuestion={editingQuestion}
        onNavigateToSubjects={onNavigateToSubjects}
      />

      {/* Modal Kết Quả Kiểm Thử Cloud Firestore */}
      {isTestModalOpen && testResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${testResult.overallSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {testResult.overallSuccess ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Báo Cáo Kiểm Thử Cloud Firestore</h3>
                  <p className="text-[11px] text-slate-400">Kiểm tra kết nối và thao tác dữ liệu 4 bước thực tế</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông số kết nối */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Google Cloud Project:</span>
                <span className="font-mono text-indigo-400 font-semibold">{testResult.projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Firestore Database ID:</span>
                <span className="font-mono text-emerald-400 font-semibold">{testResult.databaseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tài khoản xác thực:</span>
                <span className="font-mono text-white">{testResult.currentUser?.email || (firebaseUser ? firebaseUser.email : 'Tài khoản hệ thống')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian kiểm tra:</span>
                <span className="text-slate-300">{testResult.testedAt}</span>
              </div>
            </div>

            {/* Danh sách 4 bước kiểm thử */}
            <div className="space-y-2 text-xs">
              {testResult.steps.map((st, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    st.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {st.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        Bước {i + 1}: {st.title} [{st.step}]
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{st.timestamp}</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">{st.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">
                {testResult.overallSuccess ? '✓ Tất cả các phép thử đều thành công.' : '⚠️ Có bước kiểm thử không hoàn tất.'}
              </span>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
              >
                Đóng báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
