import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Award,
  Plus,
  ThumbsUp,
  AlertTriangle,
  Search,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  Star
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  type: 'merit' | 'demerit';
  points: number;
  reason: string;
  recordedBy: string;
  date: string;
}

export const BehaviorDisciplineModule: React.FC = () => {
  const { students, classes, activeUser, addToast } = useApp();

  const [records, setRecords] = useState<BehaviorRecord[]>([
    {
      id: 'beh-1',
      studentId: 'st-1',
      studentName: 'Trần Minh Khang',
      studentCode: 'HS-2024-001',
      className: '10A1',
      type: 'merit',
      points: 5,
      reason: 'Đạt điểm 10 kiểm tra giữa kỳ môn Toán và tích cực hướng dẫn bạn học nhóm',
      recordedBy: 'Thầy Nguyễn Văn An',
      date: '2024-10-02'
    },
    {
      id: 'beh-2',
      studentId: 'st-2',
      studentName: 'Nguyễn Lê Thảo My',
      studentCode: 'HS-2024-002',
      className: '10A1',
      type: 'merit',
      points: 5,
      reason: 'Đại diện lớp đạt giải Nhì hội thi Hùng biện Tiếng Anh cấp trường',
      recordedBy: 'Thầy Nguyễn Văn An',
      date: '2024-09-28'
    },
    {
      id: 'beh-3',
      studentId: 'st-4',
      studentName: 'Hoàng Quốc Bảo',
      studentCode: 'HS-2024-004',
      className: '10A1',
      type: 'demerit',
      points: -2,
      reason: 'Đi học muộn 15 phút không có giấy xin phép của phụ huynh',
      recordedBy: 'Thầy Nguyễn Văn An',
      date: '2024-10-01'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formStudentId, setFormStudentId] = useState('');
  const [formType, setFormType] = useState<'merit' | 'demerit'>('merit');
  const [formPoints, setFormPoints] = useState(5);
  const [formReason, setFormReason] = useState('');

  const filtered = records.filter((r) => {
    const matchSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) || r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || r.type === selectedType;
    return matchSearch && matchType;
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formReason.trim()) {
      alert('Vui lòng chọn học sinh và nhập nội dung ghi nhận nề nếp');
      return;
    }

    const st = students.find((s) => s.id === formStudentId);
    if (!st) return;

    const newRec: BehaviorRecord = {
      id: `beh-${Date.now()}`,
      studentId: st.id,
      studentName: st.fullName,
      studentCode: st.studentCode,
      className: st.className,
      type: formType,
      points: formType === 'merit' ? Math.abs(formPoints) : -Math.abs(formPoints),
      reason: formReason.trim(),
      recordedBy: activeUser.name,
      date: new Date().toISOString().split('T')[0]
    };

    setRecords((prev) => [newRec, ...prev]);
    setIsModalOpen(false);
    setFormReason('');

    addToast({
      type: 'success',
      title: 'Đã lưu ghi nhận nề nếp',
      message: `Đã cập nhật ${formType === 'merit' ? 'khen thưởng' : 'nhắc nhở'} cho học sinh ${st.fullName}.`
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hành Vi & Nề Nếp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Ghi nhận điểm cộng thi đua, nhắc nhở nề nếp và theo dõi rèn luyện học sinh
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormStudentId(students[0]?.id || '');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận nề nếp</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3 neon-card-box">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Khen thưởng tháng 10</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">14 lượt tuyên dương</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3 neon-card-box">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Cần nhắc nhở nề nếp</span>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-400">3 học sinh</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center gap-3 neon-card-box">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Tỷ lệ hạnh kiểm Tốt</span>
            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">92.5% toàn trường</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 neon-card-box">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã HS, nội dung vi phạm hoặc khen thưởng..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả ghi nhận</option>
          <option value="merit">Chỉ tuyên dương (+ điểm)</option>
          <option value="demerit">Chỉ nhắc nhở (- điểm)</option>
        </select>
      </div>

      {/* Log list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs neon-card-box">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3.5">Học sinh</th>
                <th className="py-3 px-3.5">Lớp</th>
                <th className="py-3 px-3.5">Phân loại</th>
                <th className="py-3 px-3.5">Điểm thi đua</th>
                <th className="py-3 px-3.5">Nội dung ghi nhận</th>
                <th className="py-3 px-3.5">Người ghi nhận</th>
                <th className="py-3 px-3.5 text-right">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((rec) => {
                const isMerit = rec.type === 'merit';
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3.5">
                      <span className="font-semibold text-slate-900 dark:text-white block">{rec.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{rec.studentCode}</span>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{rec.className}</td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isMerit ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'}`}>
                        {isMerit ? 'Tuyên dương' : 'Nhắc nhở'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold">
                      <span className={isMerit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isMerit ? `+${rec.points}` : rec.points} điểm
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 max-w-md">
                      {rec.reason}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400">{rec.recordedBy}</td>
                    <td className="py-3 px-3.5 text-right text-slate-400 dark:text-slate-500 font-mono">{rec.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Ghi Nhận Hành Vi & Điểm Rèn Luyện"
          subtitle="Tuyên dương thành tích học sinh hoặc nhắc nhở vi phạm nề nếp"
          maxWidth="md"
        >
          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Chọn học sinh</label>
              <select
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentCode} - Lớp {s.className})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hình thức</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="merit">Tuyên dương (+)</option>
                  <option value="demerit">Nhắc nhở / Trừ (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mức điểm</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formPoints}
                  onChange={(e) => setFormPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nội dung chi tiết / Lý do</label>
              <textarea
                rows={3}
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="Ví dụ: Đạt giải Nhất cuộc thi cờ vua, Nhặt được của rơi trả người đánh mất..."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Lưu ghi nhận
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
