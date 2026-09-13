import { useEffect, useState } from 'react';
import { subscribeCasts } from '../lib/data';
import { useAuth } from '../contexts/AuthContext';
import type { Cast } from '../types';
import Header from '../components/Header';

export default function StaffSelectCastPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [pending, setPending] = useState<Cast | null>(null);
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
              onClick={() => setPending(cast)}
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

      {pending && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44, 38, 32, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 100,
          }}
          onClick={() => setPending(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 340,
              textAlign: 'center',
              border: '1px solid var(--color-gold)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 8 }}>
              あなたは
            </p>
            <h2 style={{ fontSize: 26, marginBottom: 8 }}>{pending.name} さん</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
              で間違いありませんか？
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setPending(null)}
              >
                いいえ
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedCastId(pending.id);
                  setPending(null);
                }}
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
