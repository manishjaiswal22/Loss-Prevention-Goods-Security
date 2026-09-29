import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AnalyticsView from '../../components/analytics/AnalyticsView';

describe('AnalyticsView Component', () => {
  it('renders 4 KPI StatCards and all 4 analytical cards in 2x2 grid', () => {
    render(
      <MemoryRouter>
        <AnalyticsView />
      </MemoryRouter>
    );

    // KPI StatCards
    expect(screen.getAllByText('Total Tags').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Untagged').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Theft Alerts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Potential Loss').length).toBeGreaterThan(0);

    // 4 Analytical visual cards
    expect(screen.getByText('Tag Status Distribution (3D)')).toBeInTheDocument();
    expect(screen.getByText('Top 5 Stolen Items')).toBeInTheDocument();
    expect(screen.getByText('Theft by Time of Day')).toBeInTheDocument();
    expect(screen.getByText('Theft by Day of Week')).toBeInTheDocument();
  });
});
