import { Desk } from './Desk';

interface ScheduleItem {
  id: string;
  name: string;
  location: string;
  isAvailable: boolean;
  reservedBy: string | null;
}

interface DeskPodProps {
  desks: ScheduleItem[];
  myReservedIds: Set<string>;
  onDeskClick: (desk: ScheduleItem) => void;
}

export function DeskPod({ desks, myReservedIds, onDeskClick }: DeskPodProps) {
  const left = [...desks.slice(0, 4)].reverse();
  const right = [...desks.slice(4, 8)].reverse();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex gap-6">
          <div className="flex flex-col gap-3">
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

          <div className="w-px bg-slate-100" />

          <div className="flex flex-col gap-3">
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
    </div>
  );
}
