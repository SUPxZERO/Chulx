// ---------------------------------------------------------------------------
// API Request / Response Envelopes
// ---------------------------------------------------------------------------

import type { User, UserRole } from './models';

/** Standard single-resource response wrapper. */
export interface ApiResponse<T> {
  data: T;
}

/** Paginated list response matching Laravel's LengthAwarePaginator shape. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ---- Auth ----------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}
