import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { AdminUser } from '../api/types';

export function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setUsers((prev) => prev.filter((u) => u.id !== id));
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

  const pending = users.filter((u) => !u.isApproved);
  const approved = users.filter((u) => u.isApproved);

  function UserRow({ user }: { user: AdminUser }) {
    const busy = approvingId === user.id || makingAdminId === user.id || deletingId === user.id;

    return (
      <li className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-800">{user.name}</p>
            {user.isAdmin && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="flex gap-2 items-center">
          {!user.isApproved && (
            <button
              onClick={() => handleApprove(user.id)}
              disabled={busy || confirmAdminId === user.id || confirmDeleteId === user.id}
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {approvingId === user.id ? '…' : 'Approve'}
            </button>
          )}

          {!user.isAdmin && confirmAdminId === user.id ? (
            <>
              <span className="text-sm text-slate-500">Make admin?</span>
              <button
                onClick={() => handleMakeAdmin(user.id)}
                disabled={makingAdminId === user.id}
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {makingAdminId === user.id ? '…' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmAdminId(null)}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            !user.isAdmin && (
              <button
                onClick={() => setConfirmAdminId(user.id)}
                disabled={busy || confirmDeleteId === user.id}
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                Make admin
              </button>
            )
          )}

          {confirmDeleteId === user.id ? (
            <>
              <span className="text-sm text-slate-500">Sure?</span>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingId === user.id}
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === user.id ? '…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDeleteId(user.id)}
              disabled={busy || confirmAdminId === user.id}
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage user accounts</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Back to planner
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {loading && <p className="text-sm text-slate-400 text-center py-12">Loading…</p>}
        {error && <p className="text-sm text-red-500 text-center py-4">{error}</p>}

        {!loading && (
          <>
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Pending approval
              </h2>
              {pending.length === 0 ? (
                <p className="text-sm text-slate-400">No pending accounts.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {pending.map((u) => <UserRow key={u.id} user={u} />)}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Approved accounts
              </h2>
              {approved.length === 0 ? (
                <p className="text-sm text-slate-400">No approved accounts yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {approved.map((u) => <UserRow key={u.id} user={u} />)}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
