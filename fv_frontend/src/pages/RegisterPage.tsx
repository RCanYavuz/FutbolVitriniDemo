import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiError } from '../lib/api';
import {
  authApi,
  type RegisterPreferredFoot,
  type RegisterPosition,
} from '../lib/auth.api';
import {
  validateRegistration,
  type RegistrationErrors,
  type RegistrationValues,
} from '../lib/validation';
import type { UserRole } from '../store/types';

/** Kayit ekraninda admin secilemez; gelen deger admin ise futbolcuya dusuruyoruz. */
type RegisterableRole = Exclude<UserRole, 'admin'>;
type RegisterableSubRole = 'scout' | 'coach';

interface RegisterLocationState {
  selectedRole?: UserRole;
  selectedSubRole?: RegisterableSubRole;
}

function toRegisterableRole(role: unknown): RegisterableRole {
  return role === 'club' ? 'club' : 'player';
}

function toRegisterableSubRole(subRole: unknown): RegisterableSubRole {
  return subRole === 'coach' ? 'coach' : 'scout';
}

const POSITION_API_VALUES: Record<string, RegisterPosition> = {
  Kaleci: 'GK',
  Stoper: 'DF',
  Bek: 'DF',
  'Defansif Orta Saha': 'MF',
  'Merkez Orta Saha': 'MF',
  'Ofansif Orta Saha': 'MF',
  Kanat: 'FW',
  Santrafor: 'FW',
};

const PREFERRED_FOOT_API_VALUES: Record<string, RegisterPreferredFoot> = {
  Sağ: 'right',
  Sol: 'left',
  Çift: 'both',
};

const emptyValues: Omit<RegistrationValues, 'role'> = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  avatarUrl: '',
  position: '',
  preferredFoot: '',
  birthDate: '',
  currentClub: '',
  organization: '',
  expertise: '',
};

const inputBase =
  'w-full bg-surface-container-high border rounded-lg py-3 px-4 text-on-surface text-sm focus:outline-none transition-colors';

