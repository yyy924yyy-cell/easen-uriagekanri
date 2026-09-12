interface Props {
  onClick: () => void;
  label?: string;
}

export default function FloatingTopButton({ onClick, label = 'TOPに戻る' }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 50,
        background: 'var(--gradient-main)',
        color: '#fff',
        border: 'none',
        borderRadius: 999,
        padding: '14px 22px',
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 6px 18px rgba(110, 59, 82, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      🏠 {label}
    </button>
  );
}
