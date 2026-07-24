import { api } from './api';

export interface AdminStats {
  totalStaff: number;
  activePlayers: number;
  pendingApprovals: number;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  date: string;
  status: string;
}

/** Yonetim paneli uclarina ince sarmalayici. */
export const adminApi = {
  stats(): Promise<AdminStats> {
    return api.get<AdminStats>('/admin/stats');
  },

  pendingUsers(): Promise<PendingUser[]> {
    return api.get<PendingUser[]>('/admin/pending-users');
  },

  approve(userId: string): Promise<void> {
    return api.post<void>(`/admin/users/${encodeURIComponent(userId)}/approve`);
  },

  reject(userId: string): Promise<void> {
    return api.post<void>(`/admin/users/${encodeURIComponent(userId)}/reject`);
  },
};
