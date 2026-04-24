import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 as supabaseClient } from '@/api/base44Client';

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
      const userRecords = await supabaseClient.entities.users.filter({ email: authUser.email });
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
      setIsLoadingAuth(true);

      const isLoggedIn = await supabaseClient.auth.isAuthenticated();
      if (isLoggedIn) {
        const currentUser = await supabaseClient.auth.me();
        const userWithRole = await resolveUserRole(currentUser);
        setUser(userWithRole);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);

      const response = await supabaseClient.auth.login(email, password);
      const currentUser = await supabaseClient.auth.me();
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

      const response = await supabaseClient.auth.signup(email, password, { full_name: fullName });
      const isLoggedIn = await supabaseClient.auth.isAuthenticated();

      if (!isLoggedIn) {
        await login(email, password);
        return response;
      }

      const currentUser = await supabaseClient.auth.me();
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
      await supabaseClient.auth.logout();
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
    apiClient: supabaseClient,
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
