import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopNavbar from '../../components/layout/TopNavbar';

describe('TopNavbar Component', () => {
  it('renders application title and subtitle', () => {
    render(<TopNavbar />);

    expect(screen.getByText('Loss Prevention & Goods Security')).toBeInTheDocument();
    expect(screen.getByText(/Real-time monitoring of your store's inventory/i)).toBeInTheDocument();
  });

  it('calls onToggleSidebar when hamburger menu button is clicked', () => {
    const handleToggle = vi.fn();
    render(<TopNavbar onToggleSidebar={handleToggle} />);

    const toggleBtn = screen.getByLabelText('Toggle Navigation Sidebar');
    fireEvent.click(toggleBtn);

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('toggles notifications dropdown when bell icon is clicked and displays article, store, and time details', () => {
    render(<TopNavbar />);

    const bellBtn = screen.getByTitle('Theft & Security Alerts');
    fireEvent.click(bellBtn);

    expect(screen.getByText('Security Alerts')).toBeInTheDocument();
    expect(screen.getByText('2 New')).toBeInTheDocument();

    // Verify article description as main, article no, store code, store name, and time
    expect(screen.getByText('Men Slim Fit Denim Jeans')).toBeInTheDocument();
    expect(screen.getByText('ART-10492')).toBeInTheDocument();
    expect(screen.getByText(/HD55/i)).toBeInTheDocument();
    expect(screen.getByText(/Dwarka/i)).toBeInTheDocument();
    expect(screen.getByText('14:22')).toBeInTheDocument();
  });

  it('renders user initials and handles logout action', () => {
    const handleLogout = vi.fn();
    render(<TopNavbar user={{ username: 'Manish' }} onLogout={handleLogout} />);

    expect(screen.getByText('MA')).toBeInTheDocument();

    // Click profile dropdown
    const profileBtn = screen.getByText('MA').closest('button');
    fireEvent.click(profileBtn);

    expect(screen.getByText('Store Manager')).toBeInTheDocument();
    const logoutBtn = screen.getByText('Sign Out');
    fireEvent.click(logoutBtn);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('closes notifications dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <TopNavbar />
      </div>
    );

    const bellBtn = screen.getByTitle('Theft & Security Alerts');
    fireEvent.click(bellBtn);

    expect(screen.getByText('Security Alerts')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-area'));

    expect(screen.queryByText('Security Alerts')).not.toBeInTheDocument();
  });
});
