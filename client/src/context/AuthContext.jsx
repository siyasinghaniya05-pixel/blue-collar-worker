import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillserve_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize from storage or default to demo customer
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('skillserve_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setWorkerProfile(data.workerProfile);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to restore session from token', err);
        }
      }
      
      // Default to demo customer on first visit
      await demoLogin('customer');
      setLoading(false);
    }

    initAuth();
  }, []);

  const demoLogin = async (role = 'customer') => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setWorkerProfile(data.workerProfile);
        setToken(data.token);
        localStorage.setItem('skillserve_token', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const login = async (email) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setWorkerProfile(data.workerProfile);
        setToken(data.token);
        localStorage.setItem('skillserve_token', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setWorkerProfile(data.workerProfile);
        setToken(data.token);
        localStorage.setItem('skillserve_token', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setWorkerProfile(null);
    setToken(null);
    localStorage.removeItem('skillserve_token');
  };

  const refreshWorkerProfile = async (workerId) => {
    try {
      const res = await fetch(`/api/workers/${workerId || workerProfile?.id || 'w-1'}`);
      if (res.ok) {
        const data = await res.json();
        setWorkerProfile(data);
      }
    } catch (err) {
      console.error('Failed to refresh worker profile', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      workerProfile,
      token,
      loading,
      login,
      demoLogin,
      register,
      logout,
      refreshWorkerProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
