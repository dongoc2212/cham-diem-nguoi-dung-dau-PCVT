import * as XLSX from 'xlsx';
import { UnitSheet } from '../types';

export function exportSingleSheetToExcel(sheet: UnitSheet) {
  const wb = XLSX.utils.book_new();

  const sheetData: any[][] = [];

  // Row 1: Title
  sheetData.push([sheet.title || 'BẢNG TIÊU CHUẨN CHẤM ĐIỂM LÃNH ĐẠO PHÒNG/ĐỘI/ĐIỆN LỰC']);
  // Row 2: Unit
  sheetData.push([sheet.unitTitle || sheet.name]);
  // Row 3: Header columns
  sheetData.push([
    'STT',
    'Nội dung đánh giá',
    'Điểm chuẩn',
    'Điểm chấm',
    'Giải trình',
    'Đơn vị phúc tra',
    'Điểm phúc tra',
    'Người chỉnh sửa',
    'Thời gian sửa'
  ]);

  // Rows
  sheet.rows.forEach(r => {
    sheetData.push([
      r.stt,
      r.content,
      r.standardScore !== null ? r.standardScore : '',
      r.selfScore !== null ? r.selfScore : '',
      r.explanation || '',
      r.reviewer || '',
      r.auditScore !== null ? r.auditScore : '',
      r.lastEditedBy ? `${r.lastEditedBy.userName} (${r.lastEditedBy.userCode})` : '',
      r.lastEditedBy ? r.lastEditedBy.timestamp : ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // STT
    { wch: 60 }, // Nội dung
    { wch: 12 }, // Điểm chuẩn
    { wch: 12 }, // Điểm chấm
    { wch: 30 }, // Giải trình
    { wch: 20 }, // Đơn vị phúc tra
    { wch: 14 }, // Điểm phúc tra
    { wch: 25 }, // Người sửa
    { wch: 18 }  // Thời gian
  ];

  XLSX.utils.book_append_sheet(wb, ws, sheet.code.substring(0, 31));

  const fileName = `ChamDiem_${sheet.code.replace(/[^a-zA-Z0-9]/g, '_')}_PCVT.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportAllSheetsToExcel(sheets: UnitSheet[]) {
  const wb = XLSX.utils.book_new();

  // 1. Summary sheet
  const summaryData: any[][] = [
    ['BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ CHẤM ĐIỂM NGƯỜI ĐỨNG ĐẦU 13 ĐƠN VỊ TRỰC THUỘC PCVT'],
    ['Thời gian xuất:', new Date().toLocaleString('vi-VN')],
    [],
    [
      'STT',
      'Mã Sheet',
      'Tên Đơn vị',
      'Tổng Điểm Chuẩn',
      'Tổng Điểm Chấm',
      'Tổng Điểm Phúc Tra',
      'Tỷ lệ Đạt (%)',
      'Xếp Loại'
    ]
  ];

  sheets.forEach((s, idx) => {
    let standardTotal = 0;
    let selfTotal = 0;
    let auditTotal = 0;

    s.rows.forEach(r => {
      // Sum the detailed leaf items
      if (!r.isGroupHeader && !r.isTotal && r.standardScore !== null && !r.isSubHeader) {
        standardTotal += r.standardScore;
        if (r.selfScore !== null) selfTotal += r.selfScore;
        if (r.auditScore !== null) auditTotal += r.auditScore;
      }
    });

    // Default to 100 max if counted differently
    const maxScore = standardTotal > 0 ? standardTotal : 100;
    const finalScore = auditTotal > 0 ? auditTotal : selfTotal;
    const percentage = ((finalScore / maxScore) * 100).toFixed(1);

    let rank = 'Chưa hoàn thành';
    if (finalScore >= 90) rank = 'Hoàn thành xuất sắc';
    else if (finalScore >= 80) rank = 'Hoàn thành tốt';
    else if (finalScore >= 70) rank = 'Hoàn thành nhiệm vụ';
    else rank = 'Không hoàn thành';

    summaryData.push([
      idx + 1,
      s.code,
      s.unitTitle,
      maxScore,
      selfTotal,
      auditTotal > 0 ? auditTotal : 'Chưa phúc tra',
      `${percentage}%`,
      rank
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 32 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tong_Hop_13_DonVi');

  // 2. Append all 13 individual sheets
  sheets.forEach(sheet => {
    const sheetData: any[][] = [];
    sheetData.push([sheet.title || 'BẢNG TIÊU CHUẨN CHẤM ĐIỂM LÃNH ĐẠO PHÒNG/ĐỘI/ĐIỆN LỰC']);
    sheetData.push([sheet.unitTitle || sheet.name]);
    sheetData.push([
      'STT',
      'Nội dung đánh giá',
      'Điểm chuẩn',
      'Điểm chấm',
      'Giải trình',
      'Đơn vị phúc tra',
      'Điểm phúc tra',
      'Người sửa',
      'Thời gian'
    ]);

    sheet.rows.forEach(r => {
      sheetData.push([
        r.stt,
        r.content,
        r.standardScore !== null ? r.standardScore : '',
        r.selfScore !== null ? r.selfScore : '',
        r.explanation || '',
        r.reviewer || '',
        r.auditScore !== null ? r.auditScore : '',
        r.lastEditedBy ? `${r.lastEditedBy.userName} (${r.lastEditedBy.userCode})` : '',
        r.lastEditedBy ? r.lastEditedBy.timestamp : ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 55 },
      { wch: 12 },
      { wch: 12 },
      { wch: 28 },
      { wch: 18 },
      { wch: 14 },
      { wch: 22 },
      { wch: 16 }
    ];

    // Excel sheet name max 31 characters
    const cleanSheetName = sheet.code.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
  });

  const fileName = `ChamDiem_LanhDao_PCVT_DayDu13DonVi_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
