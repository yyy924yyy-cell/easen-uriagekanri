import { useEffect, useState } from 'react';
import { subscribeCasts } from '../lib/data';
import { useAuth } from '../contexts/AuthContext';
import type { Cast } from '../types';
import Header from '../components/Header';

export default function StaffSelectCastPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const { setSelectedCastId } = useAuth();

  useEffect(() => subscribeCasts((list) => setCasts(list.filter((c) => c.active))), []);

  return (
    <div>
      <Header title="スタッフを選択してください" />
      <div className="page-container">
        <div className="grid-cast-buttons">
          {casts.map((cast) => (
            <button
              key={cast.id}
              className="cast-button"
              onClick={() => setSelectedCastId(cast.id)}
            >
              {cast.name}
            </button>
          ))}
        </div>
        {casts.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 20 }}>
            表示できるスタッフがいません。オーナーに登録を依頼してください。
          </p>
        )}
      </div>
    </div>
  );
}
