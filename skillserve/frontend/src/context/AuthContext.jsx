import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillserve_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user || res.data);
      return res.data.user || res.data;
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillserve_token');
      localStorage.removeItem('skillserve_user');
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('skillserve_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUser();
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('skillserve_token', newToken);
      setToken(newToken);
      setUser(userData);

      if (userData.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/search');
      }
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('skillserve_token', newToken);
      setToken(newToken);
      setUser(newUser);

      if (newUser.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/search');
      }
      toast.success('Account created successfully!');
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('skillserve_token');
    localStorage.removeItem('skillserve_user');
    setToken(null);
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  }, [navigate]);

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/updateprofile', data);
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Update failed.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isWorker: user?.role === 'worker',
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout,
    updateProfile,
    fetchUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
