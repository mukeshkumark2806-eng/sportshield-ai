// ═══════════════════════════════════════════════════
// Scan & Detect Page — SportShield AI
// Upload suspicious content and compare with official
// ═══════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUpload,
  HiOutlineSearch,
  HiOutlineShieldExclamation,
  HiOutlineFilm,
} from 'react-icons/hi';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { formatFileSize, compareContent } from '../utils/detectionEngine';
import './Scan.css';

const SOURCES = [
  { value: 'Manual Upload',  label: '📁 Manual Upload'  },
  { value: 'YouTube',        label: '▶️ YouTube'         },
  { value: 'Telegram',       label: '✈️ Telegram'        },
  { value: 'Instagram',      label: '📷 Instagram'       },
  { value: 'Website',        label: '🌐 Website'         },
];

export default function Scan() {
  const navigate = useNavigate();
  const [officialFile,   setOfficialFile]   = useState(null);
  const [suspiciousFile, setSuspiciousFile] = useState(null);
  const [source,         setSource]         = useState('Manual Upload');
  const [scanning,       setScanning]       = useState(false);
  const [scanProgress,   setScanProgress]   = useState(0);
  const [result,         setResult]         = useState(null);
  const [scanError,      setScanError]      = useState('');

  const handleScan = async () => {
    if (!officialFile || !suspiciousFile) return;

    setScanning(true);
    setResult(null);
    setScanError('');
    setScanProgress(0);

    let interval;
    try {
      const { detectPiracy } = await import('../services/apiService');
      const { saveDetection } = await import('../services/supabaseService');

      interval = setInterval(() => {
        setScanProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 250);

      const apiResult = await detectPiracy(suspiciousFile, officialFile);
      
      let detectionData = {
        ...apiResult,
        officialFile: officialFile.name,
        source,
      };

      setScanProgress(100);
      clearInterval(interval);
      setResult(detectionData);

      await saveDetection(detectionData);
      
    } catch (error) {
      if (interval) clearInterval(interval);
      setScanProgress(0);
      console.error("Scan failed with actual backend error:", error);
      setScanError(error.message || "Failed to process scan using the real backend structure.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="page-content" id="scan-page">
      <div className="page-header">
        <h1 className="section-title">Scan & Detect</h1>
        <p className="section-subtitle">
          Upload suspicious content to compare against your official library.
        </p>
      </div>

      <div className="scan-grid">
        {/* ── Official File ─── */}
        <motion.div
          className="scan-upload glass-card"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3><HiOutlineFilm /> Official Content</h3>
          <div
            className={`upload-zone mini ${officialFile ? 'has-file' : ''}`}
            onClick={() => document.getElementById('scan-official-input').click()}
          >
            {officialFile ? (
              <div className="file-preview">
                <HiOutlineFilm className="preview-icon" />
                <span className="preview-name">{officialFile.name}</span>
                <span className="preview-size">{formatFileSize(officialFile.size)}</span>
              </div>
            ) : (
              <>
                <div className="icon"><HiOutlineUpload /></div>
                <h3>Upload Official File</h3>
                <p>The original protected content</p>
              </>
            )}
          </div>
          <input
            type="file"
            id="scan-official-input"
            accept="video/*,image/*"
            onChange={(e) => setOfficialFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </motion.div>

        {/* ── VS Divider ────── */}
        <div className="scan-vs">
          <div className="vs-circle">VS</div>
        </div>

        {/* ── Suspicious File ─ */}
        <motion.div
          className="scan-upload glass-card"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3><HiOutlineShieldExclamation /> Suspicious Content</h3>
          <div
            className={`upload-zone mini ${suspiciousFile ? 'has-file' : ''}`}
            onClick={() => document.getElementById('scan-suspicious-input').click()}
          >
            {suspiciousFile ? (
              <div className="file-preview">
                <HiOutlineShieldExclamation className="preview-icon danger" />
                <span className="preview-name">{suspiciousFile.name}</span>
                <span className="preview-size">{formatFileSize(suspiciousFile.size)}</span>
              </div>
            ) : (
              <>
                <div className="icon"><HiOutlineUpload /></div>
                <h3>Upload Suspicious File</h3>
                <p>The content to scan for piracy</p>
              </>
            )}
          </div>
          <input
            type="file"
            id="scan-suspicious-input"
            accept="video/*,image/*"
            onChange={(e) => setSuspiciousFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </motion.div>
      </div>

      {/* ── Source Selector ── */}
      <motion.div
        className="glass-card"
        style={{ padding: '16px 20px', marginBottom: 0 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Suspicious Content Source:
          </label>
          <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
            <select
              id="select-scan-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              {SOURCES.map(s => (
                <option key={s.value} value={s.value} style={{ background: '#1a1a2e' }}>
                  {s.label}
                </option>
              ))}
            </select>
            <HiOutlineChevronDown
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Scan Button ────── */}
      <div className="scan-action">
        <button
          className="btn-primary btn-lg scan-btn"
          disabled={!officialFile || !suspiciousFile || scanning}
          onClick={handleScan}
          id="btn-start-scan"
        >
          <HiOutlineSearch />
          {scanning ? 'Analyzing...' : 'Start Detection Scan'}
        </button>
      </div>

      {/* ── Scan Progress / Errors ─── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="scan-progress-wrap glass-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="scan-progress-bar">
              <div className="scan-progress-fill" style={{ width: `${scanProgress}%` }} />
            </div>
            <div className="scan-progress-info">
              <span>Analyzing frames & generating fingerprints...</span>
              <span className="scan-pct">{Math.round(scanProgress)}%</span>
            </div>
          </motion.div>
        )}

        {scanError && !scanning && (
          <motion.div
            className="scan-error glass-card danger"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20, textAlign: 'center', padding: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <h3 style={{ color: 'var(--danger)', marginBottom: 8 }}><HiOutlineShieldExclamation size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Detection API Failed</h3>
            <p>{scanError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Preview ─── */}
      <AnimatePresence>
        {result && !scanning && (
          <motion.div
            className="scan-result glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="result-header">
              <h3>Detection Result</h3>
              <span className={`badge badge-${result.riskLevel === 'High' ? 'danger' : result.riskLevel === 'Medium' ? 'warning' : 'success'}`}>
                {result.riskLevel} Risk
              </span>
            </div>

            <div className="result-score-ring">
              <svg viewBox="0 0 120 120" className="ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={result.riskColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${result.matchPercentage * 3.14} 314`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="ring-value">
                <span className="ring-pct" style={{ color: result.riskColor }}>
                  {result.matchPercentage}%
                </span>
                <span className="ring-label">Match</span>
              </div>
            </div>

            <div className="result-details">
              <div className="result-row">
                <span>Edited Copy:</span>
                <span className={result.editedCopy ? 'danger-text' : 'success-text'}>
                  {result.editedCopy ? 'Yes — Modifications Detected' : 'No — Direct Copy'}
                </span>
              </div>
              <div className="result-row">
                <span>Modifications:</span>
                <div className="mod-tags">
                  {result.modifications.map((m, i) => (
                    <span key={i} className="mod-tag">{m}</span>
                  ))}
                </div>
              </div>
              <div className="result-row">
                <span>Official:</span>
                <span>{result.officialFile}</span>
              </div>
              <div className="result-row">
                <span>Suspicious:</span>
                <span>{result.suspiciousFile}</span>
              </div>
            </div>

            <button className="btn-primary" onClick={() => navigate('/results')} id="btn-view-all-results">
              View All Results →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
