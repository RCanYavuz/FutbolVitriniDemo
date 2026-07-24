import type { User } from '../store/types';
import { api } from './api';

export interface LoginPayload {
  username: string;
  password: string;
}

export type RegisterPosition = 'GK' | 'DF' | 'MF' | 'FW';
export type RegisterPreferredFoot = 'left' | 'right' | 'both';
export type RegisterClubSubRole = 'scout' | 'coach';

export interface RegisterPayload {
  username: string;
  email: string;
  displayName: string;
  password: string;
  role: 'player' | 'club';
  subRole?: RegisterClubSubRole;
  avatarUrl?: string;
  position?: RegisterPosition;
  preferredFoot?: RegisterPreferredFoot;
  birthDate?: string;
  currentClub?: string;
  organization?: string;
  expertise?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResult {
  status: 'pending';
  message: string;
}

/** Backend auth uclarina ince sarmalayici. */
export const authApi = {
  async login(payload: LoginPayload): Promise<User> {
    const { user } = await api.post<AuthResponse>('/auth/login', payload);
    return user;
  },

  register(payload: RegisterPayload): Promise<RegisterResult> {
    return api.post<RegisterResult>('/auth/register', payload);
  },

  logout(): Promise<void> {
    return api.post<void>('/auth/logout');
  },

  me(): Promise<User> {
    return api.get<User>('/users/me');
  },
};
