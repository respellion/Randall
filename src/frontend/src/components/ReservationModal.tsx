import { useState } from 'react';

interface ReservationModalProps {
  deskName: string;
  date: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const PURPLE = '#5b4fc7';
const PURPLE_DEEP = '#3f33a8';
const SAGE = '#c7d4b8';
const SAGE_DEEP = '#a9bb96';
const PAPER = '#f4f3ee';

export function ReservationModal({ deskName, date, onConfirm, onClose }: ReservationModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setError('');
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(42,31,107,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: PAPER, borderRadius: 18, padding: 32,
          width: '100%', maxWidth: 360, margin: '0 16px',
          border: '1px solid rgba(91,79,199,0.12)',
          boxShadow: '0 20px 60px -12px rgba(42,31,107,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: PURPLE, opacity: 0.7, marginBottom: 8, fontWeight: 500,
        }}>
          Reserve desk
        </div>
        <div style={{
          fontFamily: "'Rubik Mono One', monospace",
          fontSize: 36, letterSpacing: '-0.03em', color: PURPLE,
          lineHeight: 0.95, marginBottom: 6,
        }}>
          {deskName}
        </div>
        <div style={{ fontSize: 13, color: PURPLE, opacity: 0.65, marginBottom: 24 }}>
          {date}
        </div>

        {error && (
          <div style={{
            fontSize: 13, color: '#c0392b',
            background: 'rgba(192,57,43,0.08)',
            borderRadius: 8, padding: '10px 14px',
            marginBottom: 18,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 99,
              background: SAGE, border: `1px solid ${SAGE_DEEP}`,
              color: PURPLE_DEEP, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 99,
              background: PURPLE, border: `1.5px solid ${PURPLE_DEEP}`,
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Reserving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
