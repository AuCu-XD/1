import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  FileCheck2,
  Plus,
  Play,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Users,
  Search,
  Filter,
  Check,
  ShieldAlert,
  ArrowRight,
  Eye,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  className: string;
  durationMinutes: number;
  totalQuestions: number;
  totalScore: number;
  attemptsCount: number;
  status: 'active' | 'upcoming' | 'closed';
  questions: QuizQuestion[];
}

interface StudentQuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  className: string;
  submittedAt: string;
  autoScore: number;
  totalQuestions: number;
  correctAnswersCount: number;
  userAnswers: Record<number, number>;
  status: 'pending_approval' | 'approved';
  teacherFeedback?: string;
  approvedScore?: number;
}

export const QuizModule: React.FC = () => {
  const { classes, subjects, activeUser, addToast, switchRole } = useApp();

  const isTeacher = activeUser.role === 'teacher' || activeUser.role === 'admin';
  const isStudent = activeUser.role === 'student';
  const isParent = activeUser.role === 'parent';

  // Sub-tabs for Teacher: 'pending_submissions' | 'quiz_list'
  const [teacherTab, setTeacherTab] = useState<'pending_submissions' | 'quiz_list'>('pending_submissions');

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 'quiz-1',
      title: 'Kiểm tra trắc nghiệm 15 phút: Đại số & Hàm số bậc hai',
      subject: 'Toán học',
      className: '10A1',
      durationMinutes: 15,
      totalQuestions: 5,
      totalScore: 10,
      attemptsCount: 38,
      status: 'active',
      questions: [
        {
          id: 1,
          question: 'Đồ thị hàm số y = ax² + bx + c (a ≠ 0) có toạ độ đỉnh I là gì?',
          options: [
            'I(-b/2a; -Δ/4a)',
            'I(b/2a; Δ/4a)',
            'I(-b/a; -c/a)',
            'I(b/a; c/a)'
          ],
          correctAnswer: 0,
          explanation: 'Tọa độ đỉnh của parabol là I(-b/(2a), -Δ/(4a)).'
        },
        {
          id: 2,
          question: 'Trục đối xứng của parabol y = x² - 4x + 3 là đường thẳng:',
          options: ['x = 2', 'x = -2', 'x = 4', 'y = 2'],
          correctAnswer: 0,
          explanation: 'Trục đối xứng là x = -b/(2a) = -(-4)/(2*1) = 2.'
        },
        {
          id: 3,
          question: 'Hàm số y = -2x² + 4x + 1 đồng biến trên khoảng nào?',
          options: ['(-∞; 1)', '(1; +∞)', '(-∞; 2)', '(2; +∞)'],
          correctAnswer: 0,
          explanation: 'Vì a = -2 < 0 nên hàm số đồng biến trên khoảng (-∞; -b/(2a)) = (-∞; 1).'
        },
        {
          id: 4,
          question: 'Biệt thức Δ của phương trình x² - 6x + 9 = 0 là:',
          options: ['0', '9', '-9', '36'],
          correctAnswer: 0,
          explanation: 'Δ = b² - 4ac = (-6)² - 4*1*9 = 36 - 36 = 0.'
        },
        {
          id: 5,
          question: 'Tập xác định của hàm số y = √(x - 3) là:',
          options: ['[3; +∞)', '(3; +∞)', '(-∞; 3]', 'R \\ {3}'],
          correctAnswer: 0,
          explanation: 'Điều kiện: x - 3 ≥ 0 <=> x ≥ 3. Tập xác định D = [3; +∞).'
        }
      ]
    },
    {
      id: 'quiz-2',
      title: 'Quiz Tiếng Anh Unit 3: Music & Arts Vocabulary',
      subject: 'Tiếng Anh',
      className: '10A1',
      durationMinutes: 20,
      totalQuestions: 4,
      totalScore: 10,
      attemptsCount: 42,
      status: 'active',
      questions: [
        {
          id: 1,
          question: 'The singer made her debut album ______ 2021.',
          options: ['in', 'at', 'on', 'by'],
          correctAnswer: 0,
          explanation: 'Dùng giới từ "in" trước các năm (in 2021).'
        },
        {
          id: 2,
          question: 'Which word means "a person who writes music"?',
          options: ['Composer', 'Audience', 'Conductor', 'Vocalist'],
          correctAnswer: 0,
          explanation: 'Composer nghĩa là nhà soạn nhạc.'
        },
        {
          id: 3,
          question: 'The live concert was completely ______ out within ten minutes.',
          options: ['sold', 'bought', 'played', 'given'],
          correctAnswer: 0,
          explanation: 'Cụm từ "sold out" nghĩa là bán sạch vé.'
        },
        {
          id: 4,
          question: 'She has a beautiful voice and sings very ______.',
          options: ['sweetly', 'sweet', 'sweeter', 'sweetness'],
          correctAnswer: 0,
          explanation: 'Cần một trạng từ (sweetly) để bổ nghĩa cho động từ "sings".'
        }
      ]
    }
  ]);

  // Danh sách bài nộp chờ duyệt và tự động chấm
  const [submissions, setSubmissions] = useState<StudentQuizSubmission[]>([
    {
      id: 'sub-1',
      quizId: 'quiz-1',
      quizTitle: 'Kiểm tra trắc nghiệm 15 phút: Đại số & Hàm số bậc hai',
      studentId: 's1',
      studentName: 'Nguyễn Văn An',
      className: '10A1',
      submittedAt: 'Hôm nay, 08:35',
      autoScore: 10,
      totalQuestions: 5,
      correctAnswersCount: 5,
      userAnswers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      status: 'pending_approval'
    },
    {
      id: 'sub-2',
      quizId: 'quiz-1',
      quizTitle: 'Kiểm tra trắc nghiệm 15 phút: Đại số & Hàm số bậc hai',
      studentId: 's2',
      studentName: 'Trần Thị Mai',
      className: '10A1',
      submittedAt: 'Hôm nay, 08:38',
      autoScore: 8,
      totalQuestions: 5,
      correctAnswersCount: 4,
      userAnswers: { 0: 0, 1: 0, 2: 1, 3: 0, 4: 0 },
      status: 'pending_approval'
    },
    {
      id: 'sub-3',
      quizId: 'quiz-2',
      quizTitle: 'Quiz Tiếng Anh Unit 3: Music & Arts Vocabulary',
      studentId: 's3',
      studentName: 'Lê Quốc Bảo',
      className: '10A1',
      submittedAt: 'Hôm qua, 15:20',
      autoScore: 10,
      totalQuestions: 4,
      correctAnswersCount: 4,
      userAnswers: { 0: 0, 1: 0, 2: 0, 3: 0 },
      status: 'approved',
      teacherFeedback: 'Xuất sắc! Từ vựng chuẩn xác và hoàn thành trước thời hạn 5 phút.',
      approvedScore: 10
    }
  ]);

  // Review submission modal state for Teacher
  const [reviewingSubmission, setReviewingSubmission] = useState<StudentQuizSubmission | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewScore, setReviewScore] = useState<number>(10);

  // Taking Quiz state for Student
  const [activeQuizToTake, setActiveQuizToTake] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; correctCount: number } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Timer countdown
  useEffect(() => {
    if (!activeQuizToTake || quizSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuizToTake, quizSubmitted]);

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuizToTake(q);
    setUserAnswers({});
    setQuizSubmitted(false);
    setScoreResult(null);
    setSecondsRemaining(q.durationMinutes * 60);
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  // Student submits quiz -> Auto graded & sent to teacher for approval
  const handleSubmitQuiz = () => {
    if (!activeQuizToTake || quizSubmitted) return;
    setQuizSubmitted(true);

    let correct = 0;
    activeQuizToTake.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / activeQuizToTake.questions.length) * 10 * 10) / 10;
    setScoreResult({ score: calculatedScore, correctCount: correct });

    // Tự động tạo bản ghi nộp bài gửi tới giáo viên
    const newSubmission: StudentQuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId: activeQuizToTake.id,
      quizTitle: activeQuizToTake.title,
      studentId: activeUser.identifier || 's-me',
      studentName: activeUser.name,
      className: activeQuizToTake.className,
      submittedAt: 'Vừa xong',
      autoScore: calculatedScore,
      totalQuestions: activeQuizToTake.questions.length,
      correctAnswersCount: correct,
      userAnswers: { ...userAnswers },
      status: 'pending_approval'
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    addToast({
      type: 'success',
      title: 'Tự động chấm điểm xong!',
      message: `Hệ thống chấm: ${calculatedScore}/10 điểm (${correct}/${activeQuizToTake.questions.length} câu đúng). Bài làm đã gửi giáo viên duyệt nhận xét.`
    });
  };

  // Teacher opens review modal
  const handleOpenReview = (sub: StudentQuizSubmission) => {
    setReviewingSubmission(sub);
    setReviewComment(sub.teacherFeedback || 'Bài làm đạt yêu cầu, nắm vững kiến thức trọng tâm.');
    setReviewScore(sub.approvedScore ?? sub.autoScore);
  };

  // Teacher confirms & approves submission
  const handleApproveSubmission = () => {
    if (!reviewingSubmission) return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === reviewingSubmission.id
          ? {
              ...s,
              status: 'approved',
              teacherFeedback: reviewComment.trim(),
              approvedScore: reviewScore
            }
          : s
      )
    );

    addToast({
      type: 'success',
      title: 'Đã duyệt nhận xét bài kiểm tra',
      message: `Đã công bố điểm ${reviewScore}/10 cho học sinh ${reviewingSubmission.studentName} và cập nhật vào sổ điểm.`
    });

    setReviewingSubmission(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // NẾU LÀ TÀI KHOẢN PHỤ HUYNH -> KHÔNG CÓ QUYỀN CAN THIỆP LÀM BÀI HOẶC CHẤM BÀI
  if (isParent) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                Thông báo phân quyền tài khoản Phụ huynh
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                Tài khoản Phụ huynh không có quyền can thiệp vào việc làm bài kiểm tra hoặc chấm điểm. Để theo dõi điểm các bài kiểm tra 15 phút, 1 tiết của con, vui lòng xem tại Bảng điều khiển hoặc Sổ điểm học sinh.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => switchRole('teacher')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs"
                >
                  Chuyển quyền Giáo viên (Tự động chấm bài)
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
                >
                  Chuyển quyền Học sinh (Làm Quiz)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GIAO DIỆN DÀNH CHO GIÁO VIÊN / ADMIN: TỰ ĐỘNG CHẤM BÀI & DUYỆT NHẬN XÉT
  if (isTeacher) {
    const pendingCount = submissions.filter((s) => s.status === 'pending_approval').length;

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <span>Tự Động Chấm Bài & Quản Lý Kiểm Tra</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Hệ thống tự động chấm điểm trắc nghiệm ngay khi học sinh nộp bài · Giáo viên phê duyệt và ghi nhận xét
            </p>
          </div>
        </div>

        {/* Tab Selector: Bài nộp chờ duyệt vs Danh mục đề thi */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setTeacherTab('pending_submissions')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-2 ${
              teacherTab === 'pending_submissions'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Bài nộp chờ duyệt & tự động chấm</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-extrabold bg-rose-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTeacherTab('quiz_list')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-2 ${
              teacherTab === 'quiz_list'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Danh mục đề kiểm tra ({quizzes.length})</span>
          </button>
        </div>

        {/* TAB 1: DANH SÁCH BÀI NỘP CHỜ DUYỆT (TỰ ĐỘNG CHẤM) */}
        {teacherTab === 'pending_submissions' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Hệ thống đã <strong>tự động đối chiếu đáp án và tính điểm chuẩn</strong>. Giáo viên chỉ cần duyệt và thêm nhận xét sư phạm.
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => {
                const isApproved = sub.status === 'approved';

                return (
                  <div
                    key={sub.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {sub.studentName}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Lớp {sub.className}
                        </span>
                        <span>·</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                          Nộp: {sub.submittedAt}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {sub.quizTitle}
                      </h4>

                      {isApproved && sub.teacherFeedback && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5 mt-1">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Lời phê: "{sub.teacherFeedback}"</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Tự động chấm:</span>
                          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                            {isApproved ? sub.approvedScore : sub.autoScore}/10 đ
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {sub.correctAnswersCount}/{sub.totalQuestions} câu đúng
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenReview(sub)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 ${
                          isApproved
                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isApproved ? 'Xem lại bài làm' : 'Duyệt nhận xét'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DANH MỤC ĐỀ KIỂM TRA CHO GIÁO VIÊN */}
        {teacherTab === 'quiz_list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{quiz.subject}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Đang mở thi
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {quiz.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.durationMinutes} phút
                  </span>
                  <span>·</span>
                  <span>{quiz.totalQuestions} câu hỏi</span>
                  <span>·</span>
                  <span>{quiz.attemptsCount} lượt làm</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Áp dụng: Lớp {quiz.className}</span>
                  <button
                    type="button"
                    onClick={() => handleStartQuiz(quiz)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Làm thử đề</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Giáo viên duyệt nhận xét bài thi tự động chấm */}
        {reviewingSubmission && (
          <Modal
            isOpen={true}
            onClose={() => setReviewingSubmission(null)}
            title={`Chi tiết bài làm: ${reviewingSubmission.studentName} (${reviewingSubmission.className})`}
          >
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {reviewingSubmission.quizTitle}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Nộp bài: {reviewingSubmission.submittedAt}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Điểm tự động chấm:</span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {reviewingSubmission.autoScore}/10 đ
                  </span>
                </div>
              </div>

              {/* Chi tiết từng câu hỏi học sinh làm */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(() => {
                  const targetQuiz = quizzes.find((q) => q.id === reviewingSubmission.quizId) || quizzes[0];
                  return targetQuiz.questions.map((q, idx) => {
                    const studentAns = reviewingSubmission.userAnswers[idx];
                    const isCorrect = studentAns === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          isCorrect
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Câu {idx + 1}: {q.question}</span>
                          <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                            {isCorrect ? '✓ Đúng (+2đ)' : '✗ Sai (0đ)'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          Học sinh chọn: <strong>{q.options[studentAns] || 'Chưa chọn'}</strong>
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                            Đáp án đúng: {q.options[q.correctAnswer]} ({q.explanation})
                          </p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Ô nhập nhận xét sư phạm và duyệt điểm */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Nhận xét của Giáo viên bộ môn:
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Điểm chốt:</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={reviewScore}
                      onChange={(e) => setReviewScore(Number(e.target.value))}
                      className="w-16 px-2 py-0.5 border rounded font-bold text-center text-indigo-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhập lời phê, góp ý về kiến thức hoặc thái độ làm bài của học sinh..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleApproveSubmission}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Phê duyệt & Lưu vào sổ điểm</span>
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // GIAO DIỆN DÀNH CHO HỌC SINH: LÀM BÀI KIỂM TRA & QUIZ
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Bài Kiểm Tra & Quiz Trực Tuyến</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Làm bài trắc nghiệm tính giờ tự động · Hệ thống chấm điểm ngay và gửi giáo viên duyệt kết quả
          </p>
        </div>
      </div>

      {/* Danh sách đề thi cho học sinh làm */}
      {!activeQuizToTake ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3.5 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{quiz.subject}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {quiz.durationMinutes} phút
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {quiz.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Số câu hỏi: <strong>{quiz.totalQuestions} câu</strong></span>
                <span>·</span>
                <span>Thang điểm: <strong>10 điểm</strong></span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Tự động chấm điểm trắc nghiệm</span>
                <button
                  type="button"
                  onClick={() => handleStartQuiz(quiz)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Bắt đầu làm bài</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Màn hình học sinh đang làm bài thi */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {activeQuizToTake.subject} · {activeQuizToTake.className}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {activeQuizToTake.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-mono font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveQuizToTake(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Hủy bài thi
              </button>
            </div>
          </div>

          {/* Kết quả sau khi nộp */}
          {quizSubmitted && scoreResult && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  🎉 Bạn đã nộp bài thành công!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Hệ thống tự động chấm: <strong>{scoreResult.score}/10 điểm</strong> ({scoreResult.correctCount}/{activeQuizToTake.questions.length} câu đúng). Bài làm đã được gửi đến giáo viên để duyệt nhận xét.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuizToTake(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shrink-0"
              >
                Quay lại danh sách
              </button>
            </div>
          )}

          {/* Danh sách câu hỏi làm bài */}
          <div className="space-y-6">
            {activeQuizToTake.questions.map((q, qIndex) => {
              const selectedOpt = userAnswers[qIndex];
              const isSubmitted = quizSubmitted;
              const isCorrect = isSubmitted && selectedOpt === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300'
                        : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Câu {qIndex + 1}: {q.question}
                    </h4>
                    {isSubmitted && (
                      <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCorrect ? 'Đúng (+2đ)' : 'Chưa đúng'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selectedOpt === optIndex;
                      const isActualCorrect = isSubmitted && optIndex === q.correctAnswer;

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(qIndex, optIndex)}
                          className={`p-3 rounded-xl text-left text-xs font-medium transition-all border ${
                            isSubmitted
                              ? isActualCorrect
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border-emerald-400 font-bold'
                                : isChosen
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 border-rose-400 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                              : isChosen
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                          }`}
                        >
                          <span className="font-mono mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && q.explanation && (
                    <div className="mt-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài thi & Chấm điểm</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
