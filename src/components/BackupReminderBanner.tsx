import { useEffect, useState } from 'react';
import { isLastDayOfMonthNow, isAfterReminderHour, currentYearMonth } from '../lib/backupReminder';
import { buildCastMonthlyReport, exportCastMonthlyReportToExcel } from '../lib/excelExport';
import { updateSettings } from '../lib/data';
import type { Cast, GeneralSettings, SalesRecord } from '../types';

interface Props {
  records: SalesRecord[];
  casts: Cast[];
  settings: GeneralSettings;
}

export default function BackupReminderBanner({ records, casts, settings }: Props) {
  const [tick, setTick] = useState(0);
  const [hiddenForNow, setHiddenForNow] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  const yearMonth = currentYearMonth();
  const alreadyDone = settings.lastBackupMonth === yearMonth;
  const visible =
    !hiddenForNow && !alreadyDone && isLastDayOfMonthNow() && isAfterReminderHour();

  // tick is referenced only to force a re-render every minute so the time-based
  // condition above is re-evaluated; it has no other purpose.
  void tick;

  if (!visible) return null;

  async function handleExport() {
    const rows = buildCastMonthlyReport(casts, records, yearMonth, settings.nominationFee);
    exportCastMonthlyReportToExcel(rows, yearMonth);
    await updateSettings({ lastBackupMonth: yearMonth });
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
