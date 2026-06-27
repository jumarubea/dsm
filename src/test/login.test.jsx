import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n.js';

// Avoid real network: AuthProvider calls refreshRequest on mount.
vi.mock('../api/auth.js', () => ({
  refreshRequest: () => Promise.reject(new Error('no session')),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  setLanguageRequest: vi.fn(() => Promise.resolve()),
}));

const { AuthProvider } = await import('../contexts/AuthContext.jsx');
const { LoginPage } = await import('../modules/auth/LoginPage.jsx');

const renderLogin = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('LoginPage', () => {
  it('renders the sign-in form in English', async () => {
    renderLogin();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('switches to Kiswahili via the language toggle', async () => {
    renderLogin();
    fireEvent.click(await screen.findByLabelText('Switch language'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ingia' })).toBeInTheDocument());
  });
});
