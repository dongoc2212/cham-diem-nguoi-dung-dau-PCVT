import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Award, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportAllSheetsToExcel } from '../utils/excelExport';
import { getClassification, CLASSIFICATION_TIERS } from '../utils/classification';

export const SummaryDashboard: React.FC = () => {
  const { sheets, setActiveTab } = useApp();
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('all');

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

      const tier = getClassification(finalScore);

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
        rank: tier.rank,
        rankKey: tier.key,
        rankFull: tier.fullTitle,
        rankCondition: tier.condition,
        rankColor: tier.badgeClass,
        scoredItems,
        totalItems,
        progressPercent: totalItems > 0 ? Math.round((scoredItems / totalItems) * 100) : 0
      };
    });
  }, [sheets]);

  // Overall aggregate by official tiers
  const overallStats = useMemo(() => {
    const totalUnits = summaryList.length;
    const completedUnits = summaryList.filter(s => s.progressPercent === 100).length;
    const avgScore = (summaryList.reduce((acc, s) => acc + s.finalScore, 0) / (totalUnits || 1)).toFixed(1);

    const xuatSacCount = summaryList.filter(s => s.rankKey === 'xuat_sac').length;
    const totCount = summaryList.filter(s => s.rankKey === 'tot').length;
    const hoanThanhCount = summaryList.filter(s => s.rankKey === 'hoan_thanh').length;
    const khongHoanThanhCount = summaryList.filter(s => s.rankKey === 'khong_hoan_thanh').length;

    return { 
      totalUnits, 
      completedUnits, 
      avgScore, 
      xuatSacCount,
      totCount,
      hoanThanhCount,
      khongHoanThanhCount
    };
  }, [summaryList]);

  const filteredList = useMemo(() => {
    if (selectedRankFilter === 'all') return summaryList;
    return summaryList.filter(s => s.rankKey === selectedRankFilter);
  }, [summaryList, selectedRankFilter]);

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

      {/* Official Classification Criteria Box as per uploaded document */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Chỉ Tiêu Xếp Loại Đánh Giá (Theo Quy Định PCVT)
            </h3>
          </div>
          <span className="text-xs text-slate-500 italic">
            Áp dụng cho điểm chấm và điểm phúc tra của 13 đơn vị trực thuộc
          </span>
        </div>

        {/* 4 Tiers Grid matching the uploaded image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CLASSIFICATION_TIERS.map(tier => {
            const count = summaryList.filter(s => s.rankKey === tier.key).length;
            const isSelected = selectedRankFilter === tier.key;

            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedRankFilter(isSelected ? 'all' : tier.key)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-white shadow-md border-blue-400' 
                    : `${tier.bgLight} ${tier.borderClass} hover:shadow-xs hover:border-slate-400`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${tier.badgeClass}`}>
                    {tier.rank}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800">
                    {count} <span className="text-xs font-normal text-slate-500">đơn vị</span>
                  </span>
                </div>
                <div className="mt-2 text-xs font-medium text-slate-700 leading-snug">
                  - {tier.condition}, {tier.fullTitle.toLowerCase()}.
                </div>
              </button>
            );
          })}
        </div>

        {selectedRankFilter !== 'all' && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-blue-700 font-medium">
              Đang lọc danh sách theo xếp loại: <strong>{CLASSIFICATION_TIERS.find(t => t.key === selectedRankFilter)?.rank}</strong>
            </span>
            <button
              onClick={() => setSelectedRankFilter('all')}
              className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Hiện tất cả 13 đơn vị
            </button>
          </div>
        )}
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
          <span className="text-xs text-slate-500 font-medium block">Hoàn thành xuất sắc (≥ 90đ)</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {overallStats.xuatSacCount} <span className="text-xs text-slate-500 font-normal">đơn vị</span>
          </div>
        </div>
      </div>

      {/* Overview Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Chi Tiết Điểm Số & Xếp Loại 13 Đơn Vị Trực Thuộc
            </h3>
            <span className="text-xs text-slate-500">
              {filteredList.length === 13 
                ? 'Hiển thị toàn bộ 13 đơn vị (bấm vào dòng để mở sheet chấm điểm chi tiết)' 
                : `Đang lọc: ${filteredList.length} đơn vị`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedRankFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                selectedRankFilter === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả (13)
            </button>
            {CLASSIFICATION_TIERS.map(t => (
              <button
                key={t.key}
                onClick={() => setSelectedRankFilter(t.key)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedRankFilter === t.key 
                    ? `${t.badgeClass} ring-1 ring-slate-400 font-bold` 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.rank}
              </button>
            ))}
          </div>
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
                <th className="py-3 px-4 w-44 text-center">Xếp loại theo quy định</th>
                <th className="py-3 px-3 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.map((item) => (
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
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.rankColor}`}>
                        {item.rank}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.rankCondition}
                      </span>
                    </div>
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
