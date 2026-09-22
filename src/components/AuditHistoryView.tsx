import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Clock, 
  ArrowRight, 
  FileSpreadsheet, 
  Building2,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HistoryEntry } from '../types';

interface AuditHistoryViewProps {
  onJumpToSheet?: (sheetId: string) => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ onJumpToSheet }) => {
  const { allHistory, sheets, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    return allHistory.filter(entry => {
      if (selectedSheet !== 'all' && entry.sheetCode !== selectedSheet) return false;
      if (selectedField !== 'all' && entry.field !== selectedField) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          entry.userName.toLowerCase().includes(term) ||
          entry.userCode.toLowerCase().includes(term) ||
          entry.rowContent.toLowerCase().includes(term) ||
          entry.rowStt.toLowerCase().includes(term) ||
          String(entry.newValue).toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [allHistory, selectedSheet, selectedField, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Nhật Ký Lịch Sử Chỉnh Sửa
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Theo dõi chi tiết tất cả thao tác điều chỉnh điểm số, nội dung giải trình và điểm phúc tra kèm danh tính cán bộ thực hiện.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-mono font-medium">
            Tổng số ghi nhận: <strong>{allHistory.length}</strong> lượt
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã NV, tên cán bộ, nội dung..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSheet}
              onChange={e => setSelectedSheet(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">Tất cả 13 Sheet</option>
              {sheets.map(s => (
                <option key={s.id} value={s.code}>
                  {s.code} - {s.unitTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedField}
              onChange={e => setSelectedField(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="all">Tất cả loại thay đổi</option>
              <option value="selfScore">Điểm chấm</option>
              <option value="explanation">Giải trình</option>
              <option value="auditScore">Điểm phúc tra</option>
              <option value="standardScore">Điểm chuẩn</option>
            </select>
          </div>

          {(searchTerm || selectedSheet !== 'all' || selectedField !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSheet('all');
                setSelectedField('all');
              }}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 underline"
            >
              Đặt lại lọc
            </button>
          )}
        </div>

      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm">Chưa có lịch sử chỉnh sửa nào được ghi nhận.</p>
            <p className="text-xs text-slate-500">
              Hãy chọn một ô trong 13 sheet đơn vị, nhập điểm số hoặc giải trình để ghi nhận.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-32">Thời gian</th>
                  <th className="py-3 px-4 w-52">Người chấm / sửa (Họ và tên)</th>
                  <th className="py-3 px-3 w-28 text-center">Đơn vị (Sheet)</th>
                  <th className="py-3 px-3 w-20 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Nội dung tiêu chí</th>
                  <th className="py-3 px-3 w-28 text-center">Mục thay đổi</th>
                  <th className="py-3 px-4 min-w-[180px]">Giá trị thay đổi</th>
                  <th className="py-3 px-3 w-24 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHistory.map((item) => {
                  const targetSheet = sheets.find(s => s.code === item.sheetCode);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.timestamp}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {item.userCode.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {item.userName}
                            </span>
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                              Mã: {item.userCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sheet Code */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.sheetCode}
                        </span>
                      </td>

                      {/* STT */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {item.rowStt || '—'}
                      </td>

                      {/* Content preview */}
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={item.rowContent}>
                        {item.rowContent}
                      </td>

                      {/* Field */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.field === 'selfScore' 
                            ? 'bg-blue-100 text-blue-800' 
                            : item.field === 'auditScore'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.fieldLabel}
                        </span>
                      </td>

                      {/* Old -> New */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 line-through">
                            {item.oldValue !== null && item.oldValue !== '' ? String(item.oldValue) : '(Trống)'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {item.newValue !== null && item.newValue !== '' ? String(item.newValue) : '(Trống)'}
                          </span>
                        </div>
                      </td>

                      {/* Jump to sheet action */}
                      <td className="py-3 px-3 text-center">
                        {targetSheet && (
                          <button
                            onClick={() => {
                              setActiveTab(targetSheet.id);
                              if (onJumpToSheet) onJumpToSheet(targetSheet.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            Xem sheet
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
