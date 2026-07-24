export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface PlayerStats {
  pace: number;
  passing: number;
  defending: number;
  physical: number;
  tackling: number;
  vision: number;
  dribbling: number;
  shooting: number;
}

export interface PlayerMetrics {
  sprintSpeed: number;
  shotPower: number;
  passingAcc: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  position: Position;
  team: string;
  aiScore: number;
  matchPercentage?: number;
  stats: PlayerStats;
  metrics: PlayerMetrics;
  imageUrl: string;
  aiReasoning?: string;
}

export interface Filters {
  ageRange: [number, number];
  positions: Position[];
  minAiScore: number;
}

/* ─── Auth Types ───────────────────────────────────────────────── */
export type UserRole = 'admin' | 'club' | 'player';
export type UserSubRole = 'admin' | 'scout' | 'coach' | 'player';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  subRole: UserSubRole;
  avatarUrl: string;
  position?: Position | null;
  preferredFoot?: 'left' | 'right' | 'both' | null;
  birthDate?: string | null;
  currentClub?: string | null;
  organization?: string | null;
  expertise?: string | null;
}

export interface MockCredential {
  username: string;
  password: string;
  user: User;
}
