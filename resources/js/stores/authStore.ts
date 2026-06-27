// ---------------------------------------------------------------------------
// Auth Store (Zustand)
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import type { User } from '@/types/models';
import { TOKEN_KEY } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // ---- State ---------------------------------------------------------------
  user: null,
  token: null,
  isAuthenticated: false,

  // ---- Actions -------------------------------------------------------------

  setAuth: (user: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
