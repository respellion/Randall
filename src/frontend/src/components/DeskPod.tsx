import { Desk } from './Desk';

interface ScheduleItem {
  id: string;
  name: string;
  location: string;
  isAvailable: boolean;
  reservedBy: string | null;
}

interface DeskPodProps {
  label: string;
  desks: ScheduleItem[];
  myReservedIds: Set<string>;
  onDeskClick: (desk: ScheduleItem) => void;
}

export function DeskPod({ label, desks, myReservedIds, onDeskClick }: DeskPodProps) {
  const left = [...desks.slice(0, 4)].reverse();
  const right = [...desks.slice(4, 8)].reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '0 0 auto' }}>
      <div style={{
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--purple)',
        opacity: 0.6,
        fontWeight: 500,
      }}>
        {label}
      </div>
      <div style={{
        display: 'inline-flex',
        gap: 10,
        padding: '10px',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: 14,
        border: '1px solid rgba(91,79,199,0.08)',
        width: 'fit-content',
        alignSelf: 'flex-start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {left.map((desk) => (
            <Desk
              key={desk.id}
              name={desk.name}
              available={desk.isAvailable}
              reserved={myReservedIds.has(desk.id)}
              reservedBy={desk.reservedBy ?? undefined}
              rotate="cw"
              onClick={() => onDeskClick(desk)}
            />
          ))}
        </div>
        <div style={{ width: 1, background: 'rgba(91,79,199,0.10)', alignSelf: 'stretch' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {right.map((desk) => (
            <Desk
              key={desk.id}
              name={desk.name}
              available={desk.isAvailable}
              reserved={myReservedIds.has(desk.id)}
              reservedBy={desk.reservedBy ?? undefined}
              rotate="ccw"
              onClick={() => onDeskClick(desk)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
