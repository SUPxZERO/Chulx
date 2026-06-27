// ---------------------------------------------------------------------------
// Booking Hooks — list, create, transition
// ---------------------------------------------------------------------------

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Booking } from '@/types/models';

const BOOKINGS_KEY = ['bookings'] as const;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the current user's bookings (paginated). */
export function useMyBookings(page = 1) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, { page }],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Booking>>(
        '/bookings',
        { params: { page } },
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

interface CreateBookingPayload {
  companion_id: number;
  venue_id: number;
  scheduled_start: string;
  scheduled_end: string;
  purpose: string;
  special_requests?: string;
}

/** Create a new booking. */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const { data } = await api.post<ApiResponse<Booking>>(
        '/bookings',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY });
    },
  });
}

interface TransitionPayload {
  bookingId: number;
  action: string;
}

/** Transition a booking to the next state (accept, fund, complete, etc.). */
export function useTransitionBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, action }: TransitionPayload) => {
      const { data } = await api.post<ApiResponse<Booking>>(
        `/bookings/${bookingId}/${action}`,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY });
    },
  });
}
