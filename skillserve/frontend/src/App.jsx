import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';
import WorkerLayout from './components/layout/WorkerLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import BookingPage from './pages/BookingPage';
import BookingsListPage from './pages/BookingsListPage';
import WorkerDashboard from './pages/WorkerDashboard';
import AssessmentsPage from './pages/AssessmentsPage';
import SkillProgressPage from './pages/SkillProgressPage';
import WorkerProfileEditPage from './pages/WorkerProfileEditPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminWorkersPage from './pages/AdminWorkersPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function WorkerRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['worker']}>
      <WorkerLayout>{children}</WorkerLayout>
    </ProtectedRoute>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading SkillServe..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="workers/:id" element={<WorkerProfilePage />} />
        <Route
          path="bookings/new"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <BookingsListPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/worker/dashboard"
        element={
          <WorkerRoute>
            <WorkerDashboard />
          </WorkerRoute>
        }
      />
      <Route
        path="/worker/assessments"
        element={
          <WorkerRoute>
            <AssessmentsPage />
          </WorkerRoute>
        }
      />
      <Route
        path="/worker/skill-progress"
        element={
          <WorkerRoute>
            <SkillProgressPage />
          </WorkerRoute>
        }
      />
      <Route
        path="/worker/profile-edit"
        element={
          <WorkerRoute>
            <WorkerProfileEditPage />
          </WorkerRoute>
        }
      />
      <Route
        path="/worker/bookings"
        element={
          <WorkerRoute>
            <BookingsListPage />
          </WorkerRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <AdminRoute>
            <AdminWorkersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <AdminRoute>
            <AdminBookingsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AdminRoute>
            <AdminReviewsPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
