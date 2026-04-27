// ═══════════════════════════════════════════════════
// Results Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockDetections } from '../utils/mockData';
import { formatTimestamp } from '../utils/detectionEngine';
import './Results.css';

export default function Results() {
  const [dbDetections, setDbDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../services/supabaseService').then(({ getDetections }) => {
      getDetections()
        .then((data) => {
          setDbDetections(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.warn('Could not load detections:', err);
          setDbDetections([]);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  // Real DB rows first, mock data as visual filler fallback
  const allDetections = dbDetections.length > 0
    ? dbDetections
    : [...dbDetections, ...mockDetections];

  return (
    <div className="page-content" id="results-page">
      <div className="page-header">
        <h1 className="section-title">Detection Results</h1>
        <p className="section-subtitle">
          All piracy detection results with match percentages and risk analysis.
        </p>
      </div>

      {loading && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
          Loading detection results...
        </p>
      )}

      <div className="results-grid">
        {allDetections.map((det, i) => {
          const matchPct = det.matchPercentage ?? det.match_percentage ?? 0;
          const riskLevel = det.riskLevel || det.risk_level || 'Low';
          const officialFile = det.officialFile || det.official_file || '';
          const suspiciousFile = det.suspiciousFile || det.suspicious_file || '';
          const ts = det.timestamp || det.event_time;

          return (
            <motion.div
              key={det.id + i}
              className="result-card glass-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="rc-header">
                <span className="rc-id">{det.id}</span>
                <span className={`badge badge-${riskLevel === 'High' ? 'danger' : riskLevel === 'Medium' ? 'warning' : 'success'}`}>
                  {riskLevel}
                </span>
              </div>

              <div className="rc-score-wrap">
                <div className="rc-score-bar">
                  <div
                    className="rc-score-fill"
                    style={{
                      width: `${matchPct}%`,
                      background: matchPct >= 80 ? 'var(--danger)' : matchPct >= 55 ? 'var(--warning)' : 'var(--success)',
                    }}
                  />
                </div>
                <span className="rc-score-value" style={{
                  color: matchPct >= 80 ? 'var(--danger)' : matchPct >= 55 ? 'var(--warning)' : 'var(--success)',
                }}>
                  {matchPct}%
                </span>
              </div>

              <div className="rc-files">
                <div className="rc-file">
                  <span className="rc-label">Official:</span>
                  <span className="rc-value">{officialFile}</span>
                </div>
                <div className="rc-file">
                  <span className="rc-label">Suspicious:</span>
                  <span className="rc-value">{suspiciousFile}</span>
                </div>
              </div>

              <div className="rc-mods">
                {(det.modifications || []).map((m, j) => (
                  <span key={j} className="mod-tag">{m}</span>
                ))}
              </div>

              <div className="rc-footer">
                <span className="rc-source">{det.source}</span>
                <span className="rc-time">{formatTimestamp(ts)}</span>
              </div>
            </motion.div>
          );
        })}

        {!loading && allDetections.length === 0 && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
            No detections yet. Run a Scan &amp; Detect to see results here.
          </p>
        )}
      </div>
    </div>
  );
}
