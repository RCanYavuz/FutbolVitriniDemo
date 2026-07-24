import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../lib/api';
import { authApi } from '../lib/auth.api';
import RegisterPage from './RegisterPage';

function renderRegister(state?: {
  selectedRole: string;
  selectedSubRole?: 'scout' | 'coach';
}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/register', state }]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<p>giris ekrani</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Ortak alanlari gecerli degerlerle doldurur. */
async function fillCommonFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Adınız'), 'Arda');
  await user.type(screen.getByLabelText('Soyadınız'), 'Guler');
  await user.type(screen.getByLabelText('Kullanıcı Adı'), 'arda_guler');
  await user.type(screen.getByLabelText('E-posta Adresi'), 'arda@futbolvitrini.local');
  await user.type(screen.getByLabelText('Şifre'), 'GucluParola1');
  await user.type(screen.getByLabelText('Şifre Tekrar'), 'GucluParola1');
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('bos formda hata mesajlari gosterir ve yonlendirme yapmaz', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));

    expect(screen.getByText('Adinizi giriniz.')).toBeInTheDocument();
    expect(screen.getByText('Kullanici adinizi giriniz.')).toBeInTheDocument();
    expect(screen.getByText('E-posta adresinizi giriniz.')).toBeInTheDocument();
    expect(screen.getByText('Mevki seciniz.')).toBeInTheDocument();
    expect(screen.queryByText('giris ekrani')).not.toBeInTheDocument();
  });

  it('kullanici duzeltmeye baslayinca alan hatasi kaybolur', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));
    expect(screen.getByText('Adinizi giriniz.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Adınız'), 'A');
    expect(screen.queryByText('Adinizi giriniz.')).not.toBeInTheDocument();
  });

  it('eslesmeyen parolayi yakalar', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillCommonFields(user);
    await user.clear(screen.getByLabelText('Şifre Tekrar'));
    await user.type(screen.getByLabelText('Şifre Tekrar'), 'BaskaParola1');
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));

    expect(screen.getByText('Parola tekrari eslesmiyor.')).toBeInTheDocument();
  });

  it('gecerli futbolcu kaydini APIye yollar ve onay mesajini gosterir', async () => {
    const registerSpy = vi.spyOn(authApi, 'register').mockResolvedValue({
      status: 'pending',
      message: 'Kaydınız alındı. Hesabınız yönetici onayından sonra aktifleşecek.',
    });
    const user = userEvent.setup();
    renderRegister();

    await fillCommonFields(user);
    await user.selectOptions(screen.getByLabelText('Mevki'), 'Kanat');
    await user.selectOptions(screen.getByLabelText('Tercih Ettiği Ayak'), 'Sol');
    await user.type(screen.getByLabelText('Doğum Tarihi'), '2005-02-25');
    await user.type(
      screen.getByLabelText('Güncel Kulüp (Opsiyonel)'),
      'Fenerbahçe U19',
    );
    await user.type(
      screen.getByLabelText('Profil Fotoğrafı URL (İsteğe Bağlı)'),
      'https://example.com/arda.png',
    );

    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));

    await waitFor(() => {
      expect(screen.getByText('Yönetici onayı bekleniyor')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Kaydınız alındı. Hesabınız yönetici onayından sonra aktifleşecek.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('giris ekrani')).not.toBeInTheDocument();
    expect(registerSpy).toHaveBeenCalledWith({
      username: 'arda_guler',
      email: 'arda@futbolvitrini.local',
      displayName: 'Arda Guler',
      password: 'GucluParola1',
      role: 'player',
      avatarUrl: 'https://example.com/arda.png',
      position: 'FW',
      preferredFoot: 'left',
      birthDate: '2005-02-25',
      currentClub: 'Fenerbahçe U19',
    });
  });

  it('HTTP kayit hatasini gosterir ve giris ekranina yonlendirmez', async () => {
    vi.spyOn(authApi, 'register').mockRejectedValue(
      new ApiError('Bu kullanıcı adı zaten kullanılıyor', 409),
    );
    const user = userEvent.setup();
    renderRegister();

    await fillCommonFields(user);
    await user.selectOptions(screen.getByLabelText('Mevki'), 'Kanat');
    await user.selectOptions(screen.getByLabelText('Tercih Ettiği Ayak'), 'Sol');
    await user.type(screen.getByLabelText('Doğum Tarihi'), '2005-02-25');
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));

    expect(await screen.findByText('Bu kullanıcı adı zaten kullanılıyor')).toBeInTheDocument();
    expect(screen.queryByText('giris ekrani')).not.toBeInTheDocument();
  });

  it('kulup rolunde futbolcu alanlari yerine kurum alanlari sorulur', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole('button', { name: /Scout \/ Antrenör/ }));

    expect(screen.queryByLabelText('Mevki')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Çalıştığı Kulüp / Ajans')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));
    expect(screen.getByText('Kulup / ajans bilgisi giriniz.')).toBeInTheDocument();
  });

  it('kulup kaydinda kurum bilgilerini APIye ekler', async () => {
    const registerSpy = vi.spyOn(authApi, 'register').mockResolvedValue({
      status: 'pending',
      message: 'Onay bekleniyor.',
    });
    const user = userEvent.setup();
    renderRegister({ selectedRole: 'club' });

    await fillCommonFields(user);
    await user.click(screen.getByRole('button', { name: 'Antrenör' }));
    await user.type(screen.getByLabelText('Çalıştığı Kulüp / Ajans'), 'Bursaspor');
    await user.selectOptions(screen.getByLabelText('Uzmanlık Alanı'), 'A Takım Scout');
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/ }));

    await screen.findByText('Onay bekleniyor.');
    expect(registerSpy).toHaveBeenCalledWith({
      username: 'arda_guler',
      email: 'arda@futbolvitrini.local',
      displayName: 'Arda Guler',
      password: 'GucluParola1',
      role: 'club',
      subRole: 'coach',
      organization: 'Bursaspor',
      expertise: 'A Takım Scout',
    });
  });

  it('giris ekranindan gelen rol ve alt rol secimini uygular', () => {
    renderRegister({ selectedRole: 'club', selectedSubRole: 'coach' });

    expect(screen.getByLabelText('Çalıştığı Kulüp / Ajans')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Antrenör' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
