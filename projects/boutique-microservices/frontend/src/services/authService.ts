import apiClient from './api';
import { tokenStore } from './tokenStore';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

/**
 * The refresh token is never handled here — it lives in an httpOnly cookie
 * that JavaScript cannot read. Only the short-lived access token passes
 * through this module, and it goes into memory, not localStorage.
 */
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    tokenStore.set(response.data.token);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', credentials);
    tokenStore.set(response.data.token);
    return response.data;
  },

  /**
   * Exchanges the httpOnly refresh cookie for a new access token. Called on
   * app startup to restore a session across page reloads, since the in-memory
   * access token does not survive one.
   */
  restoreSession: async (): Promise<AuthResponse | null> => {
    try {
      const response = await apiClient.post('/auth/refresh', {});
      tokenStore.set(response.data.token);
      return response.data;
    } catch {
      tokenStore.clear();
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Server-side revocation: marks the refresh token revoked and clears
      // the cookie. The old implementation only removed localStorage keys,
      // leaving the token valid forever if it had been copied.
      await apiClient.post('/auth/logout', {});
    } finally {
      tokenStore.clear();
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
