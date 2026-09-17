// Googleドライブへのアップロード機能。
// スコープは drive.file（このアプリが作成したファイルのみアクセス可能）に限定しているため、
// Googleの厳格な審査（sensitive scope verification）を受けずに、
// テストユーザーとして登録したアカウントだけで利用できる。

const GOOGLE_CLIENT_ID = '727587317159-bp8lciiio4b9jjbjepf5aael9gt0cmaq.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

let gsiLoadPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google認証スクリプトの読み込みに失敗しました'));
    document.head.appendChild(script);
  });
  return gsiLoadPromise;
}

async function getAccessToken(): Promise<string> {
  await loadGsiScript();
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google認証の準備ができていません'));
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error('Googleアカウントの認証がキャンセルまたは失敗しました'));
          return;
        }
        resolve(resp.access_token);
      },
    });
    client.requestAccessToken();
  });
}

export async function uploadFileToDrive(blob: Blob, filename: string): Promise<void> {
  const accessToken = await getAccessToken();

  const metadata = {
    name: filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Googleドライブへのアップロードに失敗しました（${res.status}）${text}`);
  }
}
