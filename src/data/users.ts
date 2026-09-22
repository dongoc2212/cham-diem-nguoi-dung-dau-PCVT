import { User } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    employeeId: 'NV01',
    name: 'Nguyễn Văn An',
    unit: 'Văn phòng',
    role: 'leader',
    title: 'Chánh Văn phòng'
  },
  {
    employeeId: 'NV02',
    name: 'Trần Thị Bình',
    unit: 'Phòng Tổ chức Nhân sự',
    role: 'leader',
    title: 'Trưởng phòng TCNS'
  },
  {
    employeeId: 'NV03',
    name: 'Lê Hoàng Cường',
    unit: 'Phòng Kế hoạch Vật tư',
    role: 'leader',
    title: 'Trưởng phòng KHVT'
  },
  {
    employeeId: 'NV04',
    name: 'Phạm Văn Dũng',
    unit: 'Phòng Quản lý Đầu tư',
    role: 'leader',
    title: 'Trưởng phòng QLĐT'
  },
  {
    employeeId: 'NV05',
    name: 'Hoàng Minh Đức',
    unit: 'Phòng Kỹ thuật An toàn',
    role: 'leader',
    title: 'Trưởng phòng KTAT'
  },
  {
    employeeId: 'NV06',
    name: 'Vũ Thị Giang',
    unit: 'Phòng Kinh doanh',
    role: 'leader',
    title: 'Trưởng phòng Kinh doanh'
  },
  {
    employeeId: 'NV07',
    name: 'Đỗ Quốc Hưng',
    unit: 'Phòng Tài chính Kế toán',
    role: 'leader',
    title: 'Trưởng phòng TCKT'
  },
  {
    employeeId: 'NV08',
    name: 'Ngô Văn Khải',
    unit: 'Đội Vận hành Lưới điện',
    role: 'leader',
    title: 'Đội trưởng Đội VHLĐ'
  },
  {
    employeeId: 'NV09',
    name: 'Bùi Đình Long',
    unit: 'Đội Quản lý Lưới điện',
    role: 'leader',
    title: 'Đội trưởng Đội QLLĐ'
  },
  {
    employeeId: 'NV10',
    name: 'Trịnh Thu Mai',
    unit: 'Đội Dịch vụ Khách hàng',
    role: 'leader',
    title: 'Đội trưởng Đội DVKH'
  },
  {
    employeeId: 'NV11',
    name: 'Vũ Đình Nam',
    unit: 'Đội Quản lý Thu ghi',
    role: 'leader',
    title: 'Đội trưởng Đội QLTG'
  },
  {
    employeeId: 'NV12',
    name: 'Nguyễn Hữu Phúc',
    unit: 'Đội Quản lý Hệ thống Đo đếm',
    role: 'leader',
    title: 'Đội trưởng Đội QLHTĐĐ'
  },
  {
    employeeId: 'NV13',
    name: 'Đặng Văn Quang',
    unit: 'Điện lực ĐK Côn Đảo',
    role: 'leader',
    title: 'Giám đốc Điện lực Côn Đảo'
  },
  {
    employeeId: 'PT01',
    name: 'Hội Đồng Phúc Tra PCVT',
    unit: 'Ban Giám đốc & Hội đồng Đánh giá',
    role: 'reviewer',
    title: 'Chủ tịch Hội đồng Phúc tra'
  },
  {
    employeeId: 'ADMIN',
    name: 'Quản trị viên Hệ thống PCVT',
    unit: 'Ban Công nghệ Thông tin',
    role: 'admin',
    title: 'Quản trị viên'
  }
];

export function authenticateUser(employeeId: string, pass: string): { success: boolean; user?: User; message?: string } {
  const cleanId = employeeId.trim();
  const cleanPass = pass.trim();

  if (!cleanId) {
    return { success: false, message: 'Vui lòng nhập mã số nhân viên' };
  }

  // Yêu cầu đề bài: "pass là mã số nhân viên"
  if (cleanPass.toUpperCase() !== cleanId.toUpperCase()) {
    return { success: false, message: 'Mật khẩu không chính xác! Mật khẩu mặc định là Mã số nhân viên.' };
  }

  // Find in default users
  const matched = DEFAULT_USERS.find(u => u.employeeId.toUpperCase() === cleanId.toUpperCase());
  if (matched) {
    return { success: true, user: matched };
  }

  // If custom employee ID entered with matching pass, create user profile smoothly
  const newUser: User = {
    employeeId: cleanId.toUpperCase(),
    name: `Cán bộ NV ${cleanId.toUpperCase()}`,
    unit: 'Công ty Điện lực PCVT',
    role: 'staff',
    title: 'Cán bộ nhân viên'
  };

  return { success: true, user: newUser };
}
