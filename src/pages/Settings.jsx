// ═══════════════════════════════════════════════════
// Settings Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineTrash,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user, profile } = useAuth();
  const displayName   = profile?.display_name   || user?.user_metadata?.displayName || 'Admin';
  const email         = profile?.email          || user?.email                     || 'admin@sportshield.ai';
  const organization  = profile?.organization                                      || 'SportShield Broadcasting';
  const [threshold, setThreshold] = useState(65);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    critical: true,
    weekly: false,
  });
  const [monitoredContent, setMonitoredContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // ── Fetch live official_content from Supabase ──────────────────
  useEffect(() => {
    import('../services/supabaseService').then(({ getOfficialContent }) => {
      getOfficialContent()
        .then((data) => {
          setMonitoredContent(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.warn('Could not load monitored content:', err);
          setMonitoredContent([]);
        })
        .finally(() => setLoadingContent(false));
    });
  }, []);

  // ── Delete row from Supabase + optimistic UI update ────────────
  const removeContent = async (id) => {
    // Optimistic remove — UI updates immediately
    setMonitoredContent((prev) => prev.filter((c) => c.id !== id));
    try {
      const { deleteOfficialContent } = await import('../services/supabaseService');
      await deleteOfficialContent(id);
    } catch (err) {
      console.error('Delete failed, re-fetching list:', err);
      // Re-fetch to restore correct state on failure
      const { getOfficialContent } = await import('../services/supabaseService');
      const fresh = await getOfficialContent();
      setMonitoredContent(Array.isArray(fresh) ? fresh : []);
    }
  };

  return (
    <div className="page-content" id="settings-page">
      <div className="page-header" style={{ display: 'block' }}>
        <h1 className="section-title"><HiOutlineCog style={{ verticalAlign: 'middle' }} /> Settings</h1>
        <p className="section-subtitle">Configure your anti-piracy detection preferences</p>
      </div>

      <div className="settings-grid">
        {/* ── Profile ─────────── */}
        <motion.div
          className="settings-section glass-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3><HiOutlineUser /> Profile</h3>
          <div className="settings-form">
            <div className="form-group-s">
              <label>Display Name</label>
              <input
                type="text"
                className="input-field"
                defaultValue={displayName}
                id="input-display-name"
              />
            </div>
            <div className="form-group-s">
              <label>Email</label>
              <input
                type="email"
                className="input-field"
                defaultValue={email}
                id="input-settings-email"
              />
            </div>
            <div className="form-group-s">
              <label>Organization</label>
              <input
                type="text"
                className="input-field"
                defaultValue={organization}
                id="input-organization"
              />
            </div>
            <button className="btn-primary" id="btn-save-profile">Save Changes</button>
          </div>
        </motion.div>

        {/* ── Detection Threshold ── */}
        <motion.div
          className="settings-section glass-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3><HiOutlineShieldCheck /> Detection Settings</h3>
          <div className="settings-form">
            <div className="form-group-s">
              <label>
                Match Threshold: <strong style={{ color: 'var(--accent-primary)' }}>{threshold}%</strong>
              </label>
              <p className="form-help">
                Content with match % above this threshold will be flagged as piracy.
              </p>
              <div className="slider-wrap">
                <input
                  type="range"
                  min="20"
                  max="99"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="threshold-slider"
                  id="slider-threshold"
                />
                <div className="slider-labels">
                  <span>20% (Lenient)</span>
                  <span>99% (Strict)</span>
                </div>
              </div>
            </div>
            <div className="threshold-preview">
              <div className="tp-bar">
                <div className="tp-zone success" style={{ width: `${threshold}%` }}>
                  <span>Safe</span>
                </div>
                <div className="tp-zone danger" style={{ width: `${100 - threshold}%` }}>
                  <span>Flagged</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Notifications ───── */}
        <motion.div
          className="settings-section glass-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3><HiOutlineBell /> Notifications</h3>
          <div className="settings-form">
            {Object.entries(notifications).map(([key, val]) => (
              <div className="toggle-row" key={key}>
                <div>
                  <span className="toggle-label">
                    {key === 'email' ? 'Email Alerts' : key === 'push' ? 'Push Notifications' : key === 'critical' ? 'Critical Only Mode' : 'Weekly Report'}
                  </span>
                  <span className="toggle-desc">
                    {key === 'email' ? 'Receive alerts via email' : key === 'push' ? 'Browser push notifications' : key === 'critical' ? 'Only notify for high-risk detections' : 'Weekly summary email'}
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() =>
                      setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Monitored Content ── */}
        <motion.div
          className="settings-section glass-card full-width"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3><HiOutlineShieldCheck /> Monitored Content</h3>
          <div className="monitored-list">
            {loadingContent && (
              <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Loading monitored content...</p>
            )}
            {!loadingContent && monitoredContent.length === 0 && (
              <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>
                No content uploaded yet. Go to <strong>Upload Content</strong> to add official media.
              </p>
            )}
            {Array.isArray(monitoredContent) && monitoredContent.map((c) => (
              <div key={c.id} className="monitored-item">
                <div className="mi-info">
                  <span className="mi-name">{c.name}</span>
                  <span className="mi-meta">{c.size} • {c.uploaded}</span>
                </div>
                <span className={`badge badge-${c.status === 'Active' ? 'success' : 'warning'}`}>
                  {c.status || 'Active'}
                </span>
                <button
                  className="mi-remove"
                  onClick={() => removeContent(c.id)}
                  title="Remove from monitoring"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
