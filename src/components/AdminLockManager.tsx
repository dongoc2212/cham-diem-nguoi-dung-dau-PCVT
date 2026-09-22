import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Sparkles, 
  Save, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateVN } from '../utils/lockManager';

export const AdminLockManager: React.FC = () => {
  const { 
    currentUser, 
    isAdmin, 
    lockSettings, 
    updateLockSettings, 
    isSelfLocked, 
    isAuditLocked, 
    sheets,
    setActiveTab 
  } = useApp();

  // Local state for editing
  const [selfScoreLocked, setSelfScoreLocked] = useState<boolean>(lockSettings.selfScoreLocked);
  const [selfScoreLockDate, setSelfScoreLockDate] = useState<string>(lockSettings.selfScoreLockDate || '');
  const [selfScoreLockTime, setSelfScoreLockTime] = useState<string>(lockSettings.selfScoreLockTime || '23:59');

  const [auditScoreLocked, setAuditScoreLocked] = useState<boolean>(lockSettings.auditScoreLocked);
  const [auditScoreLockDate, setAuditScoreLockDate] = useState<string>(lockSettings.auditScoreLockDate || '');
  const [auditScoreLockTime, setAuditScoreLockTime] = useState<string>(lockSettings.auditScoreLockTime || '23:59');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Quick date helper
  const setQuickDate = (type: 'self' | 'audit', daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (type === 'self') {
      setSelfScoreLockDate(dateStr);
      setSelfScoreLockTime('23:59');
    } else {
      setAuditScoreLockDate(dateStr);
      setAuditScoreLockTime('23:59');
    }
  };

  const clearDate = (type: 'self' | 'audit') => {
    if (type === 'self') {
      setSelfScoreLockDate('');
    } else {
      setAuditScoreLockDate('');
    }
  };

  const handleSave = () => {
    updateLockSettings({
      selfScoreLocked,
      selfScoreLockDate,
      selfScoreLockTime,
      auditScoreLocked,
      auditScoreLockDate,
      auditScoreLockTime
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleUnlockAll = () => {
    if (window.confirm('Bạn có chắc muốn MỞ KHÓA TOÀN BỘ (cả Chấm điểm và Phúc tra)?')) {
      setSelfScoreLocked(false);
      setSelfScoreLockDate('');
      setAuditScoreLocked(false);
      setAuditScoreLockDate('');
      updateLockSettings({
        selfScoreLocked: false,
        selfScoreLockDate: '',
        auditScoreLocked: false,
        auditScoreLockDate: ''
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-xs border border-rose-200 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Khu Vực Dành Riêng Cho Quản Trị Viên</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Chỉ tài khoản Quản trị viên (Mã nhân viên <strong>012499</strong> - Đỗ Thị Bích Ngọc) mới có thẩm quyền thiết lập khóa chấm điểm và phúc tra theo ngày.
        </p>
        <button
          onClick={() => setActiveTab('tab_1')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
        >
          Quay lại Bảng Chấm Điểm
        </button>
      </div>
    );
  }

  // Calculate unit progress statistics
  const unitStats = sheets.map(sheet => {
    let totalItems = 0;
    let scoredItems = 0;
    let selfTotal = 0;
    let auditTotal = 0;

    sheet.rows.forEach(r => {
      if (!r.isGroupHeader && !r.isTotal && r.standardScore !== null && !r.isSubHeader) {
        totalItems++;
        if (r.selfScore !== null) {
          scoredItems++;
          selfTotal += r.selfScore;
        }
        if (r.auditScore !== null) {
          auditTotal += r.auditScore;
        }
      }
    });

    const isCompleted = totalItems > 0 && scoredItems === totalItems;
    return {
      id: sheet.id,
      code: sheet.code,
      name: sheet.name,
      totalItems,
      scoredItems,
      selfTotal,
      auditTotal,
      isCompleted,
      percent: totalItems > 0 ? Math.round((scoredItems / totalItems) * 100) : 0
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Admin Profile Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 sm:p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md font-extrabold text-xl flex-shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Quản Trị Viên Hệ Thống
              </span>
              <span className="text-xs text-slate-300">Công ty Điện lực Vũng Tàu (PCVT)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Cấu Hình Khóa Chấm Điểm & Khóa Phúc Tra Theo Ngày
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300">
              <span className="text-white font-medium">Họ & tên: <strong>Đỗ Thị Bích Ngọc</strong></span>
              <span>•</span>
              <span>Mã NV (Số hiệu): <strong className="font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/40">012499</strong></span>
              <span>•</span>
              <span className="text-slate-300">Phòng Tổ chức và Nhân sự</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUnlockAll}
            title="Mở khóa khẩn cấp toàn bộ hệ thống"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Unlock className="w-4 h-4 text-emerald-400" />
            <span>Mở khóa toàn bộ</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thiết lập khóa</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Đã lưu thành công cấu hình khóa! Các thiết lập khóa theo ngày đã có hiệu lực ngay trên toàn hệ thống.</span>
        </div>
      )}

      {/* Main Grid: 2 Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: KHÓA CHẤM ĐIỂM (TỰ CHẤM CỦA ĐƠN VỊ) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Khóa Chấm Điểm (Tự Chấm 13 Đơn Vị)
                </h3>
                <p className="text-xs text-slate-500">
                  Khóa quyền nhập điểm tự chấm và nội dung giải trình
                </p>
              </div>
            </div>

            {/* Current status pill */}
            {isSelfLocked.isLocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <Lock className="w-3 h-3 text-rose-600" />
                <span>Đang Khóa</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>Đang Mở</span>
              </span>
            )}
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Setting Option A: Direct Lock Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Khóa ngay lập tức (Thủ công)
                </span>
                <span className="text-[11px] text-slate-500">
                  Khóa chức năng chấm điểm bất kể ngày giờ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelfScoreLocked(!selfScoreLocked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  selfScoreLocked ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    selfScoreLocked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Setting Option B: Lock by Date (Hạn chót chấm điểm) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Khóa Tự Động Theo Ngày (Hạn Chót Chấm Điểm)</span>
                </label>
                {selfScoreLockDate && (
                  <button
                    onClick={() => clearDate('self')}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Xóa ngày khóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Ngày khóa (sau ngày này sẽ tự khóa):</span>
                  <input
                    type="date"
                    value={selfScoreLockDate}
                    onChange={e => setSelfScoreLockDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Giờ khóa (mặc định hết ngày):</span>
                  <input
                    type="time"
                    value={selfScoreLockTime}
                    onChange={e => setSelfScoreLockTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Date Selectors */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setQuickDate('self', 0)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('self', 1)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('self', 3)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +3 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('self', 7)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +7 ngày
                </button>
              </div>
            </div>

            {/* Explanation & Preview for Users */}
            <div className={`p-3 rounded-lg border text-xs ${
              isSelfLocked.isLocked 
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-blue-50/50 border-blue-200/70 text-blue-900'
            }`}>
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                {isSelfLocked.isLocked ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Trạng thái hiệu lực: Đang BỊ KHÓA</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trạng thái hiệu lực: Đang MỞ CHO CHẤM ĐIỂM</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isSelfLocked.reason || (
                  selfScoreLockDate 
                    ? `Hệ thống sẽ cho phép 13 đơn vị chấm điểm đến hết ngày ${formatDateVN(selfScoreLockDate)} lúc ${selfScoreLockTime}. Sau mốc này sẽ tự động khóa.` 
                    : 'Chưa đặt ngày khóa. Các đơn vị có thể chấm điểm tự do.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: KHÓA PHÚC TRA (HỘI ĐỒNG PHÚC TRA) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Khóa Điểm Phúc Tra (Hội Đồng PCVT)
                </h3>
                <p className="text-xs text-slate-500">
                  Khóa quyền nhập và chỉnh sửa điểm phúc tra
                </p>
              </div>
            </div>

            {/* Current status pill */}
            {isAuditLocked.isLocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <Lock className="w-3 h-3 text-rose-600" />
                <span>Đang Khóa</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>Đang Mở</span>
              </span>
            )}
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Setting Option A: Direct Lock Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Khóa ngay lập tức (Thủ công)
                </span>
                <span className="text-[11px] text-slate-500">
                  Khóa chức năng phúc tra bất kể ngày giờ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAuditScoreLocked(!auditScoreLocked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  auditScoreLocked ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    auditScoreLocked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Setting Option B: Lock by Date (Hạn chót phúc tra) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Khóa Tự Động Theo Ngày (Hạn Chót Phúc Tra)</span>
                </label>
                {auditScoreLockDate && (
                  <button
                    onClick={() => clearDate('audit')}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Xóa ngày khóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Ngày khóa (sau ngày này sẽ tự khóa):</span>
                  <input
                    type="date"
                    value={auditScoreLockDate}
                    onChange={e => setAuditScoreLockDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Giờ khóa:</span>
                  <input
                    type="time"
                    value={auditScoreLockTime}
                    onChange={e => setAuditScoreLockTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Date Selectors */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setQuickDate('audit', 0)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('audit', 1)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('audit', 3)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +3 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('audit', 7)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +7 ngày
                </button>
              </div>
            </div>

            {/* Explanation & Preview for Users */}
            <div className={`p-3 rounded-lg border text-xs ${
              isAuditLocked.isLocked 
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-purple-50/50 border-purple-200/70 text-purple-900'
            }`}>
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                {isAuditLocked.isLocked ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Trạng thái hiệu lực: Đang BỊ KHÓA</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Trạng thái hiệu lực: Đang MỞ PHÚC TRA</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isAuditLocked.reason || (
                  auditScoreLockDate 
                    ? `Hội đồng phúc tra có thể nhập điểm đến hết ngày ${formatDateVN(auditScoreLockDate)} lúc ${auditScoreLockTime}. Sau mốc này sẽ tự động khóa.` 
                    : 'Chưa đặt ngày khóa phúc tra. Hội đồng có thể ghi nhận điểm phúc tra bất kỳ lúc nào.'
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          {lockSettings.lastUpdatedBy ? (
            <span>
              Lần cập nhật gần nhất bởi: <strong>{lockSettings.lastUpdatedBy.userName}</strong> ({lockSettings.lastUpdatedBy.userCode}) lúc {lockSettings.lastUpdatedBy.timestamp}
            </span>
          ) : (
            <span>Chưa ghi nhận lịch sử thay đổi cấu hình khóa.</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Áp Dụng Và Lưu Thiết Lập Khóa</span>
          </button>
        </div>
      </div>

      {/* UNIT PROGRESS MONITORING (To help Admin decide when to lock) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Tiến Độ Chấm Điểm 13 Đơn Vị Trực Thuộc</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm tra tình trạng hoàn thành của từng đơn vị trước khi tiến hành khóa chấm điểm
            </p>
          </div>
          <button
            onClick={() => setActiveTab('summary')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Xem Bảng Tổng Hợp Chi Tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {unitStats.map(stat => (
            <div 
              key={stat.id}
              onClick={() => setActiveTab(stat.id)}
              className="p-3 rounded-lg border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all space-y-2 bg-slate-50/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 font-mono bg-slate-200/70 px-1.5 py-0.5 rounded">
                  {stat.code}
                </span>
                {stat.isCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã hoàn thành
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                    Đang chấm ({stat.percent}%)
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 font-medium truncate" title={stat.name}>
                {stat.name}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    stat.percent === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${stat.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Đã chấm: <strong>{stat.scoredItems}/{stat.totalItems}</strong></span>
                <span className="font-mono font-semibold text-blue-700">{stat.selfTotal} điểm</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
