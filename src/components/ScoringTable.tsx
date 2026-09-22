import React, { useState, useMemo } from 'react';
import { 
  Edit3, 
  Search, 
  Sparkles, 
  RotateCcw, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Award,
  ChevronDown,
  Building,
  Check,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SheetRowItem } from '../types';
import { EditCellModal } from './EditCellModal';
import { exportSingleSheetToExcel } from '../utils/excelExport';
import { getClassification, CLASSIFICATION_TIERS } from '../utils/classification';

export const ScoringTable: React.FC = () => {
  const { 
    currentSheet, 
    currentUser, 
    quickFillMaxScores, 
    clearSheetScores, 
    triggerLoginModal,
    isAdmin,
    isSelfLocked,
    isAuditLocked,
    setActiveTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unscored' | 'scored' | 'edited'>('all');

  // Modal edit state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    row: SheetRowItem | null;
    field: 'selfScore' | 'explanation' | 'auditScore' | 'standardScore';
  }>({
    isOpen: false,
    row: null,
    field: 'selfScore'
  });

  if (!currentSheet) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Vui lòng chọn một sheet để xem bảng điểm.</p>
      </div>
    );
  }

  // Calculate live statistics
  const stats = useMemo(() => {
    let standardTotal = 0;
    let selfTotal = 0;
    let auditTotal = 0;
    let scoredItemsCount = 0;
    let totalScorableItems = 0;
    let editedItemsCount = 0;

    // Subtotals by group
    let groupA_std = 0;
    let groupA_self = 0;
    let groupB_std = 0;
    let groupB_self = 0;
    let groupC_std = 0;
    let groupC_self = 0;

    let currentGroup: 'A' | 'B' | 'C' | null = null;

    currentSheet.rows.forEach(r => {
      if (r.isGroupHeader) {
        if (r.stt === 'A' || r.content.includes('TIÊU CHÍ CHUNG')) currentGroup = 'A';
        else if (r.stt === 'B' || r.content.includes('CHỨC TRÁCH')) currentGroup = 'B';
        else if (r.stt === 'C' || r.content.includes('ĐIỂM THƯỞNG')) currentGroup = 'C';
        return;
      }

      if (!r.isTotal && r.standardScore !== null && !r.isSubHeader) {
        totalScorableItems++;
        standardTotal += r.standardScore;

        if (currentGroup === 'A') groupA_std += r.standardScore;
        else if (currentGroup === 'B') groupB_std += r.standardScore;
        else if (currentGroup === 'C') groupC_std += r.standardScore;

        if (r.selfScore !== null) {
          selfTotal += r.selfScore;
          scoredItemsCount++;
          if (currentGroup === 'A') groupA_self += r.selfScore;
          else if (currentGroup === 'B') groupB_self += r.selfScore;
          else if (currentGroup === 'C') groupC_self += r.selfScore;
        }

        if (r.auditScore !== null) {
          auditTotal += r.auditScore;
        }

        if (r.history && r.history.length > 0) {
          editedItemsCount++;
        }
      }
    });

    const standardMax = standardTotal > 0 ? standardTotal : 100;
    const finalScore = auditTotal > 0 ? auditTotal : selfTotal;
    const percentage = ((finalScore / standardMax) * 100).toFixed(1);

    const tier = getClassification(finalScore);

    return {
      standardTotal: standardMax,
      selfTotal,
      auditTotal,
      finalScore,
      percentage,
      classification: tier.rank,
      classificationFull: tier.fullTitle,
      classificationCondition: tier.condition,
      badgeColor: tier.badgeClass,
      scoredItemsCount,
      totalScorableItems,
      editedItemsCount,
      groupA_std,
      groupA_self,
      groupB_std,
      groupB_self,
      groupC_std,
      groupC_self
    };
  }, [currentSheet]);

  // Open modal editor for a cell
  const handleCellClick = (
    row: SheetRowItem,
    field: 'selfScore' | 'explanation' | 'auditScore' | 'standardScore'
  ) => {
    // If it is a group header or total row, do not open regular edit unless authorized
    if (row.isGroupHeader || row.isTotal) return;

    if (!currentUser) {
      triggerLoginModal(() => {
        setModalState({ isOpen: true, row, field });
      });
      return;
    }

    // Check lock conditions
    if (!isAdmin) {
      if ((field === 'selfScore' || field === 'explanation') && isSelfLocked.isLocked) {
        alert(`THÔNG BÁO KHÓA CHẤM ĐIỂM:\n${isSelfLocked.reason}\n\nVui lòng liên hệ Quản trị viên (Mã NV: 012499) để được hỗ trợ mở khóa.`);
        return;
      }
      if (field === 'auditScore' && isAuditLocked.isLocked) {
        alert(`THÔNG BÁO KHÓA PHÚC TRA:\n${isAuditLocked.reason}\n\nVui lòng liên hệ Quản trị viên (Mã NV: 012499) để được hỗ trợ mở khóa.`);
        return;
      }
    }

    setModalState({ isOpen: true, row, field });
  };

  // Filter rows by search term and filter mode
  const filteredRows = useMemo(() => {
    return currentSheet.rows.filter(row => {
      // Always show group headers and total row so layout isn't disjointed unless searching
      if (searchTerm.trim() === '') {
        if (filterMode === 'all') return true;
        if (row.isGroupHeader || row.isTotal) return true;
        if (filterMode === 'scored') return row.selfScore !== null;
        if (filterMode === 'unscored') return row.selfScore === null && row.standardScore !== null && !row.isSubHeader;
        if (filterMode === 'edited') return row.history && row.history.length > 0;
        return true;
      }

      const matchSearch =
        row.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.stt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.reviewer.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSearch;
    });
  }, [currentSheet.rows, searchTerm, filterMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Sheet Title Banner & Statistics Summary */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-md shadow-xs">
                MÃ SHEET: {currentSheet.code}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {currentSheet.unitTitle}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentSheet.unitTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSheet.title}
            </p>
          </div>

          {/* Quick Score Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-quick-fill-max"
              disabled={isSelfLocked.isLocked && !isAdmin}
              onClick={() => quickFillMaxScores(currentSheet.id)}
              title={
                isSelfLocked.isLocked && !isAdmin
                  ? `Chức năng chấm điểm đã bị khóa: ${isSelfLocked.reason}`
                  : "Tự động điền điểm chấm bằng điểm chuẩn tối đa cho toàn bộ tiêu chí"
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isSelfLocked.isLocked && !isAdmin
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
              }`}
            >
              {isSelfLocked.isLocked && !isAdmin ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>Chấm điểm tối đa</span>
            </button>

            <button
              id="btn-clear-sheet-scores"
              disabled={isSelfLocked.isLocked && !isAdmin}
              onClick={() => {
                if (window.confirm(`Bạn có chắc muốn xóa điểm tự chấm của sheet ${currentSheet.code}?`)) {
                  clearSheetScores(currentSheet.id);
                }
              }}
              title={
                isSelfLocked.isLocked && !isAdmin
                  ? `Chức năng chấm điểm đã bị khóa: ${isSelfLocked.reason}`
                  : "Xóa toàn bộ điểm chấm và giải trình của sheet này"
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isSelfLocked.isLocked && !isAdmin
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa điểm</span>
            </button>

            <button
              id="btn-export-sheet-table"
              onClick={() => exportSingleSheetToExcel(currentSheet)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tải file Excel</span>
            </button>
          </div>

        </div>

        {/* Real-time Lock Status Banners */}
        {(isSelfLocked.isLocked || isAuditLocked.isLocked) && (
          <div className="mt-4 space-y-2">
            {isSelfLocked.isLocked && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-900">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-rose-200/80 text-rose-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold">ĐÃ KHÓA CHẤM ĐIỂM: </span>
                    <span>{isSelfLocked.reason}</span>
                    {isAdmin && (
                      <span className="ml-2 font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                        👑 Quyền Admin: Bạn có thể sửa ô
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="text-[11px] font-bold text-rose-800 underline hover:text-rose-950 flex-shrink-0"
                  >
                    Quản lý khóa Admin →
                  </button>
                ) : (
                  <span className="text-[11px] text-rose-700">
                    Liên hệ Admin: <strong>012499 - Đỗ Thị Bích Ngọc</strong>
                  </span>
                )}
              </div>
            )}

            {isAuditLocked.isLocked && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-900">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-purple-200/80 text-purple-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold">ĐÃ KHÓA ĐIỂM PHÚC TRA: </span>
                    <span>{isAuditLocked.reason}</span>
                    {isAdmin && (
                      <span className="ml-2 font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                        👑 Quyền Admin: Bạn có thể sửa ô
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="text-[11px] font-bold text-purple-800 underline hover:text-purple-950 flex-shrink-0"
                  >
                    Quản lý khóa Admin →
                  </button>
                ) : (
                  <span className="text-[11px] text-purple-700">
                    Liên hệ Admin: <strong>012499 - Đỗ Thị Bích Ngọc</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Live Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-5">
          
          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Điểm Chuẩn
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {stats.standardTotal} <span className="text-xs font-normal text-slate-500">điểm</span>
            </div>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200/60">
            <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider block">
              Tổng Điểm Chấm
            </span>
            <div className="text-xl font-bold font-mono text-blue-900 mt-0.5">
              {stats.selfTotal} <span className="text-xs font-normal text-blue-600">/{stats.standardTotal}</span>
            </div>
          </div>

          <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-200/60">
            <span className="text-[11px] font-medium text-purple-700 uppercase tracking-wider block">
              Tổng Điểm Phúc Tra
            </span>
            <div className="text-xl font-bold font-mono text-purple-900 mt-0.5">
              {stats.auditTotal > 0 ? stats.auditTotal : '—'} <span className="text-xs font-normal text-purple-600">{stats.auditTotal > 0 ? 'điểm' : 'chưa phúc tra'}</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Tiến Độ Chấm
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {stats.scoredItemsCount}/{stats.totalScorableItems}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.totalScorableItems > 0 ? (stats.scoredItemsCount / stats.totalScorableItems) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 col-span-2 sm:col-span-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Đánh Giá & Xếp Loại
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {stats.classificationCondition}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${stats.badgeColor} flex items-center gap-1 shadow-xs`}>
                <Award className="w-3.5 h-3.5" />
                {stats.classification}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-600">
                ({stats.finalScore}đ · {stats.percentage}%)
              </span>
            </div>
          </div>

        </div>

        {/* Group Sub-scores Progress Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">Nhóm A (Chung):</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">
              {stats.groupA_self}/30đ
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">Nhóm B (Chức trách):</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">
              {stats.groupB_self}/65đ
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">Nhóm C (Thưởng):</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">
              {stats.groupC_self}/5đ
            </span>
          </div>
        </div>

        {/* Classification Criteria Notice according to PCVT document */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/80">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Chỉ tiêu xếp loại đánh giá:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 font-medium">
            <span>• ≥ 90 điểm: <strong className="text-emerald-700">Hoàn thành xuất sắc nhiệm vụ</strong></span>
            <span>• ≥ 70 đến &lt; 90 điểm: <strong className="text-blue-700">Hoàn thành tốt nhiệm vụ</strong></span>
            <span>• ≥ 50 đến &lt; 70 điểm: <strong className="text-amber-700">Hoàn thành nhiệm vụ</strong></span>
            <span>• &lt; 50 điểm: <strong className="text-rose-700">Không hoàn thành nhiệm vụ</strong></span>
          </div>
        </div>

      </div>

      {/* Table Toolbar & Search */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nội dung tiêu chí, số TT..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả ({currentSheet.rows.length})
            </button>
            <button
              onClick={() => setFilterMode('unscored')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'unscored'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Chưa chấm ({stats.totalScorableItems - stats.scoredItemsCount})
            </button>
            <button
              onClick={() => setFilterMode('scored')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'scored'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Đã chấm ({stats.scoredItemsCount})
            </button>
            <button
              onClick={() => setFilterMode('edited')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'edited'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Có ghi nhận sửa ({stats.editedItemsCount})
            </button>
          </div>

        </div>

        {/* The Spreadsheet Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 tracking-wider">
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">STT</th>
                <th className="py-3 px-4 min-w-[280px] max-w-[420px] border-r border-slate-200">Nội dung đánh giá</th>
                <th className="py-3 px-3 w-24 text-center border-r border-slate-200">Điểm chuẩn</th>
                <th className="py-3 px-3 w-32 text-center border-r border-slate-200 bg-blue-50/80 text-blue-900">
                  <div className="flex items-center justify-center gap-1 font-bold">
                    <span>Điểm chấm</span>
                    <Edit3 className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[200px] border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1">
                    <span>Giải trình</span>
                    <Edit3 className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 w-36 text-center border-r border-slate-200">Đơn vị phúc tra</th>
                <th className="py-3 px-3 w-32 text-center bg-purple-50/70 text-purple-900">
                  <div className="flex items-center justify-center gap-1 font-bold">
                    <span>Điểm phúc tra</span>
                    <Edit3 className="w-3 h-3 text-purple-600" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy nội dung tiêu chí phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  
                  // 1. Group Header Row (e.g., "NHÓM TIÊU CHÍ CHUNG", "NHÓM B", "ĐIỂM THƯỞNG")
                  if (row.isGroupHeader) {
                    return (
                      <tr 
                        key={row.id} 
                        className="bg-slate-800 text-white font-bold text-xs tracking-wide"
                      >
                        <td className="py-2.5 px-3 text-center font-mono border-r border-slate-700">
                          {row.stt}
                        </td>
                        <td className="py-2.5 px-4 uppercase border-r border-slate-700">
                          {row.content}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-300 font-bold border-r border-slate-700">
                          {row.standardScore !== null ? `${row.standardScore} điểm` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-700 font-mono text-blue-200">
                          {/* Live computed group subtotal */}
                          {row.stt === 'A' && `${stats.groupA_self} đ`}
                          {row.stt === 'B' && `${stats.groupB_self} đ`}
                          {row.stt === 'C' && `${stats.groupC_self} đ`}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-700"></td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-700 text-slate-300 font-normal">
                          {row.reviewer}
                        </td>
                        <td className="py-2.5 px-3 text-center"></td>
                      </tr>
                    );
                  }

                  // 2. Subheader row (e.g., Section 1, 2, 3 in Group A)
                  if (row.isSubHeader) {
                    return (
                      <tr 
                        key={row.id} 
                        className="bg-blue-50/70 font-semibold text-slate-800 text-xs"
                      >
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-800 border-r border-slate-200">
                          {row.stt}
                        </td>
                        <td className="py-2.5 px-4 border-r border-slate-200 font-medium text-slate-900">
                          {row.content}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700 border-r border-slate-200">
                          {row.standardScore}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-400">
                          —
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-400"></td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600 text-[11px]">
                          {row.reviewer}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400">
                          —
                        </td>
                      </tr>
                    );
                  }

                  // 3. Total Row (TỔNG CỘNG)
                  if (row.isTotal) {
                    return (
                      <tr 
                        key={row.id} 
                        className="bg-blue-900 text-white font-bold text-sm tracking-wide border-t-2 border-blue-950"
                      >
                        <td className="py-3.5 px-3 text-center font-mono border-r border-blue-800">
                          ∑
                        </td>
                        <td className="py-3.5 px-4 uppercase border-r border-blue-800">
                          {row.content || 'TỔNG CỘNG (A + B + C)'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-300 border-r border-blue-800 text-base">
                          {stats.standardTotal}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-white border-r border-blue-800 text-base bg-blue-800">
                          {stats.selfTotal}
                        </td>
                        <td className="py-3.5 px-3 border-r border-blue-800 text-xs font-normal text-blue-200">
                          Tỷ lệ đạt: {stats.percentage}% ({stats.classification})
                        </td>
                        <td className="py-3.5 px-3 text-center border-r border-blue-800 text-xs font-normal text-blue-200">
                          Hội đồng PCVT
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-purple-200 text-base bg-purple-950/40">
                          {stats.auditTotal > 0 ? stats.auditTotal : '—'}
                        </td>
                      </tr>
                    );
                  }

                  // 4. Regular criteria leaf row
                  const hasEdits = row.history && row.history.length > 0;
                  const isScored = row.selfScore !== null;
                  const isAudited = row.auditScore !== null;

                  return (
                    <tr 
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-600 border-r border-slate-200">
                        {row.stt}
                      </td>

                      {/* Content */}
                      <td className="py-2.5 px-4 text-slate-800 leading-relaxed border-r border-slate-200">
                        <div className={!row.stt ? 'pl-4 text-slate-600 text-[11px] italic' : ''}>
                          {row.content}
                        </div>
                      </td>

                      {/* Standard benchmark score */}
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700 border-r border-slate-200">
                        {row.standardScore !== null ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {row.standardScore}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Self-Score cell (CLICKABLE & TRACKED) */}
                      <td 
                        onClick={() => handleCellClick(row, 'selfScore')}
                        title="Bấm để chấm/điều chỉnh số điểm và lưu tên người sửa"
                        className="py-2.5 px-3 text-center border-r border-slate-200 cursor-pointer transition-all hover:bg-blue-100/60 relative group/cell"
                      >
                        <div className="flex flex-col items-center justify-center">
                          {isScored ? (
                            <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/80 shadow-2xs group-hover/cell:scale-105 transition-transform">
                              {row.selfScore}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 group-hover/cell:text-blue-600 flex items-center gap-0.5 border border-dashed border-slate-300 rounded px-1.5 py-0.5">
                              + Chấm
                            </span>
                          )}

                          {/* Editor Badge under score - Displaying Full Name (Họ và tên) */}
                          {row.lastEditedBy && row.lastEditedBy.field.includes('Điểm chấm') && (
                            <span 
                              className="text-[10px] text-blue-800 font-semibold truncate max-w-[130px] mt-1 bg-blue-100/90 hover:bg-blue-200/90 px-1.5 py-0.5 rounded border border-blue-200/80 block leading-tight shadow-2xs"
                              title={`Người chấm: ${row.lastEditedBy.userName} (Mã NV: ${row.lastEditedBy.userCode}) lúc ${row.lastEditedBy.timestamp}`}
                            >
                              ✍ {row.lastEditedBy.userName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Explanation cell (CLICKABLE & TRACKED) */}
                      <td 
                        onClick={() => handleCellClick(row, 'explanation')}
                        title="Bấm để nhập văn bản giải trình"
                        className="py-2 px-3 border-r border-slate-200 cursor-pointer transition-all hover:bg-amber-50/60 relative group/cell max-w-[240px]"
                      >
                        {row.explanation ? (
                          <div className="space-y-0.5">
                            <p className="text-slate-700 text-xs line-clamp-2">
                              {row.explanation}
                            </p>
                            {row.lastEditedBy && row.lastEditedBy.field === 'Giải trình' && (
                              <span 
                                className="text-[10px] text-amber-900 font-semibold inline-block truncate max-w-[210px] mt-1 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200/80 shadow-2xs"
                                title={`Người giải trình: ${row.lastEditedBy.userName} (Mã NV: ${row.lastEditedBy.userCode}) lúc ${row.lastEditedBy.timestamp}`}
                              >
                                ✍ {row.lastEditedBy.userName} · {row.lastEditedBy.timestamp.slice(0, 5)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300 italic group-hover/cell:text-amber-700 flex items-center gap-1">
                            + Thêm giải trình
                          </span>
                        )}
                      </td>

                      {/* Reviewing Authority / Unit */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600">
                        {row.reviewer ? (
                          <span className="inline-block bg-slate-100 text-slate-700 font-medium text-[11px] px-2 py-0.5 rounded border border-slate-200">
                            {row.reviewer}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Audit Score (CLICKABLE & TRACKED) */}
                      <td 
                        onClick={() => handleCellClick(row, 'auditScore')}
                        title="Bấm để ghi nhận điểm phúc tra của Hội đồng"
                        className="py-2.5 px-3 text-center cursor-pointer transition-all hover:bg-purple-100/60 relative group/cell"
                      >
                        <div className="flex flex-col items-center justify-center">
                          {isAudited ? (
                            <span className="font-mono font-bold text-sm text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 shadow-2xs group-hover/cell:scale-105 transition-transform">
                              {row.auditScore}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-300 group-hover/cell:text-purple-600">
                              + Phúc tra
                            </span>
                          )}

                          {row.lastEditedBy && row.lastEditedBy.field.includes('Điểm phúc tra') && (
                            <span 
                              className="text-[10px] text-purple-800 font-semibold truncate max-w-[130px] mt-1 bg-purple-100/90 hover:bg-purple-200/90 px-1.5 py-0.5 rounded border border-purple-200/80 block leading-tight shadow-2xs"
                              title={`Người phúc tra: ${row.lastEditedBy.userName} (Mã NV: ${row.lastEditedBy.userCode}) lúc ${row.lastEditedBy.timestamp}`}
                            >
                              ✍ {row.lastEditedBy.userName}
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Instructions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Hướng dẫn: Bấm trực tiếp vào cột <strong>Điểm chấm</strong>, <strong>Giải trình</strong> hoặc <strong>Điểm phúc tra</strong> để nhập và hệ thống tự động ghi nhận tên người sửa.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono">
              Tổng số dòng: {currentSheet.rows.length}
            </span>
          </div>
        </div>

      </div>

      {/* Edit Cell Modal */}
      <EditCellModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        row={modalState.row}
        sheetId={currentSheet.id}
        field={modalState.field}
      />

    </div>
  );
};
