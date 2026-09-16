import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateFilter from '../../components/common/DateFilter';

describe('DateFilter Component', () => {
  it('renders default date label "Today"', () => {
    render(<DateFilter defaultDate="Today" />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('opens preset menu when trigger button is clicked', () => {
    render(<DateFilter />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Presets')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
  });

  it('calls onDateChange and keeps datepicker open when preset option is selected', () => {
    const handleDateChange = vi.fn();
    render(<DateFilter onDateChange={handleDateChange} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Yesterday'));

    expect(handleDateChange).toHaveBeenCalledWith(
      'Yesterday',
      expect.objectContaining({
        preset: 'Yesterday',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    );
    expect(screen.getByText('Select Custom Range')).toBeInTheDocument();
  });

  it('closes popover when Close button in header or footer is clicked', () => {
    render(<DateFilter />);

    // Open datepicker
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Select Custom Range')).toBeInTheDocument();

    // Click Close button in footer
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(screen.queryByText('Select Custom Range')).not.toBeInTheDocument();

    // Open again and click Close X in header
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Select Custom Range')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close Datepicker'));
    expect(screen.queryByText('Select Custom Range')).not.toBeInTheDocument();
  });

  it('toggles open and closed when trigger button is clicked', () => {
    render(<DateFilter />);

    const triggerBtn = screen.getByRole('button');
    fireEvent.click(triggerBtn);
    expect(screen.getByText('Select Custom Range')).toBeInTheDocument();

    fireEvent.click(triggerBtn);
    expect(screen.queryByText('Select Custom Range')).not.toBeInTheDocument();
  });

  it('applies custom date range and closes when Apply button is clicked', () => {
    const handleDateChange = vi.fn();
    render(<DateFilter onDateChange={handleDateChange} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Select Custom Range')).toBeInTheDocument();

    // Click Apply button
    const applyBtn = screen.getByRole('button', { name: /^apply$/i });
    fireEvent.click(applyBtn);

    expect(handleDateChange).toHaveBeenCalled();
    expect(screen.queryByText('Select Custom Range')).not.toBeInTheDocument();
  });

  it('passes single date value instead of date range when start and end date are the same', () => {
    const handleDateChange = vi.fn();
    render(<DateFilter onDateChange={handleDateChange} />);

    // Open datepicker
    fireEvent.click(screen.getByRole('button'));

    // Today is the default selection (startDate === endDate)
    // Footer should not render the arrow "→"
    expect(screen.queryByText('→')).not.toBeInTheDocument();

    // Click Apply button
    const applyBtn = screen.getByRole('button', { name: /^apply$/i });
    fireEvent.click(applyBtn);

    // Should receive single formatted date string (e.g. DD-MM-YYYY)
    expect(handleDateChange).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{2}-\d{2}-\d{4}$/),
      expect.any(Object)
    );
  });
});
