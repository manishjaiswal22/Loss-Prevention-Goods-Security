/**
 * @param {string|number} val 
 * @returns {string}
 */
export function formatCurrency(val) {
  if (val == null || val === '') return '₹0';
  const str = String(val).trim();
  if (str === 'N/A' || str === 'NA' || str === '₹N/A' || str === '₹NA') return '₹0';
  if (str.startsWith('₹')) {
    const numPart = str.slice(1).replace(/,/g, '').trim();
    const num = Number(numPart);
    if (!isNaN(num)) return `₹${num.toLocaleString('en-IN')}`;
    return '₹0';
  }
  const num = Number(str.replace(/,/g, ''));
  if (!isNaN(num)) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return '₹0';
}

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Normalizes backend dashboard payload into consistent structured metrics
 * @param {Object} data Raw backend data (from API response or SSE message)
 * @returns {Object} Structured dashboard data
 */
export function normalizeDashboardData(data) {
  if (!data) return null;
  const summary = data.Summary || data;

  const rawLoss = (summary.PotentialLossDisplay && summary.PotentialLossDisplay !== 'N/A' && summary.PotentialLossDisplay !== 'NA')
    ? summary.PotentialLossDisplay
    : (summary.PotentialLoss ?? '0');

  const incidents = (data.SecurityIncidents?.Incidents || data.Incidents || []).map((inc, index) => {
    const rawAmt = inc.Amount ?? inc.AmountDisplay ?? 0;
    let safeAmt = 0;
    if (typeof rawAmt === 'number' && !isNaN(rawAmt)) {
      safeAmt = rawAmt;
    } else if (rawAmt && rawAmt !== 'N/A' && rawAmt !== 'NA') {
      const parsed = Number(String(rawAmt).replace(/[₹,\s]/g, ''));
      safeAmt = isNaN(parsed) ? 0 : parsed;
    }

    return {
      id: inc.EPC || inc.Id || `inc-${index}`,
      articleDescription: inc.ArticleDescription || inc.ItemName || inc.ArticleDesc || 'Untitled Article',
      articleNo: inc.ArticleNo || inc.Material || inc.EAN_UPC || 'N/A',
      epc: inc.EPC || 'N/A',
      amount: safeAmt,
      amountDisplay: `₹${safeAmt.toLocaleString('en-IN')}`,
      date: inc.IncidentDate || inc.Date || '',
      time: inc.IncidentTime || inc.Time || '',
      status: inc.AlertStatus || 'Theft Alert',
      variant: 'theft',
      storeCode: inc.StoreCode || '',
      storeName: inc.StoreName || '',
    };
  });

  return {
    date: data.Date || null,
    totalTags: summary.TotalTags != null ? String(summary.TotalTags) : '0',
    untagged: summary.Untagged != null ? String(summary.Untagged) : (summary.Checkout != null ? String(summary.Checkout) : '0'),
    theftAlerts: summary.TheftAlerts != null ? String(summary.TheftAlerts) : (summary.Loss != null ? String(summary.Loss) : '0'),
    potentialLoss: formatCurrency(rawLoss),
    incidents,
  };
}

export const DASHBOARD_SYNC_EVENT = 'loss-prevention:dashboard-sync';

/**
 * Broadcasts dashboard/theft update event across the entire application
 * @param {Object} data Normalized dashboard data or live stream event
 */
export function broadcastDashboardSync(data) {
  if (typeof window !== 'undefined' && data) {
    try {
      window.dispatchEvent(new CustomEvent(DASHBOARD_SYNC_EVENT, { detail: data }));
    } catch (e) {
      console.warn('Failed to broadcast dashboard sync event:', e);
    }
  }
}

/**
 * Subscribes to global dashboard sync events
 * @param {Function} callback Handler receiving synced data
 * @returns {Function} Unsubscribe teardown
 */
export function onDashboardSync(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => {
    if (e.detail && callback) {
      callback(e.detail);
    }
  };
  window.addEventListener(DASHBOARD_SYNC_EVENT, handler);
  return () => window.removeEventListener(DASHBOARD_SYNC_EVENT, handler);
}

/**
 * Checks whether an incident date belongs to today's date
 * Handles formats like '01 Oct 2026', '2026-10-01', '01-10-2026', ISO strings, etc.
 * @param {string} dateStr 
 * @returns {boolean}
 */
