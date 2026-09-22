import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SHEETS } from '../data/initialData';
import { DEFAULT_USERS } from '../data/users';
import { UnitSheet, User, HistoryEntry } from '../types';

interface AppContextType {
  sheets: UnitSheet[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateCell: (
    sheetId: string,
    rowId: string,
    field: 'selfScore' | 'explanation' | 'auditScore' | 'standardScore',
    newValue: any
  ) => boolean;
  quickFillMaxScores: (sheetId: string) => void;
  clearSheetScores: (sheetId: string) => void;
  resetAllData: () => void;
  allHistory: HistoryEntry[];
  currentSheet: UnitSheet | undefined;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  triggerLoginModal: (callback?: () => void) => void;
}

const STORAGE_KEY_SHEETS = 'pcvt_sheets_storage_v2';
const STORAGE_KEY_USER = 'pcvt_user_storage_v2';
const STORAGE_KEY_HISTORY = 'pcvt_history_storage_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current user (requires login before entering app)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  // 2. Sheets state
  const [sheets, setSheets] = useState<UnitSheet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHEETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 13) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved sheets, using initial', e);
    }
    return INITIAL_SHEETS;
  });

  // 3. Global History
  const [allHistory, setAllHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // 4. Navigation Tab state ('tab_1' .. 'tab_13' | 'summary' | 'login' | 'audit')
  const [activeTab, setActiveTab] = useState<string>('tab_1');

  // 5. Login modal trigger
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SHEETS, JSON.stringify(sheets));
    } catch (e) {
      console.error('Failed to save sheets to localStorage', e);
    }
  }, [sheets]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(allHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [allHistory]);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const triggerLoginModal = (callback?: () => void) => {
    if (callback) setPendingCallback(() => callback);
    setIsLoginModalOpen(true);
  };

  // Update cell with user tracking and history
  const updateCell = (
    sheetId: string,
    rowId: string,
    field: 'selfScore' | 'explanation' | 'auditScore' | 'standardScore',
    newValue: any
  ): boolean => {
    if (!currentUser) {
      triggerLoginModal();
      return false;
    }

    const fieldLabels: Record<string, string> = {
      selfScore: 'Điểm chấm',
      explanation: 'Giải trình',
      auditScore: 'Điểm phúc tra',
      standardScore: 'Điểm chuẩn'
    };

    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    let historyItem: HistoryEntry | null = null;

    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== sheetId) return sheet;

        const updatedRows = sheet.rows.map(row => {
          if (row.id !== rowId) return row;

          const oldValue = (row as any)[field];
          if (oldValue === newValue) return row; // No change

          const newHistoryEntry: HistoryEntry = {
            id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            field,
            fieldLabel: fieldLabels[field] || field,
            oldValue,
            newValue,
            userCode: currentUser.employeeId,
            userName: currentUser.name,
            timestamp: formattedTime,
            sheetCode: sheet.code,
            rowStt: row.stt,
            rowContent: row.content
          };

          historyItem = newHistoryEntry;

          const rowHistory = row.history ? [newHistoryEntry, ...row.history] : [newHistoryEntry];

          return {
            ...row,
            [field]: newValue,
            history: rowHistory,
            lastEditedBy: {
              userCode: currentUser.employeeId,
              userName: currentUser.name,
              timestamp: formattedTime,
              field: fieldLabels[field] || field
            }
          };
        });

        return {
          ...sheet,
          rows: updatedRows
        };
      });
    });

    if (historyItem) {
      setAllHistory(prev => [historyItem!, ...prev.slice(0, 199)]);
    }

    return true;
  };

  // Quick fill maximum self-score according to standard score
  const quickFillMaxScores = (sheetId: string) => {
    if (!currentUser) {
      triggerLoginModal();
      return;
    }

    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== sheetId) return sheet;

        const updatedRows = sheet.rows.map(row => {
          if (row.isGroupHeader || row.isTotal || row.standardScore === null || row.isSubHeader) {
            return row;
          }

          const newHistoryEntry: HistoryEntry = {
            id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            field: 'selfScore',
            fieldLabel: 'Điểm chấm',
            oldValue: row.selfScore,
            newValue: row.standardScore,
            userCode: currentUser.employeeId,
            userName: currentUser.name,
            timestamp: formattedTime,
            sheetCode: sheet.code,
            rowStt: row.stt,
            rowContent: row.content
          };

          return {
            ...row,
            selfScore: row.standardScore,
            history: row.history ? [newHistoryEntry, ...row.history] : [newHistoryEntry],
            lastEditedBy: {
              userCode: currentUser.employeeId,
              userName: currentUser.name,
              timestamp: formattedTime,
              field: 'Điểm chấm (Tối đa)'
            }
          };
        });

        return {
          ...sheet,
          rows: updatedRows
        };
      });
    });
  };

  // Clear sheet scores
  const clearSheetScores = (sheetId: string) => {
    if (!currentUser) {
      triggerLoginModal();
      return;
    }

    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== sheetId) return sheet;

        const updatedRows = sheet.rows.map(row => {
          if (row.isGroupHeader || row.isTotal) return row;
          return {
            ...row,
            selfScore: null,
            auditScore: null,
            explanation: ''
          };
        });

        return {
          ...sheet,
          rows: updatedRows
        };
      });
    });
  };

  // Reset all to clean initial sheets
  const resetAllData = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu 13 đơn vị về trạng thái ban đầu?')) {
      setSheets(INITIAL_SHEETS);
      setAllHistory([]);
      localStorage.removeItem(STORAGE_KEY_SHEETS);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  };

  const currentSheet = sheets.find(s => s.id === activeTab);

  return (
    <AppContext.Provider
      value={{
        sheets,
        activeTab,
        setActiveTab,
        currentUser,
        login,
        logout,
        updateCell,
        quickFillMaxScores,
        clearSheetScores,
        resetAllData,
        allHistory,
        currentSheet,
        isLoginModalOpen,
        setIsLoginModalOpen,
        triggerLoginModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
