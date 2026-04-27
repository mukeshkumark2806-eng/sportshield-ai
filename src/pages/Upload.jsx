// ═══════════════════════════════════════════════════
// Upload Page — SportShield AI
// Upload Official Content & Generate Fingerprints
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUpload,
  HiOutlineFilm,
  HiOutlineTrash,
  HiOutlineFingerPrint,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { generateFingerprint, formatFileSize } from '../utils/detectionEngine';
import { mockOfficialContent } from '../utils/mockData';
import './Upload.css';

// Helper: extract a displayable fingerprint string from any shape
function getFpDisplay(fp) {
  if (!fp) return 'N/A';
  if (typeof fp === 'string') return fp.slice(0, 14);
  return (fp.phash || fp.hash || fp.md5 || '').toString().slice(0, 14);
}

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [uploadedContent, setUploadedContent] = useState(
    Array.isArray(mockOfficialContent) ? mockOfficialContent : []
  );
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    import('../services/supabaseService').then(({ getOfficialContent }) => {
      getOfficialContent().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUploadedContent(data);
        }
      }).catch(err => console.warn('Could not load official content:', err));
    });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    processFiles(dropped);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    processFiles(selected);
  };

  const processFiles = (newFiles) => {
    const fileItems = newFiles.map((f) => ({
      file: f,
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      status: 'pending',
      fingerprint: null,
    }));
    setFiles((prev) => [...prev, ...fileItems]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadAll = async () => {
    setProcessing(true);
    try {
      const { saveOfficialContent } = await import('../services/supabaseService');
      const { registerContentToEngine } = await import('../services/apiService');

      const newContent = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.status === 'done') continue;
        
        try {
          const fileObj = f.file;
          const engineResult = await registerContentToEngine(fileObj);
          
          if (!engineResult || !engineResult.secure_url) {
            throw new Error("Failed to get Cloudinary secure URL from backend");
          }

          const fingerprintData = engineResult.fingerprint || generateFingerprint(fileObj);

          const officialData = {
            name: f.name,
            type: f.type?.includes('video') ? 'video' : 'image',
            size: formatFileSize(f.size),
            storageUrl: engineResult.secure_url,
            fingerprint: fingerprintData.hash || fingerprintData.phash || Math.random().toString(16).slice(2, 10),
          };

          const docId = await saveOfficialContent(officialData);
          officialData.id = docId;
          officialData.uploaded = new Date().toISOString().split('T')[0];
          officialData.status = 'Active';

          setFiles((prev) =>
            prev.map((item) =>
              item.id === f.id ? { ...item, status: 'done', fingerprint: fingerprintData } : item
            )
          );
          newContent.push(officialData);
        } catch (error) {
          console.error("Upload failed for file:", f.name, error);
          setFiles((prev) =>
            prev.map((item) =>
              item.id === f.id ? { ...item, status: 'error' } : item
            )
          );
        }
      }

      setUploadedContent((prev) => [...newContent, ...prev]);
    } catch (globalErr) {
      console.error("Critical error in upload process:", globalErr);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-content" id="upload-page">
      <div className="page-header">
        <h1 className="section-title">Upload Official Content</h1>
        <p className="section-subtitle">
          Upload your official sports videos to generate fingerprint metadata for protection.
        </p>
      </div>

      {/* ── Upload Zone ────── */}
      <motion.div
        className={`upload-zone ${dragActive ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => document.getElementById('file-input-official').click()}
        id="upload-zone-official"
      >
        <div className="icon"><HiOutlineUpload /></div>
        <h3>Drop your official sports content here</h3>
        <p>or click to browse. Supports MP4, AVI, MOV, JPG, PNG</p>
        <input
          type="file"
          id="file-input-official"
          multiple
          accept="video/*,image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </motion.div>

      {/* ── File Queue ─────── */}
      {files.length > 0 && (
        <motion.div
          className="file-queue glass-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="queue-header">
            <h3>Upload Queue ({files.length} files)</h3>
            <button
              className="btn-primary"
              onClick={handleUploadAll}
              disabled={processing}
              id="btn-upload-all"
            >
              <HiOutlineFingerPrint />
              {processing ? 'Processing...' : 'Generate Fingerprints'}
            </button>
          </div>
          <div className="queue-list">
            {files.map((f) => (
              <div key={f.id} className={`queue-item ${f.status}`}>
                <HiOutlineFilm className="queue-file-icon" />
                <div className="queue-file-info">
                  <span className="queue-file-name">{f.name}</span>
                  <span className="queue-file-size">{formatFileSize(f.size)}</span>
                </div>
                {f.status === 'done' && (
                  <div className="queue-fp">
                    <HiOutlineCheckCircle className="fp-check" />
                    <code>{getFpDisplay(f.fingerprint)}...</code>
                  </div>
                )}
                {f.status === 'pending' && (
                  <button className="queue-remove" onClick={() => removeFile(f.id)}>
                    <HiOutlineTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Official Content Library ── */}
      <motion.div
        className="glass-card"
        style={{ marginTop: 24 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ padding: '20px 20px 0' }}>
          <h3 className="chart-title">Official Content Library</h3>
        </div>
        <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Fingerprint</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(uploadedContent) && uploadedContent.map((item) => (
                <tr key={item.id || item.name}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</td>
                  <td><span className="badge badge-success">{item.type}</span></td>
                  <td>{item.size}</td>
                  <td>{item.uploaded}</td>
                  <td>
                    <code style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {typeof item.fingerprint === 'string'
                        ? item.fingerprint.slice(0, 16)
                        : getFpDisplay(item.fingerprint)}
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
