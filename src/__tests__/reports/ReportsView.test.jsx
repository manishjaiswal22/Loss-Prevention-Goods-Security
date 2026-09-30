import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ReportsView from '../../components/reports/ReportsView';

vi.mock('../../utils/dashboardApi', () => ({
  fetchIncidentReport: vi.fn().mockResolvedValue({
    code: 1,
    msg: 'Success',
    totalAll: 45,
    totalTheft: 40,
    totalUntagged: 5,
    totalTags: 45,
    theftAlerts: 40,
    untagged: 5,
    potentialLoss: '₹22,131',
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 45,
    totalPages: 5,
    records: [
      {
        id: 'inc-1',
        srNo: 1,
        date: '29-09-2026',
        time: '14:20:00',
        storeCode: 'HD44',
        storeName: 'UTTAM NAGAR',
        epc: '000001622295100000000001',
        articleNo: 'ART-10492',
        articleDescription: 'Crewneck Sweatshirt',
        qty: 1,
        amount: 1499,
        amountDisplay: '₹1,499',
        eventType: 'Theft',
      },
    ],
  }),
}));

describe('ReportsView Component', () => {
  it('renders report header, KPI StatCards, and interactive React DataTable', () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /reports/i })).toBeInTheDocument();
    expect(screen.getAllByText('Total Tags').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EPC Code').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Article No').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Event Type').length).toBeGreaterThan(0);
  });

  it('filters table rows when search input changes', async () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('ART-10492').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/Search by EPC, Article No, Description, Store/i);
    fireEvent.change(searchInput, { target: { value: 'ART-10492' } });

    expect(screen.getAllByText('ART-10492').length).toBeGreaterThan(0);
  });

  it('switches event type filter tabs (All / Theft / Untagged)', () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    const theftTab = screen.getByRole('button', { name: /Theft/i });
    fireEvent.click(theftTab);

    expect(theftTab).toHaveClass('bg-rose-500');
  });

  it('renders export menu with Excel and Save to PDF/Print (and verifies CSV is absent)', () => {
    render(
      <MemoryRouter>
        <ReportsView />
      </MemoryRouter>
    );

    const toggleExportBtn = screen.getByTitle('More export options');
    fireEvent.click(toggleExportBtn);

    expect(screen.getByText('Microsoft Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('Save to PDF / Print')).toBeInTheDocument();

    // Verify CSV is removed as requested
    expect(screen.queryByText(/CSV Document/i)).not.toBeInTheDocument();
  });
});
