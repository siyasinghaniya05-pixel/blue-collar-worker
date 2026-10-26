import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify session with backend
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const token = localStorage.getItem('kaushalid_jwt_token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await api.auth.getMe();
        if (isMounted) {
          setUser({ ...data.user, profile: data.profile });
        }
      } catch (err) {
        console.warn('Session restoration failed, clearing token:', err.message);
        localStorage.removeItem('kaushalid_jwt_token');
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifySession();
    return () => { isMounted = false; };
  }, []);

  // Standard Email / Password Login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('kaushalid_jwt_token', data.token);
      const activeUser = { ...data.user, profile: data.profile };
      setUser(activeUser);
      return { success: true, user: activeUser };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Google Login Simulation
  const loginWithGoogle = async (role = 'worker') => {
    return demoLogin(role);
  };

  // Registration
  const signup = async ({ fullName, name, email, password, role = 'worker', city, trade, companyName }) => {
    setAuthError(null);
    try {
      const data = await api.auth.signup({
        name: fullName || name,
        email,
        password,
        role,
        city,
        trade,
        companyName
      });
      localStorage.setItem('kaushalid_jwt_token', data.token);
      const activeUser = { ...data.user, profile: data.profile };
      setUser(activeUser);
      return { success: true, user: activeUser };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Fast 1-Click Demo Persona Login
  const demoLogin = async (role = 'worker') => {
    setAuthError(null);
    try {
      const data = await api.auth.demoLogin(role);
      localStorage.setItem('kaushalid_jwt_token', data.token);
      const activeUser = { ...data.user, profile: data.profile };
      setUser(activeUser);
      return { success: true, user: activeUser };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Profile Update
  const updateProfile = async (updates) => {
    try {
      const data = await api.auth.updateProfile(updates);
      const updatedUser = { ...data.user, profile: data.profile };
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem('kaushalid_jwt_token');
    setUser(null);
    setAuthError(null);
    return { success: true };
  };

  const value = {
    user,
    userProfile: user,
    userType: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    authError,
    setAuthError,
    login,
    signup,
    demoLogin,
    loginWithGoogle,
    updateProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
