import { useEffect, useState } from 'react';
import type { PaymentMethod, SalesRecord, Store } from '../types';
import Toggle from './Toggle';

export interface SalesRecordFormValue {
  storeId: string;
  treatmentAmount: number;
  treatmentMemo?: string;
  optionAmount: number;
  optionMemo?: string;
  pointsUsed: number;
  nominated: boolean;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
}

interface Props {
  stores: Store[];
  initial?: SalesRecord;
  onSubmit: (value: SalesRecordFormValue) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

function errorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code === 'permission-denied') {
    return '保存する権限がありません。当日以外の記録を修正しようとしていないか、端末の日付・時刻が正しいか確認してください。';
  }
  if (code === 'unavailable' || code === 'failed-precondition') {
    return '通信状態が不安定なようです。電波・Wi-Fiの状態を確認して、もう一度お試しください。';
  }
  if (err instanceof Error) return `保存できませんでした（${err.message}）`;
  return '保存できませんでした。もう一度お試しください。';
}

export default function SalesRecordForm({ stores, initial, onSubmit, onCancel, onDelete }: Props) {
  const [storeId, setStoreId] = useState(initial?.storeId ?? stores[0]?.id ?? '');

  useEffect(() => {
    if (!storeId && stores.length > 0) setStoreId(stores[0].id);
  }, [stores, storeId]);

  const [treatmentAmount, setTreatmentAmount] = useState(String(initial?.treatmentAmount ?? ''));
  const [showTreatmentMemo, setShowTreatmentMemo] = useState(!!initial?.treatmentMemo);
  const [treatmentMemo, setTreatmentMemo] = useState(initial?.treatmentMemo ?? '');

  const [optionAmount, setOptionAmount] = useState(String(initial?.optionAmount ?? '0'));
  const [showOptionMemo, setShowOptionMemo] = useState(!!initial?.optionMemo);
  const [optionMemo, setOptionMemo] = useState(initial?.optionMemo ?? '');

  const [pointsUsed, setPointsUsed] = useState(String(initial?.pointsUsed ?? '0'));
  const [nominated, setNominated] = useState(initial?.nominated ?? false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? 'cash'
  );
  const [isPaid, setIsPaid] = useState(initial?.isPaid ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const treatment = Number(treatmentAmount) || 0;
  const option = Number(optionAmount) || 0;
  const points = Number(pointsUsed) || 0;
  const total = treatment + option;
  const payment = total - points;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!storeId) {
      setError('店舗を選択してください。');
      return;
    }
    if (treatment <= 0) {
      setError('施術金額を入力してください。');
      return;
    }
    if (payment < 0) {
      setError('使用ポイントが合計金額を超えています。');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        storeId,
        treatmentAmount: treatment,
        treatmentMemo: showTreatmentMemo ? treatmentMemo.trim() : '',
        optionAmount: option,
        optionMemo: showOptionMemo ? optionMemo.trim() : '',
        pointsUsed: points,
        nominated,
        paymentMethod,
        isPaid,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: 18 }}>
      {stores.length > 1 && (
        <div>
          <label className="field-label">店舗</label>
          <select
            className="field-input"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {stores.length === 1 && (
        <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
          店舗：{stores[0].name}
        </div>
      )}

      <div>
        <label className="field-label">施術金額</label>
        <input
          className="field-input"
          type="number"
          inputMode="numeric"
          min="0"
          value={treatmentAmount}
          onChange={(e) => setTreatmentAmount(e.target.value)}
          placeholder="0"
          required
        />
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            fontSize: 13,
            color: 'var(--color-text-muted)',
          }}
        >
          <input
            type="checkbox"
            checked={showTreatmentMemo}
            onChange={(e) => setShowTreatmentMemo(e.target.checked)}
          />
          備考を書く
        </label>
        {showTreatmentMemo && (
          <textarea
            className="field-input"
            style={{ marginTop: 8, minHeight: 60 }}
            value={treatmentMemo}
            onChange={(e) => setTreatmentMemo(e.target.value)}
            placeholder="施術金額についての備考"
          />
        )}
      </div>

      <div>
        <label className="field-label">追加オプション金額</label>
        <input
          className="field-input"
          type="number"
          inputMode="numeric"
          min="0"
          value={optionAmount}
          onChange={(e) => setOptionAmount(e.target.value)}
          placeholder="0"
        />
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            fontSize: 13,
            color: 'var(--color-text-muted)',
          }}
        >
          <input
            type="checkbox"
            checked={showOptionMemo}
            onChange={(e) => setShowOptionMemo(e.target.checked)}
          />
          備考を書く
        </label>
        {showOptionMemo && (
          <textarea
            className="field-input"
            style={{ marginTop: 8, minHeight: 60 }}
            value={optionMemo}
            onChange={(e) => setOptionMemo(e.target.value)}
            placeholder="追加オプションについての備考"
          />
        )}
      </div>

      <div>
        <span className="field-label">合計金額</span>
        <div className="readonly-amount">¥{total.toLocaleString()}</div>
      </div>

      <div>
        <label className="field-label">使用ポイント</label>
        <input
          className="field-input"
          type="number"
          inputMode="numeric"
          min="0"
          value={pointsUsed}
          onChange={(e) => setPointsUsed(e.target.value)}
          placeholder="0"
        />
      </div>

      <div>
        <span className="field-label">お客様の支払金額（自動計算）</span>
        <div className="readonly-amount">¥{payment.toLocaleString()}</div>
      </div>

      <div>
        <span className="field-label">支払い方法</span>
        <div className="segmented">
          {(
            [
              ['cash', '現金'],
              ['card', 'カード'],
              ['emoney', '電子マネー'],
            ] as [PaymentMethod, string][]
          ).map(([val, label]) => (
            <button
              type="button"
              key={val}
              className={paymentMethod === val ? 'active' : ''}
              onClick={() => setPaymentMethod(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Toggle checked={nominated} onChange={setNominated} label="指名" />
      <Toggle checked={isPaid} onChange={setIsPaid} label="会計済" />

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: 14, margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>
          キャンセル
        </button>
        {onDelete && (
          <button
            type="button"
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={async () => {
              setError(null);
              try {
                await onDelete();
              } catch (err) {
                setError(errorMessage(err));
              }
            }}
          >
            削除
          </button>
        )}
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
          {saving ? '保存中…' : '保存'}
        </button>
      </div>
    </form>
  );
}
