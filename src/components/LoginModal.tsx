import React, { useState, useMemo } from 'react';
import { X, LogIn, Sparkles, Info, CheckCircle2, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STAFF_DIRECTORY, authenticateUser, normalizeEmployeeId } from '../data/users';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useApp();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const detectedStaff = useMemo(() => {
    const clean = employeeId.trim();
    if (!clean) return null;
    const normalized = normalizeEmployeeId(clean);
    return STAFF_DIRECTORY.find(s => s.employeeId === clean || s.employeeId === normalized) || null;
  }, [employeeId]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = authenticateUser(employeeId, password);
    if (res.success && res.user) {
      login(res.user);
    } else {
      setError(res.message || 'Số hiệu hoặc Mật khẩu không đúng');
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
              Đăng Nhập Tài Khoản
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
            <strong>Ghi nhận lịch sử:</strong> Đăng nhập với mã số nhân viên để ghi nhận danh tính người chấm và thời gian sửa.
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đăng nhập (mã số nhân viên)
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={e => {
                  setEmployeeId(e.target.value);
                  setError('');
                }}
                placeholder="Nhập mã số nhân viên (ví dụ: 002113, 011903...)"
                required
                autoFocus
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
              {detectedStaff && (
                <div className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{detectedStaff.name} ({detectedStaff.title})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Nhập mật khẩu"
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
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

        </div>
      </div>
    </div>
  );
};
