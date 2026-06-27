// ---------------------------------------------------------------------------
// App Entry — React 19 root with TanStack Query + React Router
// ---------------------------------------------------------------------------

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import AppShell from '@components/layout/AppShell';

// Pages
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import CompanionDirectory from '@pages/CompanionDirectory';
import BookingFlow from '@pages/BookingFlow';
import ActiveBooking from '@pages/ActiveBooking';
import NotFound from '@pages/NotFound';
import { configureEcho } from '@laravel/echo-react';

configureEcho({
    broadcaster: 'reverb',
});

// ── TanStack Query client ─────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,       // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Mount ─────────────────────────────────────────────────────────────────
const rootEl = document.getElementById('app');

if (!rootEl) {
  throw new Error(
    'Root element #app not found. Make sure your Blade template includes <div id="app"></div>.',
  );
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — AppShell checks auth */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="companions" element={<CompanionDirectory />} />
            <Route path="bookings" element={<Dashboard />} />
            <Route path="bookings/new/:companionId" element={<BookingFlow />} />
            <Route path="bookings/:bookingId/active" element={<ActiveBooking />} />
            <Route path="profile" element={<Dashboard />} />
            <Route path="settings" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
