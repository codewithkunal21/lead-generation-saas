import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { getCurrentUserApi, loginApi, registerApi } from '../api/auth';
import type { User, UserCreate, UserLogin } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: attempt to restore session from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const currentUser = await getCurrentUserApi();
          setUser(currentUser);
        } catch {
          // Token is invalid or expired — remove it silently
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: UserLogin) => {
    try {
      const tokenResponse = await loginApi(credentials);
      localStorage.setItem('token', tokenResponse.access_token);
      const currentUser = await getCurrentUserApi();
      setUser(currentUser);
    } catch (err: unknown) {
      // Re-throw with a clearer message so the login page can display it
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          // Network error — no response received (CORS failure, backend down, etc.)
          throw new Error(
            'Unable to reach the server. Please check your connection or try again later.'
          );
        }
        const status = err.response.status;
        const detail =
          (err.response.data as { detail?: string })?.detail ?? 'Login failed';

        if (status === 400 || status === 401) {
          // Incorrect credentials
          throw new Error(detail);
        }
        if (status === 422) {
          throw new Error('Invalid request format. Please check your input.');
        }
        // Other server error
        throw new Error(`Server error (${status}): ${detail}`);
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (userData: UserCreate) => {
    try {
      await registerApi(userData);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
        const detail =
          (err.response.data as { detail?: string })?.detail ?? 'Registration failed';
        throw new Error(detail);
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
