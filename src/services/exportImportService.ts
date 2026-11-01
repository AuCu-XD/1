import { Student, GradeItem, Subject } from '../types';
import { formatScore } from '../utils/gradeCalculations';

export interface ImportValidationRow {
  rowNumber: number;
  data: Partial<Student>;
  isValid: boolean;
  errors: string[];
}

export interface ImportResult {
  validRows: Student[];
  invalidRows: ImportValidationRow[];
  totalRows: number;
}

export const ExportImportService = {
  /**
   * Tải về file mẫu CSV để người dùng nhập thông tin học sinh
   */
  downloadStudentTemplateCsv(): void {
    const headers = [
      'studentCode',
      'fullName',
      'gender',
      'dateOfBirth',
      'className',
      'parentName',
      'parentPhone',
      'parentEmail',
      'address'
    ];

    const sampleRows = [
      'HS-2024-050,Nguyễn Văn An,Nam,2008-05-15,10A1,Nguyễn Văn Bình,0903112233,binh.nv@gmail.com,123 Lê Lợi Quận 1',
      'HS-2024-051,Trần Thị Mai Chi,Nữ,2008-09-20,10A1,Trần Quốc Toản,0912334455,toan.tq@gmail.com,456 Hai Bà Trưng Quận 3'
    ];

    const csvContent = '\uFEFF' + headers.join(',') + '\n' + sampleRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mau_Nhap_Hoc_Sinh_EduManage.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Phân tích và kiểm tra tính hợp lệ của nội dung CSV tải lên
   */
  parseAndValidateStudentCsv(
    csvText: string,
    existingStudentCodes: Set<string>,
    classMapByName: Map<string, string>
  ): ImportResult {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { validRows: [], invalidRows: [], totalRows: 0 };
    }

    // Đọc header và normalize
    const headerLine = lines[0].replace(/^\uFEFF/, '').trim();
    const rawHeaders = headerLine.split(',').map(h => h.trim().toLowerCase());

    const expectedHeaders = ['studentcode', 'fullname', 'gender', 'dateofbirth', 'classname'];
    const missingHeaders = expectedHeaders.filter(eh => !rawHeaders.includes(eh));

    if (missingHeaders.length > 0) {
      throw new Error(`File CSV thiếu các cột bắt buộc: ${missingHeaders.join(', ')}`);
    }

    const colIndex = {
      studentCode: rawHeaders.indexOf('studentcode'),
      fullName: rawHeaders.indexOf('fullname'),
      gender: rawHeaders.indexOf('gender'),
      dateOfBirth: rawHeaders.indexOf('dateofbirth'),
      className: rawHeaders.indexOf('classname'),
      parentName: rawHeaders.indexOf('parentname'),
      parentPhone: rawHeaders.indexOf('parentphone'),
      parentEmail: rawHeaders.indexOf('parentemail'),
      address: rawHeaders.indexOf('address'),
    };

    const validRows: Student[] = [];
    const invalidRows: ImportValidationRow[] = [];
    const seenCodesInBatch = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting
      const parts = line.split(',').map(p => p.trim());
      const rowNum = i + 1;
      const errors: string[] = [];

      const studentCode = parts[colIndex.studentCode] || '';
      const fullName = parts[colIndex.fullName] || '';
      const gender = parts[colIndex.gender] || '';
      const dateOfBirth = parts[colIndex.dateOfBirth] || '';
      const className = parts[colIndex.className] || '';
      const parentName = colIndex.parentName !== -1 ? (parts[colIndex.parentName] || '') : '';
      const parentPhone = colIndex.parentPhone !== -1 ? (parts[colIndex.parentPhone] || '') : '';
      const parentEmail = colIndex.parentEmail !== -1 ? (parts[colIndex.parentEmail] || '') : '';
      const address = colIndex.address !== -1 ? (parts[colIndex.address] || '') : '';

      // Validation logic
      if (!studentCode) {
        errors.push('Mã học sinh không được để trống');
      } else if (existingStudentCodes.has(studentCode.toUpperCase())) {
        errors.push(`Mã học sinh "${studentCode}" đã tồn tại trong hệ thống`);
      } else if (seenCodesInBatch.has(studentCode.toUpperCase())) {
        errors.push(`Mã học sinh "${studentCode}" bị trùng lặp trong file tải lên`);
      } else {
        seenCodesInBatch.add(studentCode.toUpperCase());
      }

      if (!fullName || fullName.length < 3) {
        errors.push('Họ và tên học sinh phải từ 3 ký tự trở lên');
      }

      const normalizedGender = gender.toLowerCase() === 'nữ' || gender.toLowerCase() === 'nu' ? 'Nữ' : 'Nam';

      if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        errors.push('Ngày sinh phải có định dạng YYYY-MM-DD (Ví dụ: 2008-05-15)');
      }

      const classId = classMapByName.get(className.toUpperCase());
      if (!className) {
        errors.push('Tên lớp không được để trống');
      } else if (!classId) {
        errors.push(`Không tìm thấy lớp học "${className}" trong trường`);
      }

      if (errors.length === 0) {
        validRows.push({
          id: `student-imported-${Date.now()}-${i}`,
          studentCode: studentCode.toUpperCase(),
          fullName,
          gender: normalizedGender,
          dateOfBirth,
          classId: classId!,
          className: className.toUpperCase(),
          parentName: parentName || 'Chưa cập nhật',
          parentPhone: parentPhone || 'Chưa cập nhật',
          parentEmail: parentEmail || '',
          address: address || 'Chưa cập nhật',
          status: 'Đang học',
          enrollmentDate: new Date().toISOString().split('T')[0],
          gpa: 8.0,
          conduct: 'Tốt'
        });
      } else {
        invalidRows.push({
          rowNumber: rowNum,
          data: { studentCode, fullName, className, dateOfBirth, gender: normalizedGender },
          isValid: false,
          errors
        });
      }
    }

    return {
      validRows,
      invalidRows,
      totalRows: lines.length - 1
    };
  },

  /**
   * Xuất danh sách học sinh ra file CSV có hỗ trợ UTF-8 (Excel tương thích)
   */
  exportStudentsToCsv(students: Student[], filterDescription: string = ''): void {
    const headers = [
      'STT',
      'Mã Học Sinh',
      'Họ và Tên',
      'Giới Tính',
      'Ngày Sinh',
      'Lớp',
      'Tên Phụ Huynh',
      'SĐT Phụ Huynh',
      'Điểm TB',
      'Hạnh Kiểm',
      'Trạng Thái',
      'Địa Chỉ'
    ];

    const rows = students.map((s, index) => [
      index + 1,
      `"${s.studentCode}"`,
      `"${s.fullName}"`,
      s.gender,
      s.dateOfBirth,
      `"${s.className}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      s.gpa ? s.gpa.toFixed(1) : '-',
      s.conduct || 'Tốt',
      s.status,
      `"${s.address.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Danh_Sach_Hoc_Sinh_${filterDescription || 'Toan_Truong'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Xuất bảng điểm môn học ra file CSV
   */
  exportGradebookToCsv(
    students: Student[],
    grades: GradeItem[],
    subject: Subject,
    className: string,
    semester: string
  ): void {
    const headers = [
      'STT',
      'Mã Học Sinh',
      'Họ và Tên',
      'Lớp',
      'Môn Học',
      'Học Kỳ',
      'Điểm Miệng 1',
      'Điểm Miệng 2',
      '15 Phút 1',
      '15 Phút 2',
      '1 Tiết (Hệ số 2)',
      'Giữa Kỳ (Hệ số 2)',
      'Cuối Kỳ (Hệ số 3)',
      'Điểm TB Môn'
    ];

    const gradeMap = new Map(grades.map(g => [g.studentId, g]));

    const rows = students.map((s, index) => {
      const g = gradeMap.get(s.id);
      return [
        index + 1,
        `"${s.studentCode}"`,
        `"${s.fullName}"`,
        `"${className}"`,
        `"${subject.name}"`,
        semester,
        formatScore(g?.oralScore1),
        formatScore(g?.oralScore2),
        formatScore(g?.fifteenMinScore1),
        formatScore(g?.fifteenMinScore2),
        formatScore(g?.onePeriodScore),
        formatScore(g?.midtermScore),
        formatScore(g?.finalScore),
        formatScore(g?.averageScore)
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Bang_Diem_${subject.code}_Lop_${className}_${semester}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
