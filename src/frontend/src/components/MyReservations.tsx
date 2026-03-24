import type { Reservation } from '../api/types';

interface MyReservationsProps {
  reservations: Reservation[];
  onCancel: (reservation: Reservation) => void;
}

export function MyReservations({ reservations, onCancel }: MyReservationsProps) {
  const upcoming = reservations
    .filter((r) => r.status === 'Active')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">No upcoming reservations.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {upcoming.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3"
        >
          <div>
            <span className="font-medium text-slate-800">{r.workplaceName}</span>
            <div className="text-xs text-slate-400 mt-0.5">{r.date}</div>
          </div>
          <button
            onClick={() => onCancel(r)}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </li>
      ))}
    </ul>
  );
}
