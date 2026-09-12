// ログイン画面で入力するID（owner / staff）と、Firebase Authenticationに
// 登録されている実際のメールアドレスとの対応表。
export const LOGIN_ID_TO_EMAIL: Record<string, string> = {
  owner: 'owner@easen.local',
  staff: 'staff@easen-uriagekanri.local',
};

export const OWNER_EMAIL = 'owner@easen.local';
export const STAFF_EMAIL = 'staff@easen-uriagekanri.local';

export function resolveEmail(loginId: string): string | null {
  const key = loginId.trim().toLowerCase();
  return LOGIN_ID_TO_EMAIL[key] ?? null;
}

import type { Role } from '../types';

export function emailToRole(email: string | null | undefined): Role | null {
  if (!email) return null;
  if (email === OWNER_EMAIL) return 'owner';
  if (email === STAFF_EMAIL) return 'staff';
  return null;
}
