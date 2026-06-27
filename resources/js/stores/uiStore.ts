// ---------------------------------------------------------------------------
// UI Store (Zustand)
// ---------------------------------------------------------------------------

import { create } from 'zustand';

type Theme = 'dark' | 'light';
type Locale = 'en' | 'km';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  locale: Locale;
}

interface UIActions {
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  // ---- State ---------------------------------------------------------------
  sidebarOpen: false,
  theme: 'dark',
  locale: 'en',

  // ---- Actions -------------------------------------------------------------

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  setLocale: (locale: Locale) => {
    set({ locale });
  },
}));
