import { LockSettings, LockStatusResult, User } from '../types';

export const ADMIN_EMPLOYEE_ID = '012499';

export const DEFAULT_LOCK_SETTINGS: LockSettings = {
  selfScoreLocked: false,
  selfScoreLockDate: '',
  selfScoreLockTime: '23:59',
  auditScoreLocked: false,
  auditScoreLockDate: '',
  auditScoreLockTime: '23:59'
};

/**
 * Check if the user has Admin privileges (Employee ID 012499)
 */
export function isAdminUser(user?: User | null): boolean {
  if (!user) return false;
  const clean = String(user.employeeId || '').trim();
  return clean === ADMIN_EMPLOYEE_ID || clean === '12499' || user.role === 'admin';
}

/**
 * Format YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Check lock status for Self-scoring (Chấm điểm của 13 đơn vị)
 */
export function checkSelfScoreLock(
  settings: LockSettings, 
  user?: User | null
): LockStatusResult {
  let isDateLocked = false;
  const isManualLocked = Boolean(settings.selfScoreLocked);

  if (settings.selfScoreLockDate) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (todayStr > settings.selfScoreLockDate) {
      isDateLocked = true;
    } else if (todayStr === settings.selfScoreLockDate) {
      const lockTime = settings.selfScoreLockTime || '23:59';
      if (nowTimeStr >= lockTime) {
        isDateLocked = true;
      }
    }
  }

  const isLocked = isManualLocked || isDateLocked;
  let reason = '';

  if (isManualLocked && isDateLocked) {
    reason = `Chức năng chấm điểm đã bị Quản trị viên khóa trực tiếp và đã hết hạn ngày ${formatDateVN(settings.selfScoreLockDate)}${settings.selfScoreLockTime ? ' lúc ' + settings.selfScoreLockTime : ''}.`;
  } else if (isManualLocked) {
    reason = 'Chức năng chấm điểm đang bị Quản trị viên khóa trực tiếp.';
  } else if (isDateLocked) {
    reason = `Đã hết thời hạn chấm điểm (Hạn chót: ${formatDateVN(settings.selfScoreLockDate)}${settings.selfScoreLockTime ? ' ' + settings.selfScoreLockTime : ''}). Hệ thống tự động khóa.`;
  }

  return {
    isLocked,
    reason,
    isDateLocked,
    isManualLocked,
    lockDate: settings.selfScoreLockDate,
    lockTime: settings.selfScoreLockTime
  };
}

/**
 * Check lock status for Audit-scoring (Phúc tra của Hội đồng)
 */
export function checkAuditScoreLock(
  settings: LockSettings, 
  user?: User | null
): LockStatusResult {
  let isDateLocked = false;
  const isManualLocked = Boolean(settings.auditScoreLocked);

  if (settings.auditScoreLockDate) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (todayStr > settings.auditScoreLockDate) {
      isDateLocked = true;
    } else if (todayStr === settings.auditScoreLockDate) {
      const lockTime = settings.auditScoreLockTime || '23:59';
      if (nowTimeStr >= lockTime) {
        isDateLocked = true;
      }
    }
  }

  const isLocked = isManualLocked || isDateLocked;
  let reason = '';

  if (isManualLocked && isDateLocked) {
    reason = `Chức năng phúc tra đã bị Quản trị viên khóa trực tiếp và đã hết hạn ngày ${formatDateVN(settings.auditScoreLockDate)}${settings.auditScoreLockTime ? ' lúc ' + settings.auditScoreLockTime : ''}.`;
  } else if (isManualLocked) {
    reason = 'Chức năng phúc tra đang bị Quản trị viên khóa trực tiếp.';
  } else if (isDateLocked) {
    reason = `Đã hết thời hạn phúc tra (Hạn chót: ${formatDateVN(settings.auditScoreLockDate)}${settings.auditScoreLockTime ? ' ' + settings.auditScoreLockTime : ''}). Hệ thống tự động khóa.`;
  }

  return {
    isLocked,
    reason,
    isDateLocked,
    isManualLocked,
    lockDate: settings.auditScoreLockDate,
    lockTime: settings.auditScoreLockTime
  };
}
