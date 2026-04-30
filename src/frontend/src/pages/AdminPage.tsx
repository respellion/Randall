import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AdminUser, AuthResponse } from '../api/types';

const PURPLE = '#5b4fc7';
const PURPLE_DEEP = '#3f33a8';
const SAGE = '#c7d4b8';
const SAGE_DEEP = '#a9bb96';
const PAPER = '#f4f3ee';

interface AdminPageProps {
  auth: AuthResponse;
  onLogout: () => void;
}

function monogram(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function AdminPage({ auth, onLogout }: AdminPageProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [makingAdminId, setMakingAdminId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmAdminId, setConfirmAdminId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setUsers(await api.getAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      await api.approveUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isApproved: true } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleMakeAdmin(id: string) {
    setMakingAdminId(id);
    try {
      await api.makeAdmin(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isAdmin: true } : u));
      setConfirmAdminId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make user admin');
    } finally {
      setMakingAdminId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const totalUsers = users.length;
  const approvedCount = users.filter((u) => u.isApproved).length;
  const adminCount = users.filter((u) => u.isAdmin).length;
  const pendingCount = users.filter((u) => !u.isApproved).length;

  const kpis = [
    { label: 'Total users', value: String(totalUsers).padStart(2, '0') },
    { label: 'Approved', value: String(approvedCount).padStart(2, '0') },
    { label: 'Admins', value: String(adminCount).padStart(2, '0') },
    { label: 'Pending', value: String(pendingCount).padStart(2, '0') },
  ];

  const TABLE_COLS = '2fr 2fr 1fr 1fr auto';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 36px', flexShrink: 0,
        }}>
          {/* Wordmark + Admin badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 1,
                color: PURPLE,
                fontFamily: "'Rubik Mono One', monospace",
                fontSize: 18, letterSpacing: '-0.02em', cursor: 'pointer',
              }}
            >
              <span style={{ opacity: 0.6 }}>{'{'}</span>
              <span style={{ padding: '0 4px' }}>randall</span>
              <span style={{ opacity: 0.6 }}>{'}'}</span>
            </div>
            <span style={{
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: PURPLE, padding: '3px 9px', borderRadius: 99,
              border: '1px solid rgba(91,79,199,0.25)', fontWeight: 500,
            }}>
              Admin
            </span>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, color: PURPLE }}>
            <span style={{ fontWeight: 500 }}>Users</span>
            <button
              onClick={onLogout}
              style={{
                padding: '7px 18px', borderRadius: 99,
                background: SAGE, border: `1px solid ${SAGE_DEEP}`,
                color: PURPLE_DEEP, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Body */}
        <div style={{
          padding: '8px 36px 32px',
          display: 'flex', flexDirection: 'column', gap: 18,
          minHeight: 0, flex: 1, overflow: 'hidden',
        }}>
          {/* Hero */}
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: PURPLE, opacity: 0.7, marginBottom: 12, fontWeight: 500,
            }}>
              Users · The Hague HQ
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: "'Rubik Mono One', monospace",
              fontSize: 42, fontWeight: 400, letterSpacing: '-0.02em',
              lineHeight: 0.95, color: PURPLE,
            }}>
              Who can <span style={{ color: SAGE_DEEP }}>book?</span>
            </h1>
          </div>

          {/* KPI strip */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {kpis.map((k) => (
                <div key={k.label} style={{
                  background: PAPER, borderRadius: 14, padding: '14px 16px',
                  border: '1px solid rgba(91,79,199,0.10)',
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: PURPLE, opacity: 0.7, fontWeight: 500,
                  }}>
                    {k.label}
                  </div>
                  <div style={{
                    fontFamily: "'Rubik Mono One', monospace",
                    fontSize: 30, letterSpacing: '-0.02em', color: PURPLE,
                    marginTop: 4, lineHeight: 1,
                  }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users table card */}
          <div style={{
            background: PAPER, borderRadius: 18,
            border: '1px solid rgba(91,79,199,0.10)',
            flex: 1, display: 'flex', flexDirection: 'column',
            minHeight: 0, overflow: 'hidden',
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: '1px solid rgba(91,79,199,0.10)',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 12px', borderRadius: 99,
                border: '1px solid rgba(91,79,199,0.18)',
                background: 'rgba(255,255,255,0.4)',
                fontSize: 13, color: PURPLE, minWidth: 260,
              }}>
                <span style={{ opacity: 0.6 }}>⌕</span>
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    fontSize: 13, color: PURPLE, fontFamily: 'inherit',
                    flex: 1, opacity: search ? 1 : 0.6,
                  }}
                />
              </div>
              <button style={{
                padding: '8px 16px', borderRadius: 99,
                background: SAGE, border: `1px solid ${SAGE_DEEP}`,
                color: PURPLE_DEEP, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                + Add user
              </button>
            </div>

            {/* Table head */}
            <div style={{
              display: 'grid', gridTemplateColumns: TABLE_COLS,
              padding: '10px 18px',
              fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: PURPLE, opacity: 0.7, fontWeight: 500,
              borderBottom: '1px solid rgba(91,79,199,0.08)',
              flexShrink: 0,
            }}>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {/* Table rows */}
            <div style={{ overflow: 'auto', flex: 1 }}>
              {loading && (
                <p style={{ textAlign: 'center', color: PURPLE, opacity: 0.5, fontSize: 13, margin: '32px 0' }}>
                  Loading…
                </p>
              )}
              {error && (
                <p style={{ textAlign: 'center', color: '#c0392b', fontSize: 13, margin: '24px 0' }}>
                  {error}
                </p>
              )}
              {!loading && filtered.map((u, i) => {
                const busy = approvingId === u.id || makingAdminId === u.id || deletingId === u.id;
                const isLastRow = i === filtered.length - 1;

                return (
                  <div key={u.id} data-testid="user-row" style={{
                    display: 'grid', gridTemplateColumns: TABLE_COLS,
                    alignItems: 'center',
                    padding: '12px 18px',
                    fontSize: 13, color: PURPLE_DEEP,
                    borderBottom: isLastRow ? 'none' : '1px solid rgba(91,79,199,0.06)',
                  }}>
                    {/* Name */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: SAGE, border: `1px solid ${SAGE_DEEP}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 600, color: PURPLE_DEEP,
                        flexShrink: 0,
                      }}>
                        {monogram(u.name)}
                      </span>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </span>

                    {/* Email */}
                    <span style={{ color: PURPLE, opacity: 0.85, fontSize: 12 }}>{u.email}</span>

                    {/* Role badge */}
                    <span>
                      <span data-testid="role-badge" style={{
                        fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: 99, fontWeight: 500,
                        background: u.isAdmin ? SAGE : 'transparent',
                        border: `1px solid ${u.isAdmin ? SAGE_DEEP : 'rgba(91,79,199,0.20)'}`,
                        color: u.isAdmin ? PURPLE_DEEP : PURPLE,
                      }}>
                        {u.isAdmin ? 'admin' : 'employee'}
                      </span>
                    </span>

                    {/* Status */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: PURPLE }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: u.isApproved ? SAGE_DEEP : 'rgba(91,79,199,0.30)',
                      }} />
                      {u.isApproved ? 'Active' : 'Pending'}
                    </span>

                    {/* Actions */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {!u.isApproved && (
                        confirmAdminId !== u.id && confirmDeleteId !== u.id && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={busy}
                            style={{
                              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                              background: SAGE, border: `1px solid ${SAGE_DEEP}`,
                              color: PURPLE_DEEP, cursor: busy ? 'default' : 'pointer',
                              fontFamily: 'inherit', opacity: busy ? 0.5 : 1,
                            }}
                          >
                            {approvingId === u.id ? '…' : 'Approve'}
                          </button>
                        )
                      )}

                      {confirmAdminId === u.id ? (
                        <>
                          <span style={{ fontSize: 12, color: PURPLE, opacity: 0.7 }}>Make admin?</span>
                          <button
                            onClick={() => handleMakeAdmin(u.id)}
                            disabled={!!makingAdminId}
                            style={{
                              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                              background: PURPLE, border: `1px solid ${PURPLE_DEEP}`,
                              color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            {makingAdminId === u.id ? '…' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmAdminId(null)}
                            style={{
                              background: 'none', border: 'none', fontSize: 12,
                              color: PURPLE, opacity: 0.6, cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            No
                          </button>
                        </>
                      ) : confirmDeleteId === u.id ? (
                        <>
                          <span style={{ fontSize: 12, color: PURPLE, opacity: 0.7 }}>Delete?</span>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={!!deletingId}
                            style={{
                              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                              background: PURPLE_DEEP, border: `1px solid ${PURPLE_DEEP}`,
                              color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            {deletingId === u.id ? '…' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              background: 'none', border: 'none', fontSize: 12,
                              color: PURPLE, opacity: 0.6, cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          {!u.isAdmin && (
                            <button
                              onClick={() => setConfirmAdminId(u.id)}
                              disabled={busy}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                fontSize: 12, color: PURPLE, opacity: busy ? 0.4 : 0.65,
                                cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
                              }}
                            >
                              Admin
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            disabled={busy}
                            style={{
                              background: 'none', border: 'none', padding: 0,
                              fontSize: 12, color: PURPLE, opacity: busy ? 0.4 : 0.65,
                              cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
              {!loading && filtered.length === 0 && !error && (
                <p style={{ textAlign: 'center', color: PURPLE, opacity: 0.4, fontSize: 13, margin: '32px 0' }}>
                  {search ? 'No users match your search.' : 'No users found.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
