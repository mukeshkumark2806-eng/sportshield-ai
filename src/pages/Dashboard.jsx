// ═══════════════════════════════════════════════════
// Dashboard Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineShieldExclamation,
  HiOutlineBell,
  HiOutlineExclamation,
  HiOutlineFilm,
} from 'react-icons/hi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { mockChartData, mockPieData } from '../utils/mockData';
import './Dashboard.css';

// ── Default chart fallbacks (visible before DB data arrives)
const FALLBACK_CHART = mockChartData;
const FALLBACK_PIE   = mockPieData;

const STAT_META = [
  { key: 'totalDetections', label: 'Total Detections', icon: HiOutlineShieldExclamation, color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   change: 'All time'  },
  { key: 'todayAlerts',     label: 'Today Alerts',     icon: HiOutlineBell,               color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  change: 'Today'     },
  { key: 'highRiskCount',   label: 'High Risk Count',  icon: HiOutlineExclamation,        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  change: 'Critical'  },
  { key: 'videosMonitored', label: 'Videos Monitored', icon: HiOutlineFilm,               color: '#10b981', bg: 'rgba(16,185,129,0.1)', change: 'Active'    },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats]         = useState({ totalDetections: 0, todayAlerts: 0, videosMonitored: 0, highRiskCount: 0 });
  const [chartData, setChartData] = useState(FALLBACK_CHART);
  const [pieData, setPieData]     = useState(FALLBACK_PIE);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          getDashboardStats,
          getDashboardChartData,
          getPiracySources,
          getRecentAlerts,
        } = await import('../services/supabaseService');

        const [statsData, chartRaw, pieRaw, alertsRaw] = await Promise.all([
          getDashboardStats(),
          getDashboardChartData(),
          getPiracySources(),
          getRecentAlerts(5),
        ]);

        if (statsData)  setStats(statsData);
        if (chartRaw && chartRaw.some(d => d.detections > 0)) setChartData(chartRaw);
        if (pieRaw   && pieRaw.length > 0)                    setPieData(pieRaw);
        if (alertsRaw && alertsRaw.length > 0)                setRecentAlerts(alertsRaw);
      } catch (err) {
        console.warn('Dashboard data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page-content" id="dashboard-page">
      <div className="page-header">
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">
          Real-time piracy detection overview
          {loading && <span style={{ marginLeft: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>⟳ Loading...</span>}
        </p>
      </div>

      {/* ── Stats Cards ─────── */}
      <div className="stats-grid">
        {STAT_META.map((s, i) => (
          <motion.div
            key={s.key}
            className="stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon />
            </div>
            <div className="stat-info">
              <h3>
                {loading
                  ? <span style={{ color: 'var(--text-muted)' }}>—</span>
                  : (stats[s.key] ?? 0).toLocaleString()
                }
              </h3>
              <p>{s.label}</p>
            </div>
            <span className="stat-change" style={{ color: s.color }}>{s.change}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ──────── */}
      <div className="charts-row">
        <motion.div
          className="chart-card glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="chart-title">Detection Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDetect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="detections" stroke="#3b82f6" fill="url(#gradDetect)" strokeWidth={2} name="Detections" />
              <Area type="monotone" dataKey="highRisk"   stroke="#ef4444" fill="url(#gradHigh)"   strokeWidth={2} name="High Risk"  />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart-card glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="chart-title">Piracy Sources</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Recent Alerts ─────── */}
      <motion.div
        className="recent-alerts glass-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="chart-title">Recent Alerts</h3>
        <div className="alerts-list">
          {recentAlerts.length === 0 && !loading && (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No alerts yet — run a detection scan to generate alerts.
            </p>
          )}
          {recentAlerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <div className="alert-indicator" />
              <div className="alert-content">
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
              </div>
              <div className="alert-meta">
                <span className="alert-score">{alert.matchScore ?? alert.match_score}%</span>
                <span className="alert-time">
                  {alert.time
                    ? new Date(alert.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
