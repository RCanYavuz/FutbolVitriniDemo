import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../lib/api';
import { authApi } from '../lib/auth.api';
import { useAuthStore } from '../store/authStore';
import LoginPage from './LoginPage';

const initialState = useAuthStore.getState();

function RegisterProbe() {
  return <p>kayit ekrani</p>;
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterProbe />} />
        <Route path="/vitrin" element={<p>vitrin paneli</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ ...initialState, isInitializing: false }, true);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dogrudan giris formunu gosterir', () => {
    renderLogin();
    expect(screen.getByLabelText(/Kullanıcı Adı/i)).toBeInTheDocument();
  });

  it('dogru bilgilerle giris yapip kullanicinin paneline yonlendirir', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      id: 'srv-1',
      name: 'Ahmet Yılmaz',
      role: 'club',
      subRole: 'scout',
      avatarUrl: '',
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/Kullanıcı Adı/i), 'scout');
    await user.type(screen.getByLabelText('Şifre'), 'scout123');
    await user.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() => expect(screen.getByText('vitrin paneli')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('hatali parolada hata mesaji gosterir', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(
      new ApiError('Kullanıcı adı veya parola hatalı', 401),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/Kullanıcı Adı/i), 'scout');
    await user.type(screen.getByLabelText('Şifre'), 'yanlisparola');
    await user.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() =>
      expect(screen.getByText(/Kullanıcı adı veya parola hatalı/)).toBeInTheDocument(),
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('kayit ekranina baglanti sunar', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('link', { name: 'Kayıt Olun' }));

    expect(screen.getByText('kayit ekrani')).toBeInTheDocument();
  });
});
