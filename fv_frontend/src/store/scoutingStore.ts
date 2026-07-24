import { create } from 'zustand';
import { playersApi } from '../lib/players.api';
import type { Player, Position } from './types';
import { mockPlayers } from './mockData';

/* ═══════════════════════════════════════════════════════════════════
   FM-STYLE STAT DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */

export interface FMStatRange {
  min: number;
  max: number;
}

/** All 1–20 based */
export interface TechnicalStats {
  finishing: FMStatRange;
  firstTouch: FMStatRange;
  passing: FMStatRange;
  crossing: FMStatRange;
  dribbling: FMStatRange;
  heading: FMStatRange;
  longShots: FMStatRange;
  marking: FMStatRange;
  tackling: FMStatRange;
  technique: FMStatRange;
}

export interface MentalStats {
  aggression: FMStatRange;
  anticipation: FMStatRange;
  bravery: FMStatRange;
  composure: FMStatRange;
  concentration: FMStatRange;
  decisions: FMStatRange;
  determination: FMStatRange;
  flair: FMStatRange;
  leadership: FMStatRange;
  offTheBall: FMStatRange;
  positioning: FMStatRange;
  teamwork: FMStatRange;
  vision: FMStatRange;
  workRate: FMStatRange;
}

export interface PhysicalStats {
  acceleration: FMStatRange;
  agility: FMStatRange;
  balance: FMStatRange;
  jumpingReach: FMStatRange;
  naturalFitness: FMStatRange;
  pace: FMStatRange;
  stamina: FMStatRange;
  strength: FMStatRange;
}

export type PreferredFoot = 'any' | 'left' | 'right' | 'both';

/* ═══════════════════════════════════════════════════════════════════
   SCOUTING FILTERS
   ═══════════════════════════════════════════════════════════════════ */

export interface ScoutingFilters {
  ageRange: [number, number];
  positions: Position[];
  preferredFoot: PreferredFoot;
  minAiScore: number;
  technicalStats: TechnicalStats;
  mentalStats: MentalStats;
  physicalStats: PhysicalStats;
}

function createDefaultRange(): FMStatRange {
  return { min: 1, max: 20 };
}

function createDefaultTechnical(): TechnicalStats {
  return {
    finishing: createDefaultRange(),
    firstTouch: createDefaultRange(),
    passing: createDefaultRange(),
    crossing: createDefaultRange(),
    dribbling: createDefaultRange(),
    heading: createDefaultRange(),
    longShots: createDefaultRange(),
    marking: createDefaultRange(),
    tackling: createDefaultRange(),
    technique: createDefaultRange(),
  };
}

function createDefaultMental(): MentalStats {
  return {
    aggression: createDefaultRange(),
    anticipation: createDefaultRange(),
    bravery: createDefaultRange(),
    composure: createDefaultRange(),
    concentration: createDefaultRange(),
    decisions: createDefaultRange(),
    determination: createDefaultRange(),
    flair: createDefaultRange(),
    leadership: createDefaultRange(),
    offTheBall: createDefaultRange(),
    positioning: createDefaultRange(),
    teamwork: createDefaultRange(),
    vision: createDefaultRange(),
    workRate: createDefaultRange(),
  };
}

function createDefaultPhysical(): PhysicalStats {
  return {
    acceleration: createDefaultRange(),
    agility: createDefaultRange(),
    balance: createDefaultRange(),
    jumpingReach: createDefaultRange(),
    naturalFitness: createDefaultRange(),
    pace: createDefaultRange(),
    stamina: createDefaultRange(),
    strength: createDefaultRange(),
  };
}

const defaultFilters: ScoutingFilters = {
  ageRange: [16, 35],
  positions: ['GK', 'DF', 'MF', 'FW'],
  preferredFoot: 'any',
  minAiScore: 5.0,
  technicalStats: createDefaultTechnical(),
  mentalStats: createDefaultMental(),
  physicalStats: createDefaultPhysical(),
};

/* ═══════════════════════════════════════════════════════════════════
   SCOUTING STORE
   ═══════════════════════════════════════════════════════════════════ */

interface ScoutingState {
  players: Player[];
  isLoadingPlayers: boolean;
  playersError: string | null;
  filters: ScoutingFilters;
  comparisonSelection: string[];
  searchQuery: string;
  drawerOpen: boolean;
  filteredPlayers: () => Player[];
  loadPlayers: () => Promise<void>;

