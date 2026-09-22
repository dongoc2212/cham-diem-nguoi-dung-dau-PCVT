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
  employeeId: string; // Số hiệu
  name: string;       // Họ và tên
  unit: string;       // Đơn vị
  department?: string;// Phòng ban
  team?: string;      // Tổ nhóm
  phone?: string;     // Số điện thoại
  email?: string;     // Email
  dob?: string;       // Ngày sinh
  role: 'leader' | 'reviewer' | 'admin' | 'staff' | 'manager';
  title?: string;     // Chức danh
}

export interface AuditFilter {
  sheetCode?: string;
  userCode?: string;
  field?: string;
  searchTerm?: string;
}
