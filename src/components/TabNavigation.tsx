import React from 'react';
import { 
  Building2, 
  BarChart3, 
  LogIn, 
  History, 
  CheckCircle, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TabNavigation: React.FC = () => {
  const { sheets, activeTab, setActiveTab, currentUser, allHistory } = useApp();

  // Helper to compute progress for each sheet
  const getSheetSummary = (sheetId: string) => {
    const sheet = sheets.find(s => s.id === sheetId);
    if (!sheet) return { selfTotal: 0, hasEdits: false, countFilled: 0, totalItems: 0 };

    let selfTotal = 0;
    let countFilled = 0;
    let totalItems = 0;
    let hasEdits = false;

    sheet.rows.forEach(r => {
      if (!r.isGroupHeader && !r.isTotal && r.standardScore !== null && !r.isSubHeader) {
        totalItems++;
        if (r.selfScore !== null) {
          selfTotal += r.selfScore;
          countFilled++;
        }
      }
      if (r.history && r.history.length > 0) {
        hasEdits = true;
      }
    });

    return { selfTotal, hasEdits, countFilled, totalItems };
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[61px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top utility tab bar (Summary, Login Tab, Audit History) */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 overflow-x-auto text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-medium px-2 hidden sm:inline">Xem theo:</span>

            {/* 13 Sheets Tab trigger */}
            <button
              id="tab-btn-sheets-group"
              onClick={() => {
                if (['summary', 'login', 'audit'].includes(activeTab)) {
                  setActiveTab('tab_1');
                }
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                !['summary', 'login', 'audit'].includes(activeTab)
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>13 Sheet Đơn Vị</span>
            </button>

            {/* Summary tab */}
            <button
              id="tab-btn-summary"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Tổng Hợp 13 Đơn Vị</span>
            </button>

            {/* Audit History tab */}
            <button
              id="tab-btn-audit"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Nhật Ký Chỉnh Sửa</span>
              {allHistory.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {allHistory.length}
                </span>
              )}
            </button>

            {/* Explicit Login Tab as requested in prompt */}
            <button
              id="tab-btn-login"
              onClick={() => setActiveTab('login')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Tab Đăng Nhập (Mã NV)</span>
              {currentUser && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" />
                  {currentUser.employeeId}
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mỗi lần sửa ô đều lưu tên người đăng nhập & thời gian</span>
          </div>
        </div>

        {/* 13 Primary Sheets Tabs (Horizontal Scrollable) */}
        <div className="flex items-center space-x-1.5 py-2 overflow-x-auto no-scrollbar scroll-smooth">
          {sheets.map((sheet, index) => {
            const isSelected = activeTab === sheet.id;
            const summary = getSheetSummary(sheet.id);

            return (
              <button
                key={sheet.id}
                id={`tab-sheet-${index + 1}`}
                onClick={() => setActiveTab(sheet.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={`${sheet.code}: ${sheet.unitTitle}`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {index + 1}
                </span>
                <span className="whitespace-nowrap font-medium">{sheet.code}</span>

                {/* Score badge */}
                {summary.selfTotal > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {summary.selfTotal}đ
                  </span>
                )}

                {/* Indicator dot if edited */}
                {summary.hasEdits && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-amber-300' : 'bg-amber-500'
                    }`}
                    title="Có chỉnh sửa"
                  />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
