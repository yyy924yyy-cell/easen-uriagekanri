import { useState } from 'react';
import type { PaymentMethod, SalesRecord, Store } from '../types';
import Toggle from './Toggle';

export interface SalesRecordFormValue {
  storeId: string;
  treatmentAmount: number;
  optionAmount: number;
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

export default function SalesRecordForm({ stores, initial, onSubmit, onCancel, onDelete }: Props) {
  const [storeId, setStoreId] = useState(initial?.storeId ?? stores[0]?.id ?? '');
  const [treatmentAmount, setTreatmentAmount] = useState(String(initial?.treatmentAmount ?? ''));
  const [optionAmount, setOptionAmount] = useState(String(initial?.optionAmount ?? '0'));
  const [pointsUsed, setPointsUsed] = useState(String(initial?.pointsUsed ?? '0'));
  const [nominated, setNominated] = useState(initial?.nominated ?? false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? 'cash'
  );
  const [isPaid, setIsPaid] = useState(initial?.isPaid ?? false);
  const [saving, setSaving] = useState(false);

  const treatment = Number(treatmentAmount) || 0;
  const option = Number(optionAmount) || 0;
  const points = Number(pointsUsed) || 0;
  const total = treatment + option;
  const payment = total - points;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId || treatment <= 0) return;
    setSaving(true);
    try {
      await onSubmit({
        storeId,
        treatmentAmount: treatment,
        optionAmount: option,
        pointsUsed: points,
        nominated,
        paymentMethod,
        isPaid,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: 18 }}>
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

      <div>
        <label className="field-label">施術金額</label>
        <input
          className="field-input"
          type="number"
          inputMode="numeric"
          value={treatmentAmount}
          onChange={(e) => setTreatmentAmount(e.target.value)}
          placeholder="0"
          required
        />
      </div>

      <div>
        <label className="field-label">追加オプション金額</label>
        <input
          className="field-input"
          type="number"
          inputMode="numeric"
          value={optionAmount}
          onChange={(e) => setOptionAmount(e.target.value)}
          placeholder="0"
        />
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

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>
          キャンセル
        </button>
        {onDelete && (
          <button
            type="button"
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={onDelete}
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
