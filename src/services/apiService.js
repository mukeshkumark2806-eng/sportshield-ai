import { generateFingerprint, compareContent } from '../utils/detectionEngine';

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
 * Helper to handle fetch errors and provide fallback
 */
const handleFetchError = (error, endpoint, fallbackFn) => {
  console.warn(`⚠️ [API Warning] ${endpoint} failed, using local mock fallback:`, error.message);
  return fallbackFn();
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
    return handleFetchError(error, 'upload/official', () => ({
      success: true,
      content_id: `MOCK-OFF-${Math.random().toString(16).slice(2, 8)}`,
      filename: file.name,
      fingerprint: generateFingerprint(file),
      secure_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
      isMock: true
    }));
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
    return handleFetchError(error, 'detect', () => {
      const mockResult = compareContent(officialFile, suspiciousFile);
      return {
        success: true,
        ...mockResult,
        isMock: true
      };
    });
  }
};
