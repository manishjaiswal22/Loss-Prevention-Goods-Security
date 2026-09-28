/**
 * API service for Loss Prevention & Goods Security Dashboard & Analytics
 */

/**
 * Formats a currency value with the Indian Rupee symbol (₹) and locale formatting
 * @param {string|number} val 
 * @returns {string}
 */
export function formatCurrency(val) {
  if (val == null || val === '') return '₹ 0';
  const str = String(val).trim();
  if (str === 'N/A' || str === 'NA') return str;
  if (str.startsWith('₹')) return str;
  const num = Number(str.replace(/,/g, ''));
  if (!isNaN(num)) {
    return `₹ ${num.toLocaleString('en-IN')}`;
  }
  return `₹ ${str}`;
}

/**
 * Fetch today's real-time dashboard metrics (/api/todayRecord)
 * @param {Object} payload Optional request payload
 * @returns {Promise<{totalTags: string, untagged: string, theftAlerts: string, potentialLoss: string}>}
 */
export async function fetchTodayRecord(payload = {}) {
  try {
    const response = await fetch('/api/todayRecord', {
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
    const rawLoss = data.PotentialLossDisplay ?? data.PotentialLoss;

    return {
      totalTags: data.TotalTags != null ? String(data.TotalTags) : '0',
      untagged: data.Checkout != null ? String(data.Checkout) : '0',
      theftAlerts: data.Loss != null ? String(data.Loss) : '0',
      potentialLoss: formatCurrency(rawLoss),
    };
  } catch (error) {
    console.error('Error fetching today record:', error);
    throw error;
  }
}

/**
 * Fetch overall dashboard metrics (/api/dashboardRecord)
 * @param {Object} payload Optional request payload
 * @returns {Promise<{totalTags: string, untagged: string, theftAlerts: string, potentialLoss: string}>}
 */
export async function fetchDashboardRecord(payload = {}) {
  try {
    const response = await fetch('/api/dashboardRecord', {
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
    const rawLoss = data.PotentialLossDisplay ?? data.PotentialLoss;

    return {
      totalTags: data.TotalTags != null ? String(data.TotalTags) : '0',
      untagged: data.Checkout != null ? String(data.Checkout) : '0',
      theftAlerts: data.Loss != null ? String(data.Loss) : '0',
      potentialLoss: formatCurrency(rawLoss),
    };
  } catch (error) {
    console.error('Error fetching dashboard record:', error);
    throw error;
  }
}
