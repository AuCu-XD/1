import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import { ExportImportService, ImportResult } from '../../services/exportImportService';
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({ isOpen, onClose }) => {
  const { students, classes, importStudentsBatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleDownloadTemplate = () => {
    ExportImportService.downloadStudentTemplateCsv();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const existingCodes = new Set(students.map((s) => s.studentCode.toUpperCase()));
        const classMap = new Map(classes.map((c) => [c.name.toUpperCase(), c.id]));

        const result = ExportImportService.parseAndValidateStudentCsv(
          text,
          existingCodes,
          classMap
        );

        setImportResult(result);
      } catch (err: any) {
        setParseError(err.message || 'Lỗi khi đọc file CSV');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importResult || importResult.validRows.length === 0) return;
    importStudentsBatch(importResult.validRows);
    onClose();
  };

  const handleReset = () => {
    setImportResult(null);
    setParseError(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập Dữ Liệu Học Sinh Từ File CSV / Excel"
      subtitle="Tải lên danh sách học sinh theo mẫu quy định của nhà trường"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Step 1: Template banner */}
        <div className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
          <div>
            <h4 className="text-xs font-bold text-indigo-900">1. Tải file CSV mẫu chuẩn</h4>
            <p className="text-[11px] text-indigo-700 mt-0.5">
              File mẫu bao gồm đầy đủ các cột: Mã học sinh, Họ tên, Giới tính, Ngày sinh, Tên lớp...
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file mẫu (.CSV)</span>
          </button>
        </div>

        {/* Step 2: Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            2. Chọn file CSV danh sách học sinh cần tải lên
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="student-csv-upload"
            />
            <label
              htmlFor="student-csv-upload"
              className="inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Chọn file từ máy tính
            </label>
            {fileName && (
              <p className="text-xs font-mono font-medium text-slate-700 mt-2">
                Đã chọn: <span className="text-indigo-600">{fileName}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Định dạng hỗ trợ: .csv (mã hóa UTF-8)</p>
          </div>
        </div>

        {/* Error message on parse */}
        {parseError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Step 3: Validation Preview */}
        {importResult && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                3. Kết quả kiểm tra dữ liệu trước khi lưu ({importResult.totalRows} dòng)
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-700 font-semibold tabular-nums">
                  ✓ {importResult.validRows.length} dòng hợp lệ
                </span>
                {importResult.invalidRows.length > 0 && (
                  <span className="text-rose-600 font-semibold tabular-nums">
                    ✕ {importResult.invalidRows.length} dòng lỗi
                  </span>
                )}
              </div>
            </div>

            {/* Invalid rows box */}
            {importResult.invalidRows.length > 0 && (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl max-h-40 overflow-y-auto space-y-2">
                <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Các dòng bị lỗi sẽ không được nhập vào hệ thống:</span>
                </div>
                {importResult.invalidRows.map((inv) => (
                  <div key={inv.rowNumber} className="text-xs text-rose-700 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="font-bold">Dòng {inv.rowNumber}:</span> {inv.data.fullName || 'Trống'} ({inv.data.studentCode || 'Thiếu mã'})
                    <ul className="list-disc list-inside mt-0.5 text-[11px] text-rose-600">
                      {inv.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Valid preview sample table */}
            {importResult.validRows.length > 0 && (
              <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">Mã HS</th>
                      <th className="py-2 px-2.5">Họ và Tên</th>
                      <th className="py-2 px-2.5">Giới tính</th>
                      <th className="py-2 px-2.5">Ngày sinh</th>
                      <th className="py-2 px-2.5">Lớp</th>
                      <th className="py-2 px-2.5">Phụ huynh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importResult.validRows.slice(0, 10).map((vr) => (
                      <tr key={vr.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2.5 font-mono text-slate-700">{vr.studentCode}</td>
                        <td className="py-1.5 px-2.5 font-medium text-slate-900">{vr.fullName}</td>
                        <td className="py-1.5 px-2.5 text-slate-600">{vr.gender}</td>
                        <td className="py-1.5 px-2.5 text-slate-600">{vr.dateOfBirth}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-indigo-600">{vr.className}</td>
                        <td className="py-1.5 px-2.5 text-slate-600">{vr.parentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            Làm mới
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!importResult || importResult.validRows.length === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập ({importResult?.validRows.length || 0} học sinh)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
