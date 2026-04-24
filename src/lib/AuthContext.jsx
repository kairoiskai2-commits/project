import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const resolveUserRole = async (authUser) => {
    if (!authUser?.email) return authUser;
    if (authUser.role) return authUser;

    try {
      const userRecords = await apiClient.entities.User.filter({ email: authUser.email });
      const matched = Array.isArray(userRecords) ? userRecords[0] : null;
      if (matched && matched.role) {
        return { ...authUser, role: matched.role };
      }
    } catch (error) {
      console.warn('Role resolution failed:', error);
    }
    return authUser;
  };

  const initializeAuth = async () => {
    try {
      setAuthError(null);
      
      // Check if there's a stored token
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setToken(token);
        // Try to fetch current user
        const currentUser = await apiClient.auth.me();
        const userWithRole = await resolveUserRole(currentUser);
        setUser(userWithRole);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);
      
      const response = await apiClient.auth.login(email, password);
      const currentUser = await apiClient.auth.me();
      const userWithRole = await resolveUserRole(currentUser);
      
      setUser(userWithRole);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setAuthError(error.message || 'Login failed');
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);
      
      const response = await apiClient.auth.signup(email, password, fullName);
      let currentUser;
      
      if (response?.token || response?.access_token || response?.session?.access_token || response?.data?.session?.access_token) {
        currentUser = await apiClient.auth.me();
      } else {
        await login(email, password);
        return response;
      }

      const userWithRole = await resolveUserRole(currentUser);
      setUser(userWithRole);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      setAuthError(error.message || 'Signup failed');
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoadingAuth(false);
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
      if (shouldRedirect) {
        window.location.href = '/login';
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
    login,
    signup,
    logout,
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
