import { User } from '../types';
import staffData from './staffDirectory.json';

export const ADMIN_EMPLOYEE_ID = '012499';

export function isAdminUser(user?: User | null): boolean {
  if (!user) return false;
  const clean = String(user.employeeId || '').trim();
  return clean === ADMIN_EMPLOYEE_ID || clean === '12499' || user.role === 'admin';
}

// All 436 personnel from Google Sheet: https://docs.google.com/spreadsheets/d/1aj3zL1ATxT0nVUOCtKZEWLRUXOli0z0t (gid=681599665)
export const STAFF_DIRECTORY: User[] = (staffData as any[]).map(item => {
  const empId = String(item.employeeId).trim();
  let role: User['role'] = 'staff';
  const titleLower = (item.title || '').toLowerCase();
  const deptLower = (item.department || '').toLowerCase();

  // Admin đặc quyền: Mã nhân viên 012499 (Đỗ Thị Bích Ngọc - Phòng Tổ chức và Nhân sự)
  if (empId === '012499' || empId === '12499') {
    role = 'admin';
  } else if (titleLower.includes('giám đốc') || titleLower.includes('chánh') || titleLower.includes('trưởng')) {
    role = 'leader';
  } else if (deptLower.includes('ban giám đốc')) {
    role = 'reviewer';
  }

  return {
    employeeId: empId,
    name: item.name.trim(),
    title: (empId === '012499' || empId === '12499') ? 'Quản Trị Viên Hệ Thống (Tổ Chức Nhân Sự)' : (item.title?.trim() || 'Cán bộ'),
    department: item.department?.trim() || 'Công ty Điện lực Vũng Tàu',
    unit: item.department?.trim() || 'Công ty Điện lực Vũng Tàu',
    team: item.team?.trim() || '',
    phone: item.phone?.trim() || '',
    email: item.email?.trim() || '',
    dob: item.dob?.trim() || '',
    role
  };
});


// Alias for backward compatibility
export const DEFAULT_USERS = STAFF_DIRECTORY;

// Primary Leaders / Unit Heads for quick reference
export const UNIT_HEADS: User[] = [
  // Ban Giám đốc
  ...STAFF_DIRECTORY.filter(s => s.department === 'Ban Giám đốc'),
  // Department heads
  ...STAFF_DIRECTORY.filter(s => 
    s.department !== 'Ban Giám đốc' && 
    (s.title?.toLowerCase().includes('trưởng') || s.title?.toLowerCase().includes('chánh') || s.title?.toLowerCase().includes('giám đốc'))
  ).slice(0, 15)
];

// Helper to normalize employee number (e.g. "2113" -> "002113")
export function normalizeEmployeeId(id: string): string {
  const clean = id.trim();
  if (/^\d{1,5}$/.test(clean)) {
    return clean.padStart(6, '0');
  }
  return clean;
}

// Authenticate with "Số hiệu" as username and password
export function authenticateUser(
  soHieuInput: string, 
  passwordInput: string
): { success: boolean; user?: User; message?: string } {
  const cleanSoHieu = soHieuInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanSoHieu) {
    return { success: false, message: 'Vui lòng nhập Số hiệu nhân sự' };
  }

  if (!cleanPass) {
    return { success: false, message: 'Vui lòng nhập Mật khẩu (Mật khẩu chính là Số hiệu của bạn)' };
  }

  const normalizedSoHieu = normalizeEmployeeId(cleanSoHieu);
  const normalizedPass = normalizeEmployeeId(cleanPass);

  // Quy định: Mật khẩu theo số hiệu trong danh sách Google Sheet
  const passMatches = 
    cleanPass.toLowerCase() === cleanSoHieu.toLowerCase() ||
    normalizedPass.toLowerCase() === normalizedSoHieu.toLowerCase();

  if (!passMatches) {
    return { 
      success: false, 
      message: `Mật khẩu không đúng! Mật khẩu là Số hiệu của bạn (ví dụ: Số hiệu là ${cleanSoHieu} thì Mật khẩu là ${cleanSoHieu}).` 
    };
  }

  // Look up in 436 personnel from Google Sheet
  const matched = STAFF_DIRECTORY.find(
    s => s.employeeId === cleanSoHieu || s.employeeId === normalizedSoHieu
  );

  if (matched) {
    return { 
      success: true, 
      user: matched 
    };
  }

  // Fallback for special IDs or custom codes
  return {
    success: true,
    user: {
      employeeId: cleanSoHieu,
      name: `Cán bộ ${cleanSoHieu}`,
      title: 'Cán bộ nhân viên',
      unit: 'Công ty Điện lực Vũng Tàu',
      department: 'Điện lực Vũng Tàu',
      role: 'staff'
    }
  };
}
