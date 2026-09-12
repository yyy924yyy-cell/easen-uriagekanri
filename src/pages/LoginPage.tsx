import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(loginId, password);
    } catch {
      setError('IDまたはパスワードが正しくありません');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-main)',
        padding: 24,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28 }}>易苑</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>売上・歩合給管理</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="loginId">
            ID
          </label>
          <input
            id="loginId"
            className="field-input"
            style={{ marginBottom: 16 }}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="owner または staff"
            autoCapitalize="none"
          />
          <label className="field-label" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className="field-input"
            style={{ marginBottom: 20 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: 14, marginBottom: 16 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
