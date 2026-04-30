import { useState } from 'react';

interface DeskProps {
  name: string;
  available: boolean;
  reserved: boolean;
  reservedBy?: string;
  rotate?: 'cw' | 'ccw';
  onClick: () => void;
}

const PURPLE = '#5b4fc7';
const PURPLE_DEEP = '#3f33a8';
const SAGE = '#c7d4b8';
const SAGE_DEEP = '#a9bb96';
const PAPER = '#f4f3ee';

export function Desk({ name, available, reserved, reservedBy, rotate, onClick }: DeskProps) {
  const [hover, setHover] = useState(false);

  const isMine = reserved;
  const isFree = !reserved && available;
  const isTaken = !reserved && !available;

  const svgFill = isMine ? PURPLE_DEEP : isFree ? PURPLE : 'rgba(91,79,199,0.25)';

  const displayLabel = isFree
    ? 'free'
    : isMine
    ? 'yours'
    : reservedBy
    ? reservedBy.length > 7
      ? reservedBy.slice(0, 6) + '…'
      : reservedBy
    : 'taken';

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={isTaken ? undefined : onClick}
      title={
        isMine
          ? `${name} — your reservation (click to cancel)`
          : isFree
          ? `Reserve ${name}`
          : reservedBy
          ? `Reserved by ${reservedBy}`
          : `${name} is taken`
      }
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 74,
        height: 80,
        padding: '4px',
        gap: 1,
        borderRadius: 12,
        background: isMine ? SAGE : isFree ? PAPER : 'transparent',
        border: isMine
          ? `1.5px solid ${SAGE_DEEP}`
          : isFree
          ? '1px solid rgba(91,79,199,0.18)'
          : '1px dashed rgba(91,79,199,0.18)',
        color: isMine ? PURPLE_DEEP : isFree ? PURPLE : 'rgba(91,79,199,0.45)',
        cursor: isTaken ? 'default' : 'pointer',
        boxShadow: isMine
          ? '0 6px 16px -8px rgba(91,79,199,0.25)'
          : hover && isFree
          ? '0 8px 20px -10px rgba(91,79,199,0.20)'
          : 'none',
        transform: hover && !isTaken ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms, border-color 160ms',
        fontFamily: 'inherit',
        outline: 'none',
      }}
    >
      <svg
        viewBox="0 0 48 48"
        width={28}
        height={28}
        fill="none"
        aria-hidden="true"
        style={{
          transform: rotate === 'cw' ? 'rotate(90deg)' : 'rotate(-90deg)',
          transition: 'transform 200ms',
          flexShrink: 0,
        }}
      >
        <rect x="2" y="10" width="44" height="28" rx="2.5" fill={svgFill} />
        <rect x="17" y="13" width="14" height="5" rx="1.5" fill={PURPLE_DEEP} opacity="0.7" />
        <rect x="18" y="41" width="12" height="8" rx="2" fill={svgFill} />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {name}
      </span>
      <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 500, lineHeight: 1.1, textAlign: 'center' }}>
        {displayLabel}
      </span>
    </button>
  );
}
