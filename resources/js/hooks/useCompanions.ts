// ---------------------------------------------------------------------------
// Companion Hooks — search & detail
// ---------------------------------------------------------------------------

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { CompanionProfile } from '@/types/models';

const COMPANIONS_KEY = ['companions'] as const;

// ---------------------------------------------------------------------------
// Search Filters
// ---------------------------------------------------------------------------

export interface CompanionFilters {
  page?: number;
  per_page?: number;
  language?: string;
  specialty?: string;
  min_rate?: number;
  max_rate?: number;
  availability?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  sort_by?: 'rating' | 'price_asc' | 'price_desc' | 'distance';
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Search companions with optional filters. */
export function useSearchCompanions(filters: CompanionFilters = {}) {
  return useQuery({
    queryKey: [...COMPANIONS_KEY, 'search', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<CompanionProfile>>(
        '/companions',
        { params: filters },
      );
      return data;
    },
  });
}

/** Fetch a single companion profile by ID. */
export function useCompanion(id: number | string) {
  return useQuery({
    queryKey: [...COMPANIONS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CompanionProfile>>(
        `/companions/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}
