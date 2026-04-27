// ═══════════════════════════════════════════════════
// Live Alerts Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineExclamationCircle,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineBell,
} from 'react-icons/hi';
import { mockAlerts } from '../utils/mockData';
import './Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    import('../services/supabaseService').then(({ getActiveAlerts }) => {
      getActiveAlerts().then(data => {
        if (data && data.length > 0) {
          // Merge real DB alerts with mock alerts for hackathon visuals
          setAlerts(prev => {
            const newAlerts = [...data, ...prev].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
            return newAlerts;
          });
        }
      });
    });
  }, []);

  const filtered = filter === 'all'
    ? alerts
    : alerts.filter((a) => a.type === filter);

  const dismissAlert = async (id) => {
    // Optimistic UI update
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    
    // Remote update
    if (!id.startsWith('ALT-')) { // Assume mock have ALT prefix, DB has native firestore IDs
      const { dismissAlert: remoteDismiss } = await import('../services/supabaseService');
      await remoteDismiss(id);
    }
  };

  return (
    <div className="page-content" id="alerts-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">
            <HiOutlineBell className="title-icon" /> Live Alerts
          </h1>
          <p className="section-subtitle">Real-time piracy detection alerts and notifications</p>
        </div>
        <div className="alert-live-badge">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      {/* ── Filter Bar ─────── */}
      <div className="alert-filters">
        {['all', 'critical', 'warning'].map((f) => (
          <button
            key={f}
            className={`alert-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Alerts' : f === 'critical' ? '🔴 Critical' : '🟡 Warning'}
          </button>
        ))}
      </div>

      {/* ── Alerts List ─────── */}
      <div className="alert-cards">
        <AnimatePresence>
          {filtered.map((alert, i) => (
            <motion.div
              key={alert.id}
              className={`alert-card ${alert.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              layout
            >
              <div className="ac-indicator-bar" />
              <div className="ac-icon">
                {alert.type === 'critical' ? (
                  <HiOutlineExclamationCircle />
                ) : (
                  <HiOutlineExclamation />
                )}
              </div>
              <div className="ac-body">
                <div className="ac-top">
                  <h4>{alert.title}</h4>
                  <span className={`badge badge-${alert.type === 'critical' ? 'danger' : 'warning'}`}>
                    {alert.type}
                  </span>
                </div>
                <p className="ac-message">{alert.message}</p>
                <div className="ac-meta">
                  <span>Source: <strong>{alert.source}</strong></span>
                  <span>Match: <strong style={{ color: 'var(--danger)' }}>{alert.matchScore ?? alert.match_score}%</strong></span>
                  <span>{alert.time || alert.event_time}</span>
                </div>
              </div>
              <button
                className="ac-dismiss"
                onClick={() => dismissAlert(alert.id)}
                title="Dismiss"
              >
                <HiOutlineCheckCircle />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="alert-empty">
            <HiOutlineCheckCircle className="empty-icon" />
            <p>No {filter} alerts — all clear!</p>
          </div>
        )}
      </div>
    </div>
  );
}
