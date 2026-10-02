import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  LoginCredentials,
  RegisterFormData,
} from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'skyline_auth_token';
const USER_KEY = 'skyline_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check token validity and sync user profile on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const activeToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
        // Sync with storage
        if (localStorage.getItem(TOKEN_KEY)) {
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } else {
          sessionStorage.setItem(USER_KEY, JSON.stringify(profile));
        }
      } catch (err: any) {
        // Only clear token if unauthorized (401/403), keep session intact for network hiccups
        if (err.status === 401 || err.status === 403) {
          console.warn('[Auth] Session expired or invalid:', err.message);
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        } else {
          console.warn('[Auth] Backend temporarily unreachable, maintaining local session:', err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { user: authedUser, token: authToken } = response;

      // 1. Persist to storage immediately before updating React state
      if (credentials.rememberMe) {
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(authedUser));
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, authToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(authedUser));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      // 2. Update reactive React state
      setUser(authedUser);
      setToken(authToken);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      const { user: newUser, token: authToken } = response;

      setUser(newUser);
      setToken(authToken);

      // Store in session storage by default on registration
      sessionStorage.setItem(TOKEN_KEY, authToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your details.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('[Auth] Failed to refresh profile:', err);
    }
  };

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user || !user.roles) return false;
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      return user.roles.some((r) => requiredRoles.includes(r));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        hasRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
