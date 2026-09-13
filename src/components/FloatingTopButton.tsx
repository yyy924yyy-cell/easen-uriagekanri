interface Props {
  onClick: () => void;
  label?: string;
  side?: 'left' | 'right';
}

export default function FloatingTopButton({ onClick, label = 'TOPに戻る', side = 'right' }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        [side]: 20,
        bottom: 20,
        zIndex: 50,
        background: 'var(--color-surface)',
        color: 'var(--color-gold-dark)',
        border: '1.5px solid var(--color-gold)',
        borderRadius: 999,
        padding: '13px 20px',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.04em',
        boxShadow: '0 6px 18px rgba(40, 32, 20, 0.14)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M19 12H5M5 12L11 6M5 12L11 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
