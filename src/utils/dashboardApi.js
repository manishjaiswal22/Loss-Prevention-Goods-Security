/**
 * Format currency with ₹ symbol and Indian numbering format
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

// In development mode, always route via Vite proxy ('/api') to avoid browser CORS errors
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
    return normalizeDashboardData(data);
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

/**
 * Subscribes to real-time Server-Sent Events (SSE) live stream from /api/liveStream
 * @param {Function} onMessage Callback invoked with live data (full dashboard, single incident, or incident array)
 * @param {Function} onError Optional error callback
 * @param {Function} onStatusChange Optional callback receiving 'connecting' | 'connected' | 'disconnected'
 * @returns {Function} Teardown unsubscribe function
 */
export function subscribeToLiveStream(onMessage, onError, onStatusChange) {
  if (typeof window === 'undefined' || !window.EventSource) {
    console.warn('EventSource is not supported in this browser environment');
    if (onStatusChange) onStatusChange('disconnected');
    return () => {};
  }

  const streamUrl = import.meta.env.DEV
    ? '/api/liveStream'
    : (import.meta.env?.VITE_LIVE_STREAM_URL || `${API_BASE_URL}/api/liveStream`);

  let eventSource = null;

  try {
    if (onStatusChange) onStatusChange('connecting');
    eventSource = new EventSource(streamUrl);

    // Connected successfully
    eventSource.onopen = () => {
      if (onStatusChange) onStatusChange('connected');
    };

    const dispatchMessage = (rawData) => {
      try {
        if (!rawData) return;
        const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        if (onMessage) {
          onMessage(parsed);
        }
        if (onStatusChange) onStatusChange('connected');
      } catch (err) {
        console.warn('Error parsing live stream SSE message:', err);
      }
    };

    // Standard SSE message handler
    eventSource.onmessage = (event) => {
      dispatchMessage(event.data);
    };

    // Named event listeners (if backend emits custom event names)
    eventSource.addEventListener('dashboardUpdate', (event) => dispatchMessage(event.data));
    eventSource.addEventListener('theftAlert', (event) => dispatchMessage(event.data));
    eventSource.addEventListener('liveUpdate', (event) => dispatchMessage(event.data));

    eventSource.onerror = (err) => {
      if (eventSource && eventSource.readyState === EventSource.CONNECTING) {
        // EventSource is automatically attempting reconnection
        if (onStatusChange) onStatusChange('connecting');
      } else {
        if (onStatusChange) onStatusChange('disconnected');
      }
      if (onError) onError(err);
    };
  } catch (err) {
    console.error('Failed to initialize EventSource for liveStream:', err);
    if (onStatusChange) onStatusChange('disconnected');
    if (onError) onError(err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (onStatusChange) onStatusChange('disconnected');
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
      // Do not pass Preset when date range is selected
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

    // Do not pass Preset
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
