import { useEffect, useState } from 'react';
import { isLastDayOfMonthNow, isAfterReminderHour, currentYearMonth } from '../lib/backupReminder';
import { buildCastMonthlyReport, exportCastMonthlyReportToExcel } from '../lib/excelExport';
import { backupAllDataToDrive } from '../lib/appsScriptBackup';
import { updateSettings } from '../lib/data';
import type { Cast, GeneralSettings, SalesRecord, Store } from '../types';

interface Props {
  records: SalesRecord[];
  casts: Cast[];
  stores: Store[];
  settings: GeneralSettings;
}

export default function BackupReminderBanner({ records, casts, stores, settings }: Props) {
  const [tick, setTick] = useState(0);
  const [hiddenForNow, setHiddenForNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

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

  async function markDone() {
    try {
      await updateSettings({ lastBackupMonth: yearMonth });
    } catch {
      setError('送信は完了しましたが、完了の記録に失敗しました。次回もこのバナーが表示される場合があります。');
    }
  }

  function handleExport() {
    setError(null);
    const rows = buildCastMonthlyReport(casts, records, yearMonth, settings.nominationFee);
    exportCastMonthlyReportToExcel(rows, yearMonth);
    markDone();
  }

  async function handleBackupToDrive() {
    setError(null);
    setUploading(true);
    try {
      await backupAllDataToDrive(records, casts, stores, settings, yearMonth);
      setUploaded(true);
      await markDone();
    } catch {
      setError('Googleドライブへの送信でエラーが発生しました。通信状態を確認してもう一度お試しください。');
    } finally {
      setUploading(false);
    }
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
        📋 今月分のデータをバックアップ保存してください。「Googleドライブへ保存」なら1回のタップで外部保存まで完了します。エクセルをダウンロードして手動で保存していただいても構いません。
        {uploaded && (
          <div style={{ color: 'var(--color-gold-dark)', fontSize: 13, marginTop: 6 }}>
            Googleドライブへ送信しました（反映まで少し時間がかかる場合があります）。
          </div>
        )}
        {error && (
          <div style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 6 }}>{error}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline"
          style={{ padding: '8px 14px', fontSize: 13 }}
          onClick={() => setHiddenForNow(true)}
        >
          あとで
        </button>
        <button
          className="btn btn-outline"
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={handleExport}
        >
          エクセルをダウンロード
        </button>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={handleBackupToDrive}
          disabled={uploading}
        >
          {uploading ? '送信中…' : 'Googleドライブへ保存'}
        </button>
      </div>
    </div>
  );
}
