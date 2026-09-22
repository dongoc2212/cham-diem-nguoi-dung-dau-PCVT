import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { ScoringTable } from './components/ScoringTable';
import { LoginScreen } from './components/LoginScreen';
import { LoginModal } from './components/LoginModal';
import { AuditHistoryView } from './components/AuditHistoryView';
import { SummaryDashboard } from './components/SummaryDashboard';
import { AdminLockManager } from './components/AdminLockManager';

function MainLayout() {
  const { activeTab, setActiveTab, currentUser, login } = useApp();

  // Bắt buộc đăng nhập trước khi vào app theo yêu cầu
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Main Navigation Header */}
      <Header onOpenHistory={() => setActiveTab('audit')} />

      {/* 13 Sheets Tab Bar + Utility Tabs (Shows User Name on Tab) */}
      <TabNavigation />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'summary' ? (
          <SummaryDashboard />
        ) : activeTab === 'audit' ? (
          <AuditHistoryView onJumpToSheet={sheetId => setActiveTab(sheetId)} />
        ) : activeTab === 'admin' ? (
          <AdminLockManager />
        ) : (
          <ScoringTable />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Công ty Điện lực Vũng Tàu (PCVT EVN) - Hệ thống Chấm điểm Người đứng đầu trực thuộc
          </span>
          <span className="text-slate-400">
            Dữ liệu nguồn theo biểu mẫu Google Sheet PCVT (13 Sheet đơn vị) · 436 Nhân sự PCVT
          </span>
        </div>
      </footer>

      {/* Floating Login Modal (Triggered if session requires switch) */}
      <LoginModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
