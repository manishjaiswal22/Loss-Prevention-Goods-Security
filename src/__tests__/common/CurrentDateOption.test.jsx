import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CurrentDateOption from '../../components/common/CurrentDateOption';

describe('CurrentDateOption Component', () => {
  it('renders date indicator with "Today" live pill in DD-MM-YYYY format', () => {
    render(<CurrentDateOption date={new Date(2026, 8, 15)} />);

    expect(screen.getByText('15-09-2026')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('toggles explanation popover when clicked', () => {
    render(<CurrentDateOption date={new Date(2026, 8, 15)} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Current Date')).toBeInTheDocument();
    expect(screen.getByText(/Locked to Today/i)).toBeInTheDocument();
  });
});
