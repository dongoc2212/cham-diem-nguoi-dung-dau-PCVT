import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { ScoringTable } from './components/ScoringTable';
import { LoginView } from './components/LoginView';
import { LoginModal } from './components/LoginModal';
import { AuditHistoryView } from './components/AuditHistoryView';
import { SummaryDashboard } from './components/SummaryDashboard';

function MainLayout() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Main Navigation Header */}
      <Header onOpenHistory={() => setActiveTab('audit')} />

      {/* 13 Sheets Tab Bar + Utility Tabs */}
      <TabNavigation />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'summary' ? (
          <SummaryDashboard />
        ) : activeTab === 'login' ? (
          <LoginView />
        ) : activeTab === 'audit' ? (
          <AuditHistoryView onJumpToSheet={sheetId => setActiveTab(sheetId)} />
        ) : (
          <ScoringTable />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Công ty Điện lực / Viễn thông PCVT - Hệ thống Chấm điểm Người đứng đầu trực thuộc
          </span>
          <span className="text-slate-400">
            Dữ liệu nguồn theo biểu mẫu Google Sheet PCVT (13 Sheet đơn vị) · Hỗ trợ xuất file Excel
          </span>
        </div>
      </footer>

      {/* Floating Login Modal (Triggered when editing without login) */}
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
