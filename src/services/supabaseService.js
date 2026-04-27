import { supabase } from '../utils/supabaseClient';

// ─── OFFICIAL CONTENT ───────────────────────────────────────────────────

export const saveOfficialContent = async (fileData) => {
  const { data, error } = await supabase
    .from('official_content')
    .insert([{
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      storage_url: fileData.storageUrl,       // camelCase → snake_case
      fingerprint: fileData.fingerprint,
      status: 'Active',
      uploaded: new Date().toISOString().split('T')[0],
    }])
    .select();

  if (error) {
    console.error('Error saving official content:', error);
    throw new Error(error.message || 'Failed to save to Supabase');
  }

  return data && data.length > 0 ? data[0].id : `temp-${Date.now()}`;
};

export const getOfficialContent = async () => {
  const { data, error } = await supabase
    .from('official_content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch official content:', error);
    return [];
  }
  return (data || []).map(row => ({
    ...row,
    storageUrl: row.storage_url,
  }));
};

export const deleteOfficialContent = async (id) => {
  const { error } = await supabase
    .from('official_content')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting official content:', error);
    throw new Error(error.message);
  }
};

// ─── DETECTIONS ─────────────────────────────────────────────────────────

export const saveDetection = async (detectionData) => {
  const payload = {
    official_file:    detectionData.officialFile   || detectionData.official_file   || '',
    suspicious_file:  detectionData.suspiciousFile || detectionData.suspicious_file || '',
    match_percentage: detectionData.matchPercentage ?? detectionData.match_percentage ?? 0,
    risk_level:       detectionData.riskLevel       || detectionData.risk_level       || 'Low',
    modifications:    detectionData.modifications   || [],
    source:           detectionData.source          || 'Manual Upload Scan',
    status:           detectionData.status          || 'Active',
    event_time:       detectionData.timestamp       || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('detections')
    .insert([payload])
    .select();

  if (error) {
    console.error('Error saving detection:', error);
    throw new Error(error.message || 'Failed to save detection to Supabase');
  }

  const docId = data && data.length > 0 ? data[0].id : `temp-${Date.now()}`;

  if (payload.risk_level === 'High') {
    await createAlert({
      type: 'critical',
      title: 'High-Risk Piracy Detected',
      message: `Match: ${payload.match_percentage}% between ${payload.official_file} and ${payload.suspicious_file}`,
      source: payload.source,
      matchScore: payload.match_percentage,
      detectionId: docId,
    });
  } else if (payload.risk_level === 'Medium') {
    await createAlert({
      type: 'warning',
      title: 'Suspicious Content Flagged',
      message: `Match: ${payload.match_percentage}% detected.`,
      source: payload.source,
      matchScore: payload.match_percentage,
      detectionId: docId,
    });
  }

  return docId;
};

export const getDetections = async () => {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch detections:', error);
    return [];
  }
  // Normalise to camelCase so existing UI (Reports / Scan) keeps working
  return (data || []).map(row => ({
    ...row,
    officialFile:    row.official_file,
    suspiciousFile:  row.suspicious_file,
    matchPercentage: row.match_percentage,
    riskLevel:       row.risk_level,
    timestamp:       row.event_time,
  }));
};

// ─── ALERTS ─────────────────────────────────────────────────────────────

export const createAlert = async (alertData) => {
  const { error } = await supabase
    .from('piracy_alerts')
    .insert([{
      type:         alertData.type,
      title:        alertData.title,
      message:      alertData.message,
      source:       alertData.source,
      match_score:  alertData.matchScore,
      detection_id: alertData.detectionId,
      status:       'active',
      event_time:   new Date().toISOString(),
    }]);

  if (error) console.error('Error creating alert:', error);
};

export const getActiveAlerts = async () => {
  const { data, error } = await supabase
    .from('piracy_alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) return [];

  // Normalise to camelCase for UI
  return (data || []).map(row => ({
    ...row,
    matchScore:  row.match_score,
    detectionId: row.detection_id,
    time:        row.event_time,
  }));
};

export const dismissAlert = async (alertId) => {
  const { error } = await supabase
    .from('piracy_alerts')
    .update({ status: 'dismissed' })
    .eq('id', alertId);

  if (error) console.error('Error dismissing alert:', error);
};

// ─── DASHBOARD STATS ────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      { count: totalDetections },
      { count: todayAlerts },
      { count: videosMonitored },
      { count: highRiskCount },
    ] = await Promise.all([
      supabase.from('detections').select('*', { count: 'exact', head: true }),
      supabase.from('piracy_alerts').select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),
      supabase.from('official_content').select('*', { count: 'exact', head: true }),
      supabase.from('detections').select('*', { count: 'exact', head: true })
        .eq('risk_level', 'High'),
    ]);

    return {
      totalDetections: totalDetections || 0,
      todayAlerts:     todayAlerts     || 0,
      videosMonitored: videosMonitored || 0,
      highRiskCount:   highRiskCount   || 0,
    };
  } catch {
    return null;
  }
};

export const getDashboardChartData = async () => {
  // Build last-7-days labels
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const results = await Promise.all(days.map(async (day) => {
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end   = new Date(day); end.setHours(23, 59, 59, 999);

    const [{ count: detections }, { count: highRisk }] = await Promise.all([
      supabase.from('detections').select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
      supabase.from('detections').select('*', { count: 'exact', head: true })
        .eq('risk_level', 'High')
        .gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
    ]);

    return {
      name:       day.toLocaleDateString('en-US', { weekday: 'short' }),
      detections: detections || 0,
      highRisk:   highRisk   || 0,
    };
  }));

  return results;
};

export const getPiracySources = async () => {
  const { data, error } = await supabase
    .from('detections')
    .select('source');

  if (error || !data || data.length === 0) return null;

  // Group by source
  const counts = {};
  data.forEach(row => {
    const key = row.source || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];
  return Object.entries(counts).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }));
};

export const getRecentAlerts = async (limit = 5) => {
  const { data, error } = await supabase
    .from('piracy_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(row => ({
    ...row,
    matchScore:  row.match_score,
    time:        row.event_time || row.created_at,
  }));
};

// ─── SETTINGS ───────────────────────────────────────────────────────────

export const saveSettings = async (settings) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert([{ id: 1, ...settings }])
    .select();
  if (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
  return data;
};

export const getSettings = async () => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) return null;
  return data;
};
