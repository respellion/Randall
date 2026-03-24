export interface Workplace {
  id: string;
  name: string;
  location: string;
}

export interface AvailableWorkplace {
  id: string;
  name: string;
  location: string;
}

export interface Reservation {
  id: string;
  workplaceId: string;
  workplaceName: string;
  workplaceLocation: string;
  employeeName: string;
  employeeEmail: string;
  date: string;
  status: 'Active' | 'Cancelled';
  createdAt: string;
}

export interface WorkplaceScheduleItem {
  id: string;
  name: string;
  location: string;
  isAvailable: boolean;
  reservedBy: string | null;
}

export interface CreateReservationRequest {
  workplaceId: string;
  date: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface RegisterPendingResponse {
  message: string;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isApproved: boolean;
  isAdmin: boolean;
}
