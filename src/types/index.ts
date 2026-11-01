export type Role = 'admin' | 'teacher' | 'student' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  identifier?: string; // e.g., Teacher code "GV-102" or Student ID "HS-2024-001"
  classId?: string; // For students or primary class of homeroom teacher
  childId?: string; // For parents: ID of their student
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "10A1", "11B2", "12A3"
  gradeLevel: number; // 10, 11, 12
  academicYear: string; // "2024 - 2025"
  room: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount: number;
  maxCapacity: number;
}

export interface Student {
  id: string;
  studentCode: string; // HS-2024-001
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  status: 'Đang học' | 'Nghỉ phép' | 'Đã chuyển trường';
  enrollmentDate: string;
  gpa?: number;
  conduct?: 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';
}

export interface Teacher {
  id: string;
  teacherCode: string; // GV-001
  fullName: string;
  email: string;
  phone: string;
  subjectSpecialty: string; // Toán, Văn, Anh, Lý, Hóa, Sinh, Tin học
  isHomeroom: boolean;
  homeroomClassName?: string;
  status: 'Đang công tác' | 'Nghỉ phép' | 'Thỉnh giảng';
  joinDate: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number; // Hệ số môn (ví dụ Toán hệ số 2 hoặc 1)
  periodsPerWeek: number;
}

export interface GradeItem {
  id: string;
  studentId: string;
  subjectId: string;
  semester: 'HK1' | 'HK2';
  academicYear: string;
  oralScore1?: number; // Điểm miệng 1
  oralScore2?: number; // Điểm miệng 2
  fifteenMinScore1?: number; // 15 phút 1
  fifteenMinScore2?: number; // 15 phút 2
  onePeriodScore?: number; // 1 tiết (hệ số 2)
  midtermScore?: number; // Giữa kỳ (hệ số 2)
  finalScore?: number; // Cuối kỳ (hệ số 3)
  averageScore?: number; // Điểm trung bình môn
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded' | 'late';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: 'all' | 'teachers' | 'students' | 'parents' | string; // 'all' or specific class ID
  targetAudienceLabel: string;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  isPinned?: boolean;
}

export interface FilterParams {
  search?: string;
  classId?: string;
  gradeLevel?: number | string;
  status?: string;
  subjectId?: string;
  semester?: string;
  date?: string;
}

export type ThemeMode = 'light' | 'dark';

export type NeonColor = 'none' | 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'sky' | 'fuchsia' | 'lime';

export interface AppThemeSettings {
  themeMode: ThemeMode;
  neonColor: NeonColor;
}
