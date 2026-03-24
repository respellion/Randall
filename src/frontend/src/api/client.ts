import type { AdminUser, AuthResponse, CreateReservationRequest, PendingUser, RegisterPendingResponse, Reservation, WorkplaceScheduleItem } from './types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(email: string, name: string, password: string): Promise<RegisterPendingResponse> {
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    return handleResponse<RegisterPendingResponse>(res);
  },

  getAdminUsers(): Promise<AdminUser[]> {
    return fetch(`${BASE}/admin/users`, {
      headers: authHeaders(),
    }).then(handleResponse<AdminUser[]>);
  },

  getPendingUsers(): Promise<PendingUser[]> {
    return fetch(`${BASE}/admin/users/pending`, {
      headers: authHeaders(),
    }).then(handleResponse<PendingUser[]>);
  },

  async makeAdmin(id: string): Promise<void> {
    const res = await fetch(`${BASE}/admin/users/${id}/make-admin`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail ?? `Request failed: ${res.status}`);
    }
  },

  async approveUser(id: string): Promise<void> {
    const res = await fetch(`${BASE}/admin/users/${id}/approve`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail ?? `Request failed: ${res.status}`);
    }
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail ?? `Request failed: ${res.status}`);
    }
  },

  getWorkplaceSchedule(date: string): Promise<WorkplaceScheduleItem[]> {
    return fetch(`${BASE}/workplaces/schedule?date=${date}`, {
      headers: authHeaders(),
    }).then(handleResponse<WorkplaceScheduleItem[]>);
  },

  createReservation(data: CreateReservationRequest): Promise<{ id: string }> {
    return fetch(`${BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handleResponse<{ id: string }>);
  },

  getMyReservations(): Promise<Reservation[]> {
    return fetch(`${BASE}/reservations/my`, {
      headers: authHeaders(),
    }).then(handleResponse<Reservation[]>);
  },

  async cancelReservation(id: string): Promise<void> {
    const res = await fetch(`${BASE}/reservations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail ?? `Request failed: ${res.status}`);
    }
  },
};
