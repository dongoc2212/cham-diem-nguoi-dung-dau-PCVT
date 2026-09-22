import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Award, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportAllSheetsToExcel } from '../utils/excelExport';

export const SummaryDashboard: React.FC = () => {
  const { sheets, setActiveTab } = useApp();

  const summaryList = useMemo(() => {
    return sheets.map((sheet, index) => {
      let standardTotal = 0;
      let selfTotal = 0;
      let auditTotal = 0;
      let scoredItems = 0;
      let totalItems = 0;

      sheet.rows.forEach(r => {
        if (!r.isGroupHeader && !r.isTotal && r.standardScore !== null && !r.isSubHeader) {
          totalItems++;
          standardTotal += r.standardScore;
          if (r.selfScore !== null) {
            selfTotal += r.selfScore;
            scoredItems++;
          }
          if (r.auditScore !== null) {
            auditTotal += r.auditScore;
          }
        }
      });

      const maxScore = standardTotal > 0 ? standardTotal : 100;
      const finalScore = auditTotal > 0 ? auditTotal : selfTotal;
      const percentage = Number(((finalScore / maxScore) * 100).toFixed(1));

      let rank = 'Chưa hoàn thành';
      let rankColor = 'bg-rose-100 text-rose-800 border-rose-200';
      if (finalScore >= 90) {
        rank = 'Hoàn thành Xuất sắc';
        rankColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      } else if (finalScore >= 80) {
        rank = 'Hoàn thành Tốt';
        rankColor = 'bg-blue-100 text-blue-800 border-blue-200';
      } else if (finalScore >= 70) {
        rank = 'Hoàn thành Nhiệm vụ';
        rankColor = 'bg-amber-100 text-amber-800 border-amber-200';
      }

      return {
        id: sheet.id,
        index: index + 1,
        code: sheet.code,
        unitTitle: sheet.unitTitle,
        maxScore,
        selfTotal,
        auditTotal,
        finalScore,
        percentage,
        rank,
        rankColor,
        scoredItems,
        totalItems,
        progressPercent: totalItems > 0 ? Math.round((scoredItems / totalItems) * 100) : 0
      };
    });
  }, [sheets]);

  // Overall aggregate
  const overallStats = useMemo(() => {
    const totalUnits = summaryList.length;
    const completedUnits = summaryList.filter(s => s.progressPercent === 100).length;
    const avgScore = (summaryList.reduce((acc, s) => acc + s.finalScore, 0) / (totalUnits || 1)).toFixed(1);
    const excellentCount = summaryList.filter(s => s.finalScore >= 90).length;

    return { totalUnits, completedUnits, avgScore, excellentCount };
  }, [summaryList]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
              Báo Cáo Tổng Hợp
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Bảng Đánh Giá & Xếp Hạng 13 Đơn Vị Trực Thuộc PCVT
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Tổng hợp kết quả tự chấm điểm và điểm phúc tra của người đứng đầu các Phòng, Đội, Điện lực trực thuộc.
          </p>
        </div>

        <button
          onClick={() => exportAllSheetsToExcel(sheets)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex-shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Toàn Bộ 13 Sheet (.xlsx)</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Tổng số đơn vị</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            13 <span className="text-xs text-slate-500 font-normal">đơn vị</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Đơn vị đã chấm xong</span>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {overallStats.completedUnits} <span className="text-xs text-slate-500 font-normal">/13 đơn vị</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Điểm trung bình toàn PCVT</span>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
            {overallStats.avgScore} <span className="text-xs text-slate-500 font-normal">/100đ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Đạt Hoàn thành xuất sắc</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {overallStats.excellentCount} <span className="text-xs text-slate-500 font-normal">đơn vị (≥90đ)</span>
          </div>
        </div>
      </div>

      {/* Overview Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Chi Tiết Điểm Số & Xếp Loại 13 Đơn Vị
          </h3>
          <span className="text-xs text-slate-500">
            Bấm vào bất kỳ dòng nào để mở sheet chi tiết
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-3 w-28 text-center">Mã Sheet</th>
                <th className="py-3 px-4 min-w-[220px]">Tên Đơn Vị / Phòng Ban</th>
                <th className="py-3 px-3 w-28 text-center">Điểm chuẩn</th>
                <th className="py-3 px-3 w-28 text-center text-blue-800 bg-blue-50/60">Điểm tự chấm</th>
                <th className="py-3 px-3 w-32 text-center text-purple-800 bg-purple-50/60">Điểm phúc tra</th>
                <th className="py-3 px-3 w-24 text-center">Tỷ lệ (%)</th>
                <th className="py-3 px-4 w-40 text-center">Xếp loại</th>
                <th className="py-3 px-3 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summaryList.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                    {item.index}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span>{item.unitTitle}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-600">
                    {item.maxScore}đ
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                    {item.selfTotal > 0 ? `${item.selfTotal}đ` : '—'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-purple-700 bg-purple-50/30">
                    {item.auditTotal > 0 ? `${item.auditTotal}đ` : '—'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                    {item.percentage}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.rankColor}`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-blue-600 group-hover:translate-x-0.5 inline-flex items-center gap-1 font-semibold text-xs">
                      Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
