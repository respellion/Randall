import type { Reservation } from '../api/types';

interface MyReservationsProps {
  reservations: Reservation[];
  onCancel: (reservation: Reservation) => void;
}

const PURPLE = '#5b4fc7';
const PURPLE_DEEP = '#3f33a8';
const SAGE = '#c7d4b8';
const SAGE_DEEP = '#a9bb96';

export function MyReservations({ reservations, onCancel }: MyReservationsProps) {
  const upcoming = reservations
    .filter((r) => r.status === 'Active')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) {
    return (
      <p style={{ fontSize: 13, color: PURPLE, opacity: 0.4, textAlign: 'center', padding: '8px 0', margin: 0 }}>
        No upcoming reservations.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {upcoming.map((r) => (
        <li
          key={r.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid rgba(91,79,199,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: PURPLE, lineHeight: 1 }}>
              {r.workplaceName}
            </div>
            <div style={{ fontSize: 11, color: PURPLE, opacity: 0.55, marginTop: 3 }}>
              {r.date}
            </div>
          </div>
          <button
            onClick={() => onCancel(r)}
            style={{
              padding: '5px 12px',
              borderRadius: 99,
              background: SAGE,
              border: `1px solid ${SAGE_DEEP}`,
              color: PURPLE_DEEP,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </li>
      ))}
    </ul>
  );
}
