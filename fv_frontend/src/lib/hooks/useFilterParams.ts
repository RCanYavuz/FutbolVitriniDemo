/**
 * URL searchParams ile filtre state'ini senkronize eden hook.
 *
 * react-router-dom'un useSearchParams hook'u üzerine kurulu.
 * Zod şeması ile parse edilen parametreler type-safe'dir;
 * geçersiz veya eksik değerler varsayılana düşer.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlayerFilterSchema,
  DEFAULT_FILTERS,
  type PlayerFilter,
  type Position,
} from '../validations/player';

/** URL'deki searchParams'ı Zod ile parse edip type-safe filtre döndürür. */
function parseSearchParams(searchParams: URLSearchParams): PlayerFilter {
  const raw: Record<string, unknown> = {};

  const query = searchParams.get('query');
  if (query) raw.query = query;

  // Positions: ?positions=GK,DF
  const positions = searchParams.get('positions');
  if (positions) {
    raw.positions = positions.split(',').filter(Boolean);
  }

  const ageMin = searchParams.get('ageMin');
  if (ageMin) raw.ageMin = ageMin;

  const ageMax = searchParams.get('ageMax');
  if (ageMax) raw.ageMax = ageMax;

  const valueMin = searchParams.get('valueMin');
  if (valueMin) raw.valueMin = valueMin;

  const valueMax = searchParams.get('valueMax');
  if (valueMax) raw.valueMax = valueMax;

  const preferredFoot = searchParams.get('preferredFoot');
  if (preferredFoot) raw.preferredFoot = preferredFoot;

  const status = searchParams.get('status');
  if (status) raw.status = status;

  const sort = searchParams.get('sort');
  if (sort) raw.sort = sort;

  const view = searchParams.get('view');
  if (view) raw.view = view;

  const page = searchParams.get('page');
  if (page) raw.page = page;

  // Zod parse — geçersiz değerler varsayılana düşer
  const result = PlayerFilterSchema.safeParse(raw);
  return result.success ? result.data : DEFAULT_FILTERS;
}

/** Filtre nesnesini URLSearchParams'a dönüştürür (varsayılan değerler atlanır). */
function filtersToParams(filters: PlayerFilter): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) params.set('query', filters.query);
  if (filters.positions.length > 0) params.set('positions', filters.positions.join(','));
  if (filters.ageMin !== DEFAULT_FILTERS.ageMin) params.set('ageMin', String(filters.ageMin));
  if (filters.ageMax !== DEFAULT_FILTERS.ageMax) params.set('ageMax', String(filters.ageMax));
  if (filters.valueMin !== DEFAULT_FILTERS.valueMin) params.set('valueMin', String(filters.valueMin));
  if (filters.valueMax !== DEFAULT_FILTERS.valueMax) params.set('valueMax', String(filters.valueMax));
  if (filters.preferredFoot !== DEFAULT_FILTERS.preferredFoot) params.set('preferredFoot', filters.preferredFoot);
  if (filters.status !== DEFAULT_FILTERS.status) params.set('status', filters.status);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  if (filters.view !== DEFAULT_FILTERS.view) params.set('view', filters.view);
  if (filters.page !== DEFAULT_FILTERS.page) params.set('page', String(filters.page));

  return params;
}

export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  /** Tek bir filtre alanını günceller, sayfa 1'e sıfırlanır. */
  const setFilter = useCallback(
    <K extends keyof PlayerFilter>(key: K, value: PlayerFilter[K]) => {
      const next = { ...filters, [key]: value };
      // Filtre değişince sayfa 1'e dön (sayfa ve görünüm hariç)
      if (key !== 'page' && key !== 'view') {
        next.page = 1;
      }
      setSearchParams(filtersToParams(next), { replace: true });
    },
    [filters, setSearchParams],
  );

  /** Birden fazla filtreyi tek seferde günceller. */
  const setFilters = useCallback(
    (updates: Partial<PlayerFilter>) => {
      const next = { ...filters, ...updates };
      if (!('page' in updates)) {
        next.page = 1;
      }
      setSearchParams(filtersToParams(next), { replace: true });
    },
    [filters, setSearchParams],
  );

  /** Mevki seçimini toggle eder. */
  const togglePosition = useCallback(
    (pos: Position) => {
      const current = filters.positions;
      const next = current.includes(pos)
        ? current.filter((p) => p !== pos)
        : [...current, pos];
      setFilter('positions', next);
    },
    [filters.positions, setFilter],
  );

  /** Tüm filtreleri sıfırlar. */
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  /** Aktif (varsayılandan farklı) filtre sayısı. */
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.positions.length > 0) count++;
    if (filters.ageMin !== DEFAULT_FILTERS.ageMin || filters.ageMax !== DEFAULT_FILTERS.ageMax) count++;
    if (filters.valueMin !== DEFAULT_FILTERS.valueMin || filters.valueMax !== DEFAULT_FILTERS.valueMax) count++;
    if (filters.preferredFoot !== 'any') count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    togglePosition,
    resetFilters,
    activeCount,
  };
}
