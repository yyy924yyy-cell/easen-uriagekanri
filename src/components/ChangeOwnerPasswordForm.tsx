import { useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';

function errorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return '現在のパスワードが正しくありません。';
  }
  if (code === 'auth/weak-password') {
    return '新しいパスワードは6文字以上にしてください。';
  }
  if (code === 'auth/too-many-requests') {
    return '試行回数が多すぎます。しばらく待ってから再度お試しください。';
  }
  return 'パスワードを変更できませんでした。もう一度お試しください。';
}

export default function ChangeOwnerPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (newPassword.length < 6) {
      setError('新しいパスワードは6文字以上にしてください。');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('新しいパスワード（確認）が一致しません。');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError('ログイン状態を確認できませんでした。再度ログインしてください。');
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 360, display: 'grid', gap: 14 }}>
      <h3 style={{ fontSize: 16 }}>オーナーのログインパスワードを変更</h3>
      <div>
        <label className="field-label">現在のパスワード</label>
        <input
          className="field-input"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">新しいパスワード（6文字以上）</label>
        <input
          className="field-input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">新しいパスワード（確認）</label>
        <input
          className="field-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: 'var(--color-danger)', fontSize: 14, margin: 0 }}>{error}</p>}
      {done && (
        <p style={{ color: 'var(--color-rose-dark)', fontSize: 14, margin: 0 }}>
          パスワードを変更しました。
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? '変更中…' : 'パスワードを変更'}
      </button>
    </form>
  );
}
