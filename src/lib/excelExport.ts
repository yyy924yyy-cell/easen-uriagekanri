import { formatRecordTime } from './formatTime';
import * as XLSX from 'xlsx';
import type { Cast, SalesRecord } from '../types';

export interface CastMonthlyReportRow {
  castId: string;
  castName: string;
  totalSales: number;
  commissionRate: number;
  commissionAmount: number;
  nominationCount: number;
  nominationFee: number;
  nominationAmount: number;
}

export function buildCastMonthlyReport(
  casts: Cast[],
  records: SalesRecord[],
  yearMonth: string, // 'YYYY-MM'
  nominationFee: number
): CastMonthlyReportRow[] {
  return casts.map((cast) => {
    const castRecords = records.filter(
      (r) => r.castId === cast.id && r.date.startsWith(yearMonth)
    );
    const totalSales = castRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const nominationCount = castRecords.filter((r) => r.nominated).length;
    return {
      castId: cast.id,
      castName: cast.name,
      totalSales,
      commissionRate: cast.commissionRate,
      commissionAmount: Math.round(totalSales * cast.commissionRate),
      nominationCount,
      nominationFee,
      nominationAmount: nominationCount * nominationFee,
    };
  });
}

export function exportCastMonthlyReportToExcel(
  rows: CastMonthlyReportRow[],
  yearMonth: string
) {
  const data = rows.map((r) => ({
    スタッフ名: r.castName,
    売上合計: r.totalSales,
    歩合率: `${Math.round(r.commissionRate * 100)}%`,
    歩合給: r.commissionAmount,
    指名件数: r.nominationCount,
    指名料単価: r.nominationFee,
    指名料合計: r.nominationAmount,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, yearMonth);
  XLSX.writeFile(wb, `歩合給_指名料_${yearMonth}.xlsx`);
}

export function exportSalesRecordsToExcel(
  records: SalesRecord[],
  castNameById: Record<string, string>,
  storeNameById: Record<string, string>,
  yearMonth: string
) {
  const data = records
    .filter((r) => r.date.startsWith(yearMonth))
    .map((r) => ({
      日付: r.date,
      時刻: formatRecordTime(r.createdAt),
      店舗: storeNameById[r.storeId] ?? '',
      キャスト: castNameById[r.castId] ?? '',
      施術金額: r.treatmentAmount,
      施術備考: r.treatmentMemo ?? '',
      追加オプション: r.optionAmount,
      オプション備考: r.optionMemo ?? '',
      合計金額: r.totalAmount,
      使用ポイント: r.pointsUsed,
      支払金額: r.paymentAmount,
      指名: r.nominated ? '有' : '無',
      支払方法:
        r.paymentMethod === 'cash' ? '現金' : r.paymentMethod === 'card' ? 'カード' : '電子マネー',
      会計済: r.isPaid ? '済' : '未',
    }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '売上明細');
  XLSX.writeFile(wb, `売上明細_${yearMonth}.xlsx`);
}
