export interface HistoryEntry {
  id: string;
  field: 'selfScore' | 'explanation' | 'auditScore' | 'standardScore';
  fieldLabel: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  userCode: string;
  userName: string;
  timestamp: string; // ISO string or formatted date
  sheetCode: string;
  rowStt: string;
  rowContent: string;
}

export interface SheetRowItem {
  id: string;
  stt: string;
  content: string;
  standardScore: number | null;
  selfScore: number | null;
  explanation: string;
  reviewer: string;
  auditScore: number | null;
  isGroupHeader: boolean;
  isSubHeader: boolean;
  isTotal: boolean;
  history?: HistoryEntry[];
  lastEditedBy?: {
    userCode: string;
    userName: string;
    timestamp: string;
    field: string;
  };
}

export interface UnitSheet {
  id: string;
  code: string;
  name: string;
  unitTitle: string;
  title: string;
  rows: SheetRowItem[];
}

export interface User {
  employeeId: string;
  name: string;
  unit: string;
  role: 'leader' | 'reviewer' | 'admin' | 'staff';
  title?: string;
}

export interface AuditFilter {
  sheetCode?: string;
  userCode?: string;
  field?: string;
  searchTerm?: string;
}
