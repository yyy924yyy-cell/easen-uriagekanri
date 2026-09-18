import { useEffect, useState } from 'react';
import type { DiscountMode, DiscountType, PaymentMethod, SalesRecord, Store } from '../types';
import Toggle from './Toggle';

export interface SalesRecordFormValue {
  storeId: string;
  treatmentAmount: number;
  treatmentMemo?: string;
  optionAmount: number;
  optionMemo?: string;
  discountTypeId?: string;
  discountMode?: DiscountMode;
  discountValue?: number;
  discountMemo?: string;
  pointsUsed: number;
  nominated: boolean;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
}

interface Props {
  stores: Store[];
  discountTypes: DiscountType[];
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

export default function SalesRecordForm({
  stores,
  discountTypes,
  initial,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
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

  const [applyDiscount, setApplyDiscount] = useState(!!initial?.discountTypeId);
  const [discountTypeId, setDiscountTypeId] = useState(initial?.discountTypeId ?? '');
  const [showDiscountMemo, setShowDiscountMemo] = useState(!!initial?.discountMemo);
  const [discountMemo, setDiscountMemo] = useState(initial?.discountMemo ?? '');

  useEffect(() => {
    if (!discountTypeId && discountTypes.length > 0) setDiscountTypeId(discountTypes[0].id);
  }, [discountTypes, discountTypeId]);

  const [nominated, setNominated] = useState(initial?.nominated ?? false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? 'cash'
  );
  const [isPaid] = useState(initial?.isPaid ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingNegative, setConfirmingNegative] = useState(false);

  const treatment = Number(treatmentAmount) || 0;
  const option = Number(optionAmount) || 0;
  const points = Number(pointsUsed) || 0;
  const subtotal = treatment + option;
  const selectedDiscountType = discountTypes.find((t) => t.id === discountTypeId);
  const discountMode: DiscountMode = selectedDiscountType?.mode ?? 'yen';
  const discountRawValue = selectedDiscountType?.value ?? 0;
  const discountAmount = !applyDiscount
    ? 0
    : discountMode === 'percent'
      ? Math.round((subtotal * discountRawValue) / 100)
      : discountRawValue;
  const total = subtotal - discountAmount;
  const payment = total - points;

  function buildValue(): SalesRecordFormValue {
    return {
      storeId,
      treatmentAmount: treatment,
      treatmentMemo: showTreatmentMemo ? treatmentMemo.trim() : '',
      optionAmount: option,
      optionMemo: showOptionMemo ? optionMemo.trim() : '',
      discountTypeId: applyDiscount ? discountTypeId || undefined : undefined,
      discountMode: applyDiscount ? discountMode : undefined,
      discountValue: applyDiscount ? discountRawValue : undefined,
      discountMemo: applyDiscount && showDiscountMemo ? discountMemo.trim() : '',
      pointsUsed: points,
      nominated,
      paymentMethod,
      isPaid,
    };
  }

  async function doSave() {
    setSaving(true);
    try {
      await onSubmit(buildValue());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmingNegative(false);

    if (!storeId) {
      setError('店舗を選択してください。');
      return;
    }
    if (treatment <= 0) {
      setError('施術金額を入力してください。');
      return;
    }
    if (total < 0) {
      setConfirmingNegative(true);
      return;
    }
    if (payment < 0) {
      setError('使用ポイントが合計金額を超えています。');
      return;
    }

    await doSave();
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
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: applyDiscount ? 12 : 0,
          }}
        >
          <span className="field-label" style={{ marginBottom: 0 }}>
            各種割引
          </span>
          <Toggle checked={applyDiscount} onChange={setApplyDiscount} />
        </label>
        {applyDiscount && (
          <>
            {discountTypes.length > 1 ? (
              <select
                className="field-input"
                style={{ marginBottom: 8 }}
                value={discountTypeId}
                onChange={(e) => setDiscountTypeId(e.target.value)}
              >
                {discountTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}（{t.mode === 'percent' ? `${t.value}%` : `¥${t.value.toLocaleString()}`}）
                  </option>
                ))}
              </select>
            ) : discountTypes.length === 1 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>
                {discountTypes[0].name}（
                {discountTypes[0].mode === 'percent'
                  ? `${discountTypes[0].value}%`
                  : `¥${discountTypes[0].value.toLocaleString()}`}
                ）
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>
                割引の種類が登録されていません。オーナーの「割引管理」から追加してください。
              </p>
            )}
            {discountAmount > 0 && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>
                割引額：－¥{discountAmount.toLocaleString()}
              </div>
            )}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--color-text-muted)',
              }}
            >
              <input
                type="checkbox"
                checked={showDiscountMemo}
                onChange={(e) => setShowDiscountMemo(e.target.checked)}
              />
              備考を書く
            </label>
            {showDiscountMemo && (
              <textarea
                className="field-input"
                style={{ marginTop: 8, minHeight: 60 }}
                value={discountMemo}
                onChange={(e) => setDiscountMemo(e.target.value)}
                placeholder="割引についての備考"
              />
            )}
          </>
        )}
      </div>

      <div>
        <span className="field-label">合計金額（歩合の対象額・自動計算）</span>
        <div className="readonly-amount">¥{total.toLocaleString()}</div>
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

      {confirmingNegative && (
        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            padding: 14,
          }}
        >
          <p style={{ color: 'var(--color-danger)', fontSize: 14, margin: 0, marginBottom: 10 }}>
            割引額が大きく、合計金額（歩合の対象額）がマイナス（¥{total.toLocaleString()}）になります。このまま保存しますか？
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => setConfirmingNegative(false)}
            >
              いいえ
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                setConfirmingNegative(false);
                doSave();
              }}
            >
              はい、保存する
            </button>
          </div>
        </div>
      )}

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
              if (!window.confirm('本当に削除しますか？この操作は取り消せません。')) return;
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
