import type { Timestamp } from 'firebase/firestore';
import type { Cast, GeneralSettings, SalesRecord, Store } from '../types';

// Google Apps Scriptで公開したWebアプリのURL。
// 「デプロイ」後に発行されるURL（https://script.google.com/macros/s/.../exec）に書き換える。
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/【ここをデプロイ後のIDに置き換え】/exec';

// Apps Script側にも同じ文字列を設定する「合言葉」。第三者に知られても大きな実害はないが、
// 念のため公開リポジトリのコードそのままではなく、必要なら適宜差し替えて良い。
const BACKUP_SECRET = 'F9FXD-X-Of3ptQ4bRrCfJ2XNN-HxsWdZ';

function tsToIso(value: Timestamp | number | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === 'number') return new Date(value).toISOString();
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return null;
}

function plainRecord(r: SalesRecord) {
  return {
    ...r,
    createdAt: tsToIso(r.createdAt),
    updatedAt: tsToIso(r.updatedAt),
    deletedAt: r.deletedAt ? tsToIso(r.deletedAt as unknown as Timestamp) : null,
    purgeAt: r.purgeAt ? tsToIso(r.purgeAt as unknown as Timestamp) : null,
  };
}

export interface BackupPayload {
  secret: string;
  filename: string;
  data: {
    exportedAt: string;
    salesRecords: ReturnType<typeof plainRecord>[];
    casts: Cast[];
    stores: Store[];
    settings: GeneralSettings;
  };
}

/**
 * アプリの全データをJSONにまとめて、Google Apps Script経由でGoogleドライブへ送信する。
 * fetchはno-corsで送るため、成功したかどうかをブラウザ側で正確には確認できない
 * （送信自体は実際に届く）。呼び出し側は「送信した」という前提で扱うこと。
 */
export async function backupAllDataToDrive(
  records: SalesRecord[],
  casts: Cast[],
  stores: Store[],
  settings: GeneralSettings,
  yearMonth: string
): Promise<void> {
  const payload: BackupPayload = {
    secret: BACKUP_SECRET,
    filename: `easen_backup_${yearMonth}.json`,
    data: {
      exportedAt: new Date().toISOString(),
      salesRecords: records.map(plainRecord),
      casts,
      stores,
      settings,
    },
  };

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });
}
