interface DeskProps {
  name: string;
  available: boolean;
  reserved: boolean;   // reserved by the current user
  reservedBy?: string; // name of whoever reserved it (when taken by someone else)
  rotate?: 'cw' | 'ccw';
  onClick: () => void;
}

export function Desk({ name, available, reserved, reservedBy, rotate, onClick }: DeskProps) {
  let bgColor: string;
  let borderColor: string;
  let textColor: string;
  let deskColor: string;
  let cursor: string;
  let title: string;

  if (reserved) {
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-400';
    textColor = 'text-blue-700';
    deskColor = '#93c5fd';
    cursor = 'cursor-pointer hover:bg-blue-100';
    title = 'Your reservation — click to cancel';
  } else if (available) {
    bgColor = 'bg-emerald-50';
    borderColor = 'border-emerald-400';
    textColor = 'text-emerald-700';
    deskColor = '#6ee7b7';
    cursor = 'cursor-pointer hover:bg-emerald-100 hover:scale-105';
    title = `Reserve ${name}`;
  } else {
    bgColor = 'bg-slate-50';
    borderColor = 'border-slate-300';
    textColor = 'text-slate-500';
    deskColor = '#cbd5e1';
    cursor = 'cursor-default';
    title = reservedBy ? `Reserved by ${reservedBy}` : `${name} is taken`;
  }

  // Truncate long names to fit the tile
  const displayName = reservedBy && reservedBy.length > 7
    ? reservedBy.slice(0, 6) + '…'
    : reservedBy;

  return (
    <button
      className={`flex flex-col items-center justify-center w-20 rounded-xl border-2 font-semibold transition-all select-none py-2 px-1 gap-0.5 ${bgColor} ${borderColor} ${textColor} ${cursor}`}
      onClick={available || reserved ? onClick : undefined}
      title={title}
    >
      {/* Top-down desk: rectangular surface + screen stripe */}
      <svg viewBox="0 0 48 48" className={`w-10 h-10 ${rotate === 'cw' ? 'rotate-90' : rotate === 'ccw' ? '-rotate-90' : ''}`} fill="none" aria-hidden="true">
        {/* Desk surface (wide rectangle, ~1.6:1 ratio) */}
        <rect x="2" y="10" width="44" height="28" rx="2.5" fill={deskColor} />
        {/* Screen stripe — centered, ~30% of desk width, small margin from back edge */}
        <rect x="17" y="13" width="14" height="5" rx="1.5" fill="#1e293b" />
        {/* Chair — small square in front of desk */}
        <rect x="18" y="41" width="12" height="8" rx="2" fill={deskColor} />
      </svg>

      <span className="text-xs font-semibold leading-none">{name}</span>
      {reserved && <span className="text-[10px] opacity-75 leading-none">Mine</span>}
      {available && <span className="text-[10px] opacity-75 leading-none">Free</span>}
      {!reserved && !available && (
        <span className="text-[10px] opacity-75 leading-tight text-center px-0.5">
          {displayName ?? 'Taken'}
        </span>
      )}
    </button>
  );
}