  /* ── Filter actions ── */
  setAgeRange: (range: [number, number]) => void;
  togglePosition: (pos: Position) => void;
  setPreferredFoot: (foot: PreferredFoot) => void;
  setMinAiScore: (score: number) => void;
  setTechnicalStat: (key: keyof TechnicalStats, range: FMStatRange) => void;
  setMentalStat: (key: keyof MentalStats, range: FMStatRange) => void;
  setPhysicalStat: (key: keyof PhysicalStats, range: FMStatRange) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;

  /* ── Comparison actions ── */
  toggleComparison: (id: string) => void;
  clearComparison: () => void;

  /* ── Drawer ── */
  openDrawer: (playerId: string) => void;
  closeDrawer: () => void;
}

let activePlayersLoad: Promise<void> | null = null;

export const useScoutingStore = create<ScoutingState>((set, get) => ({
  players: mockPlayers,
  isLoadingPlayers: false,
  playersError: null,
  filters: { ...defaultFilters },
  comparisonSelection: [],
  searchQuery: '',
  drawerOpen: false,

  loadPlayers: () => {
    if (activePlayersLoad) return activePlayersLoad;

    activePlayersLoad = (async () => {
      set({ isLoadingPlayers: true, playersError: null });
      try {
        const players = await playersApi.listAll();
        set({ players, isLoadingPlayers: false });
      } catch {
        set({
          players: mockPlayers,
          isLoadingPlayers: false,
          playersError: 'Oyuncular sunucudan alınamadı. Örnek oyuncular gösteriliyor.',
        });
      }
    })().finally(() => {
      activePlayersLoad = null;
    });

    return activePlayersLoad;
  },

  filteredPlayers: () => {
    const { players, filters, searchQuery } = get();
    return players.filter((p) => {
      const inAge = p.age >= filters.ageRange[0] && p.age <= filters.ageRange[1];
      const inPos = filters.positions.includes(p.position);
      const aboveScore = p.aiScore >= filters.minAiScore;
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase());
      return inAge && inPos && aboveScore && matchesSearch;
    });
  },

  /* ── Filter setters ── */
  setAgeRange: (range) =>
    set((s) => ({ filters: { ...s.filters, ageRange: range } })),

  togglePosition: (pos) =>
    set((s) => {
      const current = s.filters.positions;
      const next = current.includes(pos)
        ? current.filter((p) => p !== pos)
        : [...current, pos];
      return { filters: { ...s.filters, positions: next } };
    }),

  setPreferredFoot: (foot) =>
    set((s) => ({ filters: { ...s.filters, preferredFoot: foot } })),

  setMinAiScore: (score) =>
    set((s) => ({ filters: { ...s.filters, minAiScore: score } })),

  setTechnicalStat: (key, range) =>
    set((s) => ({
      filters: {
        ...s.filters,
        technicalStats: { ...s.filters.technicalStats, [key]: range },
      },
    })),

  setMentalStat: (key, range) =>
    set((s) => ({
      filters: {
        ...s.filters,
        mentalStats: { ...s.filters.mentalStats, [key]: range },
      },
    })),

  setPhysicalStat: (key, range) =>
    set((s) => ({
      filters: {
        ...s.filters,
        physicalStats: { ...s.filters.physicalStats, [key]: range },
      },
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () =>
    set({
      filters: {
        ...defaultFilters,
        technicalStats: createDefaultTechnical(),
        mentalStats: createDefaultMental(),
        physicalStats: createDefaultPhysical(),
      },
    }),

  /* ── Comparison ── */
  toggleComparison: (id) =>
    set((s) => {
      const current = s.comparisonSelection;
      if (current.includes(id)) {
        return { comparisonSelection: current.filter((c) => c !== id) };
      }
      if (current.length >= 3) return s;
      return { comparisonSelection: [...current, id] };
    }),

  clearComparison: () => set({ comparisonSelection: [] }),

  /* ── Drawer ── */
  openDrawer: (playerId) =>
    set((s) => {
      const current = s.comparisonSelection;
      if (!current.includes(playerId)) {
        return {
          drawerOpen: true,
          comparisonSelection: current.length >= 3
            ? current
            : [...current, playerId],
        };
      }
      return { drawerOpen: true };
    }),

  closeDrawer: () => set({ drawerOpen: false }),
}));
