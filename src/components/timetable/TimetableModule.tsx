import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  Plus,
  Trash2,
  X,
  Check,
  RotateCcw,
  Printer,
  ChevronDown,
  Sparkles,
  Info,
  Sun,
  Moon,
  Download,
  Upload,
  Copy,
  Clipboard,
  Search,
  Filter,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { Modal } from '../common/Modal';

export interface TimetableCellData {
  subject: string;
  teacher: string;
  room: string;
  startTime?: string;
  endTime?: string;
}

// days: Thứ Hai -> Chủ Nhật (Thêm cột Chủ Nhật theo yêu cầu)
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayInfo {
  key: DayKey;
  label: string;
}

// Danh sách các thứ trong tuần: Thứ Bảy hiển thị chữ bình thường, không còn badge tím thừa; thêm Chủ Nhật
export const DAYS: DayInfo[] = [
  { key: 'mon', label: 'Thứ Hai' },
  { key: 'tue', label: 'Thứ Ba' },
  { key: 'wed', label: 'Thứ Tư' },
  { key: 'thu', label: 'Thứ Năm' },
  { key: 'fri', label: 'Thứ Sáu' },
  { key: 'sat', label: 'Thứ Bảy' },
  { key: 'sun', label: 'Chủ Nhật' }
];

export interface PeriodSlotDef {
  period: number;
  shift: 'morning' | 'afternoon';
  time: string;
  startTime: string;
  endTime: string;
}

export const MORNING_PERIODS: PeriodSlotDef[] = [
  { period: 1, shift: 'morning', time: '07:30 - 08:15', startTime: '07:30 SA', endTime: '08:15 SA' },
  { period: 2, shift: 'morning', time: '08:20 - 09:05', startTime: '08:20 SA', endTime: '09:05 SA' },
  { period: 3, shift: 'morning', time: '09:25 - 10:10', startTime: '09:25 SA', endTime: '10:10 SA' },
  { period: 4, shift: 'morning', time: '10:15 - 11:00', startTime: '10:15 SA', endTime: '11:00 SA' },
  { period: 5, shift: 'morning', time: '11:05 - 11:50', startTime: '11:05 SA', endTime: '11:50 SA' }
];

export const AFTERNOON_PERIODS: PeriodSlotDef[] = [
  { period: 6, shift: 'afternoon', time: '13:00 - 13:45', startTime: '01:00 CH', endTime: '01:45 CH' },
  { period: 7, shift: 'afternoon', time: '13:50 - 14:35', startTime: '01:50 CH', endTime: '02:35 CH' },
  { period: 8, shift: 'afternoon', time: '14:50 - 15:35', startTime: '02:50 CH', endTime: '03:35 CH' },
  { period: 9, shift: 'afternoon', time: '15:40 - 16:25', startTime: '03:40 CH', endTime: '04:25 CH' },
  { period: 10, shift: 'afternoon', time: '16:30 - 17:15', startTime: '04:30 CH', endTime: '05:15 CH' }
];

// Quick selection chips
export const QUICK_SUBJECT_CHIPS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lý',
  'Tin học',
  'GDCD',
  'Thể dục',
  'Luyện AI'
];

// Schedule map type: key = `${dayKey}_${period}` -> TimetableCellData
export type ClassScheduleMap = Record<string, TimetableCellData>;

// Generate default preloaded schedule for 11B1
const createDefault11B1Schedule = (): ClassScheduleMap => {
  return {
    'mon_1': { subject: 'Chào cờ & Sinh hoạt', teacher: 'Thầy Hiệu Trưởng', room: 'Sân trường', startTime: '07:30 SA', endTime: '08:15 SA' },
    'mon_2': { subject: 'Toán học', teacher: 'Thầy Đông', room: 'A.111', startTime: '08:20 SA', endTime: '09:05 SA' },
    'tue_1': { subject: 'Ngữ văn', teacher: 'Cô Mai', room: 'A.302', startTime: '07:30 SA', endTime: '08:15 SA' },
    'tue_2': { subject: 'Tiếng Anh', teacher: 'Thầy Hưng', room: 'A.111', startTime: '08:20 SA', endTime: '09:05 SA' },
    'wed_1': { subject: 'Vật lý', teacher: 'Cô Lan', room: 'A.111', startTime: '07:30 SA', endTime: '08:15 SA' },
    'wed_2': { subject: 'Hóa học', teacher: 'Thầy Đức', room: 'Phòng Lab Hóa', startTime: '08:20 SA', endTime: '09:05 SA' },
    'thu_3': { subject: 'Tin học', teacher: 'Thầy Tuấn', room: 'Phòng Máy 1', startTime: '09:25 SA', endTime: '10:10 SA' },
    'fri_1': { subject: 'Lịch sử', teacher: 'Cô Thu', room: 'A.111', startTime: '07:30 SA', endTime: '08:15 SA' },
    'sat_2': { subject: 'Sinh học', teacher: 'Cô Hương', room: 'A.111', startTime: '08:20 SA', endTime: '09:05 SA' },
    'sun_1': { subject: 'Hoạt động ngoại khóa', teacher: 'Đoàn trường', room: 'Nhà thi đấu', startTime: '07:30 SA', endTime: '08:15 SA' }
  };
};

