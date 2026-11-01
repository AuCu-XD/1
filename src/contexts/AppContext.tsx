import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Role,
  SchoolClass,
  Student,
  Teacher,
  Subject,
  GradeItem,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Announcement,
  ThemeMode,
  NeonColor
} from '../types';
import { StorageService } from '../services/storageService';
import { INITIAL_USERS } from '../data/mockData';
import { calculateSubjectAverage, calculateStudentOverallGPA } from '../utils/gradeCalculations';
import {
  auth,
  signInWithGoogle,
  signOutGoogle,
  type User,
  onAuthStateChanged,
  FIRESTORE_COLLECTIONS,
  fetchCollectionFromFirestore,
  saveDocToFirestore,
  batchSaveToFirestore,
  deleteDocFromFirestore,
  getFirestoreTableCounts
} from '../lib/firebase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  activeUser: UserProfile;
  availableUsers: UserProfile[];
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: GradeItem[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  announcements: Announcement[];
  toasts: ToastMessage[];

  // Firebase Auth
  firebaseUser: User | null;
  isFirebaseAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;

  // Cloud Firestore Sync State
  isFirestoreSyncing: boolean;
  firestoreTableCounts: Record<string, number>;
  syncAllDataToFirestore: () => Promise<boolean>;
  refreshFirestoreCounts: () => Promise<void>;

  // Theme & Personalization
  themeMode: ThemeMode;
  neonColor: NeonColor;
  setThemeMode: (mode: ThemeMode) => void;
  setNeonColor: (color: NeonColor) => void;
  resetAppSettings: () => void;

  // Actions
  setActiveUser: (user: UserProfile) => void;
  switchRole: (role: Role) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Class CRUD
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => boolean;

  // Student CRUD
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => boolean;
  importStudentsBatch: (newStudents: Student[]) => void;

  // Teacher CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => boolean;

  // Subject CRUD
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => boolean;

  // Grade CRUD
  saveStudentGrade: (grade: Partial<GradeItem> & { studentId: string; subjectId: string; semester: 'HK1' | 'HK2' }) => void;

  // Attendance
  saveAttendanceBatch: (records: AttendanceRecord[]) => void;
  updateAttendanceRecord: (recordId: string, status: AttendanceRecord['status'], note?: string) => void;

  // Assignment & Submissions
  addAssignment: (assign: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => boolean;
  submitAssignmentWork: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => void;
  gradeStudentSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Announcements
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'publishedAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;

  // Maintenance
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const loaded = StorageService.getClasses();
    return loaded.map((c) => {
      if (!c.academicYear || !/^\d{4}\s*-\s*\d{4}$/.test(c.academicYear)) {
        return { ...c, academicYear: '2024 - 2025' };
      }
      return c;
    });
  });
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => StorageService.getTeachers());
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [grades, setGrades] = useState<GradeItem[]>(() => StorageService.getGrades());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => StorageService.getSubmissions());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());
  const [activeUser, setActiveUserState] = useState<UserProfile>(() => StorageService.getActiveUser());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseAuthLoading, setIsFirebaseAuthLoading] = useState<boolean>(true);

  // Cloud Firestore Sync State
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);
  const [firestoreTableCounts, setFirestoreTableCounts] = useState<Record<string, number>>({});

  const refreshFirestoreCounts = async () => {
    try {
      const counts = await getFirestoreTableCounts();
      setFirestoreTableCounts(counts);
    } catch (err) {
      console.warn('Lỗi kiểm tra số lượng bản ghi Firestore:', err);
    }
  };

  const loadAllDataFromCloud = async () => {
    try {
      setIsFirestoreSyncing(true);
      const [
        cloudClasses,
        cloudStudents,
        cloudTeachers,
        cloudSubjects,
        cloudGrades,
        cloudAttendance,
        cloudAssignments,
        cloudSubmissions,
        cloudAnnouncements
      ] = await Promise.all([
        fetchCollectionFromFirestore<SchoolClass>(FIRESTORE_COLLECTIONS.CLASSES).catch(() => null),
        fetchCollectionFromFirestore<Student>(FIRESTORE_COLLECTIONS.STUDENTS).catch(() => null),
        fetchCollectionFromFirestore<Teacher>(FIRESTORE_COLLECTIONS.TEACHERS).catch(() => null),
        fetchCollectionFromFirestore<Subject>(FIRESTORE_COLLECTIONS.SUBJECTS).catch(() => null),
        fetchCollectionFromFirestore<GradeItem>(FIRESTORE_COLLECTIONS.GRADES).catch(() => null),
        fetchCollectionFromFirestore<AttendanceRecord>(FIRESTORE_COLLECTIONS.ATTENDANCE).catch(() => null),
        fetchCollectionFromFirestore<Assignment>(FIRESTORE_COLLECTIONS.ASSIGNMENTS).catch(() => null),
        fetchCollectionFromFirestore<AssignmentSubmission>(FIRESTORE_COLLECTIONS.SUBMISSIONS).catch(() => null),
        fetchCollectionFromFirestore<Announcement>(FIRESTORE_COLLECTIONS.ANNOUNCEMENTS).catch(() => null)
      ]);

      if (cloudClasses && cloudClasses.length > 0) {
        setClasses(cloudClasses);
        StorageService.saveClasses(cloudClasses);
      }
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        StorageService.saveStudents(cloudStudents);
      }
      if (cloudTeachers && cloudTeachers.length > 0) {
        setTeachers(cloudTeachers);
        StorageService.saveTeachers(cloudTeachers);
      }
      if (cloudSubjects && cloudSubjects.length > 0) {
        setSubjects(cloudSubjects);
        StorageService.saveSubjects(cloudSubjects);
      }
      if (cloudGrades && cloudGrades.length > 0) {
        setGrades(cloudGrades);
        StorageService.saveGrades(cloudGrades);
      }
      if (cloudAttendance && cloudAttendance.length > 0) {
        setAttendance(cloudAttendance);
        StorageService.saveAttendance(cloudAttendance);
      }
      if (cloudAssignments && cloudAssignments.length > 0) {
        setAssignments(cloudAssignments);
        StorageService.saveAssignments(cloudAssignments);
      }
      if (cloudSubmissions && cloudSubmissions.length > 0) {
        setSubmissions(cloudSubmissions);
        StorageService.saveSubmissions(cloudSubmissions);
      }
      if (cloudAnnouncements && cloudAnnouncements.length > 0) {
        setAnnouncements(cloudAnnouncements);
        StorageService.saveAnnouncements(cloudAnnouncements);
      }

      await refreshFirestoreCounts();
    } catch (err) {
      console.warn('Không thể đồng bộ toàn bộ bảng từ Cloud Firestore lúc này:', err);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  // Theo dõi phiên đăng nhập Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseAuthLoading(false);

      if (user) {
        const isAdmin = user.email === 'kimtrong16490@gmail.com';
        const googleProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Tài khoản Google',
          email: user.email || '',
          role: isAdmin ? 'admin' : 'teacher',
          avatar: user.photoURL || undefined,
          identifier: isAdmin ? 'BQT-GOOGLE' : 'GV-GOOGLE'
        };
        setActiveUserState(googleProfile);
        StorageService.saveActiveUser(googleProfile);

        // Tự động tải và đồng bộ các bảng dữ liệu từ Firestore
        loadAllDataFromCloud();
      }
    });

    return () => unsubscribe();
  }, []);

  // Theme state: dark mode synchronized across app
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [neonColor, setNeonColorState] = useState<NeonColor>(() => StorageService.getNeonColor());

  // Enforce dark mode on root document
  useEffect(() => {
    document.documentElement.classList.add('dark');
    StorageService.saveThemeMode('dark');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (neonColor !== 'none') {
      root.setAttribute('data-neon', neonColor);
    } else {
      root.removeAttribute('data-neon');
    }
  }, [neonColor]);

  const setThemeMode = (_mode: ThemeMode) => {
    setThemeModeState('light');
    StorageService.saveThemeMode('light');
    document.documentElement.classList.remove('dark');
  };

  const setNeonColor = (color: NeonColor) => {
    setNeonColorState(color);
    StorageService.saveNeonColor(color);
    const colorNames: Record<NeonColor, string> = {
      none: 'Không có (Tắt viền Neon)',
      cyan: 'Neon Xanh Cyan / Lam Ngọc',
      emerald: 'Neon Xanh Lục / Ngọc Bích',
      violet: 'Neon Tím Huyền Bí',
      amber: 'Neon Vàng Hổ Phách',
      rose: 'Neon Hồng Ánh Kim',
      sky: 'Neon Xanh Da Trời / Sky Blue',
      fuchsia: 'Neon Tím Sen / Fuchsia',
      lime: 'Neon Xanh Chanh / Lime Bright'
    };
    addToast({
      type: 'info',
      title: 'Tùy biến màu Neon',
      message: `Đã áp dụng: ${colorNames[color]}`
    });
  };

  const resetAppSettings = () => {
    setThemeModeState('light');
    StorageService.saveThemeMode('light');
    setNeonColorState('none');
    StorageService.saveNeonColor('none');
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-neon');
    addToast({
      type: 'success',
      title: 'Thiết lập lại giao diện',
      message: 'Đã hoàn nguyên màu sắc, chủ đề giao diện về màu trắng mặc định ban đầu. Dữ liệu học sinh, lớp học được giữ nguyên an toàn.'
    });
  };

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync active user
  const setActiveUser = (user: UserProfile) => {
    setActiveUserState(user);
    StorageService.saveActiveUser(user);
    addToast({
      type: 'info',
      title: 'Chuyển đổi tài khoản',
      message: `Đang đăng nhập với vai trò: ${user.name} (${user.role.toUpperCase()})`
    });
  };

  const switchRole = (role: Role) => {
    const matched = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setActiveUser(matched);
  };

  // Google Firebase Authentication handlers
  const handleSignInWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      if (!user) return;
      addToast({
        type: 'success',
        title: 'Đăng nhập Google thành công',
        message: `Đã kết nối Firebase với tài khoản ${user.displayName || user.email}.`
      });
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      addToast({
        type: 'error',
        title: 'Đăng nhập thất bại',
        message: error?.message || 'Không thể đăng nhập bằng tài khoản Google.'
      });
      throw error;
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await signOutGoogle();
      setFirebaseUser(null);
      const defaultUser = INITIAL_USERS[0];
      setActiveUserState(defaultUser);
      StorageService.saveActiveUser(defaultUser);
      addToast({
        type: 'info',
        title: 'Đã đăng xuất Google',
        message: 'Bạn đã đăng xuất khỏi phiên làm việc Firebase.'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Lỗi đăng xuất',
        message: error?.message || 'Không thể đăng xuất.'
      });
      throw error;
    }
  };

  // ============================================================================
  // CLOUD FIRESTORE BATCH SYNC ALL TABLES
  // ============================================================================
  const syncAllDataToFirestore = async (): Promise<boolean> => {
    setIsFirestoreSyncing(true);
    try {
      addToast({
        type: 'info',
        title: 'Đang đẩy toàn bộ 10 bảng dữ liệu lên Cloud Firestore...',
        message: 'Đang đồng bộ lớp học, học sinh, giáo viên, môn học, bảng điểm, chuyên cần, bài tập, bài nộp và thông báo.'
      });

      await Promise.all([
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.CLASSES, classes),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.STUDENTS, students),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.TEACHERS, teachers),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.SUBJECTS, subjects),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.GRADES, grades),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, attendance),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.ASSIGNMENTS, assignments),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.SUBMISSIONS, submissions),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.ANNOUNCEMENTS, announcements),
        batchSaveToFirestore(FIRESTORE_COLLECTIONS.USERS, INITIAL_USERS)
      ]);

      await refreshFirestoreCounts();

      addToast({
        type: 'success',
        title: 'Đã đồng bộ 10/10 bảng lên Cloud Firestore!',
        message: 'Tất cả các bảng dữ liệu đã được lưu trữ thành công trên Firestore.'
      });
      return true;
    } catch (err: any) {
      console.error('Lỗi sync Firestore:', err);
      addToast({
        type: 'error',
        title: 'Lỗi đồng bộ lên Cloud Firestore',
        message: err?.message || 'Vui lòng kiểm tra quyền hoặc đăng nhập lại Google.'
      });
      return false;
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  // Class Actions
  const addClass = (clsData: Omit<SchoolClass, 'id'>) => {
    const newClass: SchoolClass = {
      ...clsData,
      id: `class-${Date.now()}`
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    StorageService.saveClasses(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.CLASSES, newClass).catch(console.warn);
    addToast({ type: 'success', title: 'Thêm lớp học thành công', message: `Lớp ${newClass.name} đã được thêm vào hệ thống và Cloud Firestore.` });
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    const updated = classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setClasses(updated);
    StorageService.saveClasses(updated);
    const target = updated.find(c => c.id === id);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.CLASSES, target).catch(console.warn);
    addToast({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin lớp học đã được cập nhật trên Cloud Firestore.' });
  };

  const deleteClass = (id: string): boolean => {
    const cls = classes.find(c => c.id === id);
    if (!cls) return false;

    // Unassign any students belonging to this class so they are not orphaned
    const updatedStudents = students.map((s) =>
      s.classId === id ? { ...s, classId: '', className: 'Chưa xếp lớp' } : s
    );
    setStudents(updatedStudents);
    StorageService.saveStudents(updatedStudents);

    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    StorageService.saveClasses(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.CLASSES, id).catch(console.warn);
    addToast({ type: 'success', title: 'Đã xóa lớp học', message: `Đã xóa lớp ${cls.name} thành công khỏi hệ thống.` });
    return true;
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`
    };
    const updated = [newStudent, ...students];
    setStudents(updated);
    StorageService.saveStudents(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.STUDENTS, newStudent).catch(console.warn);

    // Update class student count
    setClasses(prev => prev.map(c => c.id === newStudent.classId ? { ...c, studentCount: c.studentCount + 1 } : c));

    addToast({ type: 'success', title: 'Tiếp nhận học sinh mới', message: `Đã thêm hồ sơ học sinh ${newStudent.fullName} lên Cloud Firestore.` });
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updated = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStudents(updated);
    StorageService.saveStudents(updated);
    const target = updated.find(s => s.id === id);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.STUDENTS, target).catch(console.warn);
    addToast({ type: 'success', title: 'Cập nhật học sinh', message: 'Hồ sơ học sinh đã được đồng bộ lên Cloud Firestore.' });
  };

  const deleteStudent = (id: string): boolean => {
    const student = students.find(s => s.id === id);
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    StorageService.saveStudents(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.STUDENTS, id).catch(console.warn);

    if (student) {
      setClasses(prev => prev.map(c => c.id === student.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c));
    }

    addToast({ type: 'success', title: 'Đã xóa học sinh', message: `Đã xóa học sinh ${student?.fullName || ''}.` });
    return true;
  };

  const importStudentsBatch = (newStudents: Student[]) => {
    const updated = [...newStudents, ...students];
    setStudents(updated);
    StorageService.saveStudents(updated);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.STUDENTS, newStudents).catch(console.warn);

    // Recompute class counts
    const classCountMap: Record<string, number> = {};
    updated.forEach(s => {
      classCountMap[s.classId] = (classCountMap[s.classId] || 0) + 1;
    });

    setClasses(prev => prev.map(c => ({
      ...c,
      studentCount: classCountMap[c.id] || c.studentCount
    })));

    addToast({
      type: 'success',
      title: 'Import dữ liệu thành công',
      message: `Đã thêm ${newStudents.length} học sinh vào hệ thống và Cloud Firestore.`
    });
  };

  // Teacher Actions
  const addTeacher = (teacherData: Omit<Teacher, 'id'>): Teacher => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teacher-${Date.now()}`
    };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    StorageService.saveTeachers(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.TEACHERS, newTeacher).catch(console.warn);
    addToast({ type: 'success', title: 'Thêm giáo viên mới', message: `Đã thêm ${newTeacher.fullName} vào danh sách cán bộ trên Cloud Firestore.` });
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    const updated = teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTeachers(updated);
    StorageService.saveTeachers(updated);
    const target = updated.find(t => t.id === id);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.TEACHERS, target).catch(console.warn);
    addToast({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin giáo viên đã được cập nhật trên Cloud Firestore.' });
  };

  const deleteTeacher = (id: string): boolean => {
    const teacher = teachers.find(t => t.id === id);
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    StorageService.saveTeachers(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.TEACHERS, id).catch(console.warn);
    addToast({ type: 'success', title: 'Đã xóa giáo viên', message: `Đã xóa giáo viên ${teacher?.fullName || ''}.` });
    return true;
  };

  // Subject Actions
  const addSubject = (subjectData: Omit<Subject, 'id'>): Subject => {
    const newSubject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`
    };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    StorageService.saveSubjects(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.SUBJECTS, newSubject).catch(console.warn);
    addToast({
      type: 'success',
      title: 'Thêm môn học thành công',
      message: `Môn học "${newSubject.name}" đã được lưu vào Cloud Firestore.`
    });
    return newSubject;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSubjects(updated);
    StorageService.saveSubjects(updated);
    const target = updated.find(s => s.id === id);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.SUBJECTS, target).catch(console.warn);
    addToast({
      type: 'success',
      title: 'Cập nhật môn học',
      message: 'Thông tin môn học đã được cập nhật trên Cloud Firestore.'
    });
  };

  const deleteSubject = (id: string): boolean => {
    const subjectToDelete = subjects.find((s) => s.id === id);
    if (!subjectToDelete) return false;
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    StorageService.saveSubjects(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.SUBJECTS, id).catch(console.warn);
    addToast({
      type: 'info',
      title: 'Đã xóa môn học',
      message: `Đã xóa môn học "${subjectToDelete.name}".`
    });
    return true;
  };

  // Grade Actions
  const saveStudentGrade = (gradeInput: Partial<GradeItem> & { studentId: string; subjectId: string; semester: 'HK1' | 'HK2' }) => {
    const academicYear = gradeInput.academicYear || '2024 - 2025';
    const existingIndex = grades.findIndex(
      (g) =>
        g.studentId === gradeInput.studentId &&
        g.subjectId === gradeInput.subjectId &&
        g.semester === gradeInput.semester
    );

    let updatedGrades = [...grades];
    let targetGrade: GradeItem;

    if (existingIndex >= 0) {
      targetGrade = { ...updatedGrades[existingIndex], ...gradeInput };
      targetGrade.averageScore = calculateSubjectAverage(targetGrade);
      updatedGrades[existingIndex] = targetGrade;
    } else {
      targetGrade = {
        id: `grade-${Date.now()}`,
        academicYear,
        ...gradeInput
      } as GradeItem;
      targetGrade.averageScore = calculateSubjectAverage(targetGrade);
      updatedGrades.push(targetGrade);
    }

    setGrades(updatedGrades);
    StorageService.saveGrades(updatedGrades);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.GRADES, targetGrade).catch(console.warn);

    // Update overall student GPA
    const studentAllGrades = updatedGrades.filter(g => g.studentId === gradeInput.studentId && g.semester === gradeInput.semester);
    const overallGpa = calculateStudentOverallGPA(studentAllGrades, subjects);

    if (overallGpa !== undefined) {
      const updatedStudents = students.map(s => s.id === gradeInput.studentId ? { ...s, gpa: overallGpa } : s);
      setStudents(updatedStudents);
      StorageService.saveStudents(updatedStudents);
      const updatedS = updatedStudents.find(s => s.id === gradeInput.studentId);
      if (updatedS) saveDocToFirestore(FIRESTORE_COLLECTIONS.STUDENTS, updatedS).catch(console.warn);
    }

    addToast({ type: 'success', title: 'Lưu điểm thành công', message: 'Điểm số đã được lưu lên Cloud Firestore.' });
  };

  // Attendance Actions
  const saveAttendanceBatch = (newRecords: AttendanceRecord[]) => {
    // Replace records for the same student on the same date
    const recordMap = new Map<string, AttendanceRecord>();
    attendance.forEach(r => recordMap.set(`${r.studentId}_${r.date}`, r));
    newRecords.forEach(r => recordMap.set(`${r.studentId}_${r.date}`, r));

    const updated = Array.from(recordMap.values());
    setAttendance(updated);
    StorageService.saveAttendance(updated);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, newRecords).catch(console.warn);
    addToast({ type: 'success', title: 'Điểm danh hoàn tất', message: `Đã lưu trạng thái chuyên cần cho ${newRecords.length} học sinh lên Cloud Firestore.` });
  };

  const updateAttendanceRecord = (recordId: string, status: AttendanceRecord['status'], note?: string) => {
    const updated = attendance.map(r => r.id === recordId ? { ...r, status, note: note ?? r.note } : r);
    setAttendance(updated);
    StorageService.saveAttendance(updated);
    const target = updated.find(r => r.id === recordId);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, target).catch(console.warn);
    addToast({ type: 'success', title: 'Cập nhật điểm danh', message: 'Đã thay đổi trạng thái điểm danh trên Cloud Firestore.' });
  };

  // Assignment Actions
  const addAssignment = (assignData: Omit<Assignment, 'id'>) => {
    const newAssign: Assignment = {
      ...assignData,
      id: `assign-${Date.now()}`
    };
    const updated = [newAssign, ...assignments];
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.ASSIGNMENTS, newAssign).catch(console.warn);
    addToast({ type: 'success', title: 'Giao bài tập thành công', message: `Bài tập "${newAssign.title}" đã được lưu lên Cloud Firestore.` });
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    const updated = assignments.map(a => a.id === id ? { ...a, ...updates } : a);
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    const target = updated.find(a => a.id === id);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.ASSIGNMENTS, target).catch(console.warn);
    addToast({ type: 'success', title: 'Đã lưu thay đổi', message: 'Nội dung bài tập đã được cập nhật trên Cloud Firestore.' });
  };

  const deleteAssignment = (id: string): boolean => {
    const assign = assignments.find(a => a.id === id);
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.ASSIGNMENTS, id).catch(console.warn);

    // Also remove submissions
    const updatedSubs = submissions.filter(s => s.assignmentId !== id);
    setSubmissions(updatedSubs);
    StorageService.saveSubmissions(updatedSubs);
    addToast({ type: 'success', title: 'Đã xóa bài tập', message: `Đã xóa bài tập "${assign?.title}".` });
    return true;
  };

  const submitAssignmentWork = (subData: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => {
    const newSub: AssignmentSubmission = {
      ...subData,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    const existingIndex = submissions.findIndex(s => s.assignmentId === subData.assignmentId && s.studentId === subData.studentId);
    let updated: AssignmentSubmission[];
    if (existingIndex >= 0) {
      updated = [...submissions];
      updated[existingIndex] = { ...updated[existingIndex], ...newSub };
    } else {
      updated = [newSub, ...submissions];
    }
    setSubmissions(updated);
    StorageService.saveSubmissions(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.SUBMISSIONS, newSub).catch(console.warn);
    addToast({ type: 'success', title: 'Nộp bài thành công', message: 'Bài làm của bạn đã được ghi nhận vào Cloud Firestore.' });
  };

  const gradeStudentSubmission = (submissionId: string, score: number, feedback: string) => {
    const updated = submissions.map(s => s.id === submissionId ? { ...s, score, feedback, status: 'graded' as const } : s);
    setSubmissions(updated);
    StorageService.saveSubmissions(updated);
    const target = updated.find(s => s.id === submissionId);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.SUBMISSIONS, target).catch(console.warn);
    addToast({ type: 'success', title: 'Chấm điểm thành công', message: `Đã ghi nhận điểm ${score} lên Cloud Firestore.` });
  };

  // Announcement Actions
  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'publishedAt'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      publishedAt: new Date().toISOString()
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.ANNOUNCEMENTS, newAnn).catch(console.warn);
    addToast({ type: 'success', title: 'Đăng thông báo thành công', message: 'Thông báo đã được lưu lên Cloud Firestore.' });
  };

  const deleteAnnouncement = (id: string) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.ANNOUNCEMENTS, id).catch(console.warn);
    addToast({ type: 'success', title: 'Đã xóa thông báo', message: 'Thông báo đã được gỡ bỏ khỏi Cloud Firestore.' });
  };

  const togglePinAnnouncement = (id: string) => {
    const updated = announcements.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a);
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    const target = updated.find(a => a.id === id);
    if (target) saveDocToFirestore(FIRESTORE_COLLECTIONS.ANNOUNCEMENTS, target).catch(console.warn);
  };

  const resetAllData = () => {
    StorageService.resetToDefaults();
    setActiveUserState(INITIAL_USERS[0]);
    setClasses(StorageService.getClasses());
    setStudents(StorageService.getStudents());
    setTeachers(StorageService.getTeachers());
    setSubjects(StorageService.getSubjects());
    setGrades(StorageService.getGrades());
    setAttendance(StorageService.getAttendance());
    setAssignments(StorageService.getAssignments());
    setSubmissions(StorageService.getSubmissions());
    setAnnouncements(StorageService.getAnnouncements());
    addToast({ type: 'info', title: 'Khôi phục dữ liệu gốc', message: 'Toàn bộ dữ liệu hệ thống đã được hoàn nguyên về ban đầu.' });
  };

  return (
    <AppContext.Provider
      value={{
        activeUser,
        availableUsers: INITIAL_USERS,
        classes,
        students,
        teachers,
        subjects,
        grades,
        attendance,
        assignments,
        submissions,
        announcements,
        toasts,
        firebaseUser,
        isFirebaseAuthLoading,
        isFirestoreSyncing,
        firestoreTableCounts,
        syncAllDataToFirestore,
        refreshFirestoreCounts,
        signInWithGoogle: handleSignInWithGoogle,
        signOutGoogle: handleSignOutGoogle,
        themeMode,
        neonColor,
        setThemeMode,
        setNeonColor,
        resetAppSettings,
        setActiveUser,
        switchRole,
        addToast,
        removeToast,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudentsBatch,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addSubject,
        updateSubject,
        deleteSubject,
        saveStudentGrade,
        saveAttendanceBatch,
        updateAttendanceRecord,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignmentWork,
        gradeStudentSubmission,
        addAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