export function isTodayIncident(dateStr) {
  if (!dateStr) return true;
  const str = String(dateStr).trim();
  if (!str) return true;

  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const d = pad(today.getDate());
  const m = pad(today.getMonth() + 1);
  const y = String(today.getFullYear());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[today.getMonth()].toLowerCase();

  const lower = str.toLowerCase();
  // Check if contains current month name (e.g. "01 Oct 2026" or "1 oct")
  if (lower.includes(monthName) && (lower.includes(d) || lower.includes(String(today.getDate())))) {
    return true;
  }

  // Check numeric dates like 01-10-2026, 2026-10-01, 01/10/2026
  const cleaned = str.replace(/[\/\.]/g, '-');
  if (cleaned.includes(`${d}-${m}`) || cleaned.includes(`${m}-${d}`) || cleaned.includes(`${y}-${m}-${d}`)) {
    return true;
  }

  // Safe Date parsing with UTC and local matching
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const localMatch = parsed.getDate() === today.getDate() && parsed.getMonth() === today.getMonth();
    const utcMatch = parsed.getUTCDate() === today.getDate() && parsed.getUTCMonth() === today.getMonth();
    return localMatch || utcMatch;
  }

  return true;
}

/**
 * Fetch today's dashboard overview cards data from /api/todayDashboard
 * @param {Object} payload Optional request payload
 * @returns {Promise<{totalTags: string, untagged: string, theftAlerts: string, potentialLoss: string, incidents: Array}>}
 */
