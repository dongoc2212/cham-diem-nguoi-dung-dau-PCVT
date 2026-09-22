import rawSheets from './sheetsData.json';
import { UnitSheet, SheetRowItem } from '../types';

export const INITIAL_SHEETS: UnitSheet[] = (rawSheets as any[]).map(s => {
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    unitTitle: s.unitTitle,
    title: s.title,
    rows: s.rows.map((r: any): SheetRowItem => {
      // Determine if it is a subheader like 1, 2, 3, 4, 5 in Section A
      const isSubHeader = (
        !r.isGroupHeader &&
        !r.isTotal &&
        ['1', '2', '3', '4', '5'].includes(r.stt) &&
        (
          r.content.includes('Về chính trị') ||
          r.content.includes('Về phẩm chất') ||
          r.content.includes('Năng lực lãnh đạo') ||
          r.content.includes('Về mức độ') ||
          r.content.includes('Về tự phê bình')
        )
      );

      return {
        id: r.id,
        stt: r.stt || '',
        content: r.content || '',
        standardScore: r.standardScore !== undefined ? r.standardScore : null,
        selfScore: r.selfScore !== undefined ? r.selfScore : null,
        explanation: r.explanation || '',
        reviewer: r.reviewer || '',
        auditScore: r.auditScore !== undefined ? r.auditScore : null,
        isGroupHeader: Boolean(r.isGroupHeader),
        isSubHeader,
        isTotal: Boolean(r.isTotal),
        history: r.history || []
      };
    })
  };
});
