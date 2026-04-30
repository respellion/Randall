import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AuthResponse, Reservation, WorkplaceScheduleItem } from '../api/types';
import { DeskPod } from '../components/DeskPod';
import { ReservationModal } from '../components/ReservationModal';
import { CancelModal } from '../components/CancelModal';
import { MyReservations } from '../components/MyReservations';

const PURPLE = '#5b4fc7';
const PURPLE_DEEP = '#3f33a8';
const SAGE = '#c7d4b8';
const SAGE_DEEP = '#a9bb96';
const PAPER = '#f4f3ee';

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

function formatKickerDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
  const month = date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  return `${weekday}, ${d} ${month} · THE HAGUE HQ`;
}

function formatRelativeTime(isoString: string): string {
  const created = new Date(isoString);
  const now = new Date();
  const mins = Math.floor((now.getTime() - created.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Earlier today';
}

function getDayOffset(isoDate: string, isoToday: string): number {
  const [y1, m1, d1] = isoDate.split('-').map(Number);
  const [y2, m2, d2] = isoToday.split('-').map(Number);
  const a = new Date(y1, m1 - 1, d1).getTime();
  const b = new Date(y2, m2 - 1, d2).getTime();
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

function getTrailingWord(dayOffset: number): string {
  if (dayOffset === 0) return 'today?';
  if (dayOffset === 1) return 'tomorrow?';
  return 'then?';
}

function formatDayCell(isoDate: string): { weekday: string; day: number; monthTag: string | null } {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase().slice(0, 3);
  const monthTag = d === 1
    ? date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
    : null;
  return { weekday, day: d, monthTag };
}

interface PlannerPageProps {
  auth: AuthResponse;
  onLogout: () => void;
}

export function PlannerPage({ auth, onLogout }: PlannerPageProps) {
  const navigate = useNavigate();

  const today = toIsoDate(new Date());
  const MAX_OFFSET = 13;

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

  const myDeskOnDate = myReservations.find(
    (r) => r.status === 'Active' && r.date === selectedDate,
  );
  const myDeskSchedule = myDeskOnDate
    ? schedule.find((w) => w.id === myDeskOnDate.workplaceId)
    : null;
  const neighbours = myDeskSchedule
    ? schedule
        .filter(
          (w) =>
            w.location === myDeskSchedule.location &&
            !w.isAvailable &&
            w.id !== myDeskSchedule.id &&
            w.reservedBy !== null,
        )
        .map((w) => w.reservedBy!.split(' ')[0])
        .join(', ')
    : '';

  const freeCount = schedule.filter((w) => w.isAvailable).length;
  const dayOffset = getDayOffset(selectedDate, today);
  const trailingWord = getTrailingWord(dayOffset);
  const dayStrip = Array.from({ length: 14 }, (_, i) => offsetDate(today, i));

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

  const arrowBtnStyle = (disabled: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    color: PURPLE,
    opacity: disabled ? 0.35 : 0.65,
    fontSize: 16,
    padding: '0 4px',
    fontFamily: 'inherit',
    flexShrink: 0,
    lineHeight: 1,
  });

  return (
    /* Outer bg fills the full viewport */
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Centred 1100 px frame */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 36px',
          flexShrink: 0,
        }}>
          {/* Wordmark */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: PURPLE,
            fontFamily: "'Rubik Mono One', 'Major Mono Display', monospace",
            fontSize: 18,
            letterSpacing: '-0.02em',
          }}>
            <span style={{ fontWeight: 400, opacity: 0.6 }}>{'{'}</span>
            <span style={{ padding: '0 4px' }}>randall</span>
            <span style={{ fontWeight: 400, opacity: 0.6 }}>{'}'}</span>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, color: PURPLE }}>
            <span style={{ fontWeight: 500 }}>Today</span>
            {auth.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: 'none', border: 'none', fontFamily: 'inherit',
                  fontSize: 13, color: PURPLE, opacity: 0.6, cursor: 'pointer', padding: 0,
                }}
              >
                Admin
              </button>
            )}
            <button
              onClick={onLogout}
              style={{
                padding: '7px 18px',
                borderRadius: 99,
                background: SAGE,
                border: `1px solid ${SAGE_DEEP}`,
                color: PURPLE_DEEP,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sign out
            </button>
            <span style={{ fontSize: 12, color: PURPLE, opacity: 0.6, cursor: 'default' }}>NL ▾</span>
          </div>
        </header>

        {/* Body */}
        <div style={{
          display: 'flex',
          flex: 1,
          gap: 32,
          padding: '8px 36px 32px',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {/* Left column */}
          <div style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            overflow: 'auto',
          }}>
            {/* Editorial hero */}
            <div>
              {/* Kicker */}
              <div style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PURPLE,
                opacity: 0.7,
                fontWeight: 500,
                marginBottom: 14,
              }}>
                {formatKickerDate(selectedDate)}
              </div>

              {/* Headline */}
              <h1 style={{
                margin: 0,
                fontFamily: "'Rubik Mono One', 'Major Mono Display', monospace",
                fontSize: 46,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 0.95,
                color: PURPLE,
              }}>
                Where to sit{' '}
                <span style={{ color: SAGE_DEEP }}>{trailingWord}</span>
              </h1>

              {/* Body copy */}
              <p style={{
                margin: '10px 0 0',
                maxWidth: 480,
                fontSize: 13,
                lineHeight: 1.5,
                color: PURPLE,
                opacity: 0.85,
              }}>
                {loadingFloor
                  ? 'Loading floor plan…'
                  : floorError
                  ? floorError
                  : myDeskOnDate
                  ? `${freeCount} ${freeCount === 1 ? 'desk is' : 'desks are'} free, you're holding ${myDeskOnDate.workplaceName}. Pick another or swap with a teammate.`
                  : `${freeCount} ${freeCount === 1 ? 'desk is' : 'desks are'} free. Pick one to hold your spot.`}
              </p>

              {/* 14-day date strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
                <button
                  onClick={() => setSelectedDate(offsetDate(selectedDate, -1))}
                  disabled={dayOffset === 0}
                  style={arrowBtnStyle(dayOffset === 0)}
                >
                  ←
                </button>
                <div style={{ display: 'flex', gap: 5, flex: 1 }}>
                  {dayStrip.map((dateIso) => {
                    const isActive = dateIso === selectedDate;
                    const { weekday, day, monthTag } = formatDayCell(dateIso);
                    return (
                      <button
                        key={dateIso}
                        data-date={dateIso}
                        onClick={() => setSelectedDate(dateIso)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: '1 0 0',
                          padding: '6px 2px',
                          borderRadius: 10,
                          background: isActive ? SAGE : 'transparent',
                          border: isActive
                            ? `1.5px solid ${SAGE_DEEP}`
                            : '1px solid rgba(91,79,199,0.18)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          gap: 2,
                          transition: 'background 150ms, border-color 150ms',
                        }}
                      >
                        <span style={{
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: PURPLE,
                          opacity: isActive ? 0.85 : 0.55,
                          lineHeight: 1,
                        }}>
                          {weekday}
                        </span>
                        <span style={{
                          fontFamily: "'Rubik Mono One', monospace",
                          fontSize: 18,
                          color: isActive ? PURPLE_DEEP : PURPLE,
                          lineHeight: 1,
                        }}>
                          {day}
                        </span>
                        {monthTag && (
                          <span style={{
                            fontSize: 8,
                            fontWeight: 500,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: PURPLE,
                            opacity: 0.5,
                            lineHeight: 1,
                          }}>
                            {monthTag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setSelectedDate(offsetDate(selectedDate, 1))}
                  disabled={dayOffset >= MAX_OFFSET}
                  style={arrowBtnStyle(dayOffset >= MAX_OFFSET)}
                >
                  →
                </button>
              </div>
            </div>

            {/* Floor card */}
            <div style={{
              background: PAPER,
              borderRadius: 18,
              padding: 22,
              border: '1px solid rgba(91,79,199,0.10)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Legend */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: 16,
                gap: 14,
                fontSize: 11,
                color: PURPLE,
                opacity: 0.75,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: PAPER, border: '1px solid rgba(91,79,199,0.4)',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  free
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: SAGE, border: `1px solid ${SAGE_DEEP}`,
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  yours
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 2,
                    border: '1px dashed rgba(91,79,199,0.4)',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  taken
                </span>
              </div>

              {/* Pods */}
              {!loadingFloor && !floorError && (
                <div style={{
                  display: 'flex',
                  gap: 36,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}>
                  <DeskPod label="Pod A" desks={podA} myReservedIds={myReservedIdsOnDate} onDeskClick={handleDeskClick} />
                  <DeskPod label="Pod B" desks={podB} myReservedIds={myReservedIdsOnDate} onDeskClick={handleDeskClick} />
                </div>
              )}
              {loadingFloor && (
                <p style={{ textAlign: 'center', color: PURPLE, opacity: 0.5, fontSize: 13, margin: '32px 0' }}>
                  Loading…
                </p>
              )}
              {floorError && (
                <p style={{ textAlign: 'center', color: '#c0392b', fontSize: 13, margin: '32px 0' }}>
                  {floorError}
                </p>
              )}
            </div>
          </div>

          {/* Right rail */}
          <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', flexShrink: 0 }}>
            {/* Your desk card */}
            <div style={{
              background: PAPER,
              borderRadius: 18,
              padding: 22,
              border: '1px solid rgba(91,79,199,0.10)',
              flexShrink: 0,
            }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: PURPLE, opacity: 0.7, marginBottom: 8, fontWeight: 500,
              }}>
                Your desk
              </div>

              <div style={{
                fontFamily: "'Rubik Mono One', monospace",
                fontSize: 46, letterSpacing: '-0.03em', color: PURPLE,
                lineHeight: 0.95, marginBottom: 6,
              }}>
                {myDeskOnDate?.workplaceName ?? '—'}
              </div>

              <div style={{ fontSize: 13, color: PURPLE, opacity: 0.75, marginBottom: 18 }}>
                {myDeskOnDate
                  ? `${myDeskOnDate.workplaceLocation} · Held ${formatRelativeTime(myDeskOnDate.createdAt)}`
                  : 'No desk held for this day'}
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 7,
                fontSize: 13, color: PURPLE, marginBottom: 18,
                borderTop: '1px solid rgba(91,79,199,0.10)', paddingTop: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.65 }}>Date</span>
                  <span>{formatDisplayDate(selectedDate)}</span>
                </div>
                {myDeskOnDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.65 }}>Neighbours</span>
                    <span style={{ textAlign: 'right', maxWidth: 140 }}>
                      {neighbours || '—'}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.65 }}>Streak</span>
                  <span>—</span>
                </div>
              </div>

              </div>

            {/* My reservations card */}
            <div style={{
              background: PAPER,
              borderRadius: 18,
              padding: 22,
              border: '1px solid rgba(91,79,199,0.10)',
            }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: PURPLE, opacity: 0.7, marginBottom: 14, fontWeight: 500,
              }}>
                My reservations
              </div>
              <MyReservations reservations={myReservations} onCancel={setCancelTarget} />
            </div>
          </div>
        </div>
      </div>

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
