import type { Timestamp } from 'firebase/firestore';

export type Role = 'owner' | 'staff';

export interface Store {
  id: string;
  name: string;
  order: number;
  createdAt: number;
  deletedAt?: Timestamp | null; // ゴミ箱に入った時刻（未削除ならなし）
  purgeAt?: Timestamp | null; // 完全自動削除される予定時刻（削除から30日後）
}

export interface Cast {
  id: string;
  name: string;
  commissionRate: number; // e.g. 0.10 = 10%
  active: boolean;
  order: number;
  createdAt: number;
  deletedAt?: Timestamp | null;
  purgeAt?: Timestamp | null;
}

export interface DiscountType {
  id: string;
  name: string; // 例：「当日割」
  order: number;
  active: boolean;
  createdAt: number;
  deletedAt?: Timestamp | null;
  purgeAt?: Timestamp | null;
}

export type PaymentMethod = 'cash' | 'card' | 'emoney';

export type DiscountMode = 'yen' | 'percent';

export interface SalesRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  storeId: string;
  castId: string;
  treatmentAmount: number; // 施術金額
  treatmentMemo?: string; // 施術金額の備考
  optionAmount: number; // 追加オプション金額
  optionMemo?: string; // 追加オプション金額の備考
  discountTypeId?: string; // 各種割引の種類
  discountMode?: DiscountMode; // 'yen'=金額指定 / 'percent'=割合指定
  discountValue?: number; // 入力された値（円 or %）
  discountAmount?: number; // 実際に引かれた金額（自動計算値）
  discountMemo?: string; // 各種割引の備考
  totalAmount: number; // 合計金額 = (treatmentAmount + optionAmount) - discountAmount（歩合給の計算対象）
  pointsUsed: number; // 使用ポイント
  paymentAmount: number; // 客の支払金額 = totalAmount - pointsUsed
  nominated: boolean; // 指名有無
  paymentMethod: PaymentMethod;
  isPaid: boolean; // 会計済
  menu?: string; // 将来のメニュー機能用（今は未使用）
  createdAt: Timestamp | number | null; // 記録した時刻（サーバー時刻）
  updatedAt: Timestamp | number | null;
  createdBy: Role;
  deletedAt?: Timestamp | null; // ゴミ箱に入った時刻（未削除ならなし）
  purgeAt?: Timestamp | null; // 完全自動削除される予定時刻（削除から30日後）
}

export interface GeneralSettings {
  nominationFee: number; // 指名料単価（デフォルト500円）
  lastBackupMonth?: string; // 最後にバックアップ出力を行った月（'YYYY-MM'）
}

export interface StaffDisplaySettings {
  showStaffBadge?: boolean; // スタッフ選択ボタンにイニシャルバッジを表示するか
  showStaffColor?: boolean; // スタッフ選択ボタンにスタッフごとの色をつけるか
}
