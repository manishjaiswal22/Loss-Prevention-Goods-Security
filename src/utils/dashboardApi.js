/**
 * Format currency with ₹ symbol and Indian numbering format
 * @param {string|number} val 
 * @returns {string}
 */
export function formatCurrency(val) {
  if (val == null || val === '') return '₹0';
  const str = String(val).trim();
  if (str === 'N/A' || str === 'NA') return str;
  if (str.startsWith('₹')) return str;
  const num = Number(str.replace(/,/g, ''));
  if (!isNaN(num)) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return `₹${str}`;
}

// In development mode, always route via Vite proxy ('/api') to avoid browser CORS errors
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Fetch today's dashboard overview cards data from /api/todayDashboard
 * @param {Object} payload Optional request payload
 * @returns {Promise<{totalTags: string, untagged: string, theftAlerts: string, potentialLoss: string}>}
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
    let summary = data.Summary || data;

    // If today has 0 records and no specific Date was requested, fall back to recent recorded date 2026-09-28
    if (!payload.Date && (!summary.TotalTags || Number(summary.TotalTags) === 0)) {
      try {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/todayDashboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, Date: '2026-09-28' }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.Summary && Number(fallbackData.Summary.TotalTags) > 0) {
            data = fallbackData;
            summary = fallbackData.Summary;
          }
        }
      } catch {
        // Ignore fallback error and retain initial summary
      }
    }

    const rawLoss = (summary.PotentialLossDisplay && summary.PotentialLossDisplay !== 'N/A')
      ? summary.PotentialLossDisplay
      : (summary.PotentialLoss ?? '0');

    const incidents = (data.SecurityIncidents?.Incidents || data.Incidents || []).map((inc, index) => ({
      id: inc.EPC || inc.Id || `inc-${index}`,
      articleDescription: inc.ArticleDescription || inc.ItemName || inc.ArticleDesc || 'Untitled Article',
      articleNo: inc.ArticleNo || inc.Material || inc.EAN_UPC || 'N/A',
      epc: inc.EPC || 'N/A',
      amount: inc.AmountDisplay ?? inc.Amount,
      date: inc.IncidentDate || inc.Date || '',
      time: inc.IncidentTime || inc.Time || '',
      status: inc.AlertStatus || 'Theft Alert',
      variant: 'theft',
    }));

    return {
      date: data.Date || null,
      totalTags: summary.TotalTags != null ? String(summary.TotalTags) : '0',
      untagged: summary.Untagged != null ? String(summary.Untagged) : (summary.Checkout != null ? String(summary.Checkout) : '0'),
      theftAlerts: summary.TheftAlerts != null ? String(summary.TheftAlerts) : (summary.Loss != null ? String(summary.Loss) : '0'),
      potentialLoss: formatCurrency(rawLoss),
      incidents,
    };
  } catch (error) {
    console.error('Error fetching today dashboard data:', error);
    throw error;
  }
}

export const fetchTodayRecord = fetchDashboardRecord;

export async function fetchAnalyticsDashboard(payload = { Preset: 'Today' }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyticsDashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

    if (payload.FromDate) {
      body.FromDate = payload.FromDate;
    }

    if (payload.ToDate) {
      body.ToDate = payload.ToDate;
    }

    if (payload.StoreCode) {
      body.StoreCode = payload.StoreCode;
    }

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
    if (!potentialLoss) {
      const rawLoss = data.PotentialLoss ?? summary.PotentialLoss ?? 0;
      potentialLoss = `₹${Number(rawLoss).toLocaleString('en-IN')}`;
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
      records: (data.Records || []).map((item, idx) => ({
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
        amount: Number(item.Amount || 0),
        amountDisplay: item.AmountDisplay || `₹${Number(item.Amount || 0).toLocaleString('en-IN')}`,
        eventType: item.EventType || 'Theft',
      })),
    };
  } catch (error) {
    console.error('Error fetching incident report data:', error);
    throw error;
  }
}
