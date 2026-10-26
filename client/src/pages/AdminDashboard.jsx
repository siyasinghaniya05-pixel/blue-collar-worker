import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  Award,
  DollarSign,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  RotateCcw,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
  Search,
  Check,
  X,
  Sliders,
  History,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({ assessmentFee: 499, employerMonthlySubscription: 999 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'revoke' | 'audit' | 'settings'

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [reviewScore, setReviewScore] = useState(92);
  const [assessorNotes, setAssessorNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Revoke Modal State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeCredentialId, setRevokeCredentialId] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  const loadAdminData = async () => {
    try {
      const [statsData, verifData, logsData, settingsData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getVerifications(),
        api.admin.getAuditLogs(30),
        api.admin.getSettings()
      ]);
      setStats(statsData);
      setVerifications(verifData);
      setAuditLogs(logsData.logs || []);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openReviewModal = (reqItem, action) => {
    setSelectedRequest(reqItem);
    setReviewAction(action);
    setReviewScore(action === 'Approved' ? 92 : 45);
    setAssessorNotes(action === 'Approved' ? 'Benchmark execution satisfies national safety standards.' : '');
    setRejectionReason(action === 'Rejected' ? 'Incomplete safety documentation and test evidence.' : '');
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await api.assessments.reviewRequest(selectedRequest.id, {
        status: reviewAction,
        score: Number(reviewScore),
        assessorNotes,
        rejectionReason: reviewAction === 'Rejected' ? rejectionReason : undefined
      });
      setReviewModalOpen(false);
      setActionSuccessMessage(`Assessment request ${selectedRequest.id} marked as ${reviewAction}.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to submit review decision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeCredential = async (e) => {
    e.preventDefault();
    if (!revokeCredentialId.trim() || !revokeReason.trim()) {
      alert('Credential ID and a mandatory justification reason are required.');
      return;
    }
    setActionLoading(true);
    try {
      await api.admin.revokeCredential(revokeCredentialId.trim().toUpperCase(), revokeReason.trim());
      setRevokeModalOpen(false);
      setRevokeCredentialId('');
      setRevokeReason('');
      setActionSuccessMessage(`Credential successfully revoked and logged to registry.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Revocation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.admin.updateSettings(settings);
      setActionSuccessMessage('Platform pricing settings updated successfully.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700 font-display">
          Loading National Verification Directorate...
        </p>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const pendingRequests = verifications.filter(v => v.status === 'Pending Review');

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Directorate Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>National Verification Directorate &bull; Executive Portal</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
              Administrative Control Directorate
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Live audit metrics, practical assessment approvals, credential revocation, and immutable registry logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setRevokeModalOpen(true)}
              className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Revoke Credential</span>
            </button>
            <button
              onClick={loadAdminData}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
            { id: 'verifications', label: `Assessment Queue (${pendingRequests.length})`, icon: Award },
            { id: 'audit', label: 'Immutable Audit Logs', icon: History },
            { id: 'settings', label: 'Pricing & Settings', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  active 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Registered Workers</span>
                <p className="text-2xl font-black text-slate-900 font-display">{kpis.totalWorkers || 0}</p>
                <span className="text-[11px] text-emerald-700 font-medium">National Registry</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Verified Credentials</span>
                <p className="text-2xl font-black text-emerald-700 font-display">{kpis.verifiedCredentials || 0}</p>
                <span className="text-[11px] text-emerald-600 font-medium">Audited & Active</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Pending Assessments</span>
                <p className="text-2xl font-black text-amber-600 font-display">{kpis.pendingAssessments || 0}</p>
                <span className="text-[11px] text-amber-700 font-medium">Awaiting Assessor</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Employer Accounts</span>
                <p className="text-2xl font-black text-indigo-700 font-display">{kpis.activeEmployers || 0}</p>
                <span className="text-[11px] text-slate-500 font-medium">Active Subscriptions</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Audit Entries</span>
                <p className="text-2xl font-black text-slate-700 font-display">{kpis.totalAuditLogs || 0}</p>
                <span className="text-[11px] text-slate-500 font-medium">Tamper-Proof Logs</span>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                  Skill Score Distribution Across Workforce
                </h3>
                {(!stats?.scoreDistribution || stats.scoreDistribution.length === 0) ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                    Metrics will appear when real activity is recorded.
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.scoreDistribution}>
                        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {stats.scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill || '#10B981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
                  Top Certified Trade Specializations
                </h3>
                {(!stats?.categoryStats || stats.categoryStats.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Metrics will appear when real activity is recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.categoryStats.slice(0, 6).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                        <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {cat.count} workers
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSESSMENT REVIEW QUEUE */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Practical Benchmark Review Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Workers requesting official NSQF credential elevation following workbench practical test.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                {pendingRequests.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold font-mono">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-3">Worker & KaushalID</th>
                    <th className="py-3 px-3">Trade & Skill Area</th>
                    <th className="py-3 px-3">Submitted Evidence</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Assessor Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No assessment requests in queue.
                      </td>
                    </tr>
                  ) : (
                    verifications.map((reqItem) => {
                    const isPending = reqItem.status === 'Pending Review';
                    return (
                      <tr key={reqItem.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{reqItem.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{reqItem.workerName}</p>
                          <span className="font-mono text-[10px] text-slate-500">{reqItem.kaushalId}</span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-emerald-800">{reqItem.trade}</p>
                          <p className="text-[11px] text-slate-600">{reqItem.skillArea}</p>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="text-[11px] text-slate-600 truncate" title={reqItem.evidenceDescription}>
                            {reqItem.evidenceDescription}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            reqItem.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            (reqItem.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')
                          }`}>
                            {reqItem.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openReviewModal(reqItem, 'Approved')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openReviewModal(reqItem, 'Rejected')}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400">Decision Recorded</span>
                          )}
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: IMMUTABLE AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Immutable Registry Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Cryptographically sequenced administrative actions, approvals, revocations, and configuration changes.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold font-mono">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-500">{log.timestamp?.replace('T', ' ').slice(0, 19)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{log.actorName} ({log.actorRole})</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action?.includes('APPROVED') || log.action?.includes('ISSUED') ? 'bg-emerald-100 text-emerald-800' :
                          (log.action?.includes('REVOKED') ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700')
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{log.targetEntity}:{log.targetId}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-sans text-xs">{log.details}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Configurable Platform Pricing
              </h3>
              <p className="text-xs text-slate-500">
                Adjust commercial pricing parameters across worker assessments and employer monthly subscriptions.
              </p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Worker Assessment & Certification Unit Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.assessmentFee}
                  onChange={(e) => setSettings({ ...settings, assessmentFee: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">Proposed baseline: ₹499 per assessment unit.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Employer Monthly Enterprise Subscription (₹)
                </label>
                <input
                  type="number"
                  value={settings.employerMonthlySubscription}
                  onChange={(e) => setSettings({ ...settings, employerMonthlySubscription: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">Proposed baseline: ₹999 per month.</p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                {actionLoading ? 'Updating Settings...' : 'Save Pricing Parameters'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-slate-900 text-sm font-display">
                {reviewAction === 'Approved' ? 'Approve Assessment & Mint Credential' : 'Reject Assessment Submission'}
              </h4>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 border border-slate-200">
              <p><span className="font-semibold text-slate-700">Worker:</span> {selectedRequest.workerName} ({selectedRequest.kaushalId})</p>
              <p><span className="font-semibold text-slate-700">Skill:</span> {selectedRequest.trade} - {selectedRequest.skillArea}</p>
            </div>

            {reviewAction === 'Approved' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Practical Benchmark Score (0–100)</label>
                  <input
                    type="number"
                    min="60"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400">92+ elevates worker to Level 4 Master; 80+ to Level 3 Expert.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Assessor Technical Notes</label>
                  <textarea
                    rows={3}
                    value={assessorNotes}
                    onChange={(e) => setAssessorNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-800">Mandatory Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain benchmark deficiency or missing test documentation..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                disabled={actionLoading}
                className={`flex-1 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition ${
                  reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Recording...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {revokeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRevokeCredential} className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <h4 className="font-black text-rose-900 text-sm font-display flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Revoke Worker Digital Credential
              </h4>
              <button type="button" onClick={() => setRevokeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">KaushalID or Credential ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. KID-IN-MH-10248"
                value={revokeCredentialId}
                onChange={(e) => setRevokeCredentialId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-rose-800">Mandatory Revocation Justification *</label>
              <textarea
                rows={3}
                required
                placeholder="Audit finding: forged certification, code violations, or failed field re-assessment..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-rose-300 rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
              >
                {actionLoading ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
