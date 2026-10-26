import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthGuard from './components/common/AuthGuard';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillPassportPage from './pages/SkillPassportPage';
import VerificationResultPage from './pages/VerificationResultPage';
import AdminDashboard from './pages/AdminDashboard';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/auth/worker" element={<Navigate to="/login" replace />} />
          <Route path="/auth/customer" element={<Navigate to="/login" replace />} />

          {/* Protected Route: Worker Dashboard */}
          <Route
            path="/worker-dashboard"
            element={
              <AuthGuard requiredRole="worker">
                <WorkerDashboardPage />
              </AuthGuard>
            }
          />

          {/* Protected Route: Skill Assessment Request Workflow */}
          <Route
            path="/assessments"
            element={
              <AuthGuard requiredRole="worker">
                <SkillAssessmentPage />
              </AuthGuard>
            }
          />
          <Route path="/assessment/request" element={<Navigate to="/assessments" replace />} />

          {/* Protected Route: Employer Dashboard */}
          <Route
            path="/employer-dashboard"
            element={
              <AuthGuard requiredRole="employer">
                <EmployerDashboardPage />
              </AuthGuard>
            }
          />

          {/* Protected Route: National Verification Directorate (Admin Console) */}
          <Route
            path="/admin"
            element={
              <AuthGuard requiredRole="admin">
                <AdminDashboard />
              </AuthGuard>
            }
          />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

          {/* Protected Route: Profile */}
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />

          {/* Protected Route: Self Skill Passport View */}
          <Route
            path="/skill-passport"
            element={
              <AuthGuard>
                <SkillPassportPage />
              </AuthGuard>
            }
          />

          {/* Public / Shared Digital Skill Passport & QR Verification Views */}
          <Route path="/verify/:id" element={<VerificationResultPage />} />
          <Route path="/passport/:id" element={<VerificationResultPage />} />
          <Route path="/qr-verify" element={<Navigate to="/#for-employers" replace />} />

          {/* About Page */}
          <Route path="/about" element={<AboutPage />} />

          {/* Backward compatibility redirects */}
          <Route path="/dashboard/worker" element={<Navigate to="/worker-dashboard" replace />} />
          <Route path="/dashboard/employer" element={<Navigate to="/employer-dashboard" replace />} />
          <Route path="/dashboard/customer" element={<Navigate to="/employer-dashboard" replace />} />
          <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
