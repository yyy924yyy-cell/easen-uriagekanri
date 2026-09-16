import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeCastSalesRecords,
  subscribeStores,
  subscribeCasts,
  addSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  todayString,
} from '../lib/data';
import type { SalesRecord, Store, Cast } from '../types';
import Header from '../components/Header';
import SalesRecordForm, { type SalesRecordFormValue } from '../components/SalesRecordForm';
import SalesRecordDetail from '../components/SalesRecordDetail';
import FloatingTopButton from '../components/FloatingTopButton';
import { formatRecordTime } from '../lib/formatTime';

type Mode = 'list' | 'new' | 'view' | 'edit';

export default function StaffEntryPage() {
  const { selectedCastId, setSelectedCastId } = useAuth();
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<SalesRecord | null>(null);

  useEffect(() => subscribeStores(setStores), []);
  useEffect(() => subscribeCasts(setCasts), []);
  useEffect(() => {
    if (!selectedCastId) return;
    return subscribeCastSalesRecords(selectedCastId, setRecords);
  }, [selectedCastId]);

  const castName = useMemo(
    () => casts.find((c) => c.id === selectedCastId)?.name ?? '',
    [casts, selectedCastId]
  );

  const today = todayString();
  const todayCount = useMemo(() => records.filter((r) => r.date === today).length, [records, today]);

  if (!selectedCastId) return null;

  if (mode === 'new') {
    return (
      <div>
        <Header title={`${castName} さん・新規売上入力`} onBack={() => setMode('list')} />
        <div className="page-container" style={{ maxWidth: 520 }}>
          <SalesRecordForm
            stores={stores}
            onCancel={() => setMode('list')}
            onSubmit={async (value: SalesRecordFormValue) => {
              await addSalesRecord({
                date: today,
                castId: selectedCastId,
                createdBy: 'staff',
                ...value,
              });
              setSelectedCastId(null);
            }}
          />
        </div>
        <FloatingTopButton onClick={() => setSelectedCastId(null)} />
      </div>
    );
  }

  if (mode === 'view' && selected) {
    return (
      <div>
        <Header title={`${castName} さん・記録の詳細`} onBack={() => setMode('list')} />
        <div className="page-container" style={{ maxWidth: 520 }}>
          <SalesRecordDetail
            record={selected}
            stores={stores}
            canEdit={selected.date === today}
            onEdit={() => setMode('edit')}
            onBack={() => setMode('list')}
          />
        </div>
        <FloatingTopButton onClick={() => setSelectedCastId(null)} />
      </div>
    );
  }

  if (mode === 'edit' && selected) {
    return (
      <div>
        <Header title={`${castName} さん・入力内容を修正`} onBack={() => setMode('view')} />
        <div className="page-container" style={{ maxWidth: 520 }}>
          <SalesRecordForm
            stores={stores}
            initial={selected}
            onCancel={() => setMode('view')}
            onDelete={async () => {
              await deleteSalesRecord(selected.id);
              setMode('list');
            }}
            onSubmit={async (value: SalesRecordFormValue) => {
              await updateSalesRecord(selected.id, {
                date: selected.date,
                castId: selected.castId,
                ...value,
              });
              setMode('list');
            }}
          />
        </div>
        <FloatingTopButton onClick={() => setSelectedCastId(null)} />
      </div>
    );
  }

  return (
    <div>
      <Header title={`${castName} さんの記録`} onBack={() => setSelectedCastId(null)} />
      <div className="page-container">
        <div
          style={{
            marginBottom: 16,
            padding: '10px 16px',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            color: 'var(--color-text-muted)',
            display: 'inline-block',
          }}
        >
          本日、<strong style={{ color: 'var(--color-gold-dark)' }}>{todayCount}件</strong> 入力済み
        </div>
        <br />
        <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setMode('new')}>
          ＋ 本日の売上を入力する
        </button>
        {records.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>まだ記録がありません。</p>
        )}
        <div style={{ display: 'grid', gap: 12 }}>
          {records.map((r) => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  {r.date}
                  {formatRecordTime(r.createdAt) && (
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: 14 }}>
                      {' '}
                      {formatRecordTime(r.createdAt)}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                  合計 ¥{r.totalAmount.toLocaleString()}
                  {r.nominated && '・指名あり'}
                </div>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelected(r);
                  setMode('view');
                }}
              >
                詳細を見る
              </button>
            </div>
          ))}
        </div>
      </div>
      <FloatingTopButton onClick={() => setSelectedCastId(null)} />
    </div>
  );
}
