// ═══════════════════════════════════════════════════
// Reports Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineDownload } from 'react-icons/hi';
import * as XLSX from 'xlsx';
import { mockDetections } from '../utils/mockData';
import { formatTimestamp } from '../utils/detectionEngine';
import './Reports.css';

export default function Reports() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dbDetections, setDbDetections] = useState([]);

  useEffect(() => {
    // Load detections from real Firebase
    import('../services/supabaseService').then(({ getDetections }) => {
      getDetections().then(data => {
        if (data && data.length > 0) setDbDetections(data);
      });
    });
  }, []);

  const allDetections = [...dbDetections, ...mockDetections];

  const filtered = allDetections.filter((d) => {
    const dOfficial = (d.officialFile || d.official_file || '').toLowerCase();
    const dSusp = (d.suspiciousFile || d.suspicious_file || '').toLowerCase();
    const dId = (d.id || '').toLowerCase();
    const sTerm = search.toLowerCase();

    const matchSearch = dOfficial.includes(sTerm) || dSusp.includes(sTerm) || dId.includes(sTerm);
    const matchRisk = riskFilter === 'all' || (d.riskLevel || d.risk_level) === riskFilter;
    return matchSearch && matchRisk;
  });

  const exportCSV = () => {
    const data = filtered.map((d) => ({
      'Detection ID': d.id,
      'Official File': d.officialFile || d.official_file,
      'Suspicious File': d.suspiciousFile || d.suspicious_file,
      'Match %': d.matchPercentage ?? d.match_percentage,
      'Risk Level': d.riskLevel || d.risk_level,
      'Source': d.source,
      'Status': d.status,
      'Modifications': (d.modifications || []).join(', '),
      'Timestamp': formatTimestamp(d.timestamp || d.event_time),
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns based on content
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detection Reports');

    // Write to binary buffer and force download via anchor element
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SportShield_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="page-content" id="reports-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Reports & History</h1>
          <p className="section-subtitle">Complete detection history with search and filters</p>
        </div>
        <button className="btn-secondary" id="btn-export-csv" onClick={exportCSV}>
          <HiOutlineDownload /> Export Excel
        </button>
      </div>

      {/* ── Filters ─────────── */}
      <motion.div
        className="report-filters glass-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="filter-search">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search by file name or detection ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-report-search"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div className="filter-pills">
          {['all', 'High', 'Medium', 'Low'].map((r) => (
            <button
              key={r}
              className={`filter-pill ${riskFilter === r ? 'active' : ''}`}
              onClick={() => setRiskFilter(r)}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Table ───────────── */}
      <motion.div
        className="data-table-wrap"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <table className="data-table" id="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Official File</th>
              <th>Suspicious File</th>
              <th>Match %</th>
              <th>Risk</th>
              <th>Edited</th>
              <th>Source</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.id + i}>
                <td>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-accent)' }}>
                    {d.id}
                  </code>
                </td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.officialFile || d.official_file}
                </td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.suspiciousFile || d.suspicious_file}
                </td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: (d.matchPercentage ?? d.match_percentage) >= 80 ? 'var(--danger)' : (d.matchPercentage ?? d.match_percentage) >= 55 ? 'var(--warning)' : 'var(--success)',
                  }}>
                    {d.matchPercentage ?? d.match_percentage}%
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${(d.riskLevel || d.risk_level) === 'High' ? 'danger' : (d.riskLevel || d.risk_level) === 'Medium' ? 'warning' : 'success'}`}>
                    {d.riskLevel || d.risk_level}
                  </span>
                </td>
                <td>{d.source}</td>
                <td>
                  <span className={`badge badge-${d.status === 'Active' ? 'danger' : d.status === 'Resolved' ? 'success' : 'warning'}`}>
                    {d.status}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  {formatTimestamp(d.timestamp || d.event_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          No detections found matching your search.
        </div>
      )}
    </div>
  );
}
