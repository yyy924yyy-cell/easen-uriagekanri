import type { Timestamp } from 'firebase/firestore';

/**
 * FirestoreのTimestamp（またはサーバー確定前のnull、旧データのnumber）を
 * 「HH:mm」形式の時刻文字列に変換する。まだサーバーに確定していない場合は
 * 空文字を返す。
 */
export function formatRecordTime(value: Timestamp | number | null | undefined): string {
  if (value == null) return '';
  const date =
    typeof value === 'number' ? new Date(value) : typeof value.toDate === 'function' ? value.toDate() : null;
  if (!date) return '';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
