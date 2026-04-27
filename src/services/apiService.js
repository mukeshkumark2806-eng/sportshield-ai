// ═══════════════════════════════════════════════════
// API Service — SportShield AI
// Handles communication with the Flask Detection API
// ═══════════════════════════════════════════════════

const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://sportshield-ai-fioa.onrender.com';
const API_BASE_URL = `${VITE_API_URL}/api`;

/**
 * Upload official content to the backend analyzer to generate fingerprint
 */
export const registerContentToEngine = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch(`${API_BASE_URL}/upload/official`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to register official content');
    }
    return data;
  } catch (error) {
    console.error("Backend API Error:", error);
    throw error;
  }
};

/**
 * Detect piracy by comparing a suspicious file against official content
 */
export const detectPiracy = async (suspiciousFile, officialFile) => {
  try {
    const formData = new FormData();
    formData.append('suspicious_file', suspiciousFile);
    if (officialFile) {
        formData.append('official_file', officialFile);
    }

    const detectRes = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      body: formData, // Send both files to backend
    });

    const detectionData = await detectRes.json();
    
    if (!detectRes.ok || !detectionData.success) {
      throw new Error(detectionData.error || 'Failed to analyze files.');
    }
    
    return detectionData;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
