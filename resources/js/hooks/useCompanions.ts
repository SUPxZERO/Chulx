import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse } from '@/types/api';
import type { CompanionProfile } from '@/types/models';

interface SearchParams {
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  language?: string;
  specialty?: string;
  min_rate?: number;
  max_rate?: number;
  sort_by?: 'distance' | 'rating' | 'price';
  page?: number;
}

export function useCompanions(params: SearchParams = {}) {
  return useQuery({
    queryKey: ['companions', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<CompanionProfile>>('/companions', {
        params,
      });
      return data;
    },
    refetchOnWindowFocus: false,
  });
}
