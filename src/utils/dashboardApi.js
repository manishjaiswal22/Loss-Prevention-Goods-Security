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

/**
 * Fetch today's dashboard overview cards data from /api/todayDashboard
 * @param {Object} payload Optional request payload
 * @returns {Promise<{totalTags: string, untagged: string, theftAlerts: string, potentialLoss: string}>}
 */
export async function fetchDashboardRecord(payload = {}) {
  try {
    let response = await fetch('/api/todayDashboard', {
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
        const fallbackRes = await fetch('/api/todayDashboard', {
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
