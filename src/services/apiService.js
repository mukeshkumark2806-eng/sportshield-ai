// ═══════════════════════════════════════════════════
// API Service — SportShield AI
// Handles communication with the Flask Detection API
// ═══════════════════════════════════════════════════

let VITE_API_URL = import.meta.env.VITE_API_URL || 'https://sportshield-ai-fioa.onrender.com';

// Clean up trailing slash
if (VITE_API_URL.endsWith('/')) {
  VITE_API_URL = VITE_API_URL.slice(0, -1);
}
// Clean up duplicate /api
if (VITE_API_URL.endsWith('/api')) {
  VITE_API_URL = VITE_API_URL.slice(0, -4);
}

const API_BASE_URL = `${VITE_API_URL}/api`;
console.log("🚀 [API Service] Connecting to:", API_BASE_URL);

/**
 * Helper to handle fetch errors
 */
const handleFetchError = (error, endpoint) => {
  console.error(`❌ [API Error] ${endpoint}:`, error);
  if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
    throw new Error(`Could not connect to the Detection API at ${API_BASE_URL}. Please ensure the Python backend is running locally on port 5000.`);
  }
  throw error;
};

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

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to register official content');
    }
    return data;
  } catch (error) {
    return handleFetchError(error, 'upload/official');
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
      body: formData,
    });

    if (!detectRes.ok) {
      const errorData = await detectRes.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${detectRes.status}`);
    }

    const detectionData = await detectRes.json();
    
    if (!detectionData.success) {
      throw new Error(detectionData.error || 'Failed to analyze files.');
    }
    
    return detectionData;
  } catch (error) {
    return handleFetchError(error, 'detect');
  }
};
