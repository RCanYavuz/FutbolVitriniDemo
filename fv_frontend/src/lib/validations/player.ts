/**
 * Zod şemaları — Oyuncu verisi ve filtre state'i için tip-güvenli doğrulama.
 *
 * Backend'in Player modeli (prisma/schema.prisma) ve mevcut store/types.ts
 * ile birebir uyumludur. Yeni anasayfa bileşenleri bu şemaları kullanır;
 * mevcut scouting bileşenleri kendi tiplerini kullanmaya devam eder.
 */

import { z } from 'zod';

/* ═══════════════════════════════════════════════════════════════════
   ENUMS & CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

export const POSITIONS = ['GK', 'DF', 'MF', 'FW'] as const;
export const PREFERRED_FEET = ['left', 'right', 'both'] as const;
export const PLAYER_STATUSES = ['free', 'loan', 'sale', 'all'] as const;
export const SORT_OPTIONS = ['rating', 'age', 'value', 'name'] as const;
export const VIEW_MODES = ['grid', 'list'] as const;

/** Detaylı mevki etiketleri (Sahibinden kategori ağacı için) */
export const POSITION_TREE = {
  GK: { label: 'Kaleci', children: [] },
  DF: {
    label: 'Defans',
    children: [
      { value: 'CB', label: 'Stoper' },
      { value: 'FB', label: 'Bek' },
    ],
  },
  MF: {
    label: 'Orta Saha',
    children: [
      { value: 'CDM', label: 'Defansif Orta Saha' },
      { value: 'CM', label: 'Merkez Orta Saha' },
      { value: 'CAM', label: 'Ofansif Orta Saha' },
      { value: 'WM', label: 'Kanat' },
    ],
  },
  FW: {
    label: 'Forvet',
    children: [
      { value: 'ST', label: 'Santrafor' },
      { value: 'CF', label: 'Sahte 9' },
      { value: 'WF', label: 'Kanat Forveti' },
    ],
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════
   PLAYER SCHEMAS
   ═══════════════════════════════════════════════════════════════════ */

export const PositionSchema = z.enum(POSITIONS);

export const PlayerStatsSchema = z.object({
  pace: z.number().min(0).max(100),
  passing: z.number().min(0).max(100),
  defending: z.number().min(0).max(100),
  physical: z.number().min(0).max(100),
  tackling: z.number().min(0).max(100),
  vision: z.number().min(0).max(100),
  dribbling: z.number().min(0).max(100),
  shooting: z.number().min(0).max(100),
});

export const PlayerMetricsSchema = z.object({
  sprintSpeed: z.number().min(0).max(100),
  shotPower: z.number().min(0).max(100),
  passingAcc: z.number().min(0).max(100),
});

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  age: z.number().int().min(10).max(60),
  position: PositionSchema,
  team: z.string(),
  aiScore: z.number().min(0).max(10),
  matchPercentage: z.number().int().min(0).max(100).optional(),
  aiReasoning: z.string().optional(),
  imageUrl: z.string(),
  stats: PlayerStatsSchema,
  metrics: PlayerMetricsSchema,
});

export const PaginatedPlayersSchema = z.object({
  items: z.array(PlayerSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pageCount: z.number(),
});

/* ═══════════════════════════════════════════════════════════════════
   FILTER SCHEMA (URL searchParams)
   ═══════════════════════════════════════════════════════════════════ */

export const PlayerFilterSchema = z.object({
  /** Serbest metin arama */
  query: z.string().default(''),
  /** Seçili mevkiler (boş = hepsi) */
  positions: z.array(PositionSchema).default([]),
  /** Yaş aralığı */
  ageMin: z.coerce.number().int().min(10).max(60).default(16),
  ageMax: z.coerce.number().int().min(10).max(60).default(35),
  /** Piyasa değeri aralığı (milyon €) */
  valueMin: z.coerce.number().min(0).default(0),
  valueMax: z.coerce.number().min(0).default(100),
  /** Baskın ayak */
  preferredFoot: z.enum([...PREFERRED_FEET, 'any']).default('any'),
  /** Oyuncu statüsü */
  status: z.enum(PLAYER_STATUSES).default('all'),
  /** Sıralama kriteri */
  sort: z.enum(SORT_OPTIONS).default('rating'),
  /** Görünüm modu */
  view: z.enum(VIEW_MODES).default('grid'),
  /** Sayfa numarası */
  page: z.coerce.number().int().min(1).default(1),
});

/* ═══════════════════════════════════════════════════════════════════
   INFERRED TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type Position = z.infer<typeof PositionSchema>;
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;
export type PlayerMetrics = z.infer<typeof PlayerMetricsSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type PaginatedPlayers = z.infer<typeof PaginatedPlayersSchema>;
export type PlayerFilter = z.infer<typeof PlayerFilterSchema>;

/** Filtre varsayılanları — hook'lar ve bileşenler tarafından kullanılır */
export const DEFAULT_FILTERS: PlayerFilter = PlayerFilterSchema.parse({});
