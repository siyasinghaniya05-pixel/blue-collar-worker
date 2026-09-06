import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import SkillBadge from '../components/common/SkillBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'antifraud'

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [statsRes, verifRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/verifications')
        ]);
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData);
        }
        if (verifRes.ok) {
          const vData = await verifRes.json();
          setVerifications(vData);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleVerificationAction = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refresh
        const updated = await fetch('/api/admin/verifications').then(r => r.json());
        setVerifications(updated);
        const updatedStats = await fetch('/api/admin/stats').then(r => r.json());
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Failed to update verification', err);
    }
  };

  const handleResetDB = async () => {
    if (!window.confirm('Reset database to initial seed data?')) return;
    try {
      const res = await fetch('/api/admin/reset-database', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to reset DB', err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Connecting to National Verification Registry...</p>
      </div>
    );
  }

  const { kpis, scoreDistribution, categoryStats } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-bold text-purple-400 tracking-wider block mb-1">
            Governance & Quality Oversight
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            National Verification Directorate
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDB}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo DB
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-600/30 border border-purple-500 text-purple-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Executive KPIs & Analytics
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'bg-purple-600/30 border border-purple-500 text-purple-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Verification Queue
          {stats.pendingVerifications > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              {stats.pendingVerifications}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('antifraud')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'antifraud'
              ? 'bg-purple-600/30 border border-purple-500 text-purple-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Anti-Fraud & Trust Monitor
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Executive Stats KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Workers</span>
              <span className="text-2xl font-black font-display text-white">{kpis.totalWorkers}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verified Pro</span>
              <span className="text-2xl font-black font-display text-emerald-400">{kpis.verifiedWorkers}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Master Tier</span>
              <span className="text-2xl font-black font-display text-amber-400">{kpis.masterWorkers}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customers</span>
              <span className="text-2xl font-black font-display text-blue-400">{kpis.totalCustomers}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completed Jobs</span>
              <span className="text-2xl font-black font-display text-white">{kpis.completedJobs}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Skill Score</span>
              <span className="text-2xl font-black font-display text-amber-400">{kpis.avgSkillScore}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gross GMV</span>
              <span className="text-xl font-black font-display text-emerald-400">₹{(kpis.totalRevenue / 1000).toFixed(1)}k</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Worker Payout</span>
              <span className="text-xl font-black font-display text-purple-400">₹{(kpis.workerEarnings / 1000).toFixed(1)}k</span>
            </div>
          </div>

          {/* Charts: Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tier Distribution Bar Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Worker Tier & Score Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Shows active workers categorized across the 4 skill tiers.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution Bar Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Active Workers per Trade Category
              </h3>
              <p className="text-xs text-slate-400">
                Distribution of verified professionals across the 14 trades.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats.slice(0, 7)} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={110} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Worker Tier Upgrade & Verification Requests
            </h3>
            <span className="text-xs text-slate-400">
              Auditing apprenticeship records & test certificates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Worker Name</th>
                  <th className="p-3">Trade</th>
                  <th className="p-3">Current → Requested Tier</th>
                  <th className="p-3">Document Proof</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white">{v.workerName}</td>
                    <td className="p-3 text-slate-400">{v.specialty}</td>
                    <td className="p-3">
                      <span className="text-slate-400">{v.currentTier}</span> → <strong className="text-amber-400">{v.requestedTier}</strong>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">{v.documentType}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : v.status === 'Rejected'
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {v.status === 'Pending Review' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerificationAction(v.id, 'Approved')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerificationAction(v.id, 'Rejected')}
                            className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'antifraud' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Anti-Fraud & Trust Integrity System
              </h3>
              <p className="text-xs text-slate-400">
                Monitors suspicious review attempts, duplicate accounts, and unauthorized rating inflation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">Escrow Gate</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">Active</span>
              </div>
              <h4 className="font-bold text-sm text-white">Verified Completed Jobs Only</h4>
              <p className="text-xs text-slate-400">
                100% of published customer reviews must originate from a cryptographic booking ID that reached 'Job Completed' status.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400">Anomaly Engine</span>
                <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded">Active</span>
              </div>
              <h4 className="font-bold text-sm text-white">Multi-Dimension Scoring</h4>
              <p className="text-xs text-slate-400">
                Workers cannot self-rate. Reviews require rating 5 distinct technical parameters, detecting copy-pasted or coordinated bot spam.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">Credential Ledger</span>
                <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded">Active</span>
              </div>
              <h4 className="font-bold text-sm text-white">Certificate Expiry Watch</h4>
              <p className="text-xs text-slate-400">
                Certifications expire automatically every 2–3 years, triggering mandatory skill re-assessment to prevent outdated qualifications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
