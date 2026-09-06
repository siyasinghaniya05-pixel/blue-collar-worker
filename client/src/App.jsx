import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import WorkerSearchPage from './pages/WorkerSearchPage';
import SmartMatchPage from './pages/SmartMatchPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import WorkerDashboard from './pages/WorkerDashboard';
import BookingTrackerPage from './pages/BookingTrackerPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<WorkerSearchPage />} />
          <Route path="/match" element={<SmartMatchPage />} />
          <Route path="/worker/:id" element={<WorkerProfilePage />} />
          <Route path="/assessment" element={<SkillAssessmentPage />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/bookings" element={<BookingTrackerPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
