import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 as apiClient } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const formatError = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return { message: error };
    return {
      message: error.message || String(error),
      type: error.type,
    };
  };

  const initializeAuth = useCallback(async () => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);

      const isLoggedIn = await apiClient.auth.isAuthenticated();
      if (isLoggedIn) {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(formatError(error));
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);

      await apiClient.auth.login(email, password);
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      const formatted = formatError(error);
      setAuthError(formatted);
      setIsAuthenticated(false);
      throw formatted;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);

      await apiClient.auth.signup(email, password, { full_name: fullName });
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      const formatted = formatError(error);
      setAuthError(formatted);
      setIsAuthenticated(false);
      throw formatted;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const checkUserAuth = useCallback(async () => {
    if (!authChecked) {
      await initializeAuth();
    }
  }, [authChecked, initializeAuth]);

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
    authChecked,
    login,
    signup,
    logout,
    checkUserAuth,
    apiClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
