// ---------------------------------------------------------------------------
// Auth Hook — login / register / logout mutations
// ---------------------------------------------------------------------------

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
} from '@/types/api';
import type { User } from '@/types/models';

export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, logout: clearAuth, user, isAuthenticated } = useAuthStore();

  // ---- Login ---------------------------------------------------------------
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await api.post<LoginResponse>(
        '/login',
        credentials,
      );
      return data;
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
    },
  });

  // ---- Register ------------------------------------------------------------
  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const { data } = await api.post<LoginResponse>(
        '/register',
        payload,
      );
      return data;
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
    },
  });

  // ---- Logout --------------------------------------------------------------
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/logout');
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated,

    login: loginMutation.mutateAsync,
    loginStatus: loginMutation.status,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    registerStatus: registerMutation.status,
    registerError: registerMutation.error,

    logout: logoutMutation.mutateAsync,
    logoutStatus: logoutMutation.status,
  } as const;
}
