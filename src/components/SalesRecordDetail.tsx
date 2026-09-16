import type { SalesRecord, Store } from '../types';
import { formatRecordTime } from '../lib/formatTime';

const PAYMENT_METHOD_LABEL: Record<SalesRecord['paymentMethod'], string> = {
  cash: '現金',
  card: 'カード',
  emoney: '電子マネー',
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

interface Props {
  record: SalesRecord;
  stores: Store[];
  canEdit: boolean;
  onEdit: () => void;
  onBack: () => void;
}

export default function SalesRecordDetail({ record, stores, canEdit, onEdit, onBack }: Props) {
  const storeName = stores.find((s) => s.id === record.storeId)?.name ?? '';

  return (
    <div className="card">
      <Row label="日付" value={record.date} />
      {formatRecordTime(record.createdAt) && (
        <Row label="記録時刻" value={formatRecordTime(record.createdAt)} />
      )}
      <Row label="店舗" value={storeName} />
      <Row label="施術金額" value={`¥${record.treatmentAmount.toLocaleString()}`} />
      {record.treatmentMemo && <Row label="施術の備考" value={record.treatmentMemo} />}
      <Row label="追加オプション金額" value={`¥${record.optionAmount.toLocaleString()}`} />
      {record.optionMemo && <Row label="オプションの備考" value={record.optionMemo} />}
      <Row label="合計金額" value={`¥${record.totalAmount.toLocaleString()}`} />
      <Row label="使用ポイント" value={record.pointsUsed.toLocaleString()} />
      <Row label="お客様の支払金額" value={`¥${record.paymentAmount.toLocaleString()}`} />
      <Row label="支払い方法" value={PAYMENT_METHOD_LABEL[record.paymentMethod]} />
      <Row label="指名" value={record.nominated ? '有' : '無'} />
      <Row label="会計済" value={record.isPaid ? '済' : '未'} />

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onBack}>
          一覧に戻る
        </button>
        {canEdit ? (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onEdit}>
            修正する
          </button>
        ) : (
          <span
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 13,
            }}
          >
            当日以外は修正できません
          </span>
        )}
      </div>
    </div>
  );
}
