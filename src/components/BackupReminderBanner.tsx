import { useEffect, useState } from 'react';
import {
  shouldShowBackupReminder,
  currentYearMonth,
  markBackupDone,
} from '../lib/backupReminder';
import { buildCastMonthlyReport, exportCastMonthlyReportToExcel } from '../lib/excelExport';
import type { Cast, SalesRecord } from '../types';

interface Props {
  records: SalesRecord[];
  casts: Cast[];
  nominationFee: number;
}

export default function BackupReminderBanner({ records, casts, nominationFee }: Props) {
  const [visible, setVisible] = useState(false);
  const [hiddenForNow, setHiddenForNow] = useState(false);

  useEffect(() => {
    setVisible(shouldShowBackupReminder());
    const timer = setInterval(() => setVisible(shouldShowBackupReminder()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!visible || hiddenForNow) return null;

  const yearMonth = currentYearMonth();

  function handleExport() {
    const rows = buildCastMonthlyReport(casts, records, yearMonth, nominationFee);
    exportCastMonthlyReportToExcel(rows, yearMonth);
    markBackupDone(yearMonth);
    setVisible(false);
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid var(--color-gold)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--color-text)' }}>
        📋 今月も終わりです。今月分のデータをエクセル出力してバックアップを取っておきましょう。
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-outline"
          style={{ padding: '8px 14px', fontSize: 13 }}
          onClick={() => setHiddenForNow(true)}
        >
          あとで
        </button>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={handleExport}
        >
          今すぐエクセル出力
        </button>
      </div>
    </div>
  );
}
