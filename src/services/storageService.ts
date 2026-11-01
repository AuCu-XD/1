import {
  SchoolClass,
  Student,
  Teacher,
  Subject,
  GradeItem,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Announcement,
  UserProfile,
  NeonColor
} from '../types';

import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_USERS
} from '../data/mockData';

const STORAGE_KEYS = {
  CLASSES: 'edumanage_classes_v1',
  STUDENTS: 'edumanage_students_v1',
  TEACHERS: 'edumanage_teachers_v1',
  SUBJECTS: 'edumanage_subjects_v1',
  GRADES: 'edumanage_grades_v1',
  ATTENDANCE: 'edumanage_attendance_v1',
  ASSIGNMENTS: 'edumanage_assignments_v1',
  SUBMISSIONS: 'edumanage_submissions_v1',
  ANNOUNCEMENTS: 'edumanage_announcements_v1',
  ACTIVE_USER: 'edumanage_active_user_v1',
  THEME_MODE: 'edumanage_theme_mode_v1',
  NEON_COLOR: 'edumanage_neon_color_v1'
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading key ${key} from localStorage:`, error);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  getClasses: (): SchoolClass[] => safeGet(STORAGE_KEYS.CLASSES, INITIAL_CLASSES),
  saveClasses: (data: SchoolClass[]): void => safeSet(STORAGE_KEYS.CLASSES, data),

  getStudents: (): Student[] => safeGet(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (data: Student[]): void => safeSet(STORAGE_KEYS.STUDENTS, data),

  getTeachers: (): Teacher[] => safeGet(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS),
  saveTeachers: (data: Teacher[]): void => safeSet(STORAGE_KEYS.TEACHERS, data),

  getSubjects: (): Subject[] => safeGet(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS),
  saveSubjects: (data: Subject[]): void => safeSet(STORAGE_KEYS.SUBJECTS, data),

  getGrades: (): GradeItem[] => safeGet(STORAGE_KEYS.GRADES, INITIAL_GRADES),
  saveGrades: (data: GradeItem[]): void => safeSet(STORAGE_KEYS.GRADES, data),

  getAttendance: (): AttendanceRecord[] => safeGet(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (data: AttendanceRecord[]): void => safeSet(STORAGE_KEYS.ATTENDANCE, data),

  getAssignments: (): Assignment[] => safeGet(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS),
  saveAssignments: (data: Assignment[]): void => safeSet(STORAGE_KEYS.ASSIGNMENTS, data),

  getSubmissions: (): AssignmentSubmission[] => safeGet(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS),
  saveSubmissions: (data: AssignmentSubmission[]): void => safeSet(STORAGE_KEYS.SUBMISSIONS, data),

  getAnnouncements: (): Announcement[] => safeGet(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
  saveAnnouncements: (data: Announcement[]): void => safeSet(STORAGE_KEYS.ANNOUNCEMENTS, data),

  getActiveUser: (): UserProfile => safeGet(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0]),
  saveActiveUser: (user: UserProfile): void => safeSet(STORAGE_KEYS.ACTIVE_USER, user),

  getThemeMode: (): 'light' | 'dark' => safeGet(STORAGE_KEYS.THEME_MODE, 'light'),
  saveThemeMode: (mode: 'light' | 'dark'): void => safeSet(STORAGE_KEYS.THEME_MODE, mode),

  getNeonColor: (): NeonColor => safeGet<NeonColor>(STORAGE_KEYS.NEON_COLOR, 'none'),
  saveNeonColor: (color: NeonColor): void => safeSet(STORAGE_KEYS.NEON_COLOR, color),

  resetToDefaults: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to reset storage:', e);
    }
  }
};