// Generic default schedule generator for other classes
const createGenericSchedule = (defaultRoom: string, defaultTeacher: string): ClassScheduleMap => {
  return {
    'mon_1': { subject: 'Chào cờ & Sinh hoạt', teacher: 'BGH', room: 'Sân trường', startTime: '07:30 SA', endTime: '08:15 SA' },
    'mon_2': { subject: 'Toán học', teacher: defaultTeacher || 'Thầy An', room: defaultRoom || 'B201', startTime: '08:20 SA', endTime: '09:05 SA' },
    'mon_3': { subject: 'Ngữ văn', teacher: 'Cô Mai', room: defaultRoom || 'B201', startTime: '09:25 SA', endTime: '10:10 SA' },
    'tue_1': { subject: 'Vật lý', teacher: 'Cô Lan', room: defaultRoom || 'B201', startTime: '07:30 SA', endTime: '08:15 SA' },
    'tue_2': { subject: 'Hóa học', teacher: 'Thầy Đức', room: defaultRoom || 'B201', startTime: '08:20 SA', endTime: '09:05 SA' },
    'wed_1': { subject: 'Tiếng Anh', teacher: 'Thầy Hưng', room: defaultRoom || 'B201', startTime: '07:30 SA', endTime: '08:15 SA' },
    'thu_2': { subject: 'Tin học', teacher: 'Thầy Tuấn', room: 'Phòng Lab 1', startTime: '08:20 SA', endTime: '09:05 SA' },
    'fri_1': { subject: 'Lịch sử', teacher: 'Cô Thu', room: defaultRoom || 'B201', startTime: '07:30 SA', endTime: '08:15 SA' },
    'sat_2': { subject: 'Sinh học', teacher: 'Cô Hương', room: defaultRoom || 'B201', startTime: '08:20 SA', endTime: '09:05 SA' },
    'sun_2': { subject: 'Ôn tập & Bồi dưỡng', teacher: 'Tổ bộ môn', room: defaultRoom || 'B201', startTime: '08:20 SA', endTime: '09:05 SA' }
  };
};

