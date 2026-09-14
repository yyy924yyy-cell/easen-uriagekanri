export type Role = 'owner' | 'staff';

export interface Store {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface Cast {
  id: string;
  name: string;
  commissionRate: number; // e.g. 0.10 = 10%
  active: boolean;
  order: number;
  createdAt: number;
}

export type PaymentMethod = 'cash' | 'card' | 'emoney';

export interface SalesRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  storeId: string;
  castId: string;
  treatmentAmount: number; // 施術金額
  treatmentMemo?: string; // 施術金額の備考
  optionAmount: number; // 追加オプション金額
  optionMemo?: string; // 追加オプション金額の備考
  totalAmount: number; // 合計金額 = treatmentAmount + optionAmount（歩合給の計算対象）
  pointsUsed: number; // 使用ポイント
  paymentAmount: number; // 客の支払金額 = totalAmount - pointsUsed
  nominated: boolean; // 指名有無
  paymentMethod: PaymentMethod;
  isPaid: boolean; // 会計済
  menu?: string; // 将来のメニュー機能用（今は未使用）
  createdAt: number;
  updatedAt: number;
  createdBy: Role;
}

export interface GeneralSettings {
  nominationFee: number; // 指名料単価（デフォルト500円）
  lastBackupMonth?: string; // 最後にバックアップ出力を行った月（'YYYY-MM'）
}

export interface StaffDisplaySettings {
  showStaffBadge?: boolean; // スタッフ選択ボタンにイニシャルバッジを表示するか
  showStaffColor?: boolean; // スタッフ選択ボタンにスタッフごとの色をつけるか
}
