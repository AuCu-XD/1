import {
  UserProfile,
  SchoolClass,
  Student,
  Teacher,
  Subject,
  GradeItem,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Announcement
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Thầy Nguyễn Minh Quang',
    email: 'hieu.truong@edumanage.edu.vn',
    role: 'admin',
    identifier: 'BGH-01',
    phone: '0903 123 456'
  },
  {
    id: 'user-teacher-1',
    name: 'Thầy Nguyễn Văn An',
    email: 'van.an@edumanage.edu.vn',
    role: 'teacher',
    identifier: 'GV-101',
    phone: '0912 345 678',
    classId: 'class-10a1'
  },
  {
    id: 'user-student-1',
    name: 'Trần Minh Khang',
    email: 'khang.tm2024@edumanage.edu.vn',
    role: 'student',
    identifier: 'HS-2024-001',
    phone: '0981 112 233',
    classId: 'class-10a1'
  },
  {
    id: 'user-parent-1',
    name: 'Ông Trần Đức Hưng',
    email: 'hung.tran.parent@gmail.com',
    role: 'parent',
    identifier: 'PH-001',
    phone: '0909 888 777',
    childId: 'student-1'
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'class-10a1',
    name: '10A1',
    gradeLevel: 10,
    academicYear: '2024 - 2025',
    room: 'Phòng B201',
    homeroomTeacherId: 'teacher-1',
    homeroomTeacherName: 'Nguyễn Văn An',
    studentCount: 38,
    maxCapacity: 40
  },
  {
    id: 'class-10a2',
    name: '10A2',
    gradeLevel: 10,
    academicYear: '2024 - 2025',
    room: 'Phòng B202',
    homeroomTeacherId: 'teacher-2',
    homeroomTeacherName: 'Trần Thị Mai',
    studentCount: 39,
    maxCapacity: 40
  },
  {
    id: 'class-11a1',
    name: '11A1',
    gradeLevel: 11,
    academicYear: '2024 - 2025',
    room: 'Phòng C301',
    homeroomTeacherId: 'teacher-3',
    homeroomTeacherName: 'Lê Hoàng Long',
    studentCount: 36,
    maxCapacity: 40
  },
  {
    id: 'class-11b1',
    name: '11B1',
    gradeLevel: 11,
    academicYear: '2024 - 2025',
    room: 'Phòng C302',
    homeroomTeacherId: 'teacher-4',
    homeroomTeacherName: 'Phạm Thu Hà',
    studentCount: 37,
    maxCapacity: 40
  },
  {
    id: 'class-12a1',
    name: '12A1',
    gradeLevel: 12,
    academicYear: '2024 - 2025',
    room: 'Phòng A101',
    homeroomTeacherId: 'teacher-5',
    homeroomTeacherName: 'Đặng Quốc Bảo',
    studentCount: 40,
    maxCapacity: 40
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-math', name: 'Toán học', code: 'TOAN', coefficient: 2, periodsPerWeek: 4 },
  { id: 'sub-lit', name: 'Ngữ văn', code: 'VAN', coefficient: 2, periodsPerWeek: 4 },
  { id: 'sub-eng', name: 'Tiếng Anh', code: 'ANH', coefficient: 2, periodsPerWeek: 3 },
  { id: 'sub-phy', name: 'Vật lý', code: 'LY', coefficient: 1, periodsPerWeek: 2 },
  { id: 'sub-chem', name: 'Hóa học', code: 'HOA', coefficient: 1, periodsPerWeek: 2 },
  { id: 'sub-bio', name: 'Sinh học', code: 'SINH', coefficient: 1, periodsPerWeek: 2 },
  { id: 'sub-his', name: 'Lịch sử', code: 'SU', coefficient: 1, periodsPerWeek: 2 },
  { id: 'sub-it', name: 'Tin học', code: 'TIN', coefficient: 1, periodsPerWeek: 2 }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    teacherCode: 'GV-101',
    fullName: 'Nguyễn Văn An',
    email: 'van.an@edumanage.edu.vn',
    phone: '0912 345 678',
    subjectSpecialty: 'Toán học',
    isHomeroom: true,
    homeroomClassName: '10A1',
    status: 'Đang công tác',
    joinDate: '2019-09-01'
  },
  {
    id: 'teacher-2',
    teacherCode: 'GV-102',
    fullName: 'Trần Thị Mai',
    email: 'thi.mai@edumanage.edu.vn',
    phone: '0913 234 567',
    subjectSpecialty: 'Ngữ văn',
    isHomeroom: true,
    homeroomClassName: '10A2',
    status: 'Đang công tác',
    joinDate: '2018-09-01'
  },
  {
    id: 'teacher-3',
    teacherCode: 'GV-103',
    fullName: 'Lê Hoàng Long',
    email: 'hoang.long@edumanage.edu.vn',
    phone: '0914 345 678',
    subjectSpecialty: 'Tiếng Anh',
    isHomeroom: true,
    homeroomClassName: '11A1',
    status: 'Đang công tác',
    joinDate: '2020-09-01'
  },
  {
    id: 'teacher-4',
    teacherCode: 'GV-104',
    fullName: 'Phạm Thu Hà',
    email: 'thu.ha@edumanage.edu.vn',
    phone: '0915 456 789',
    subjectSpecialty: 'Vật lý',
    isHomeroom: true,
    homeroomClassName: '11B1',
    status: 'Đang công tác',
    joinDate: '2017-09-01'
  },
  {
    id: 'teacher-5',
    teacherCode: 'GV-105',
    fullName: 'Đặng Quốc Bảo',
    email: 'quoc.bao@edumanage.edu.vn',
    phone: '0916 567 890',
    subjectSpecialty: 'Tin học',
    isHomeroom: true,
    homeroomClassName: '12A1',
    status: 'Đang công tác',
    joinDate: '2021-09-01'
  },
  {
    id: 'teacher-6',
    teacherCode: 'GV-106',
    fullName: 'Vũ Ngọc Lan',
    email: 'ngoc.lan@edumanage.edu.vn',
    phone: '0917 678 901',
    subjectSpecialty: 'Hóa học',
    isHomeroom: false,
    status: 'Đang công tác',
    joinDate: '2022-09-01'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    studentCode: 'HS-2024-001',
    fullName: 'Trần Minh Khang',
    dateOfBirth: '2008-04-15',
    gender: 'Nam',
    classId: 'class-10a1',
    className: '10A1',
    parentName: 'Trần Đức Hưng',
    parentPhone: '0909 888 777',
    parentEmail: 'hung.tran.parent@gmail.com',
    address: 'Số 45, Đường Lê Duẩn, Quận 1, TP. HCM',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 8.8,
    conduct: 'Tốt'
  },
  {
    id: 'student-2',
    studentCode: 'HS-2024-002',
    fullName: 'Lê Nguyễn Hoàng Yến',
    dateOfBirth: '2008-07-22',
    gender: 'Nữ',
    classId: 'class-10a1',
    className: '10A1',
    parentName: 'Nguyễn Thị Bích Loan',
    parentPhone: '0908 123 789',
    parentEmail: 'loan.nguyen@yahoo.com',
    address: '112/4 Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 9.1,
    conduct: 'Tốt'
  },
  {
    id: 'student-3',
    studentCode: 'HS-2024-003',
    fullName: 'Phạm Đức Anh',
    dateOfBirth: '2008-11-09',
    gender: 'Nam',
    classId: 'class-10a1',
    className: '10A1',
    parentName: 'Phạm Văn Tuấn',
    parentPhone: '0918 345 612',
    parentEmail: 'tuan.pham77@gmail.com',
    address: '28 Hai Bà Trưng, Phường Bến Nghé, Quận 1',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 7.6,
    conduct: 'Khá'
  },
  {
    id: 'student-4',
    studentCode: 'HS-2024-004',
    fullName: 'Võ Thị Thanh Thảo',
    dateOfBirth: '2008-02-18',
    gender: 'Nữ',
    classId: 'class-10a1',
    className: '10A1',
    parentName: 'Võ Quốc Trí',
    parentPhone: '0977 456 123',
    parentEmail: 'tri.vo@fpt.com.vn',
    address: '56 Phan Xích Long, Quận Phú Nhuận',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 8.4,
    conduct: 'Tốt'
  },
  {
    id: 'student-5',
    studentCode: 'HS-2024-005',
    fullName: 'Nguyễn Gia Huy',
    dateOfBirth: '2008-09-30',
    gender: 'Nam',
    classId: 'class-10a1',
    className: '10A1',
    parentName: 'Nguyễn Trọng Đại',
    parentPhone: '0933 678 910',
    parentEmail: 'nguyen.dai@gmail.com',
    address: '104 CMT8, Phường 7, Quận 3',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 6.9,
    conduct: 'Khá'
  },
  {
    id: 'student-6',
    studentCode: 'HS-2024-006',
    fullName: 'Hoàng Nhật Minh',
    dateOfBirth: '2008-05-12',
    gender: 'Nam',
    classId: 'class-10a2',
    className: '10A2',
    parentName: 'Hoàng Văn Sơn',
    parentPhone: '0912 789 456',
    parentEmail: 'son.hoang@hcm.gov.vn',
    address: '89 Nam Kỳ Khởi Nghĩa, Quận 1',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 8.5,
    conduct: 'Tốt'
  },
  {
    id: 'student-7',
    studentCode: 'HS-2024-007',
    fullName: 'Đặng Ngọc Quỳnh Như',
    dateOfBirth: '2008-10-05',
    gender: 'Nữ',
    classId: 'class-10a2',
    className: '10A2',
    parentName: 'Đặng Đình Khoa',
    parentPhone: '0903 890 123',
    parentEmail: 'dinhkhoa.dang@gmail.com',
    address: '14 Nguyễn Thị Minh Khai, Quận 1',
    status: 'Đang học',
    enrollmentDate: '2024-08-20',
    gpa: 8.9,
    conduct: 'Tốt'
  },
  {
    id: 'student-8',
    studentCode: 'HS-2023-015',
    fullName: 'Bùi Tuấn Kiệt',
    dateOfBirth: '2007-03-14',
    gender: 'Nam',
    classId: 'class-11a1',
    className: '11A1',
    parentName: 'Bùi Đức Thịnh',
    parentPhone: '0988 567 123',
    parentEmail: 'thinh.bui@viettel.vn',
    address: '67 Lê Văn Sỹ, Phường 13, Quận 3',
    status: 'Đang học',
    enrollmentDate: '2023-08-20',
    gpa: 8.2,
    conduct: 'Tốt'
  },
  {
    id: 'student-9',
    studentCode: 'HS-2023-022',
    fullName: 'Trịnh Bảo Châu',
    dateOfBirth: '2007-08-19',
    gender: 'Nữ',
    classId: 'class-11a1',
    className: '11A1',
    parentName: 'Trịnh Quang Hải',
    parentPhone: '0919 456 780',
    parentEmail: 'quanghai.trinh@gmail.com',
    address: '221 Trần Hưng Đạo, Quận 5',
    status: 'Đang học',
    enrollmentDate: '2023-08-20',
    gpa: 9.3,
    conduct: 'Tốt'
  },
  {
    id: 'student-10',
    studentCode: 'HS-2022-008',
    fullName: 'Lý Quốc Cường',
    dateOfBirth: '2006-12-01',
    gender: 'Nam',
    classId: 'class-12a1',
    className: '12A1',
    parentName: 'Lý Vĩnh Phát',
    parentPhone: '0902 334 455',
    parentEmail: 'phat.ly@vinhphat.com',
    address: '450 An Dương Vương, Quận 5',
    status: 'Đang học',
    enrollmentDate: '2022-08-20',
    gpa: 8.7,
    conduct: 'Tốt'
  }
];

