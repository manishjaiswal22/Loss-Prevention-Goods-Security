import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../../components/auth/Login';

describe('Login Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders login form with username, password, and sign in button', () => {
    render(<Login />);

    expect(screen.getByPlaceholderText('Enter Your Username Here..')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login now/i })).toBeInTheDocument();
  });

  it('shows error toast if form is submitted with empty fields', () => {
    render(<Login />);

    const submitBtn = screen.getByRole('button', { name: /login now/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please enter both username and password')).toBeInTheDocument();
  });

  it('toggles password field visibility when eye icon button is clicked', () => {
    render(<Login />);

    const passwordInput = screen.getByPlaceholderText('Enter Your Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByTitle(/show password/i);
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('calls onLogin callback upon successful login submission', async () => {
    const handleLogin = vi.fn();
    render(<Login onLogin={handleLogin} />);

    const usernameInput = screen.getByPlaceholderText('Enter Your Username Here..');
    const passwordInput = screen.getByPlaceholderText('Enter Your Password');
    const submitBtn = screen.getByRole('button', { name: /login now/i });

    fireEvent.change(usernameInput, { target: { value: 'admin_user' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Fast-forward fake timers (500ms delay in Login.jsx)
    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(handleLogin).toHaveBeenCalledWith({ username: 'admin_user' });
  });
});
