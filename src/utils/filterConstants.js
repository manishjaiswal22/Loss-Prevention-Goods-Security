/**
 * Filter Constants and Utilities for Store and Date filtering
 */

export const STORES_LIST = [
  { id: 'all', storeCode: '', name: 'All Stores (Overall)', location: 'Global Network' },
  { id: 'HD44', storeCode: 'HD44', name: 'Uttam - Nagar 2', location: 'Delhi' },
  { id: 'HD55', storeCode: 'HD55', name: 'Dwarka', location: 'Delhi' },
  { id: 'HH15', storeCode: 'HH15', name: 'Dundahera', location: 'Delhi' },
];

export const DATE_PRESETS = [
  'Today',
  'Yesterday',
  'Last 7 Days',
  'This Month',
  'Last 30 Days',
];


export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
