import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import StaffSelectCastPage from './pages/StaffSelectCastPage';
import StaffEntryPage from './pages/StaffEntryPage';
import OwnerPage from './pages/OwnerPage';

function Routed() {
  const { loading, role, selectedCastId } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        読み込み中…
      </div>
    );
  }

  if (!role) return <LoginPage />;
  if (role === 'owner') return <OwnerPage />;
  if (!selectedCastId) return <StaffSelectCastPage />;
  return <StaffEntryPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routed />
    </AuthProvider>
  );
}