export async function fetchDashboardRecord(payload = {}) {
  try {
    let response = await fetch(`${API_BASE_URL}/api/todayDashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();
    const normalized = normalizeDashboardData(data);
    if (normalized) {
      broadcastDashboardSync(normalized);
    }
    return normalized;
  } catch (error) {
    console.error('Error fetching today dashboard data:', error);
    throw error;
  }
}

export const fetchTodayRecord = fetchDashboardRecord;

/**
 * Normalizes a single incident (useful for single SSE theft alerts)
 * @param {Object} inc Raw incident object
 * @param {number} index Index fallback
 * @returns {Object} Normalized incident object
 */
export function normalizeSingleIncident(inc, index = 0) {
  if (!inc) return null;
  const rawAmt = inc.Amount ?? inc.AmountDisplay ?? 0;
  let safeAmt = 0;
  if (typeof rawAmt === 'number' && !isNaN(rawAmt)) {
    safeAmt = rawAmt;
  } else if (rawAmt && rawAmt !== 'N/A' && rawAmt !== 'NA') {
    const parsed = Number(String(rawAmt).replace(/[₹,\s]/g, ''));
    safeAmt = isNaN(parsed) ? 0 : parsed;
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return {
    id: inc.EPC || inc.EpcCode || inc.Id || `inc-${Date.now()}-${index}`,
    articleDescription: inc.ArticleDescription || inc.ItemName || inc.ArticleDesc || 'Untitled Article',
    articleNo: inc.ArticleNo || inc.Material || inc.EAN_UPC || 'N/A',
    epc: inc.EPC || inc.EpcCode || 'N/A',
    amount: safeAmt,
    amountDisplay: `₹${safeAmt.toLocaleString('en-IN')}`,
    date: inc.IncidentDate || inc.Date || defaultDate,
    time: inc.IncidentTime || inc.Time || defaultTime,
    status: inc.AlertStatus || inc.EventType || 'Theft Alert',
    variant: 'theft',
    storeCode: inc.StoreCode || '',
    storeName: inc.StoreName || '',
  };
}

let liveSubscribers = new Set();
let livePollInterval = null;
let lastMaxTagId = 0;
let isCheckingLive = false;
let currentLiveStatus = 'connecting';

function broadcastToSubscribers(type, data) {
  liveSubscribers.forEach((sub) => {
    try {
      if (type === 'message' && sub.onMessage) sub.onMessage(data);
      if (type === 'status' && sub.onStatusChange) sub.onStatusChange(data);
      if (type === 'error' && sub.onError) sub.onError(data);
    } catch (e) {
      console.warn('Error in live stream subscriber callback:', e);
    }
  });
}

async function pollLiveCheck() {
  if (liveSubscribers.size === 0 || isCheckingLive) return;
  isCheckingLive = true;

  const checkUrl = import.meta.env.DEV
    ? '/api/liveCheck'
    : (import.meta.env?.VITE_LIVE_CHECK_URL || `${API_BASE_URL}/api/liveCheck`);

  try {
    const response = await fetch(`${checkUrl}?lastMaxTagId=${lastMaxTagId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();

    if (currentLiveStatus !== 'connected') {
      currentLiveStatus = 'connected';
      broadcastToSubscribers('status', 'connected');
    }

    if (lastMaxTagId === 0) {
      lastMaxTagId = result.maxTagId;
      broadcastToSubscribers('message', { event: 'connected', maxTagId: result.maxTagId });
    } else if (result.hasNew || result.maxTagId > lastMaxTagId) {
      lastMaxTagId = result.maxTagId;
      const eventData = {
        event: 'new_record',
        maxTagId: result.maxTagId,
        timestamp: result.timestamp || new Date().toISOString(),
      };
      broadcastToSubscribers('message', eventData);
      broadcastDashboardSync(eventData);
    }
  } catch (err) {
    if (currentLiveStatus !== 'disconnected') {
      currentLiveStatus = 'disconnected';
      broadcastToSubscribers('status', 'disconnected');
    }
    broadcastToSubscribers('error', err);
  } finally {
    isCheckingLive = false;
  }
}

/**
 * Subscribes to real-time live updates from /api/liveCheck
 * Uses a single shared poll loop for all components to ensure perfect synchronization
 * @param {Function} onMessage Callback invoked with live data or liveCheck event
 * @param {Function} onError Optional error callback
 * @param {Function} onStatusChange Optional callback receiving 'connecting' | 'connected' | 'disconnected'
 * @returns {Function} Teardown unsubscribe function
 */
export function subscribeToLiveStream(onMessage, onError, onStatusChange) {
  if (typeof window === 'undefined') {
    if (onStatusChange) onStatusChange('disconnected');
    return () => {};
  }

  const sub = { onMessage, onError, onStatusChange };
  liveSubscribers.add(sub);

  if (onStatusChange) {
    onStatusChange(currentLiveStatus);
  }

  if (!livePollInterval) {
    pollLiveCheck();
    livePollInterval = setInterval(pollLiveCheck, 2500);
  }

  return () => {
    liveSubscribers.delete(sub);
    if (liveSubscribers.size === 0 && livePollInterval) {
      clearInterval(livePollInterval);
      livePollInterval = null;
    }
  };
}

export async function fetchAnalyticsDashboard(payload = {}) {
  try {
    const todayStr = (function () {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const startDate = payload.StartDate || payload.FromDate || (payload.Preset ? undefined : todayStr);
    const endDate = payload.EndDate || payload.ToDate || (payload.Preset ? undefined : todayStr);

    const body = { ...payload };

    if (startDate && endDate) {
      body.StartDate = startDate;
      body.EndDate = endDate;
      body.FromDate = startDate;
      body.ToDate = endDate;
      delete body.Preset;
    }

    if (payload.StoreId || payload.StoreCode) {
      body.StoreId = payload.StoreId || payload.StoreCode;
      body.StoreCode = payload.StoreCode || payload.StoreId;
    }

    const response = await fetch(`${API_BASE_URL}/api/analyticsDashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.Summary || data;
    const rawLoss = (summary.PotentialLossDisplay && summary.PotentialLossDisplay !== 'N/A')
      ? summary.PotentialLossDisplay
      : (summary.PotentialLoss ?? '0');

    return {
      preset: data.Preset,
      startDate: data.StartDate,
      endDate: data.EndDate,
      totalTags: summary.TotalTags != null ? String(summary.TotalTags) : '0',
      untagged: summary.Untagged != null ? String(summary.Untagged) : (summary.Checkout != null ? String(summary.Checkout) : '0'),
      theftAlerts: summary.TheftAlerts != null ? String(summary.TheftAlerts) : (summary.Loss != null ? String(summary.Loss) : '0'),
      potentialLoss: formatCurrency(rawLoss),
      tagStatusDistribution: data.TagStatusDistribution || null,
      highIncidentTargets: data.HighIncidentTargets || null,
      hourlyThefts: data.HourlyThefts || null,
      weeklyThefts: data.WeeklyThefts || null,
    };
  } catch (error) {
    console.error('Error fetching analytics dashboard data:', error);
    throw error;
  }
}

export async function fetchIncidentReport(payload = {}) {
  try {
    const body = {
      PageSize: payload.PageSize ?? 10,
      PageNumber: payload.PageNumber ?? 1,
      EventType: payload.EventType ?? 'All',
      Search: payload.Search ?? '',
    };

    const fromDate = payload.StartDate || payload.FromDate;
    const toDate = payload.EndDate || payload.ToDate;

    if (fromDate) {
      body.FromDate = fromDate;
      body.StartDate = fromDate;
    }

    if (toDate) {
      body.ToDate = toDate;
      body.EndDate = toDate;
    }

    if (payload.StoreCode || payload.StoreId) {
      body.StoreCode = payload.StoreCode || payload.StoreId;
    }

    delete body.Preset;

    const response = await fetch(`${API_BASE_URL}/api/incidentReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.Summary || {};
    const totalAll = Number(data.TotalAll ?? data.TotalTags ?? summary.TotalTags ?? data.TotalRecords ?? 0);
    const totalTheft = Number(data.TotalTheft ?? data.TheftAlerts ?? summary.TheftAlerts ?? summary.Loss ?? 0);
    const totalUntagged = Number(data.TotalUntagged ?? data.Untagged ?? summary.Untagged ?? summary.Checkout ?? 0);
    const totalTags = Number(data.TotalTags ?? summary.TotalTags ?? totalAll);
    const theftAlerts = Number(data.TheftAlerts ?? summary.TheftAlerts ?? totalTheft);
    const untagged = Number(data.Untagged ?? summary.Untagged ?? totalUntagged);

    let potentialLoss = data.PotentialLossDisplay || data.TotalLossDisplay || summary.PotentialLossDisplay;
    if (!potentialLoss || potentialLoss === 'N/A' || potentialLoss === 'NA') {
      const rawLoss = data.PotentialLoss ?? summary.PotentialLoss ?? 0;
      const numLoss = Number(rawLoss);
      potentialLoss = `₹${(isNaN(numLoss) ? 0 : numLoss).toLocaleString('en-IN')}`;
    } else if (!potentialLoss.startsWith('₹')) {
      const numLoss = Number(String(potentialLoss).replace(/,/g, ''));
      potentialLoss = !isNaN(numLoss) ? `₹${numLoss.toLocaleString('en-IN')}` : '₹0';
    }

    return {
      code: data.Code,
      msg: data.Msg,
      preset: data.Preset,
      startDate: data.StartDate,
      endDate: data.EndDate,
      summary: data.Summary || null,
      totalAll,
      totalTheft,
      totalUntagged,
      totalTags,
      theftAlerts,
      untagged,
      potentialLoss,
      pageNumber: Number(data.PageNumber ?? body.PageNumber),
      pageSize: Number(data.PageSize ?? body.PageSize),
      totalRecords: Number(data.TotalRecords ?? (data.Records ? data.Records.length : 0)),
      totalPages: Number(data.TotalPages ?? 1),
      records: (data.Records || []).map((item, idx) => {
        const rawAmt = item.Amount ?? item.AmountDisplay ?? 0;
        let safeAmt = 0;
        if (typeof rawAmt === 'number' && !isNaN(rawAmt)) {
          safeAmt = rawAmt;
        } else if (rawAmt && rawAmt !== 'N/A' && rawAmt !== 'NA') {
          const parsed = Number(String(rawAmt).replace(/[₹,\s]/g, ''));
          safeAmt = isNaN(parsed) ? 0 : parsed;
        }

        return {
          id: item.EpcCode || `inc-${item.SrNo || idx}`,
          srNo: item.SrNo ?? idx + 1,
          date: item.Date || '',
          time: item.Time || '',
          storeCode: item.StoreCode || '',
          storeName: item.StoreName || '',
          epc: item.EpcCode || '',
          articleNo: item.ArticleNo || '',
          articleDescription: item.ArticleDescription || '',
          qty: item.Qty ?? 1,
          amount: safeAmt,
          amountDisplay: `₹${safeAmt.toLocaleString('en-IN')}`,
          eventType: item.EventType || 'Theft',
        };
      }),
    };
  } catch (error) {
    console.error('Error fetching incident report data:', error);
    throw error;
  }
}
