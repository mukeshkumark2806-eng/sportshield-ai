// ═══════════════════════════════════════════════════
// Detection Engine — SportShield AI
// Simulated AI detection logic for hackathon demo
// ═══════════════════════════════════════════════════

/**
 * Simulate fingerprint generation for an uploaded file.
 * In production, this would use OpenCV/perceptual hashing.
 */
export function generateFingerprint(file) {
  const chars = 'abcdef0123456789';
  let hash = '';
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return {
    hash,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    timestamp: new Date().toISOString(),
    algorithm: 'pHash-DCT-64bit',
  };
}

/**
 * Simulate comparison between official and suspicious content.
 * Returns realistic detection results.
 */
export function compareContent(officialFile, suspiciousFile) {
  // Simulate processing delay
  const baseScore = Math.random();
  
  // Generate weighted similarity score (biased toward higher matches for demo)
  const matchPercentage = Math.round((40 + baseScore * 58) * 10) / 10;
  
  // Determine risk level
  let riskLevel, riskColor;
  if (matchPercentage >= 80) {
    riskLevel = 'High';
    riskColor = '#ef4444';
  } else if (matchPercentage >= 55) {
    riskLevel = 'Medium';
    riskColor = '#f59e0b';
  } else {
    riskLevel = 'Low';
    riskColor = '#10b981';
  }

  // Determine modifications
  const possibleMods = [
    'Cropped',
    'Resized',
    'Watermark removed',
    'Resolution reduced',
    'Audio replaced',
    'Speed altered',
    'Color grading changed',
    'Text overlay added',
    'Trimmed',
    'Logo overlay',
    'Aspect ratio changed',
    'Frame rate modified',
  ];

  const numMods = Math.floor(Math.random() * 4) + 1;
  const shuffled = possibleMods.sort(() => 0.5 - Math.random());
  const modifications = shuffled.slice(0, numMods);

  const isEditedCopy = matchPercentage < 98;

  return {
    id: `DET-${Date.now().toString().slice(-6)}`,
    officialFile: officialFile?.name || 'Official_Content.mp4',
    suspiciousFile: suspiciousFile?.name || 'Suspicious_Upload.mp4',
    matchPercentage,
    riskLevel,
    riskColor,
    editedCopy: isEditedCopy,
    modifications,
    timestamp: new Date().toISOString(),
    status: 'Active',
    source: 'Manual Upload',
    fingerprintOfficial: generateFingerprint(officialFile || { name: 'official', size: 0, type: '' }),
    fingerprintSuspicious: generateFingerprint(suspiciousFile || { name: 'suspicious', size: 0, type: '' }),
    analysisDetails: {
      frameSimilarity: Math.round((matchPercentage + (Math.random() * 10 - 5)) * 10) / 10,
      audioSimilarity: Math.round((matchPercentage - 15 + Math.random() * 30) * 10) / 10,
      temporalAlignment: Math.round((matchPercentage + (Math.random() * 8 - 4)) * 10) / 10,
      colorHistogram: Math.round((matchPercentage + (Math.random() * 12 - 6)) * 10) / 10,
    },
  };
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
