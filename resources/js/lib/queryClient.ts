// ---------------------------------------------------------------------------
// TanStack React-Query Client
// ---------------------------------------------------------------------------

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30 seconds before data is considered stale
      retry: 1,                 // single retry on failure
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,                 // never auto-retry mutations
    },
  },
});
