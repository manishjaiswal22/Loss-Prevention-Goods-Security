import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SelectedStore from '../../components/common/SelectedStore';

describe('SelectedStore Component', () => {
  it('renders default store code HD44 and store name UTTAM NAGAR', () => {
    render(<SelectedStore />);

    expect(screen.getByText('HD44')).toBeInTheDocument();
    expect(screen.getByText('UTTAM NAGAR')).toBeInTheDocument();
  });

  it('renders custom store props when provided', () => {
    render(<SelectedStore storeCode="HD55" storeName="Dwarka" location="Delhi" />);

    expect(screen.getByText('HD55')).toBeInTheDocument();
    expect(screen.getByText('Dwarka')).toBeInTheDocument();
  });

  it('toggles info popover when clicked', () => {
    render(<SelectedStore storeCode="HD44" storeName="UTTAM NAGAR" location="Delhi" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Active Store')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText(/All telemetry metrics, gate sensors/i)).toBeInTheDocument();
  });
});
