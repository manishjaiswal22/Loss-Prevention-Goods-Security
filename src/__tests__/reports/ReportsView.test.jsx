import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ReportsView from '../../components/reports/ReportsView';

vi.mock('../../utils/dashboardApi', () => ({
  formatCurrency: (val) => {
    if (val == null || val === '') return '₹0';
    const num = Number(String(val).replace(/[₹,\s]/g, ''));
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  },
  toIsoDate: (d) => d,
  fetchIncidentReportSummary: vi.fn().mockResolvedValue({
    code: 1,
    msg: 'Success',
    totalAll: 45,
    totalTags: 45,
    totalLoss: 40,
    theftAlerts: 40,
    loss: 40,
    totalCheckout: 5,
    untagged: 5,
    checkout: 5,
    potentialLoss: '₹22,131',
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 1,
    totalPages: 1,
    records: [
      {
        id: 'summary-26-10-2026-HD44',
        srNo: 1,
        date: '26-10-2026',
        storeCode: 'HD44',
        storeName: 'UTTAM NAGAR',
        eventType: 'Loss',
        articleCount: 28,
        qty: 56,
        amount: 8403,
        amountDisplay: '₹8,403',
      },
    ],
  }),
  fetchIncidentReportDetails: vi.fn().mockResolvedValue({
    code: 1,
    msg: 'Success',
    totalAll: 56,
    totalTheft: 40,
    totalLoss: 40,
    totalUntagged: 16,
    totalCheckout: 16,
    totalTags: 56,
    potentialLoss: '₹8,403',
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 56,
    totalPages: 6,
    records: [
      {
        id: 'detail-1',
        srNo: 1,
        date: '26-10-2026',
        time: '14:20:00',
        storeCode: 'HD44',
        storeName: 'UTTAM NAGAR',
        epc: '000001622295100000000001',
        articleNo: 'ART-10492',
        articleDescription: 'Crewneck Sweatshirt',
        mrp: 1499,
        mrpDisplay: '₹1,499',
        qty: 1,
        amount: 1499,
        amountDisplay: '₹1,499',
        eventType: 'Loss',
      },
      {
        id: 'detail-2',
        srNo: 2,
        date: '26-10-2026',
        time: '14:22:15',
        storeCode: 'HD44',
        storeName: 'UTTAM NAGAR',
        epc: '000001622295100000000002',
        articleNo: 'ART-10493',
        articleDescription: 'Classic Polo Shirt',
        mrp: 999,
        mrpDisplay: '₹999',
        qty: 1,
        amount: 999,
        amountDisplay: '₹999',
        eventType: 'Checkout',
      },
    ],
  }),
  fetchIncidentReport: vi.fn(),
}));

describe('ReportsView Component', () => {
  it('renders header, KPI cards, and Main Summary Table with required columns', async () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /reports/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('Total Tags').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Event Type').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Article Count').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Store Code').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Store Name').length).toBeGreaterThan(0);
      expect(screen.getAllByText('26-10-2026').length).toBeGreaterThan(0);
      expect(screen.getAllByText('28').length).toBeGreaterThan(0);
      expect(screen.getAllByText('56').length).toBeGreaterThan(0);
    });
  });

  it('switches event type filter tabs on the main summary table', async () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    const lossButtons = screen.getAllByRole('button', { name: /Loss/i });
    expect(lossButtons.length).toBeGreaterThan(0);
    fireEvent.click(lossButtons[0]);

    expect(lossButtons[0]).toHaveClass('bg-rose-500');
  });

  it('filters main summary table rows when search input changes', async () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('26-10-2026').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/Search by Date, Store Code, Store Name/i);
    fireEvent.change(searchInput, { target: { value: '26-10-2026' } });

    expect(screen.getAllByText('26-10-2026').length).toBeGreaterThan(0);
  });

  it('opens modal popup when clicking Article Count or Qty, and displays detailed table with Time and MRP', async () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('28').length).toBeGreaterThan(0);
    });

    // Click Article Count button
    const articleCountBtn = screen.getByTitle(/View detailed records for 26-10-2026 \(28 articles\)/i);
    fireEvent.click(articleCountBtn);

    // Modal should now be open
    await waitFor(() => {
      expect(screen.getByText('Detailed Incident Report')).toBeInTheDocument();
    });

    // Verify Time and MRP columns exist in modal
    expect(screen.getAllByText('Time').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MRP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ART-10492').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crewneck Sweatshirt').length).toBeGreaterThan(0);

    // Verify highlighted Event Type badge is displayed in modal
    expect(screen.getAllByText(/Event:/i).length).toBeGreaterThan(0);

    // Verify modal does not have internal filter buttons (only 1 Loss button from the main table)
    expect(screen.getAllByRole('button', { name: /Loss/i }).length).toBe(1);

    // Close modal via close button
    const closeBtn = screen.getByTitle('Close (Esc)');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Detailed Incident Report')).not.toBeInTheDocument();
    });

    // Main table should still be intact
    expect(screen.getAllByText('26-10-2026').length).toBeGreaterThan(0);
  });

  it('renders independent export menu with Excel and Save to PDF/Print', () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    const toggleExportBtn = screen.getByTitle('More export options');
    fireEvent.click(toggleExportBtn);

    expect(screen.getByText('Microsoft Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('Save to PDF / Print')).toBeInTheDocument();
  });
});
