import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { Booking } from '@/types/models';

interface CreateBookingPayload {
  companion_id: number;
  venue_id: number;
  scheduled_start: string;
  scheduled_end: string;
  purpose: 'WEDDING' | 'BUSINESS' | 'TOURISM' | 'CORPORATE' | 'OTHER';
  special_requests?: string;
}

export function useBookings() {
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const { data } = await api.post<ApiResponse<Booking>>('/bookings', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    createBooking: createBooking.mutateAsync,
    isCreating: createBooking.status === 'pending',
    createError: createBooking.error,
  };
}