/** Hatali alanlari kirmizi cerceveyle isaretler. */
function fieldClass(hasError: boolean, accent: string, extra = '') {
  return `${inputBase} ${extra} ${
    hasError ? 'border-accent-red focus:border-accent-red' : `border-border-standard ${accent}`
  }`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-accent-red flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">error</span>
      {message}
    </p>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as RegisterLocationState | null;

  // Eğer login sayfasından rol seçilip gelindiyse state'den al
  const [selectedRole, setSelectedRole] = useState<RegisterableRole>(() =>
    toRegisterableRole(routeState?.selectedRole),
  );
  const [selectedSubRole, setSelectedSubRole] = useState<RegisterableSubRole>(
    () => toRegisterableSubRole(routeState?.selectedSubRole),
  );
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const setField = (field: keyof typeof emptyValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setRegisterError(null);
    setPendingMessage(null);
    // Kullanici duzeltmeye baslayinca ilgili hatayi kaldiriyoruz.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const switchRole = (role: RegisterableRole) => {
    setSelectedRole(role);
    setErrors({});
    setRegisterError(null);
    setPendingMessage(null);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError(null);
    setPendingMessage(null);

    const found = validateRegistration({ ...values, role: selectedRole });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);

    try {
      const result = await authApi.register({
        username: values.username.trim(),
        email: values.email.trim(),
        displayName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        password: values.password,
        role: selectedRole,
        ...(values.avatarUrl.trim()
          ? { avatarUrl: values.avatarUrl.trim() }
          : {}),
        ...(selectedRole === 'club'
          ? {
              subRole: selectedSubRole,
              organization: values.organization.trim(),
              expertise: values.expertise,
            }
          : {
              position: POSITION_API_VALUES[values.position],
              preferredFoot:
                PREFERRED_FOOT_API_VALUES[values.preferredFoot],
              birthDate: values.birthDate,
              ...(values.currentClub.trim()
                ? { currentClub: values.currentClub.trim() }
                : {}),
            }),
      });
      setPendingMessage(result.message);
    } catch (error) {
      setRegisterError(
        error instanceof ApiError
          ? error.message
          : 'Kayit islemi tamamlanamadi. Lutfen tekrar deneyiniz.',
      );
    } finally {
      setLoading(false);
    }
  };

  const accentGreen = 'focus:border-pitch-green/60';
  const accentBlue = 'focus:border-tactical-blue/60';

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-surface-primary flex flex-col justify-center items-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pitch-green/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tactical-blue/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Logo Area */}
      <button
        type="button"
        className="flex items-center gap-2 mb-8 z-10 cursor-pointer"
        onClick={() => navigate('/login')}
      >
        <div className="w-10 h-10 bg-pitch-green rounded-xl flex items-center justify-center transform rotate-12 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
          <span className="material-symbols-outlined text-pitch-black font-bold -rotate-12 text-2xl">sports_soccer</span>
        </div>
        <span className="text-2xl font-bold text-on-surface tracking-tight">Futbol<span className="text-pitch-green">Vitrini</span></span>
      </button>

      <div className="w-full max-w-[600px] bg-surface-container border border-border-standard rounded-2xl p-6 md:p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">Hemen Üye Olun</h2>
          <p className="text-body-md text-text-muted">Kariyerinizi bir sonraki seviyeye taşıyın.</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 p-1.5 bg-surface-container-high rounded-xl mb-8 border border-border-standard">
          <button
            type="button"
            onClick={() => switchRole('player')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
              ${selectedRole === 'player' ? 'bg-pitch-green text-pitch-black shadow-md' : 'text-text-muted hover:text-on-surface hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-[20px]">sprint</span>
            Futbolcu
          </button>
          <button
            type="button"
            onClick={() => switchRole('club')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
              ${selectedRole === 'club' ? 'bg-tactical-blue text-white shadow-md' : 'text-text-muted hover:text-on-surface hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-[20px]">person_search</span>
            Scout / Antrenör
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          {/* 1. Ortak Alanlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="reg-first-name" className="block text-label-sm text-text-muted mb-1.5">
                Adınız
              </label>
              <input
                id="reg-first-name"
                type="text"
                value={values.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                className={fieldClass(!!errors.firstName, accentGreen)}
                placeholder="Örn: Arda"
              />
              <FieldError message={errors.firstName} />
            </div>
            <div>
              <label htmlFor="reg-last-name" className="block text-label-sm text-text-muted mb-1.5">
                Soyadınız
              </label>
              <input
                id="reg-last-name"
                type="text"
                value={values.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                className={fieldClass(!!errors.lastName, accentGreen)}
                placeholder="Örn: Güler"
              />
              <FieldError message={errors.lastName} />
            </div>
          </div>

          <div>
            <label htmlFor="reg-username" className="block text-label-sm text-text-muted mb-1.5">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">person</span>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={values.username}
                onChange={(e) => setField('username', e.target.value)}
                className={fieldClass(!!errors.username, accentGreen, 'pl-12')}
                placeholder="Örn: arda_guler"
              />
            </div>
            <FieldError message={errors.username} />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-label-sm text-text-muted mb-1.5">
              E-posta Adresi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">mail</span>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                className={fieldClass(!!errors.email, accentGreen, 'pl-12')}
                placeholder="ornek@email.com"
              />
            </div>
            <FieldError message={errors.email} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="reg-password" className="block text-label-sm text-text-muted mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">lock</span>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className={fieldClass(!!errors.password, accentGreen, 'pl-12')}
                  placeholder="••••••••"
                />
              </div>
              <FieldError message={errors.password} />
            </div>
            <div>
              <label htmlFor="reg-password-confirm" className="block text-label-sm text-text-muted mb-1.5">
                Şifre Tekrar
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">lock_reset</span>
                <input
                  id="reg-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={values.passwordConfirm}
                  onChange={(e) => setField('passwordConfirm', e.target.value)}
                  className={fieldClass(!!errors.passwordConfirm, accentGreen, 'pl-12')}
                  placeholder="••••••••"
                />
              </div>
              <FieldError message={errors.passwordConfirm} />
            </div>
          </div>

          <div>
            <label htmlFor="reg-avatar" className="block text-label-sm text-text-muted mb-1.5">
              Profil Fotoğrafı URL (İsteğe Bağlı)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">link</span>
              <input
                id="reg-avatar"
                type="url"
                value={values.avatarUrl}
                onChange={(e) => setField('avatarUrl', e.target.value)}
                className={fieldClass(!!errors.avatarUrl, accentGreen, 'pl-12')}
                placeholder="https://..."
              />
            </div>
            <FieldError message={errors.avatarUrl} />
          </div>

          <hr className="border-border-standard my-6" />

          {/* 2. Futbolcuya Özel Alanlar */}
          {selectedRole === 'player' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Futbolcu Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-position" className="block text-label-sm text-text-muted mb-1.5">
                    Mevki
                  </label>
                  <select
                    id="reg-position"
                    value={values.position}
                    onChange={(e) => setField('position', e.target.value)}
                    className={fieldClass(!!errors.position, accentGreen, 'appearance-none')}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Kaleci">Kaleci</option>
                    <option value="Stoper">Stoper</option>
                    <option value="Bek">Sağ/Sol Bek</option>
                    <option value="Defansif Orta Saha">Defansif Orta Saha</option>
                    <option value="Merkez Orta Saha">Merkez Orta Saha</option>
                    <option value="Ofansif Orta Saha">Ofansif Orta Saha</option>
                    <option value="Kanat">Sağ/Sol Kanat</option>
                    <option value="Santrafor">Santrafor</option>
                  </select>
                  <FieldError message={errors.position} />
                </div>
                <div>
                  <label htmlFor="reg-foot" className="block text-label-sm text-text-muted mb-1.5">
                    Tercih Ettiği Ayak
                  </label>
                  <select
                    id="reg-foot"
                    value={values.preferredFoot}
                    onChange={(e) => setField('preferredFoot', e.target.value)}
                    className={fieldClass(!!errors.preferredFoot, accentGreen, 'appearance-none')}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Sağ">Sağ</option>
                    <option value="Sol">Sol</option>
                    <option value="Çift">Çift</option>
                  </select>
                  <FieldError message={errors.preferredFoot} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-birth-date" className="block text-label-sm text-text-muted mb-1.5">
                    Doğum Tarihi
                  </label>
                  <input
                    id="reg-birth-date"
                    type="date"
                    value={values.birthDate}
                    onChange={(e) => setField('birthDate', e.target.value)}
                    className={fieldClass(!!errors.birthDate, accentGreen, 'custom-date-picker')}
                  />
                  <FieldError message={errors.birthDate} />
                </div>
                <div>
                  <label htmlFor="reg-current-club" className="block text-label-sm text-text-muted mb-1.5">
                    Güncel Kulüp (Opsiyonel)
                  </label>
                  <input
                    id="reg-current-club"
                    type="text"
                    value={values.currentClub}
                    onChange={(e) => setField('currentClub', e.target.value)}
                    className={fieldClass(false, accentGreen)}
                    placeholder="Örn: Fenerbahçe U19"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Scout / Antrenöre Özel Alanlar */}
          {selectedRole === 'club' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Kurum Bilgileri</h3>
              <div>
                <p className="block text-label-sm text-text-muted mb-1.5">
                  Hesap Türü
                </p>
                <div
                  role="group"
                  aria-label="Hesap Türü"
                  className="grid grid-cols-2 gap-2 rounded-xl border border-border-standard bg-surface-container-high p-1.5"
                >
                  <button
                    type="button"
                    aria-pressed={selectedSubRole === 'scout'}
                    onClick={() => setSelectedSubRole('scout')}
                    className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                      selectedSubRole === 'scout'
                        ? 'bg-tactical-blue text-white shadow-md'
                        : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    Scout
                  </button>
                  <button
                    type="button"
                    aria-pressed={selectedSubRole === 'coach'}
                    onClick={() => setSelectedSubRole('coach')}
                    className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                      selectedSubRole === 'coach'
                        ? 'bg-tactical-blue text-white shadow-md'
                        : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    Antrenör
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-organization" className="block text-label-sm text-text-muted mb-1.5">
                    Çalıştığı Kulüp / Ajans
                  </label>
                  <input
                    id="reg-organization"
                    type="text"
                    value={values.organization}
                    onChange={(e) => setField('organization', e.target.value)}
                    className={fieldClass(!!errors.organization, accentBlue)}
                    placeholder="Bağımsız ise 'Serbest' yazın"
                  />
                  <FieldError message={errors.organization} />
                </div>
                <div>
                  <label htmlFor="reg-expertise" className="block text-label-sm text-text-muted mb-1.5">
                    Uzmanlık Alanı
                  </label>
                  <select
                    id="reg-expertise"
                    value={values.expertise}
                    onChange={(e) => setField('expertise', e.target.value)}
                    className={fieldClass(!!errors.expertise, accentBlue, 'appearance-none')}
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Altyapı İzleme">Altyapı İzleme</option>
                    <option value="A Takım Scout">A Takım Scout</option>
                    <option value="Veri Analisti">Veri Analisti</option>
                    <option value="Teknik Direktör">Teknik Direktör</option>
                    <option value="Menajer">Menajer</option>
                  </select>
                  <FieldError message={errors.expertise} />
                </div>
              </div>
            </div>
          )}

          {pendingMessage && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-pitch-green/30 bg-pitch-green/10 px-4 py-3 text-sm text-pitch-green"
            >
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
              <div>
                <p className="font-bold">Yönetici onayı bekleniyor</p>
                <p className="mt-0.5 text-xs text-on-surface">{pendingMessage}</p>
              </div>
            </div>
          )}

          {registerError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-3 text-sm text-accent-red"
            >
              <span className="material-symbols-outlined text-[20px]">error</span>
              {registerError}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-on-surface text-sm font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50
                ${selectedRole === 'player' ? 'bg-pitch-green text-pitch-black hover:bg-pitch-green/90 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-tactical-blue text-white hover:bg-tactical-blue/90 shadow-[0_0_15px_rgba(45,136,255,0.3)]'}`}
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  Kayıt Ol
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted">
            Zaten hesabınız var mı?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-on-surface font-semibold hover:underline">
              Giriş Yapın
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
