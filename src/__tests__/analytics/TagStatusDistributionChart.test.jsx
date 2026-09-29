import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TagStatusDistributionChart from '../../components/analytics/TagStatusDistributionChart';

describe('TagStatusDistributionChart Component', () => {
  it('renders 3D pie chart header, legend labels, and potential loss bar', () => {
    render(<TagStatusDistributionChart />);

    expect(screen.getByText('Tag Status Distribution (3D)')).toBeInTheDocument();
    expect(screen.getByText(/Potential Loss:/i)).toBeInTheDocument();
    expect(screen.getByText(/₹4,23,010/i)).toBeInTheDocument();
  });

  it('renders slice legend cards for Total Tags, Untagged, and Theft Alerts', () => {
    render(<TagStatusDistributionChart />);

    expect(screen.getByText('Total Tags')).toBeInTheDocument();
    expect(screen.getAllByText(/12,568/i).length).toBeGreaterThan(0);

    expect(screen.getByText('Untagged')).toBeInTheDocument();
    expect(screen.getByText('315')).toBeInTheDocument();

    expect(screen.getByText('Theft Alerts')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
  });

  it('updates dynamic focus indicator on slice hover', () => {
    render(<TagStatusDistributionChart />);

    expect(screen.getByText('Hover slices to inspect 3D layers')).toBeInTheDocument();

    const untaggedCard = screen.getByText('Untagged').closest('div');
    fireEvent.mouseEnter(untaggedCard);

    expect(screen.getByText('(2.4%)')).toBeInTheDocument();
  });

  it('calculates 3D pie slices dynamically across all 3 values (total, untagged, theft)', () => {
    const metrics = {
      totalTags: '45',
      untagged: '5',
      theftAlerts: '40',
      potentialLoss: '₹22,131',
    };

    render(<TagStatusDistributionChart metrics={metrics} />);

    expect(screen.getByText('Total Tags')).toBeInTheDocument();
    expect(screen.getAllByText('45').length).toBeGreaterThan(0);
    expect(screen.getByText('Untagged')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Theft Alerts')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();

    // Hover untagged slice: 5 / (45 + 5 + 40) = 5.6%
    const untaggedCard = screen.getByText('Untagged').closest('div');
    fireEvent.mouseEnter(untaggedCard);
    expect(screen.getByText('(5.6%)')).toBeInTheDocument();

    // Hover theft slice: 40 / (45 + 5 + 40) = 44.4%
    const theftCard = screen.getByText('Theft Alerts').closest('div');
    fireEvent.mouseEnter(theftCard);
    expect(screen.getByText('(44.4%)')).toBeInTheDocument();

    // Hover total tags slice: 45 / (45 + 5 + 40) = 50%
    const totalCard = screen.getByText('Total Tags').closest('div');
    fireEvent.mouseEnter(totalCard);
    expect(screen.getByText('(50%)')).toBeInTheDocument();
  });
});