export const INITIAL_GRADES: GradeItem[] = [
  // Student 1 (Trần Minh Khang)
  {
    id: 'grade-1-math',
    studentId: 'student-1',
    subjectId: 'sub-math',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 9.0,
    oralScore2: 8.5,
    fifteenMinScore1: 9.0,
    fifteenMinScore2: 8.0,
    onePeriodScore: 8.5,
    midtermScore: 9.0,
    finalScore: 9.0,
    averageScore: 8.8
  },
  {
    id: 'grade-1-lit',
    studentId: 'student-1',
    subjectId: 'sub-lit',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 8.0,
    fifteenMinScore1: 8.0,
    fifteenMinScore2: 7.5,
    onePeriodScore: 8.0,
    midtermScore: 8.5,
    finalScore: 8.0,
    averageScore: 8.1
  },
  {
    id: 'grade-1-eng',
    studentId: 'student-1',
    subjectId: 'sub-eng',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 9.5,
    fifteenMinScore1: 9.0,
    fifteenMinScore2: 9.5,
    onePeriodScore: 9.0,
    midtermScore: 9.5,
    finalScore: 9.5,
    averageScore: 9.4
  },
  {
    id: 'grade-1-phy',
    studentId: 'student-1',
    subjectId: 'sub-phy',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 8.5,
    fifteenMinScore1: 8.0,
    fifteenMinScore2: 8.5,
    onePeriodScore: 8.5,
    midtermScore: 8.5,
    finalScore: 9.0,
    averageScore: 8.6
  },
  // Student 2 (Lê Nguyễn Hoàng Yến)
  {
    id: 'grade-2-math',
    studentId: 'student-2',
    subjectId: 'sub-math',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 9.5,
    fifteenMinScore1: 9.0,
    fifteenMinScore2: 9.5,
    onePeriodScore: 9.0,
    midtermScore: 9.5,
    finalScore: 9.5,
    averageScore: 9.3
  },
  {
    id: 'grade-2-lit',
    studentId: 'student-2',
    subjectId: 'sub-lit',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 9.0,
    fifteenMinScore1: 9.0,
    fifteenMinScore2: 8.5,
    onePeriodScore: 9.0,
    midtermScore: 9.0,
    finalScore: 9.0,
    averageScore: 9.0
  },
  // Student 3 (Phạm Đức Anh)
  {
    id: 'grade-3-math',
    studentId: 'student-3',
    subjectId: 'sub-math',
    semester: 'HK1',
    academicYear: '2024 - 2025',
    oralScore1: 7.0,
    fifteenMinScore1: 7.5,
    fifteenMinScore2: 7.0,
    onePeriodScore: 7.5,
    midtermScore: 7.0,
    finalScore: 7.5,
    averageScore: 7.3
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2024-10-02',
    classId: 'class-10a1',
    studentId: 'student-1',
    studentName: 'Trần Minh Khang',
    studentCode: 'HS-2024-001',
    status: 'present'
  },
  {
    id: 'att-2',
    date: '2024-10-02',
    classId: 'class-10a1',
    studentId: 'student-2',
    studentName: 'Lê Nguyễn Hoàng Yến',
    studentCode: 'HS-2024-002',
    status: 'present'
  },
  {
    id: 'att-3',
    date: '2024-10-02',
    classId: 'class-10a1',
    studentId: 'student-3',
    studentName: 'Phạm Đức Anh',
    studentCode: 'HS-2024-003',
    status: 'late',
    note: 'Đi muộn 15 phút do kẹt xe'
  },
  {
    id: 'att-4',
    date: '2024-10-02',
    classId: 'class-10a1',
    studentId: 'student-4',
    studentName: 'Võ Thị Thanh Thảo',
    studentCode: 'HS-2024-004',
    status: 'present'
  },
  {
    id: 'att-5',
    date: '2024-10-02',
    classId: 'class-10a1',
    studentId: 'student-5',
    studentName: 'Nguyễn Gia Huy',
    studentCode: 'HS-2024-005',
    status: 'excused',
    note: 'Phụ huynh có đơn xin nghỉ ốm'
  },
  // Today's records (2024-10-03)
  {
    id: 'att-6',
    date: '2024-10-03',
    classId: 'class-10a1',
    studentId: 'student-1',
    studentName: 'Trần Minh Khang',
    studentCode: 'HS-2024-001',
    status: 'present'
  },
  {
    id: 'att-7',
    date: '2024-10-03',
    classId: 'class-10a1',
    studentId: 'student-2',
    studentName: 'Lê Nguyễn Hoàng Yến',
    studentCode: 'HS-2024-002',
    status: 'present'
  },
  {
    id: 'att-8',
    date: '2024-10-03',
    classId: 'class-10a1',
    studentId: 'student-3',
    studentName: 'Phạm Đức Anh',
    studentCode: 'HS-2024-003',
    status: 'present'
  },
  {
    id: 'att-9',
    date: '2024-10-03',
    classId: 'class-10a1',
    studentId: 'student-4',
    studentName: 'Võ Thị Thanh Thảo',
    studentCode: 'HS-2024-004',
    status: 'present'
  },
  {
    id: 'att-10',
    date: '2024-10-03',
    classId: 'class-10a1',
    studentId: 'student-5',
    studentName: 'Nguyễn Gia Huy',
    studentCode: 'HS-2024-005',
    status: 'present'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Bài tập hàm số bậc hai và đồ thị parabol',
    description: 'Giải các bài tập từ câu 1 đến câu 15 trong sách bài tập Đại số chương 2. Vẽ đồ thị và xác định tọa độ đỉnh, trục đối xứng của từng hàm số.',
    subjectId: 'sub-math',
    subjectName: 'Toán học',
    classId: 'class-10a1',
    className: '10A1',
    teacherId: 'teacher-1',
    teacherName: 'Nguyễn Văn An',
    assignedDate: '2024-10-01',
    dueDate: '2024-10-06T23:59:00',
    maxScore: 10,
    attachmentName: 'De_Cuong_Ham_So_Bac_Hai.pdf'
  },
  {
    id: 'assign-2',
    title: 'Phân tích nhân vật An Dương Vương trong truyền thuyết',
    description: 'Viết bài văn nghị luận văn học khoảng 600 - 800 từ làm rõ bài học giữ nước và tinh thần cảnh giác cách mạng qua tấn bi kịch Mỵ Châu - Trọng Thủy.',
    subjectId: 'sub-lit',
    subjectName: 'Ngữ văn',
    classId: 'class-10a1',
    className: '10A1',
    teacherId: 'teacher-2',
    teacherName: 'Trần Thị Mai',
    assignedDate: '2024-09-28',
    dueDate: '2024-10-05T20:00:00',
    maxScore: 10
  },
  {
    id: 'assign-3',
    title: 'Unit 2: Cultural Diversity - Vocabulary & Reading comprehension',
    description: 'Complete online exercises on Google Classroom and write a short summary (150 words) about traditional wedding customs in Vietnam.',
    subjectId: 'sub-eng',
    subjectName: 'Tiếng Anh',
    classId: 'class-10a1',
    className: '10A1',
    teacherId: 'teacher-3',
    teacherName: 'Lê Hoàng Long',
    assignedDate: '2024-10-02',
    dueDate: '2024-10-08T18:00:00',
    maxScore: 10
  },
  {
    id: 'assign-4',
    title: 'Thực hành tính gia tốc rơi tự do với đồng hồ đo thời gian hiện số',
    description: 'Lập bảng số liệu và xử lý sai số cho 5 lần đo liên tiếp theo hướng dẫn bài thực hành số 1 trong phòng thí nghiệm Vật lý.',
    subjectId: 'sub-phy',
    subjectName: 'Vật lý',
    classId: 'class-10a1',
    className: '10A1',
    teacherId: 'teacher-4',
    teacherName: 'Phạm Thu Hà',
    assignedDate: '2024-09-29',
    dueDate: '2024-10-04T12:00:00',
    maxScore: 10
  }
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignmentId: 'assign-1',
    studentId: 'student-1',
    studentName: 'Trần Minh Khang',
    studentCode: 'HS-2024-001',
    submittedAt: '2024-10-03T14:30:00',
    content: 'Em đã hoàn thành đủ 15 bài và đính kèm file scan vẽ đồ thị rõ ràng kèm bảng biến thiên.',
    attachmentName: 'TranMinhKhang_BaiTapToan_Ch2.pdf',
    score: 9.5,
    feedback: 'Bài làm rất tốt, vẽ đồ thị chuẩn xác và lập bảng biến thiên tỉ mỉ. Tiếp tục phát huy!',
    status: 'graded'
  },
  {
    id: 'sub-2',
    assignmentId: 'assign-1',
    studentId: 'student-2',
    studentName: 'Lê Nguyễn Hoàng Yến',
    studentCode: 'HS-2024-002',
    submittedAt: '2024-10-02T20:15:00',
    content: 'Kính gửi thầy bài làm Đại số chương 2 của em ạ.',
    attachmentName: 'HoangYen_Toan10_BaiTap.pdf',
    score: 10.0,
    feedback: 'Xuất sắc, trình bày khoa học và không có lỗi sai sót nào.',
    status: 'graded'
  },
  {
    id: 'sub-3',
    assignmentId: 'assign-2',
    studentId: 'student-1',
    studentName: 'Trần Minh Khang',
    studentCode: 'HS-2024-001',
    submittedAt: '2024-10-02T19:00:00',
    content: 'Thưa cô, em nộp bài nghị luận về bi kịch mất nước của vua An Dương Vương.',
    attachmentName: 'BaiNghiLuan_TranMinhKhang.docx',
    status: 'pending'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Kế hoạch tổ chức Kỳ thi Giữa học kỳ 1 năm học 2024 - 2025',
    content: 'Ban Giám hiệu nhà trường thông báo kế hoạch thi Giữa học kỳ 1 diễn ra từ ngày 21/10/2024 đến hết ngày 26/10/2024. Đề nghị các tổ chuyên môn hoàn tất ngân hàng đề thi và giáo viên chủ nhiệm phổ biến lịch thi, nội quy thi cụ thể tới học sinh và phụ huynh.',
    priority: 'urgent',
    targetAudience: 'all',
    targetAudienceLabel: 'Toàn trường',
    authorName: 'Thầy Nguyễn Minh Quang',
    authorRole: 'Hiệu trưởng',
    publishedAt: '2024-10-02T08:00:00',
    isPinned: true
  },
  {
    id: 'ann-2',
    title: 'Họp Phụ huynh đầu năm và bầu Ban đại diện Cha mẹ học sinh',
    content: 'Trường THPT tổ chức phiên họp phụ huynh toàn trường vào lúc 08h00 sáng Chủ Nhật ngày 13/10/2024 tại các phòng học của từng lớp. Kính mời toàn thể quý phụ huynh tham dự đầy đủ để cùng thống nhất chương trình hoạt động năm học mới.',
    priority: 'important',
    targetAudience: 'parents',
    targetAudienceLabel: 'Toàn thể Phụ huynh',
    authorName: 'Thầy Nguyễn Văn An',
    authorRole: 'Tổ trưởng Khối 10',
    publishedAt: '2024-10-01T15:30:00',
    isPinned: true
  },
  {
    id: 'ann-3',
    title: 'Phát động cuộc thi Nghiên cứu Khoa học Kỹ thuật dành cho học sinh THPT',
    content: 'Nhà trường phát động cuộc thi Sáng tạo KHKT cấp trường. Học sinh có thể đăng ký dự thi cá nhân hoặc nhóm tối đa 2 bạn. Hạn chót nộp ý tưởng dự án là ngày 30/10/2024 tại Văn phòng Đoàn trường.',
    priority: 'normal',
    targetAudience: 'students',
    targetAudienceLabel: 'Toàn thể Học sinh',
    authorName: 'Đoàn Thanh Niên Trường',
    authorRole: 'Bí thư Đoàn',
    publishedAt: '2024-09-28T09:15:00',
    isPinned: false
  }
];
