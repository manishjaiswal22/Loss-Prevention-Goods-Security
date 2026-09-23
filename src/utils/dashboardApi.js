/**
 * API service for Loss Prevention & Goods Security Dashboard
 */

const API_URL = '/api/dashboardRecord';

/**
 * Fetch real-time dashboard metrics (TotalTags, Checkout, Loss, PotentialLoss)
 * @param {Object} payload Optional request payload
 * @returns {Promise<{totalTags: string, untagged: string, theftAlerts: string, potentialLoss: string}>}
 */
export async function fetchDashboardRecord(payload = {}) {
  try {
    const response = await fetch(API_URL, {
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
    // API schema: {"Code":1,"Msg":"Success","TotalTags":904,"Checkout":51,"Loss":181,"PotentialLoss":0.0}
    return {
      totalTags: data.TotalTags != null ? String(data.TotalTags) : '0',
      untagged: data.Checkout != null ? String(data.Checkout) : '0',
      theftAlerts: data.Loss != null ? String(data.Loss) : '0',
      potentialLoss: 'N/A', // Kept as N/A per requirement
    };
  } catch (error) {
    console.error('Error fetching dashboard record:', error);
    throw error;
  }
}
