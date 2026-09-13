import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export default function Header({ title, onBack }: HeaderProps) {
  const { role, logout, setSelectedCastId } = useAuth();

  return (
    <header className="app-header">
      <div>
        <div className="brand">
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-gold-dark)',
                marginRight: 10,
                fontSize: 18,
              }}
            >
              ←
            </button>
          )}
          EASEN 売上管理
        </div>
        <div className="subtitle">{title}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {role === 'owner' ? 'オーナー' : 'スタッフ'}
        </span>
        <button
          className="btn btn-outline"
          style={{ padding: '8px 14px', fontSize: 13 }}
          onClick={async () => {
            setSelectedCastId(null);
            await logout();
          }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
