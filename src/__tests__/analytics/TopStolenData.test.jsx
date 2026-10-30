import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopStolenData from '../../components/analytics/TopStolenData';

describe('TopStolenData Component', () => {
  const customItems = [
    {
      articleNumber: 'ART-9901',
      itemDescription: 'Men Slim Fit Denim Jeans',
      theftCount: 45,
      lossValue: 89995,
      color: '#ef4444',
    },
    {
      articleNumber: 'ART-9902',
      itemDescription: 'Leather Wallet',
      theftCount: 15,
      lossValue: 22485,
      color: '#f97316',
    },
  ];

  it('renders "Top 5 Stolen Articles" header and item count pill', () => {
    render(<TopStolenData items={customItems} />);

    expect(screen.getByText('Top 5 Stolen Articles')).toBeInTheDocument();
    expect(screen.getByText(/2 Articles · 60 Losses/i)).toBeInTheDocument();
  });

  it('renders ranked items with article numbers, counts, MRP, and loss values', () => {
    render(<TopStolenData items={customItems} />);

    expect(screen.getByText('Men Slim Fit Denim Jeans')).toBeInTheDocument();
    expect(screen.getByText('ART-9901')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();

    expect(screen.getByText('Leather Wallet')).toBeInTheDocument();
    expect(screen.getByText('ART-9902')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    // MRP: 89995 / 45 = ~2,000, 22485 / 15 = ~1,499
    expect(screen.getByText('₹2,000')).toBeInTheDocument();
    expect(screen.getByText('₹1,499')).toBeInTheDocument();
    expect(screen.getByText('₹89,995')).toBeInTheDocument();
    expect(screen.getByText('₹22,485')).toBeInTheDocument();
  });

  it('renders calculated share percentage pills correctly', () => {
    render(<TopStolenData items={customItems} />);

    // 45 / 60 = 75.0%
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    // 15 / 60 = 25.0%
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });
});
