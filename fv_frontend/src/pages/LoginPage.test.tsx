import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../lib/api';
import { authApi } from '../lib/auth.api';
import { useAuthStore } from '../store/authStore';
import LoginPage from './LoginPage';

const initialState = useAuthStore.getState();

function RegisterProbe() {
  const location = useLocation();
  const state = location.state as
    | { selectedRole?: string; selectedSubRole?: string }
    | null;

  return (
    <>
      <p>kayit ekrani</p>
      <output data-testid="register-state">
        {state?.selectedRole}/{state?.selectedSubRole}
      </output>
    </>
  );
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterProbe />} />
        <Route path="/club" element={<p>kulup paneli</p>} />
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

  it('once rol secimi gosterir', () => {
    renderLogin();

    expect(screen.getByText('Scout Girişi')).toBeInTheDocument();
    expect(screen.queryByLabelText('Kullanıcı Adı')).not.toBeInTheDocument();
  });

  it('rol secildikten sonra giris formuna gecer', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText('Scout Girişi'));

    expect(screen.getByLabelText('Kullanıcı Adı')).toBeInTheDocument();
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

    await user.click(screen.getByText('Scout Girişi'));
    await user.type(screen.getByLabelText('Kullanıcı Adı'), 'scout');
    await user.type(screen.getByLabelText('Şifre'), 'scout123');
    await user.click(screen.getByRole('button', { name: /Giriş Yap/i }));

    await waitFor(() => expect(screen.getByText('kulup paneli')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('hatali parolada hata mesaji gosterir', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(
      new ApiError('Kullanıcı adı veya parola hatalı', 401),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText('Scout Girişi'));
    await user.type(screen.getByLabelText('Kullanıcı Adı'), 'scout');
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

    await user.click(screen.getByRole('button', { name: 'Kayıt Olun' }));

    expect(screen.getByText('kayit ekrani')).toBeInTheDocument();
  });

  it.each([
    ['Scout Girişi', 'scout'],
    ['Antrenör Girişi', 'coach'],
  ])('%s kaydinda secilen alt rolu tasir', async (roleLabel, subRole) => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText(roleLabel));
    await user.click(screen.getByRole('button', { name: 'Kayıt Olun' }));

    expect(screen.getByTestId('register-state')).toHaveTextContent(
      `club/${subRole}`,
    );
  });
});
