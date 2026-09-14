import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import SalesRecordForm, { type SalesRecordFormValue } from '../components/SalesRecordForm';
import Toggle from '../components/Toggle';
import FloatingTopButton from '../components/FloatingTopButton';
import BackupReminderBanner from '../components/BackupReminderBanner';
import ChangeOwnerPasswordForm from '../components/ChangeOwnerPasswordForm';
import {
  subscribeAllSalesRecords,
  subscribeCasts,
  subscribeStores,
  subscribeSettings,
  addSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  addCast,
  updateCast,
  deleteCast,
  addStore,
  updateStore,
  deleteStore,
  updateSettings,
  todayString,
} from '../lib/data';
import {
  buildCastMonthlyReport,
  exportCastMonthlyReportToExcel,
  exportSalesRecordsToExcel,
} from '../lib/excelExport';
import type { Cast, GeneralSettings, SalesRecord, Store } from '../types';

type Tab = 'records' | 'report' | 'casts' | 'stores' | 'settings';

export default function OwnerPage() {
  const [tab, setTab] = useState<Tab>('report');
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>({ nominationFee: 500 });
  const [recordsFilterCast, setRecordsFilterCast] = useState('');
  const [recordsFilterMonth, setRecordsFilterMonth] = useState('');

  useEffect(() => subscribeAllSalesRecords(setRecords), []);
  useEffect(() => subscribeCasts(setCasts), []);
  useEffect(() => subscribeStores(setStores), []);
  useEffect(() => subscribeSettings(setSettings), []);

  const castNameById = useMemo(
    () => Object.fromEntries(casts.map((c) => [c.id, c.name])),
    [casts]
  );
  const storeNameById = useMemo(
    () => Object.fromEntries(stores.map((s) => [s.id, s.name])),
    [stores]
  );

  return (
    <div>
      <Header title="オーナー画面" />
      <div className="page-container">
        <BackupReminderBanner records={records} casts={casts} settings={settings} />
        <div className="nav-tabs">
          <button className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>
            歩合給・指名料レポート
          </button>
          <button className={tab === 'records' ? 'active' : ''} onClick={() => setTab('records')}>
            売上記録一覧
          </button>
          <button className={tab === 'casts' ? 'active' : ''} onClick={() => setTab('casts')}>
            スタッフ管理
          </button>
          <button className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}>
            店舗管理
          </button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
            設定
          </button>
        </div>

        {tab === 'report' && (
          <ReportTab
            records={records}
            casts={casts}
            nominationFee={settings.nominationFee}
            castNameById={castNameById}
            storeNameById={storeNameById}
            onViewDetail={(castId, yearMonth) => {
              setRecordsFilterCast(castId);
              setRecordsFilterMonth(yearMonth);
              setTab('records');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {tab === 'records' && (
          <RecordsTab
            records={records}
            casts={casts}
            stores={stores}
            castNameById={castNameById}
            storeNameById={storeNameById}
            filterCast={recordsFilterCast}
            setFilterCast={setRecordsFilterCast}
            filterMonth={recordsFilterMonth}
            setFilterMonth={setRecordsFilterMonth}
          />
        )}
        {tab === 'casts' && <CastsTab casts={casts} />}
        {tab === 'stores' && <StoresTab stores={stores} />}
        {tab === 'settings' && <SettingsTab settings={settings} />}
      </div>
      <FloatingTopButton
        side="left"
        label="TOPに戻る"
        onClick={() => {
          setTab('report');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

function currentYearMonth() {
  return todayString().slice(0, 7);
}

function ReportTab({
  records,
  casts,
  nominationFee,
  castNameById,
  storeNameById,
  onViewDetail,
}: {
  records: SalesRecord[];
  casts: Cast[];
  nominationFee: number;
  castNameById: Record<string, string>;
  storeNameById: Record<string, string>;
  onViewDetail: (castId: string, yearMonth: string) => void;
}) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const rows = useMemo(
    () => buildCastMonthlyReport(casts, records, yearMonth, nominationFee),
    [casts, records, yearMonth, nominationFee]
  );
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          totalSales: acc.totalSales + r.totalSales,
          commissionAmount: acc.commissionAmount + r.commissionAmount,
          nominationCount: acc.nominationCount + r.nominationCount,
          nominationAmount: acc.nominationAmount + r.nominationAmount,
        }),
        { totalSales: 0, commissionAmount: 0, nominationCount: 0, nominationAmount: 0 }
      ),
    [rows]
  );
  const paymentTotals = useMemo(() => {
    const monthRecords = records.filter((r) => r.date.startsWith(yearMonth));
    const acc = { cash: 0, card: 0, emoney: 0 };
    for (const r of monthRecords) acc[r.paymentMethod] += r.paymentAmount;
    return acc;
  }, [records, yearMonth]);

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <label className="field-label" style={{ margin: 0 }}>
          対象月
        </label>
        <input
          type="month"
          className="field-input"
          style={{ width: 180 }}
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => exportCastMonthlyReportToExcel(rows, yearMonth)}
        >
          歩合給・指名料をエクセル出力
        </button>
        <button
          className="btn btn-outline"
          onClick={() => exportSalesRecordsToExcel(records, castNameById, storeNameById, yearMonth)}
        >
          売上明細をエクセル出力
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 20,
          padding: '16px 18px',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>全体売上合計</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gold-dark)' }}>
            ¥{totals.totalSales.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>全体歩合給合計</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gold-dark)' }}>
            ¥{totals.commissionAmount.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>全体指名件数</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gold-dark)' }}>
            {totals.nominationCount}件
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>全体指名料合計</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gold-dark)' }}>
            ¥{totals.nominationAmount.toLocaleString()}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 20,
          padding: '16px 18px',
          background: '#fff',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>現金 合計</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
            ¥{paymentTotals.cash.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>カード 合計</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
            ¥{paymentTotals.card.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>電子マネー 合計</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
            ¥{paymentTotals.emoney.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sticky-col">スタッフ</th>
              <th>売上合計</th>
              <th>歩合率</th>
              <th>歩合給</th>
              <th>指名件数</th>
              <th>指名料合計</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.castId}>
                <td className="sticky-col">{r.castName}</td>
                <td>¥{r.totalSales.toLocaleString()}</td>
                <td>{Math.round(r.commissionRate * 100)}%</td>
                <td>¥{r.commissionAmount.toLocaleString()}</td>
                <td>{r.nominationCount}件</td>
                <td>¥{r.nominationAmount.toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: 13 }}
                    onClick={() => onViewDetail(r.castId, yearMonth)}
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordsTab({
  records,
  casts,
  stores,
  castNameById,
  storeNameById,
  filterCast,
  setFilterCast,
  filterMonth,
  setFilterMonth,
}: {
  records: SalesRecord[];
  casts: Cast[];
  stores: Store[];
  castNameById: Record<string, string>;
  storeNameById: Record<string, string>;
  filterCast: string;
  setFilterCast: (v: string) => void;
  filterMonth: string;
  setFilterMonth: (v: string) => void;
}) {
  const [editing, setEditing] = useState<SalesRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCastId, setNewCastId] = useState(casts[0]?.id ?? '');

  useEffect(() => {
    if (!newCastId && casts.length > 0) setNewCastId(casts[0].id);
  }, [casts, newCastId]);
  const [newDate, setNewDate] = useState(todayString());

  const filtered = records.filter(
    (r) =>
      (!filterCast || r.castId === filterCast) && (!filterMonth || r.date.startsWith(filterMonth))
  );

  if (editing) {
    return (
      <div style={{ maxWidth: 520 }}>
        <SalesRecordForm
          stores={stores}
          initial={editing}
          onCancel={() => setEditing(null)}
          onDelete={async () => {
            await deleteSalesRecord(editing.id);
            setEditing(null);
          }}
          onSubmit={async (value: SalesRecordFormValue) => {
            await updateSalesRecord(editing.id, {
              date: editing.date,
              castId: editing.castId,
              ...value,
            });
            setEditing(null);
          }}
        />
        <FloatingTopButton onClick={() => setEditing(null)} label="一覧に戻る" />
      </div>
    );
  }

  if (creating) {
    return (
      <div style={{ maxWidth: 520 }}>
        <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <label className="field-label">スタッフ</label>
            <select className="field-input" value={newCastId} onChange={(e) => setNewCastId(e.target.value)}>
              {casts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">日付</label>
            <input
              className="field-input"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
        </div>
        <SalesRecordForm
          stores={stores}
          onCancel={() => setCreating(false)}
          onSubmit={async (value: SalesRecordFormValue) => {
            if (!newCastId) return;
            await addSalesRecord({
              date: newDate,
              castId: newCastId,
              createdBy: 'owner',
              ...value,
            });
            setCreating(false);
          }}
        />
        <FloatingTopButton onClick={() => setCreating(false)} label="一覧に戻る" />
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          ＋ 記録を追加
        </button>
      </div>
      <div style={{ marginBottom: 14, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label className="field-label" style={{ margin: 0, display: 'inline-block', marginRight: 8 }}>
            スタッフで絞り込み
          </label>
          <select
            className="field-input"
            style={{ width: 200, display: 'inline-block' }}
            value={filterCast}
            onChange={(e) => setFilterCast(e.target.value)}
          >
            <option value="">すべて</option>
            {casts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" style={{ margin: 0, display: 'inline-block', marginRight: 8 }}>
            月で絞り込み
          </label>
          <input
            type="month"
            className="field-input"
            style={{ width: 160, display: 'inline-block' }}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          {filterMonth && (
            <button
              className="btn btn-outline"
              style={{ marginLeft: 8, padding: '8px 12px' }}
              onClick={() => setFilterMonth('')}
            >
              月指定を解除
            </button>
          )}
        </div>
        {(filterCast || filterMonth) && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            該当 {filtered.length}件・合計 ¥
            {filtered.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
          </div>
        )}
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sticky-col">スタッフ</th>
              <th>日付</th>
              <th>店舗</th>
              <th>合計金額</th>
              <th>指名</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="sticky-col">{castNameById[r.castId]}</td>
                <td>{r.date}</td>
                <td>{storeNameById[r.storeId]}</td>
                <td>¥{r.totalAmount.toLocaleString()}</td>
                <td>{r.nominated ? '有' : '無'}</td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setEditing(r)}>
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CastsTab({ casts }: { casts: Cast[] }) {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('10');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card">
        <h3 style={{ marginBottom: 14 }}>新しいスタッフを追加</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="field-input"
            style={{ maxWidth: 200 }}
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="field-input"
            style={{ maxWidth: 120 }}
            type="number"
            placeholder="歩合率(%)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!name.trim()) return;
              await addCast(name.trim(), Number(rate) / 100, nextOrder(casts));
              setName('');
              setRate('10');
            }}
          >
            追加
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {casts.map((c, i) => (
          <CastRow
            key={c.id}
            cast={c}
            onMoveUp={i > 0 ? () => swapCastOrder(casts[i], casts[i - 1]) : undefined}
            onMoveDown={i < casts.length - 1 ? () => swapCastOrder(casts[i], casts[i + 1]) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function nextOrder(items: { order: number }[]): number {
  return items.length === 0 ? 0 : Math.max(...items.map((i) => i.order)) + 1;
}

async function swapCastOrder(a: Cast, b: Cast) {
  await Promise.all([updateCast(a.id, { order: b.order }), updateCast(b.id, { order: a.order })]);
}

function CastRow({
  cast,
  onMoveUp,
  onMoveDown,
}: {
  cast: Cast;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [name, setName] = useState(cast.name);
  const [rate, setRate] = useState(String(Math.round(cast.commissionRate * 100)));

  useEffect(() => setName(cast.name), [cast.name]);
  useEffect(() => setRate(String(Math.round(cast.commissionRate * 100))), [cast.commissionRate]);

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '4px 10px', fontSize: 12, opacity: onMoveUp ? 1 : 0.3 }}
          disabled={!onMoveUp}
          onClick={onMoveUp}
        >
          ↑
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '4px 10px', fontSize: 12, opacity: onMoveDown ? 1 : 0.3 }}
          disabled={!onMoveDown}
          onClick={onMoveDown}
        >
          ↓
        </button>
      </div>
      <input
        className="field-input"
        style={{ maxWidth: 200 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== cast.name) updateCast(cast.id, { name: name.trim() });
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          className="field-input"
          style={{ width: 90 }}
          type="number"
          min="0"
          max="100"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          onBlur={() => {
            const n = Number(rate);
            if (!Number.isNaN(n) && n !== Math.round(cast.commissionRate * 100)) {
              updateCast(cast.id, { commissionRate: n / 100 });
            }
          }}
        />
        <span>%</span>
      </div>
      <Toggle checked={cast.active} onChange={(v) => updateCast(cast.id, { active: v })} label="有効" />
      <button
        className="btn btn-danger"
        style={{ marginLeft: 'auto' }}
        onClick={() => {
          if (window.confirm(`「${cast.name}」を本当に削除しますか？この操作は取り消せません。`)) {
            deleteCast(cast.id);
          }
        }}
      >
        削除
      </button>
    </div>
  );
}

function StoresTab({ stores }: { stores: Store[] }) {
  const [name, setName] = useState('');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card">
        <h3 style={{ marginBottom: 14 }}>新しい店舗を追加</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="field-input"
            style={{ maxWidth: 220 }}
            placeholder="店舗名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!name.trim()) return;
              await addStore(name.trim(), nextOrder(stores));
              setName('');
            }}
          >
            追加
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {stores.map((s) => (
          <StoreRow key={s.id} store={s} />
        ))}
      </div>
    </div>
  );
}

function StoreRow({ store }: { store: Store }) {
  const [name, setName] = useState(store.name);

  useEffect(() => setName(store.name), [store.name]);

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <input
        className="field-input"
        style={{ maxWidth: 220 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== store.name) updateStore(store.id, { name: name.trim() });
        }}
      />
      <button
        className="btn btn-danger"
        style={{ marginLeft: 'auto' }}
        onClick={() => {
          if (window.confirm(`「${store.name}」を本当に削除しますか？この操作は取り消せません。`)) {
            deleteStore(store.id);
          }
        }}
      >
        削除
      </button>
    </div>
  );
}

function SettingsTab({ settings }: { settings: GeneralSettings }) {
  const [fee, setFee] = useState(String(settings.nominationFee));

  useEffect(() => setFee(String(settings.nominationFee)), [settings.nominationFee]);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="card" style={{ maxWidth: 360 }}>
        <label className="field-label">指名料単価（円）</label>
        <input
          className="field-input"
          style={{ marginBottom: 14 }}
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => updateSettings({ nominationFee: Number(fee) })}>
          保存
        </button>
      </div>
      <ChangeOwnerPasswordForm />
    </div>
  );
}
