import React, { useState } from 'react';
import { 
  LogIn, 
  KeyRound, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS, authenticateUser } from '../data/users';

export const LoginView: React.FC = () => {
  const { currentUser, login, logout, setActiveTab, sheets } = useApp();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = authenticateUser(employeeId, password);
    if (res.success && res.user) {
      login(res.user);
      setSuccessMessage(`Đăng nhập thành công! Chào mừng ${res.user.name}.`);
    } else {
      setErrorMessage(res.message || 'Đăng nhập không thành công');
    }
  };

  const handleQuickLogin = (empId: string) => {
    setEmployeeId(empId);
    setPassword(empId);
    const res = authenticateUser(empId, empId);
    if (res.success && res.user) {
      login(res.user);
      setSuccessMessage(`Đã đăng nhập thành công với mã ${empId}`);
    }
  };

  // Find sheet corresponding to a user index
  const goToUserSheet = (index: number) => {
    if (sheets[index]) {
      setActiveTab(sheets[index].id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Current session status banner */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-lg border border-blue-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <UserCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Đang Đăng Nhập
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  Mã NV: {currentUser.employeeId}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">{currentUser.name}</h2>
              <p className="text-xs text-blue-200">{currentUser.title} · {currentUser.unit}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('tab_1')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white text-blue-950 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <span>Vào chấm điểm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Đăng Nhập Cán Bộ
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 mb-6">
            Đăng nhập để hệ thống tự động ghi nhận danh tính và thời gian mỗi khi bạn điều chỉnh điểm số hoặc giải trình.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã Số Nhân Viên:
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={e => {
                  setEmployeeId(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ví dụ: NV01, NV02, PCVT99..."
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật Khẩu:
                </label>
                {employeeId && (
                  <button
                    type="button"
                    onClick={() => setPassword(employeeId.trim())}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tự điền Pass = Mã NV</span>
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Mật khẩu là Mã số nhân viên"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Note badge */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 flex items-start gap-2 text-xs text-amber-800">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Quy định hệ thống:</strong> Mật khẩu chính là <strong>Mã số nhân viên</strong> của bạn (ví dụ: Mã NV là <code className="bg-amber-100 px-1 rounded font-mono">NV01</code> thì mật khẩu là <code className="bg-amber-100 px-1 rounded font-mono">NV01</code>).
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200 font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs border border-emerald-200 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Xác Nhận Đăng Nhập</span>
            </button>
          </form>
        </div>

        {/* Right: Quick Login Directory of 13 Unit Heads */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Danh Sách Người Đứng Đầu 13 Đơn Vị PCVT
              </h3>
              <p className="text-xs text-slate-500">
                Nhấn trực tiếp vào cán bộ bên dưới để đăng nhập nhanh 1 chạm:
              </p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              13 Lãnh Đạo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {DEFAULT_USERS.map((user, idx) => {
              const isCurrent = currentUser?.employeeId === user.employeeId;
              const isReviewer = user.role === 'reviewer';

              return (
                <div
                  key={user.employeeId}
                  onClick={() => handleQuickLogin(user.employeeId)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300'
                      : isReviewer
                      ? 'bg-purple-50/40 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                      : 'bg-slate-50/60 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 shadow-2xs">
                        {user.employeeId}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {user.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {user.unit}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isCurrent ? (
                      <span className="text-[11px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đang chọn
                      </span>
                    ) : (
                      <span className="text-[11px] text-blue-600 font-semibold hover:underline">
                        Đăng nhập →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
