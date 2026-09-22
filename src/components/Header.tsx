import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  History, 
  RotateCcw, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportSingleSheetToExcel, exportAllSheetsToExcel } from '../utils/excelExport';

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  const { 
    currentUser, 
    logout, 
    triggerLoginModal, 
    currentSheet, 
    sheets, 
    resetAllData, 
    allHistory,
    setActiveTab 
  } = useApp();

  const handleExportCurrent = () => {
    if (currentSheet) {
      exportSingleSheetToExcel(currentSheet);
    }
  };

  const handleExportAll = () => {
    exportAllSheetsToExcel(sheets);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('tab_1')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md border border-blue-500/30 flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600/30 text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-400/30 uppercase tracking-wider">
                  PCVT EVN
                </span>
                <span className="text-xs text-slate-400">13 Đơn vị trực thuộc</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Chấm Điểm Người Đứng Đầu PCVT
              </h1>
            </div>
          </div>

          {/* Right actions & User Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Excel export dropdown/buttons */}
            <div className="flex items-center gap-1.5">
              {currentSheet && (
                <button
                  id="btn-export-current-excel"
                  onClick={handleExportCurrent}
                  title="Xuất file Excel của sheet đang xem"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Xuất Sheet ({currentSheet.code})</span>
                </button>
              )}

              <button
                id="btn-export-all-excel"
                onClick={handleExportAll}
                title="Xuất file Excel đầy đủ 13 sheet kèm bảng tổng hợp"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất 13 Sheet</span>
              </button>
            </div>

            {/* Edit History button */}
            <button
              id="btn-view-history"
              onClick={onOpenHistory}
              title="Xem nhật ký lịch sử người sửa từng ô"
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhật ký sửa</span>
              {allHistory.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {allHistory.length}
                </span>
              )}
            </button>

            {/* Reset data */}
            <button
              id="btn-reset-data"
              onClick={resetAllData}
              title="Đặt lại toàn bộ dữ liệu ban đầu"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Login / Profile status */}
            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/80 pl-2.5 pr-1 py-1 rounded-lg border border-slate-700">
                <div className="flex items-center gap-1.5 text-left">
                  <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-white">{currentUser.name}</span>
                      <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1 py-0.2 rounded border border-blue-700/50">
                        {currentUser.employeeId}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                      {currentUser.unit}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-header-logout"
                  onClick={logout}
                  title="Đăng xuất tài khoản"
                  className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-700 rounded transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={() => triggerLoginModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập Mã NV</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
