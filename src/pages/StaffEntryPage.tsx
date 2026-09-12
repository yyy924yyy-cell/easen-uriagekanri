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

export default function StaffEntryPage() {
  const { selectedCastId, setSelectedCastId } = useAuth();
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list');
  const [editing, setEditing] = useState<SalesRecord | null>(null);

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
              setMode('list');
            }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'edit' && editing) {
    return (
      <div>
        <Header title={`${castName} さん・入力内容を修正`} onBack={() => setMode('list')} />
        <div className="page-container" style={{ maxWidth: 520 }}>
          <SalesRecordForm
            stores={stores}
            initial={editing}
            onCancel={() => setMode('list')}
            onDelete={async () => {
              await deleteSalesRecord(editing.id);
              setMode('list');
            }}
            onSubmit={async (value: SalesRecordFormValue) => {
              await updateSalesRecord(editing.id, {
                date: editing.date,
                castId: editing.castId,
                ...value,
              });
              setMode('list');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={`${castName} さんの記録`} onBack={() => setSelectedCastId(null)} />
      <div className="page-container">
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
                <div style={{ fontWeight: 700 }}>{r.date}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                  合計 ¥{r.totalAmount.toLocaleString()}
                  {r.nominated && '・指名あり'}
                </div>
              </div>
              {r.date === today ? (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setEditing(r);
                    setMode('edit');
                  }}
                >
                  修正
                </button>
              ) : (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>編集不可</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
