import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  LogIn, 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Users,
  ChevronRight
} from 'lucide-react';
import { STAFF_DIRECTORY, authenticateUser, normalizeEmployeeId } from '../data/users';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [soHieu, setSoHieu] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchDirectory, setSearchDirectory] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [showDirectory, setShowDirectory] = useState(false);

  // Live match detection while typing Số hiệu
  const detectedStaff = useMemo(() => {
    const clean = soHieu.trim();
    if (!clean) return null;
    const normalized = normalizeEmployeeId(clean);
    return STAFF_DIRECTORY.find(s => s.employeeId === clean || s.employeeId === normalized) || null;
  }, [soHieu]);

  // Departments for directory lookup
  const departments = useMemo(() => {
    const list = Array.from(new Set(STAFF_DIRECTORY.map(s => s.department || '').filter(Boolean)));
    return list.sort();
  }, []);

  // Filtered staff in directory lookup
  const filteredStaff = useMemo(() => {
    return STAFF_DIRECTORY.filter(s => {
      if (selectedDeptFilter !== 'all' && s.department !== selectedDeptFilter) {
        return false;
      }
      if (searchDirectory.trim()) {
        const q = searchDirectory.toLowerCase().trim();
        return (
          s.employeeId.includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.title || '').toLowerCase().includes(q) ||
          (s.department || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchDirectory, selectedDeptFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authenticateUser(soHieu, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Số hiệu hoặc mật khẩu không hợp lệ.');
    }
  };

  const handleSelectStaff = (staff: User) => {
    setSoHieu(staff.employeeId);
    setPassword(staff.employeeId);
    setErrorMessage('');
    setShowDirectory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center px-4 py-8 text-slate-800">
      
      {/* Background ambient decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-4xl space-y-6">
        
        {/* Top Header Card */}
        <div className="text-center text-white space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Công Ty Điện Lực Vũng Tàu · EVN</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hệ Thống Chấm Điểm Người Đứng Đầu Trực Thuộc
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Vui lòng đăng nhập với <strong>Số hiệu nhân sự</strong> trong danh sách Google Sheet PCVT để truy cập hệ thống và thực hiện chấm điểm 13 đơn vị.
          </p>
        </div>

        {/* Main Login Box */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  Đăng Nhập Bằng Số Hiệu
                </h2>
                <span className="text-[11px] text-slate-500">
                  Cán bộ nhân viên PCVT
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDirectory(!showDirectory)}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{showDirectory ? 'Thu gọn danh bạ' : 'Tra cứu Số hiệu'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username: Mã số nhân viên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đăng nhập (mã số nhân viên)
              </label>
              <input
                type="text"
                value={soHieu}
                onChange={e => {
                  setSoHieu(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Nhập mã số nhân viên (Ví dụ: 002113, 011903, 011915...)"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />

              {/* Instant matched personnel indicator */}
              {detectedStaff && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900 animate-in fade-in duration-150">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold">{detectedStaff.name}</span>
                    <span className="text-emerald-700 ml-1.5 font-normal">
                      ({detectedStaff.title} · {detectedStaff.department})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Password: Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Nhập mật khẩu"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Vào Hệ Thống</span>
            </button>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Hệ thống lưu vết người sửa & thời gian
              </span>
              <span>Dữ liệu 436 cán bộ PCVT</span>
            </div>
          </form>

        </div>

        {/* Extended Directory Lookup (Toggled by user) */}
        {showDirectory && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Tra Cứu Danh Bạ 436 Cán Bộ Nhân Viên PCVT</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Dữ liệu trích xuất trực tiếp từ file Google Sheet nhân sự PCVT
                </p>
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">Tất cả phòng ban / đơn vị</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDirectory}
                onChange={e => setSearchDirectory(e.target.value)}
                placeholder="Tìm kiếm theo Số hiệu, Họ và tên, Chức danh..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {filteredStaff.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Không tìm thấy nhân sự phù hợp với từ khóa tìm kiếm.
                </div>
              ) : (
                filteredStaff.map(staff => (
                  <div
                    key={staff.employeeId}
                    onClick={() => handleSelectStaff(staff)}
                    className="p-2.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 group-hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                        {staff.employeeId}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 mr-2">
                          {staff.name}
                        </span>
                        <span className="text-slate-500">
                          {staff.title} · {staff.department}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-blue-600 font-semibold group-hover:underline flex-shrink-0">
                      Chọn →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
