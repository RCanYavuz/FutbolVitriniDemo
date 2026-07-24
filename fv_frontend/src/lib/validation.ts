/**
 * Form dogrulamalari. Bilesenlerden ayri tutuluyor ki render etmeden test edilebilsinler
 * ve backend baglandiginda ayni kurallar sunucu yanitiyla karsilastirilabilsin.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const PLAYER_POSITIONS = new Set([
  'Kaleci',
  'Stoper',
  'Bek',
  'Defansif Orta Saha',
  'Merkez Orta Saha',
  'Ofansif Orta Saha',
  'Kanat',
  'Santrafor',
]);
const PREFERRED_FEET = new Set(['Sağ', 'Sol', 'Çift']);

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ─── Parola degistirme ─────────────────────────────────────────── */

export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Hata varsa mesaji, yoksa null doner. */
export function validatePasswordChange({
  currentPassword,
  newPassword,
  confirmPassword,
}: PasswordChangeValues): string | null {
  if (!currentPassword) {
    return 'Mevcut parolanizi giriniz.';
  }
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return `Yeni parola en az ${PASSWORD_MIN_LENGTH} karakter olmalidir.`;
  }
  if (newPassword === currentPassword) {
    return 'Yeni parola mevcut parolayla ayni olamaz.';
  }
  if (newPassword !== confirmPassword) {
    return 'Parola tekrari eslesmiyor.';
  }
  return null;
}

/* ─── Kayit formu ───────────────────────────────────────────────── */

export interface RegistrationValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  avatarUrl: string;
  role: 'player' | 'club';
  /** Futbolcu alanlari */
  position: string;
  preferredFoot: string;
  birthDate: string;
  currentClub: string;
  /** Scout / antrenor alanlari */
  organization: string;
  expertise: string;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;

const MIN_AGE = 10;
const MAX_AGE = 60;

/** Verilen ISO tarihine gore tam yasi hesaplar. */
export function ageFromBirthDate(birthDate: string, today = new Date()): number {
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Alan bazli hata haritasi dondurur; bos nesne "gecerli" demektir. */
export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (!values.firstName.trim()) errors.firstName = 'Adinizi giriniz.';
  if (!values.lastName.trim()) errors.lastName = 'Soyadinizi giriniz.';

  const username = values.username.trim();
  if (!username) {
    errors.username = 'Kullanici adinizi giriniz.';
  } else if (
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    errors.username =
      `Kullanici adi ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} karakter olmalidir.`;
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'Kullanici adi yalnizca harf, rakam ve alt cizgi icerebilir.';
  }

  if (!values.email.trim()) {
    errors.email = 'E-posta adresinizi giriniz.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Gecerli bir e-posta adresi giriniz.';
  }

  if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Parola en az ${PASSWORD_MIN_LENGTH} karakter olmalidir.`;
  }
  if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = 'Parola tekrari eslesmiyor.';
  }

  if (values.avatarUrl.trim() && !isValidHttpUrl(values.avatarUrl.trim())) {
    errors.avatarUrl = 'Gecerli bir http(s) adresi giriniz.';
  }

  if (values.role === 'player') {
    if (!values.position) {
      errors.position = 'Mevki seciniz.';
    } else if (!PLAYER_POSITIONS.has(values.position)) {
      errors.position = 'Gecerli bir mevki seciniz.';
    }
    if (!values.preferredFoot) {
      errors.preferredFoot = 'Tercih ettiginiz ayagi seciniz.';
    } else if (!PREFERRED_FEET.has(values.preferredFoot)) {
      errors.preferredFoot = 'Gecerli bir ayak tercihi seciniz.';
    }

    if (!values.birthDate) {
      errors.birthDate = 'Dogum tarihinizi giriniz.';
    } else {
      const age = ageFromBirthDate(values.birthDate);
      if (Number.isNaN(age)) {
        errors.birthDate = 'Gecerli bir tarih giriniz.';
      } else if (age < MIN_AGE || age > MAX_AGE) {
        errors.birthDate = `Yas ${MIN_AGE} ile ${MAX_AGE} arasinda olmalidir.`;
      }
    }
  } else {
    if (!values.organization.trim()) errors.organization = 'Kulup / ajans bilgisi giriniz.';
    if (!values.expertise) errors.expertise = 'Uzmanlik alaninizi seciniz.';
  }

  return errors;
}
