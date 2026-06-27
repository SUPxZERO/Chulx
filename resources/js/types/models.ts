// ---------------------------------------------------------------------------
// Domain Models — mirrors the Laravel API resource shapes
// ---------------------------------------------------------------------------

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'funded'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'paid';

export type UserRole = 'CLIENT' | 'COMPANION' | 'ADMIN';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  locale: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  wallet?: Wallet;
}

export interface CompanionProfile {
  id: number;
  user: User;
  bio: string;
  hourly_rate_cents: number;
  hourly_rate_display: string;
  languages: string[];
  specialties: string[];
  availability_status: AvailabilityStatus;
  rating_avg: number;
  total_bookings: number;
  verified_at: string | null;
  distance_km?: number;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  category: string;
  is_approved: boolean;
  capacity: number;
}

export interface Booking {
  id: number;
  uuid: string;
  client: User;
  companion: User;
  venue: Venue;
  status: BookingStatus;
  scheduled_start: string;
  scheduled_end: string;
  base_amount_cents: number;
  safety_fee_cents: number;
  platform_fee_cents: number;
  companion_payout_cents: number;
  purpose: string;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: number;
  balance_cents: number;
  hold_amount_cents: number;
  currency: string;
}
