import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { tokenStore } from '../services/tokenStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_ANONYMOUS' }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { user: action.payload, isAuthenticated: true, loading: false, error: null };
    case 'AUTH_FAILURE':
      return { user: null, isAuthenticated: false, loading: false, error: action.payload };
    // Not an error — simply nobody is logged in yet.
    case 'AUTH_ANONYMOUS':
      return { user: null, isAuthenticated: false, loading: false, error: null };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * On mount, try to restore the session from the httpOnly refresh cookie.
   *
   * The old version read a token out of localStorage. Now nothing is persisted
   * client-side: if the cookie is missing or expired the user is simply
   * anonymous, and the server decides — not the browser.
   */
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const session = await authService.restoreSession();
      if (cancelled) return;

      if (session?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: session.user });
      } else {
        dispatch({ type: 'AUTH_ANONYMOUS' });
      }
    };

    restore();

    // If a 401 elsewhere clears the token, drop the user out of the UI too.
    const unsubscribe = tokenStore.subscribe((token) => {
      if (!token && !cancelled) {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      // Surface the server's generic message. It deliberately does not reveal
      // whether the email exists.
      const message =
        error?.response?.data?.error ??
        error?.response?.data?.message ??
        'Login failed. Please check your details and try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      dispatch({ type: 'AUTH_START' });
      try {
        const response = await authService.register({
          email,
          password,
          firstName,
          lastName,
        } as any);
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } catch (error: any) {
        const data = error?.response?.data;
        const fieldErrors = data?.fields
          ? Object.values(data.fields).join(' ')
          : null;
        const message =
          fieldErrors ?? data?.error ?? 'Registration failed. Please try again.';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
