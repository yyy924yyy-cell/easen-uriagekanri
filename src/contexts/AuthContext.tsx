import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { resolveEmail, emailToRole } from '../lib/authMapping';
import type { Role } from '../types';

interface AuthContextValue {
  loading: boolean;
  role: Role | null;
  selectedCastId: string | null;
  setSelectedCastId: (id: string | null) => void;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CAST_STORAGE_KEY = 'easen_selected_cast_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [selectedCastId, setSelectedCastIdState] = useState<string | null>(
    () => localStorage.getItem(CAST_STORAGE_KEY)
  );

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // 永続化の設定に失敗しても致命的ではないため無視する
    });
    const unsub = onAuthStateChanged(auth, (user) => {
      setRole(emailToRole(user?.email));
      setLoading(false);
    });
    return unsub;
  }, []);

  function setSelectedCastId(id: string | null) {
    setSelectedCastIdState(id);
    if (id) localStorage.setItem(CAST_STORAGE_KEY, id);
    else localStorage.removeItem(CAST_STORAGE_KEY);
  }

  async function login(loginId: string, password: string) {
    const email = resolveEmail(loginId);
    if (!email) {
      throw new Error('IDが見つかりません');
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setSelectedCastId(null);
  }

  return (
    <AuthContext.Provider
      value={{ loading, role, selectedCastId, setSelectedCastId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
