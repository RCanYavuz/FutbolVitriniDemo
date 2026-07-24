import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../store/authStore';
import ProfileSettings from './ProfileSettings';

const initialState = useAuthStore.getState();

function renderSettings() {
  useAuthStore.setState({
    isAuthenticated: true,
    user: {
      id: 'u-1',
      name: 'Arda Guler',
      role: 'player',
      subRole: 'player',
      avatarUrl: '',
    },
  });

  return render(
    <MemoryRouter>
      <ProfileSettings />
    </MemoryRouter>,
  );
}

/** Guvenlik sekmesini acar ve parola alanlarini doldurur. */
async function openSecurityTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Account Security/ }));
}

describe('ProfileSettings', () => {
  beforeEach(() => {
    useAuthStore.setState(initialState, true);
  });

  it('oturumdaki kullanicinin adini forma doldurur', () => {
    renderSettings();

    expect(screen.getByLabelText(/First Name/)).toHaveValue('Arda');
    expect(screen.getByLabelText(/Last Name/)).toHaveValue('Guler');
  });

  it('alan degistirilince kaydetme cubugu belirir', async () => {
    const user = userEvent.setup();
    renderSettings();

    expect(screen.queryByRole('button', { name: /Save Changes/ })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/First Name/), 'x');

    expect(screen.getByRole('button', { name: /Save Changes/ })).toBeInTheDocument();
  });

  it('backend gerektiren butonlar devre disi', () => {
    renderSettings();

    expect(screen.getByRole('button', { name: 'Change Photo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Public View' })).toBeDisabled();
  });

  it('parola formu bos alanda hata verir', async () => {
    const user = userEvent.setup();
    renderSettings();
    await openSecurityTab(user);

    await user.click(screen.getByRole('button', { name: /Update Password/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('Mevcut parolanizi giriniz.');
  });

  it('kisa yeni parolayi reddeder', async () => {
    const user = userEvent.setup();
    renderSettings();
    await openSecurityTab(user);

    await user.type(screen.getByLabelText('Current Password'), 'EskiParola1');
    await user.type(screen.getByLabelText('New Password'), 'kisa');
    await user.type(screen.getByLabelText('Confirm Password'), 'kisa');
    await user.click(screen.getByRole('button', { name: /Update Password/ }));

    expect(screen.getByRole('alert')).toHaveTextContent(/en az 8/);
  });

  it('gecerli parola degisikliginde basari mesaji gosterir ve alanlari temizler', async () => {
    const user = userEvent.setup();
    renderSettings();
    await openSecurityTab(user);

    await user.type(screen.getByLabelText('Current Password'), 'EskiParola1');
    await user.type(screen.getByLabelText('New Password'), 'YeniParola1');
    await user.type(screen.getByLabelText('Confirm Password'), 'YeniParola1');
    await user.click(screen.getByRole('button', { name: /Update Password/ }));

    expect(screen.getByRole('status')).toHaveTextContent(/guncellendi/);
    expect(screen.getByLabelText('Current Password')).toHaveValue('');
    expect(screen.getByLabelText('New Password')).toHaveValue('');
  });
});
