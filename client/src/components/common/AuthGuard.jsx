import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthGuard({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verifying KaushalID session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation
  if (requiredRole) {
    const userRole = user.role;

    // Admin has superuser access to view all dashboards
    if (userRole === 'admin') {
      return children;
    }

    if (requiredRole === 'admin' && userRole !== 'admin') {
      const fallback = userRole === 'employer' ? '/employer-dashboard' : '/worker-dashboard';
      return <Navigate to={fallback} replace />;
    }

    if (requiredRole !== userRole) {
      const correctPath = userRole === 'employer' ? '/employer-dashboard' : '/worker-dashboard';
      return <Navigate to={correctPath} replace />;
    }
  }

  return children;
}
