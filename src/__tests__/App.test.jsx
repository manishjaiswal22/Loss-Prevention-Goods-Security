import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
