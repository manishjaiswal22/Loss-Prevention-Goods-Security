import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

describe('App Root Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('redirects unauthenticated users to /login by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login now/i })).toBeInTheDocument();
  });

  it('renders application shell and redirects root path to /dashboard when authenticated', () => {
    sessionStorage.setItem('auth_user', JSON.stringify({ username: 'Manish' }));
    render(<App />);

    expect(screen.getByText('Loss Prevention & Goods Security')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /dashboard/i })).toBeInTheDocument();
  });

  it('clears session storage and redirects to login upon logout', async () => {
    sessionStorage.setItem('auth_user', JSON.stringify({ username: 'Manish' }));
    sessionStorage.setItem('auth_token', 'dummy_token');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'Manish' }));
    localStorage.setItem('auth_token', 'dummy_token');

    render(<App />);

    const profileBtn = screen.getByText('MA').closest('button');
    fireEvent.click(profileBtn);

    const logoutBtn = screen.getByText('Sign Out');
    fireEvent.click(logoutBtn);

    expect(sessionStorage.getItem('auth_user')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login now/i })).toBeInTheDocument();
  });
});
