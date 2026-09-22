import React, { useState } from 'react';
import { X, LogIn, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS, authenticateUser } from '../data/users';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useApp();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = authenticateUser(employeeId, password);
    if (res.success && res.user) {
      login(res.user);
    } else {
      setError(res.message || 'Mã NV hoặc Mật khẩu không đúng');
    }
  };

  const handleQuickLogin = (empId: string) => {
    const res = authenticateUser(empId, empId);
    if (res.success && res.user) {
      login(res.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Đăng Nhập Mã Số Nhân Viên
            </h3>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>Ghi nhận lịch sử:</strong> Khi bạn chỉnh sửa điểm số hoặc giải trình, hệ thống cần biết Mã NV của bạn để ghi nhận danh tính người sửa.
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Số Nhân Viên:
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={e => {
                  setEmployeeId(e.target.value);
                  setError('');
                }}
                placeholder="Nhập mã NV (ví dụ: NV01, NV02...)"
                required
                autoFocus
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật Khẩu (Mặc định = Mã NV):
                </label>
                {employeeId && (
                  <button
                    type="button"
                    onClick={() => setPassword(employeeId.trim())}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    Tự điền
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Mật khẩu là Mã NV của bạn"
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              Đăng Nhập
            </button>
          </form>

          {/* Quick Select of top leaders */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              Hoặc chọn nhanh tài khoản mẫu:
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
              {DEFAULT_USERS.slice(0, 8).map(u => (
                <button
                  key={u.employeeId}
                  type="button"
                  onClick={() => handleQuickLogin(u.employeeId)}
                  className="p-1.5 rounded-md border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-left text-[11px] truncate flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-slate-700">{u.employeeId}</span>
                  <span className="text-slate-500 truncate max-w-[80px]">{u.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
