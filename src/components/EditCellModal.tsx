import React, { useState, useEffect } from 'react';
import { X, Check, User, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SheetRowItem } from '../types';

interface EditCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: SheetRowItem | null;
  sheetId: string;
  field: 'selfScore' | 'explanation' | 'auditScore' | 'standardScore';
}

export const EditCellModal: React.FC<EditCellModalProps> = ({
  isOpen,
  onClose,
  row,
  sheetId,
  field
}) => {
  const { currentUser, updateCell, triggerLoginModal } = useApp();

  const [scoreValue, setScoreValue] = useState<string>('');
  const [textValue, setTextValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (row) {
      if (field === 'selfScore') {
        setScoreValue(row.selfScore !== null ? String(row.selfScore) : '');
      } else if (field === 'auditScore') {
        setScoreValue(row.auditScore !== null ? String(row.auditScore) : '');
      } else if (field === 'standardScore') {
        setScoreValue(row.standardScore !== null ? String(row.standardScore) : '');
      } else if (field === 'explanation') {
        setTextValue(row.explanation || '');
      }
      setError('');
    }
  }, [row, field, isOpen]);

  if (!isOpen || !row) return null;

  const isNumeric = field === 'selfScore' || field === 'auditScore' || field === 'standardScore';

  const fieldTitles: Record<string, string> = {
    selfScore: 'Điều chỉnh Điểm Chấm (Tự chấm)',
    explanation: 'Cập nhật Nội dung Giải Trình',
    auditScore: 'Điều chỉnh Điểm Phúc Tra',
    standardScore: 'Điều chỉnh Điểm Chuẩn'
  };

  const handleSave = () => {
    if (!currentUser) {
      triggerLoginModal();
      return;
    }

    if (isNumeric) {
      if (scoreValue.trim() === '') {
        updateCell(sheetId, row.id, field, null);
        onClose();
        return;
      }

      const num = parseFloat(scoreValue);
      if (isNaN(num)) {
        setError('Vui lòng nhập một con số hợp lệ');
        return;
      }

      if (num < 0) {
        setError('Điểm số không được nhỏ hơn 0');
        return;
      }

      // Check max benchmark if applicable
      if (field === 'selfScore' && row.standardScore !== null && num > row.standardScore) {
        if (!window.confirm(`Điểm chấm (${num}) đang cao hơn Điểm chuẩn (${row.standardScore}). Bạn có chắc chắn muốn lưu?`)) {
          return;
        }
      }

      updateCell(sheetId, row.id, field, num);
    } else {
      updateCell(sheetId, row.id, field, textValue.trim());
    }

    onClose();
  };

  const handleQuickScore = (val: number) => {
    setScoreValue(String(val));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600">
              {row.stt ? `Tiêu chí ${row.stt}` : 'Mục đánh giá'}
            </span>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              {fieldTitles[field] || 'Chỉnh sửa ô dữ liệu'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4">
          
          {/* Target Criterion Content Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
            <span className="font-semibold text-slate-900 block mb-1">Nội dung đánh giá:</span>
            {row.content}
            {row.standardScore !== null && (
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                <span>Điểm chuẩn tối đa:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  {row.standardScore} điểm
                </span>
              </div>
            )}
          </div>

          {/* Form input */}
          {isNumeric ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nhập số điểm điều chỉnh:
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max={row.standardScore || undefined}
                  value={scoreValue}
                  onChange={e => {
                    setScoreValue(e.target.value);
                    setError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSave();
                  }}
                  autoFocus
                  placeholder={row.standardScore !== null ? `Tối đa ${row.standardScore}` : 'Nhập điểm'}
                  className="w-full px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {scoreValue && (
                  <button
                    type="button"
                    onClick={() => setScoreValue('')}
                    className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Quick Preset Buttons */}
              {row.standardScore !== null && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-500 mr-1">Chọn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickScore(row.standardScore!)}
                    className="text-xs px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors"
                  >
                    Tối đa ({row.standardScore}đ)
                  </button>
                  {row.standardScore > 1 && (
                    <button
                      type="button"
                      onClick={() => handleQuickScore(row.standardScore! / 2)}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      50% ({row.standardScore! / 2}đ)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickScore(0)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    0 điểm
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nội dung giải trình / chứng minh đính kèm:
              </label>
              <textarea
                rows={4}
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                autoFocus
                placeholder="Nhập giải trình, số văn bản, căn cứ hoặc lý do điều chỉnh..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400">Gợi ý:</span>
                {[
                  'Đã hoàn thành 100% đúng hạn',
                  'Có báo cáo và minh chứng đầy đủ',
                  'Không có sai phạm theo quy định',
                  'Chi bộ xếp loại Hoàn thành tốt'
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTextValue(s)}
                    className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User Tracking Notice */}
          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 flex items-start gap-2.5">
            <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                Ghi nhận người thực hiện chấm / sửa (Họ và tên):
              </span>
              {currentUser ? (
                <div className="text-slate-700 mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                    {currentUser.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    Mã NV: {currentUser.employeeId}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    · {currentUser.unit}
                  </span>
                </div>
              ) : (
                <div className="text-amber-700 font-medium mt-0.5">
                  Chưa đăng nhập! Nhấn Lưu sẽ mở hộp thoại đăng nhập Mã NV.
                </div>
              )}
            </div>
          </div>

          {/* Last edit history of this row if available */}
          {row.lastEditedBy && (
            <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Lần chấm / sửa gần nhất: </span>
              <strong className="text-slate-900 font-bold">{row.lastEditedBy.userName}</strong>
              <span className="text-slate-500 font-mono text-[11px]">(Mã: {row.lastEditedBy.userCode})</span>
              <span className="text-slate-400 text-[11px]">· {row.lastEditedBy.timestamp}</span>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Lưu & Ghi nhận người sửa</span>
          </button>
        </div>

      </div>
    </div>
  );
};