export const TimetableModule: React.FC = () => {
  const { classes, activeUser, switchRole, addToast } = useApp();

  // Quyền hạn: Chỉ Giáo viên và Quản trị viên mới được phép chỉnh sửa
  const canEdit = activeUser.role === 'admin' || activeUser.role === 'teacher';

  // Find 11B1 if exists, otherwise default to first class
  const defaultClass = useMemo(() => {
    return classes.find((c) => c.name.toUpperCase() === '11B1') || classes[0];
  }, [classes]);

  const [selectedClassId, setSelectedClassId] = useState<string>(() => defaultClass?.id || '');
  const [activeShift, setActiveShift] = useState<'morning' | 'afternoon'>('morning');

  // Excel-like feature: Highlight / Conditional Formatting by Subject
  const [highlightSubject, setHighlightSubject] = useState<string>('all');

  // Excel-like feature: Clipboard for copy-paste cells
  const [clipboardCell, setClipboardCell] = useState<TimetableCellData | null>(null);

  // Excel-like feature: Import CSV Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || defaultClass || classes[0];

  // Schedule storage key
  const storageKey = `edumanage_timetable_data_v3_${selectedClass?.id || 'default'}`;

  const [scheduleData, setScheduleData] = useState<ClassScheduleMap>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    if (selectedClass?.name.toUpperCase() === '11B1') {
      return createDefault11B1Schedule();
    }
    return createGenericSchedule(selectedClass?.room || 'Phòng học', selectedClass?.homeroomTeacherName || 'GVCN');
  });

  // Reload when switching class
  useEffect(() => {
    if (!selectedClass) return;
    try {
      const saved = localStorage.getItem(`edumanage_timetable_data_v3_${selectedClass.id}`);
      if (saved) {
        setScheduleData(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    if (selectedClass.name.toUpperCase() === '11B1') {
      setScheduleData(createDefault11B1Schedule());
    } else {
      setScheduleData(createGenericSchedule(selectedClass.room || 'Phòng học', selectedClass.homeroomTeacherName || 'GVCN'));
    }
  }, [selectedClass?.id]);

  // Save to localStorage when changed
  const saveSchedule = (newData: ClassScheduleMap) => {
    setScheduleData(newData);
    try {
      if (selectedClass?.id) {
        localStorage.setItem(`edumanage_timetable_data_v3_${selectedClass.id}`, JSON.stringify(newData));
      }
    } catch {
      // ignore
    }
  };

  // Reset schedule to initial template
  const handleResetSchedule = () => {
    if (!canEdit) return;
    let initialMap: ClassScheduleMap = {};
    if (selectedClass?.name.toUpperCase() === '11B1') {
      initialMap = createDefault11B1Schedule();
    } else {
      initialMap = createGenericSchedule(selectedClass?.room || 'Phòng học', selectedClass?.homeroomTeacherName || 'GVCN');
    }
    saveSchedule(initialMap);
    addToast?.({
      type: 'success',
      title: 'Đã thiết lập lại thời khóa biểu',
      message: `Đã khôi phục dữ liệu thời khóa biểu chuẩn cho lớp ${selectedClass?.name}`
    });
  };

  // Modal Editing & View State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{
    dayKey: DayKey;
    dayLabel: string;
    period: number;
    shift: 'morning' | 'afternoon';
    time: string;
    defaultStartTime: string;
    defaultEndTime: string;
  } | null>(null);

  // Form Fields inside Modal
  const [formSubject, setFormSubject] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Open modal for cell
  const handleOpenCell = (dayKey: DayKey, dayLabel: string, periodSlot: PeriodSlotDef) => {
    const slotKey = `${dayKey}_${periodSlot.period}`;
    const existing = scheduleData[slotKey];

    // Đối với học sinh/phụ huynh: nếu ô trống thì không làm gì (không cho gán môn)
    if (!canEdit && !existing) {
      return;
    }

    setEditingSlot({
      dayKey,
      dayLabel,
      period: periodSlot.period,
      shift: periodSlot.shift,
      time: periodSlot.time,
      defaultStartTime: periodSlot.startTime,
      defaultEndTime: periodSlot.endTime
    });

    if (existing) {
      setFormSubject(existing.subject);
      setFormTeacher(existing.teacher);
      setFormRoom(existing.room);
      setFormStartTime(existing.startTime || periodSlot.startTime);
      setFormEndTime(existing.endTime || periodSlot.endTime);
    } else {
      setFormSubject('');
      setFormTeacher(selectedClass?.homeroomTeacherName ? selectedClass.homeroomTeacherName.split(' ').pop() || 'Thầy An' : 'Thầy An');
      setFormRoom(selectedClass?.room || 'A.111');
      setFormStartTime(periodSlot.startTime);
      setFormEndTime(periodSlot.endTime);
    }
    setErrors({});
    setModalOpen(true);
  };

  // Save changes from modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !editingSlot) return;

    if (!formSubject.trim()) {
      setErrors({ subject: 'Vui lòng chọn hoặc nhập tên môn học' });
      return;
    }
    if (!formTeacher.trim()) {
      setErrors({ teacher: 'Vui lòng nhập tên giáo viên giảng dạy' });
      return;
    }

    const slotKey = `${editingSlot.dayKey}_${editingSlot.period}`;
    const nextData = {
      ...scheduleData,
      [slotKey]: {
        subject: formSubject.trim(),
        teacher: formTeacher.trim(),
        room: formRoom.trim() || selectedClass?.room || 'A.111',
        startTime: formStartTime.trim() || editingSlot.defaultStartTime,
        endTime: formEndTime.trim() || editingSlot.defaultEndTime
      }
    };

    saveSchedule(nextData);
    setModalOpen(false);

    addToast?.({
      type: 'success',
      title: 'Đã lưu thời khóa biểu',
      message: `Đã cập nhật môn ${formSubject} (${editingSlot.dayLabel} - Tiết ${editingSlot.period})`
    });
  };

  // Delete subject from cell
  const handleDeleteFromSlot = () => {
    if (!canEdit || !editingSlot) return;
    const slotKey = `${editingSlot.dayKey}_${editingSlot.period}`;
    const nextData = { ...scheduleData };
    delete nextData[slotKey];
    saveSchedule(nextData);
    setModalOpen(false);

    addToast?.({
      type: 'info',
      title: 'Đã xóa môn học',
      message: `Đã xóa môn khỏi ${editingSlot.dayLabel} - Tiết ${editingSlot.period}`
    });
  };

  // EXCEL-LIKE FEATURE 1: Export to CSV (hỗ trợ mở trực tiếp bằng Microsoft Excel với BOM)
  const handleExportExcel = () => {
    const allPeriods = [...MORNING_PERIODS, ...AFTERNOON_PERIODS];
    const headerRow = ['Tiết', 'Buổi', 'Thời gian', ...DAYS.map(d => d.label)];

    const rows: string[][] = [headerRow];

    allPeriods.forEach(p => {
      const row = [
        `Tiết ${p.period}`,
        p.shift === 'morning' ? 'Sáng' : 'Chiều',
        p.time,
        ...DAYS.map(d => {
          const cell = scheduleData[`${d.key}_${p.period}`];
          return cell ? `"${cell.subject} (${cell.teacher} - ${cell.room})"` : '""';
        })
      ];
      rows.push(row);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Thoi_Khoa_Bieu_Lop_${selectedClass?.name || 'TKB'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast?.({
      type: 'success',
      title: 'Xuất file Excel thành công',
      message: `Đã tải về bảng tính thời khóa biểu lớp ${selectedClass?.name} (.CSV)`
    });
  };

  // EXCEL-LIKE FEATURE 2: Copy cell to clipboard
  const handleCopyCell = (e: React.MouseEvent, cell: TimetableCellData) => {
    e.stopPropagation();
    setClipboardCell(cell);
    addToast?.({
      type: 'info',
      title: 'Đã sao chép ô (Excel Copy)',
      message: `Đã sao chép môn "${cell.subject}" (${cell.teacher} - ${cell.room}) vào bộ nhớ tạm.`
    });
  };

  // EXCEL-LIKE FEATURE 3: Paste cell from clipboard into target slot
  const handlePasteCell = (e: React.MouseEvent, dayKey: DayKey, period: number) => {
    e.stopPropagation();
    if (!canEdit || !clipboardCell) return;

    const slotKey = `${dayKey}_${period}`;
    const nextData = {
      ...scheduleData,
      [slotKey]: { ...clipboardCell }
    };
    saveSchedule(nextData);

    addToast?.({
      type: 'success',
      title: 'Đã dán ô thành công (Excel Paste)',
      message: `Đã dán môn "${clipboardCell.subject}" vào Tiết ${period}.`
    });
  };

  // EXCEL-LIKE FEATURE 4: Import schedule from CSV / Excel file
  const handleImportCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('File không đủ dòng dữ liệu');
        }

        const newSchedule: ClassScheduleMap = { ...scheduleData };
        let importedCount = 0;

        lines.slice(1).forEach(line => {
          // Tách dòng CSV có tính đến dấu ngoặc kép
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (matches && matches.length >= 4) {
            const periodMatch = matches[0].replace(/"/g, '').match(/\d+/);
            if (periodMatch) {
              const periodNum = parseInt(periodMatch[0], 10);
              DAYS.forEach((day, dayIndex) => {
                const cellIndex = 3 + dayIndex;
                if (matches[cellIndex]) {
                  const rawContent = matches[cellIndex].replace(/"/g, '').trim();
                  if (rawContent && rawContent !== '-') {
                    // Cú pháp: "Môn học (Giáo viên - Phòng)" hoặc chỉ "Môn học"
                    const subMatch = rawContent.match(/^(.*?)(?:\s*\((.*?)(?:\s*-\s*(.*?))?\))?$/);
                    const subject = subMatch ? subMatch[1]?.trim() : rawContent;
                    const teacher = subMatch && subMatch[2] ? subMatch[2].trim() : 'GVCN';
                    const room = subMatch && subMatch[3] ? subMatch[3].trim() : (selectedClass?.room || 'Phòng học');

                    newSchedule[`${day.key}_${periodNum}`] = {
                      subject: subject || rawContent,
                      teacher,
                      room
                    };
                    importedCount++;
                  }
                }
              });
            }
          }
        });

        saveSchedule(newSchedule);
        setIsImportModalOpen(false);
        addToast?.({
          type: 'success',
          title: 'Nhập thời khóa biểu thành công',
          message: `Đã cập nhật ${importedCount} tiết học từ file Excel vào lớp ${selectedClass?.name}.`
        });
      } catch {
        addToast?.({
          type: 'error',
          title: 'Lỗi đọc file',
          message: 'Định dạng file CSV không hợp lệ. Vui lòng kiểm tra lại cấu trúc bảng.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Calculate statistics
  const currentSlots = activeShift === 'morning' ? MORNING_PERIODS : AFTERNOON_PERIODS;

  const totalAssignedPeriods = useMemo(() => {
    return Object.keys(scheduleData).length;
  }, [scheduleData]);

  // EXCEL-LIKE FEATURE 5: Count of each subject (COUNTIF)
  const subjectBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(scheduleData).forEach((v) => {
      const name = v.subject.trim();
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scheduleData]);

  const uniqueSubjectsCount = subjectBreakdown.length;

  const uniqueTeachersCount = useMemo(() => {
    const teachers = new Set(Object.values(scheduleData).map((v) => v.teacher.trim()));
    return teachers.size;
  }, [scheduleData]);

  const morningCount = useMemo(() => {
    let count = 0;
    MORNING_PERIODS.forEach((p) => {
      DAYS.forEach((d) => {
        if (scheduleData[`${d.key}_${p.period}`]) count++;
      });
    });
    return count;
  }, [scheduleData]);

  const afternoonCount = useMemo(() => {
    let count = 0;
    AFTERNOON_PERIODS.forEach((p) => {
      DAYS.forEach((d) => {
        if (scheduleData[`${d.key}_${p.period}`]) count++;
      });
    });
    return count;
  }, [scheduleData]);

  // Color card styling based on subject name
  const getSubjectColorClasses = (subjectName: string) => {
    const sub = subjectName.toLowerCase();
    if (sub.includes('toán') || sub.includes('ai') || sub.includes('tin')) {
      return 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 hover:border-blue-400';
    }
    if (sub.includes('văn') || sub.includes('ngữ')) {
      return 'bg-fuchsia-50/90 dark:bg-fuchsia-950/50 border-fuchsia-200 dark:border-fuchsia-800 text-fuchsia-900 dark:text-fuchsia-100 hover:border-fuchsia-400';
    }
    if (sub.includes('anh') || sub.includes('ngoại')) {
      return 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 hover:border-amber-400';
    }
    if (sub.includes('lý') || sub.includes('hóa') || sub.includes('sinh')) {
      return 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 hover:border-emerald-400';
    }
    if (sub.includes('sử') || sub.includes('địa') || sub.includes('gdcd')) {
      return 'bg-orange-50/90 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100 hover:border-orange-400';
    }
    return 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 hover:border-indigo-400';
  };

  return (
    <div className="space-y-4">
      {/* CẢNH BÁO NẾU ĐANG Ở VAI TRÒ HỌC SINH / PHỤ HUYNH (CHẾ ĐỘ CHỈ XEM) */}
      {!canEdit && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
              Bạn đang xem với vai trò <strong className="font-bold uppercase">({activeUser.role === 'student' ? 'Học sinh' : 'Phụ huynh'}) (Chế độ chỉ xem)</strong>. Chỉ Giáo viên hoặc Quản trị viên mới có quyền xếp lịch, chỉnh sửa thời khóa biểu.
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

      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Thời Khóa Biểu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Lịch học tuần lớp {selectedClass?.name} — Từ Thứ Hai đến Chủ Nhật, tích hợp tính năng bảng tính Excel
          </p>
        </div>

        {/* Top-Right Control Toolbar: Class Selector, Excel Export, Import, Reset, Print */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Class Selector Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs hover:border-indigo-400 transition-colors">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Lớp:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none pr-3"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EXCEL FEATURE: Export to Excel / CSV */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors shadow-2xs"
            title="Xuất thời khóa biểu ra bảng tính Excel (.CSV)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          {/* EXCEL FEATURE: Import Excel / CSV (Chỉ GV / Admin) */}
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors shadow-2xs"
              title="Nhập dữ liệu thời khóa biểu từ file Excel"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Nhập Excel</span>
            </button>
          )}

          {/* Reset / Refresh Button (Chỉ GV / Admin) */}
          {canEdit && (
            <button
              type="button"
              onClick={handleResetSchedule}
              className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
              title="Khôi phục thời khóa biểu ban đầu"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 hover:text-slate-700 dark:hover:text-white" />
            </button>
          )}

          {/* Print / Export Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
            title="In thời khóa biểu / Xuất PDF"
          >
            <Printer className="w-4 h-4 text-slate-500 hover:text-slate-700 dark:hover:text-white" />
          </button>
        </div>
      </div>

      {/* Hero Banner: Thời khóa biểu tương tác trực tiếp & Highlight Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Thời khóa biểu tuần: Thứ Hai — Chủ Nhật
              </h3>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Lớp {selectedClass?.name}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Đầy đủ 7 ngày trong tuần
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              {canEdit ? (
                <span>💡 Nhấp trực tiếp vào bất kỳ ô nào để chỉnh sửa môn; nhấp vào ô trống (-) để thêm mới; hoặc sao chép/dán ô như Excel.</span>
              ) : (
                <span>💡 Bạn đang ở chế độ xem. Nhấp vào môn học để xem thông tin chi tiết giáo viên và phòng học.</span>
              )}
            </p>
          </div>
        </div>

        {/* TÍNH NĂNG EXCEL: Tô màu nổi bật theo môn (Conditional Highlight) & Thống kê */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Tô sáng môn:</span>
            <select
              value={highlightSubject}
              onChange={(e) => setHighlightSubject(e.target.value)}
              className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả môn học</option>
              {subjectBreakdown.map(([subName, count]) => (
                <option key={subName} value={subName} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {subName} ({count} tiết)
                </option>
              ))}
            </select>
          </div>

          {/* Total Statistics Pill */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0 shadow-2xs">
            <span>Tổng: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{totalAssignedPeriods} tiết</strong></span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
            <span><strong className="text-slate-900 dark:text-white">{uniqueSubjectsCount} môn</strong></span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
            <span><strong className="text-slate-900 dark:text-white">{uniqueTeachersCount} GV</strong></span>
          </div>
        </div>
      </div>

      {/* Notification banner if clipboard has a copied cell */}
      {canEdit && clipboardCell && (
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
            <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              Đang sao chép ô: <strong>{clipboardCell.subject}</strong> (GV: {clipboardCell.teacher} - Phòng {clipboardCell.room}). Nhấn nút <strong>Dán</strong> tại bất kỳ ô nào để sao chép vào.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setClipboardCell(null)}
            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold underline"
          >
            Hủy sao chép
          </button>
        </div>
      )}

      {/* Shift Switcher Bar (Lịch buổi sáng & Lịch buổi chiều) — ĐÃ ĐƯỢC CHỈNH TƯƠNG PHẢN RÕ NÉT THEO ẢNH 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 shadow-2xs">
          {/* Sáng */}
          <button
            type="button"
            onClick={() => setActiveShift('morning')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeShift === 'morning'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeShift === 'morning' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>Lịch buổi sáng</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              activeShift === 'morning' ? 'bg-indigo-700 text-white' : 'bg-slate-300/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}>
              Tiết 1 - 5 ({morningCount})
            </span>
          </button>

          {/* Chiều */}
          <button
            type="button"
            onClick={() => setActiveShift('afternoon')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeShift === 'afternoon'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
            }`}
          >
            <Moon className={`w-4 h-4 ${activeShift === 'afternoon' ? 'text-indigo-200' : 'text-indigo-400'}`} />
            <span>Lịch buổi chiều</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              activeShift === 'afternoon' ? 'bg-indigo-700 text-white' : 'bg-slate-300/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}>
              Tiết 6 - 10 ({afternoonCount})
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>
            Thời gian: {activeShift === 'morning' ? '07:30 - 11:50 (5 tiết sáng)' : '13:00 - 17:15 (5 tiết chiều)'}
          </span>
        </div>
      </div>

      {/* Main Interactive Matrix Table (7 cột: Thứ Hai -> Chủ Nhật, không còn badge tím thừa tại Thứ Bảy) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center">
                <th className="py-3.5 px-4 w-32 text-left font-extrabold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                  Tiết học
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day.key}
                    className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0 min-w-[125px]"
                  >
                    {/* DÒNG CHỮ TRẮNG BÌNH THƯỜNG Ở THỨ BẢY THEO ĐÚNG YÊU CẦU 2 (BỎ PHẦN CHỮ THỪA NỔI BẬT) */}
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {day.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentSlots.map((slot) => (
                <tr key={slot.period} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Period Time Column */}
                  <td className="py-3 px-4 bg-slate-50/70 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-middle">
                    <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                      Tiết {slot.period}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                      {slot.time}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {slot.shift === 'morning' ? 'Sáng' : 'Chiều'}
                    </span>
                  </td>

                  {/* 7 Day Columns: Thứ Hai -> Thứ Bảy & Chủ Nhật */}
                  {DAYS.map((day) => {
                    const slotKey = `${day.key}_${slot.period}`;
                    const cell = scheduleData[slotKey];
                    const isHighlighted = highlightSubject === 'all' || (cell && cell.subject.toLowerCase() === highlightSubject.toLowerCase());
                    const isDimmed = highlightSubject !== 'all' && (!cell || cell.subject.toLowerCase() !== highlightSubject.toLowerCase());

                    return (
                      <td
                        key={day.key}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-middle text-center h-22 transition-opacity ${
                          isDimmed ? 'opacity-30' : 'opacity-100'
                        }`}
                      >
                        {cell ? (
                          /* Subject Card (Click to edit if canEdit, or click to view if !canEdit) */
                          <div className="relative group/cell w-full h-full">
                            <button
                              type="button"
                              onClick={() => handleOpenCell(day.key, day.label, slot)}
                              className={`w-full h-full p-2.5 rounded-xl border transition-all text-center flex flex-col justify-center items-center shadow-2xs group cursor-pointer ${getSubjectColorClasses(
                                cell.subject
                              )} ${isHighlighted && highlightSubject !== 'all' ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-102 shadow-md' : ''}`}
                              title={canEdit ? `Nhấp để chỉnh sửa môn ${cell.subject}` : `Nhấp để xem chi tiết môn ${cell.subject}`}
                            >
                              <span className="font-extrabold text-xs block leading-tight truncate w-full group-hover:scale-105 transition-transform">
                                {cell.subject}
                              </span>
                              <div className="flex items-center justify-center gap-1.5 text-[11px] opacity-85 mt-1 truncate w-full font-medium">
                                <span>{cell.teacher}</span>
                                <span>·</span>
                                <span className="font-mono">{cell.room}</span>
                              </div>
                            </button>

                            {/* Quick Excel Action: Copy button hover (Chỉ hiện khi có quyền sửa) */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={(e) => handleCopyCell(e, cell)}
                                className="absolute top-1 right-1 p-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 opacity-0 group-hover/cell:opacity-100 transition-opacity hover:text-indigo-600 shadow-2xs"
                                title="Sao chép ô này (Excel Copy)"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          /* Empty cell: shows '-' normally */
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            {canEdit ? (
                              <div
                                onClick={() => handleOpenCell(day.key, day.label, slot)}
                                className="group w-full h-full min-h-[58px] flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all hover:bg-indigo-50/50 dark:hover:bg-slate-800/60"
                                title={`Nhấp để gán môn học vào ${day.label} - Tiết ${slot.period}`}
                              >
                                <span className="text-slate-300 dark:text-slate-600 font-mono text-base font-bold group-hover:hidden">
                                  -
                                </span>
                                <div className="hidden group-hover:flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-2xs">
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Thêm</span>
                                </div>
                                {clipboardCell && (
                                  <button
                                    type="button"
                                    onClick={(e) => handlePasteCell(e, day.key, slot.period)}
                                    className="mt-1 px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-700 rounded-md hover:bg-indigo-600 hover:text-white transition-colors"
                                    title="Dán môn đã sao chép vào ô này"
                                  >
                                    Dán ô
                                  </button>
                                )}
                              </div>
                            ) : (
                              /* Học sinh / phụ huynh chỉ xem: hiển thị dấu gạch ngang tĩnh */
                              <span className="text-slate-300 dark:text-slate-600 font-mono text-base font-bold">
                                -
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXCEL FEATURE: Bảng thống kê phân bổ số tiết theo môn học (COUNTIF Summary) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Phân bổ số tiết theo môn học (Thống kê tự động như Excel)</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">Tổng: {totalAssignedPeriods} tiết / tuần</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {subjectBreakdown.map(([subName, count]) => (
            <button
              key={subName}
              type="button"
              onClick={() => setHighlightSubject(highlightSubject === subName ? 'all' : subName)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                highlightSubject === subName
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold truncate">{subName}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{count} tiết / tuần</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Chỉnh sửa môn học (Khi canEdit = true) HOẶC Chi tiết môn học (Khi canEdit = false) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          canEdit
            ? editingSlot && scheduleData[`${editingSlot.dayKey}_${editingSlot.period}`]
              ? `Chỉnh sửa môn học — ${editingSlot.dayLabel}`
              : editingSlot
              ? `Thêm môn học — ${editingSlot.dayLabel}`
              : 'Gán môn học'
            : `Thông tin tiết học — ${editingSlot?.dayLabel || ''}`
        }
        subtitle={
          editingSlot
            ? `${editingSlot.shift === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều'} · Tiết ${editingSlot.period} (${editingSlot.time}) · Lớp ${selectedClass?.name}`
            : ''
        }
        maxWidth="md"
      >
        {canEdit ? (
          /* FORM CHỈNH SỬA CHO GIÁO VIÊN / ADMIN */
          <form onSubmit={handleSaveModal} className="space-y-4">
            {/* Top Badges */}
            {editingSlot && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {editingSlot.dayLabel} · {editingSlot.shift === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều'} · Tiết {editingSlot.period}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{editingSlot.time}</span>
                </span>
              </div>
            )}

            {/* Field 1: Môn học */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Môn học</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Chọn hoặc nhập trực tiếp
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Ví dụ: Luyện AI, Toán học, Ngữ văn..."
                  className="w-full pl-3 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-semibold shadow-2xs"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              {errors.subject && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.subject}</p>
              )}

              {/* Quick Chips Row */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                {QUICK_SUBJECT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setFormSubject(chip);
                      setErrors({});
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      formSubject === chip
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Giáo viên giảng dạy & Phòng học */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Giáo viên giảng dạy</span>
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  placeholder="Ví dụ: Thầy Đông, Cô Mai, Thầy An..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium"
                />
                {errors.teacher && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.teacher}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Phòng học</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="Ví dụ: A.111, B203, Phòng Lab..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-mono font-medium"
                />
              </div>
            </div>

            {/* Row 3: Giờ bắt đầu & Giờ kết thúc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Giờ bắt đầu</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  placeholder="07:30 SA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Giờ kết thúc</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  placeholder="08:15 SA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              {editingSlot && scheduleData[`${editingSlot.dayKey}_${editingSlot.period}`] ? (
                <button
                  type="button"
                  onClick={handleDeleteFromSlot}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa môn khỏi tiết này</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* CHẾ ĐỘ XEM THÔNG TIN DÀNH CHO HỌC SINH / PHỤ HUYNH */
          <div className="space-y-4 py-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-500">Môn học:</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{formSubject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Giáo viên:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{formTeacher}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Phòng học:</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{formRoom}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Khung giờ:</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{formStartTime} — {formEndTime}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 italic text-center">
              Chế độ chỉ xem: Bạn không thể sửa đổi nội dung thời khóa biểu của trường.
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* EXCEL FEATURE: Modal Nhập File Excel / CSV */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Nhập Thời Khóa Biểu từ File Excel / CSV"
          subtitle={`Cập nhật lịch học cho lớp ${selectedClass?.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Chọn file bảng tính <strong>.CSV</strong> đã chuẩn bị theo mẫu (gồm các cột Tiết, Buổi, Thời gian, Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ Nhật) để cập nhật vào lớp học.
            </p>

            <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl p-6 text-center hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Nhấp để chọn file Excel/CSV từ máy tính của bạn
              </p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ định dạng .csv chuẩn UTF-8</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCsvFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                Chọn file từ máy
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleExportExcel}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                📥 Tải file mẫu thời khóa biểu hiện tại để xem cấu trúc
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
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
