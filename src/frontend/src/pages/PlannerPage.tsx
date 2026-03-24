import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AuthResponse, Reservation, WorkplaceScheduleItem } from '../api/types';
import { DeskPod } from '../components/DeskPod';
import { ReservationModal } from '../components/ReservationModal';
import { CancelModal } from '../components/CancelModal';
import { MyReservations } from '../components/MyReservations';

function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function offsetDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

interface PlannerPageProps {
  auth: AuthResponse;
  onLogout: () => void;
}

export function PlannerPage({ auth, onLogout }: PlannerPageProps) {
  const navigate = useNavigate();

  const today = toIsoDate(new Date());
  const maxDate = toIsoDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState<WorkplaceScheduleItem[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loadingFloor, setLoadingFloor] = useState(false);
  const [floorError, setFloorError] = useState('');
  const [reserveTarget, setReserveTarget] = useState<WorkplaceScheduleItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  const loadSchedule = useCallback(async (date: string) => {
    setLoadingFloor(true);
    setFloorError('');
    try {
      setSchedule(await api.getWorkplaceSchedule(date));
    } catch (err) {
      setFloorError(err instanceof Error ? err.message : 'Failed to load floor plan');
    } finally {
      setLoadingFloor(false);
    }
  }, []);

  useEffect(() => { loadSchedule(selectedDate); }, [selectedDate, loadSchedule]);
  useEffect(() => { api.getMyReservations().then(setMyReservations).catch(() => {}); }, []);

  const myReservedIdsOnDate = new Set(
    myReservations
      .filter((r) => r.status === 'Active' && r.date === selectedDate)
      .map((r) => r.workplaceId),
  );

  function handleDeskClick(desk: WorkplaceScheduleItem) {
    if (myReservedIdsOnDate.has(desk.id)) {
      const res = myReservations.find(
        (r) => r.workplaceId === desk.id && r.date === selectedDate && r.status === 'Active',
      );
      if (res) setCancelTarget(res);
    } else if (desk.isAvailable) {
      setReserveTarget(desk);
    }
  }

  async function handleReserve() {
    if (!reserveTarget) return;
    await api.createReservation({ workplaceId: reserveTarget.id, date: selectedDate });
    setReserveTarget(null);
    await Promise.all([loadSchedule(selectedDate), api.getMyReservations().then(setMyReservations)]);
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    await api.cancelReservation(cancelTarget.id);
    setCancelTarget(null);
    await Promise.all([loadSchedule(selectedDate), api.getMyReservations().then(setMyReservations)]);
  }

  const podA = schedule.filter((w) => w.location === 'Pod A');
  const podB = schedule.filter((w) => w.location === 'Pod B');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Office Planner</h1>
            <p className="text-xs text-slate-400 mt-0.5">Reserve your workspace up to 2 weeks ahead</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{auth.name}</span>
            {auth.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Admin portal
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        <section className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Date</label>
          <button
            onClick={() => setSelectedDate(offsetDate(selectedDate, -1))}
            disabled={selectedDate <= today}
            className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <input
            type="date"
            value={selectedDate}
            min={today}
            max={maxDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
          <button
            onClick={() => setSelectedDate(offsetDate(selectedDate, 1))}
            disabled={selectedDate >= maxDate}
            className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
          <span className="text-sm text-slate-500 font-medium">{formatDisplayDate(selectedDate)}</span>
        </section>

        <div className="flex gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400 inline-block" />
            Available — click to reserve
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-400 inline-block" />
            Your reservation — click to cancel
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
            Taken — hover to see who
          </span>
        </div>

        <section>
          {loadingFloor && <p className="text-sm text-slate-400 text-center py-12">Loading floor plan…</p>}
          {floorError && <p className="text-sm text-red-500 text-center py-12">{floorError}</p>}
          {!loadingFloor && !floorError && (
            <div className="flex flex-wrap gap-12 justify-center">
              <DeskPod desks={podA} myReservedIds={myReservedIdsOnDate} onDeskClick={handleDeskClick} />
              <DeskPod desks={podB} myReservedIds={myReservedIdsOnDate} onDeskClick={handleDeskClick} />
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700 mb-4">My reservations</h2>
          <MyReservations reservations={myReservations} onCancel={setCancelTarget} />
        </section>
      </main>

      {reserveTarget && (
        <ReservationModal
          deskName={reserveTarget.name}
          date={formatDisplayDate(selectedDate)}
          onConfirm={handleReserve}
          onClose={() => setReserveTarget(null)}
        />
      )}
      {cancelTarget && (
        <CancelModal
          deskName={cancelTarget.workplaceName}
          date={formatDisplayDate(cancelTarget.date)}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
