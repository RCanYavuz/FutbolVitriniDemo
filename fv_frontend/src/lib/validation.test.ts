import { describe, expect, it } from 'vitest';
import {
  ageFromBirthDate,
  isValidEmail,
  isValidHttpUrl,
  validatePasswordChange,
  validateRegistration,
  type RegistrationValues,
} from './validation';

describe('isValidEmail', () => {
  it.each(['a@b.com', 'oyuncu@futbolvitrini.local', 'ad.soyad@alt.alan.tr'])(
    'gecerli kabul eder: %s',
    (value) => expect(isValidEmail(value)).toBe(true),
  );

  it.each(['', 'gecersiz', 'a@b', 'a b@c.com', '@b.com'])('reddeder: %s', (value) =>
    expect(isValidEmail(value)).toBe(false),
  );
});

describe('isValidHttpUrl', () => {
  it('http ve https kabul eder', () => {
    expect(isValidHttpUrl('https://example.com/a.png')).toBe(true);
    expect(isValidHttpUrl('http://example.com')).toBe(true);
  });

  it('diger protokolleri ve bozuk adresleri reddeder', () => {
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('example.com')).toBe(false);
  });
});

describe('ageFromBirthDate', () => {
  it('dogum gunu gelmediyse bir yas eksik hesaplar', () => {
    expect(ageFromBirthDate('2000-12-31', new Date('2020-06-15'))).toBe(19);
  });

  it('dogum gunu gectiyse tam yasi verir', () => {
    expect(ageFromBirthDate('2000-01-01', new Date('2020-06-15'))).toBe(20);
  });
});

describe('validatePasswordChange', () => {
  const valid = {
    currentPassword: 'EskiParola1',
    newPassword: 'YeniParola1',
    confirmPassword: 'YeniParola1',
  };

  it('gecerli girdide null doner', () => {
    expect(validatePasswordChange(valid)).toBeNull();
  });

  it('mevcut parola bos olamaz', () => {
    expect(validatePasswordChange({ ...valid, currentPassword: '' })).toMatch(/Mevcut parola/);
  });

  it('yeni parola cok kisa olamaz', () => {
    expect(
      validatePasswordChange({ ...valid, newPassword: 'kisa', confirmPassword: 'kisa' }),
    ).toMatch(/en az 8/);
  });

  it('yeni parola eskisiyle ayni olamaz', () => {
    expect(
      validatePasswordChange({
        currentPassword: 'AyniParola1',
        newPassword: 'AyniParola1',
        confirmPassword: 'AyniParola1',
      }),
    ).toMatch(/ayni olamaz/);
  });

  it('tekrar eslesmezse hata verir', () => {
    expect(validatePasswordChange({ ...valid, confirmPassword: 'BaskaParola1' })).toMatch(
      /eslesmiyor/,
    );
  });
});

describe('validateRegistration', () => {
  const playerValues: RegistrationValues = {
    firstName: 'Arda',
    lastName: 'Guler',
    username: 'arda_guler',
    email: 'arda@futbolvitrini.local',
    password: 'GucluParola1',
    passwordConfirm: 'GucluParola1',
    avatarUrl: '',
    role: 'player',
    position: 'Kanat',
    preferredFoot: 'Sol',
    birthDate: '2005-02-25',
    currentClub: '',
    organization: '',
    expertise: '',
  };

  const clubValues: RegistrationValues = {
    ...playerValues,
    role: 'club',
    position: '',
    preferredFoot: '',
    birthDate: '',
    organization: 'Bursaspor',
    expertise: 'A Takım Scout',
  };

  it('gecerli futbolcu kaydinda hata yok', () => {
    expect(validateRegistration(playerValues)).toEqual({});
  });

  it('gecerli kulup kaydinda hata yok', () => {
    expect(validateRegistration(clubValues)).toEqual({});
  });

  it('zorunlu ortak alanlari kontrol eder', () => {
    const errors = validateRegistration({
      ...playerValues,
      firstName: '  ',
      lastName: '',
      username: '',
      email: 'gecersiz',
    });

    expect(errors.firstName).toBeTruthy();
    expect(errors.lastName).toBeTruthy();
    expect(errors.username).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });

  it('kullanici adi backend kurallariyla uyumludur', () => {
    expect(validateRegistration({ ...playerValues, username: 'ar' }).username).toMatch(/3-30/);
    expect(
      validateRegistration({ ...playerValues, username: 'arda.guler' }).username,
    ).toMatch(/harf, rakam ve alt cizgi/);
    expect(validateRegistration({ ...playerValues, username: 'Arda_10' }).username).toBeUndefined();
  });

  it('kisa parolayi ve eslesmeyen tekrari yakalar', () => {
    const errors = validateRegistration({
      ...playerValues,
      password: 'kisa',
      passwordConfirm: 'baska',
    });

    expect(errors.password).toMatch(/en az 8/);
    expect(errors.passwordConfirm).toMatch(/eslesmiyor/);
  });

  it('opsiyonel avatar adresi bos olabilir ama bozuk olamaz', () => {
    expect(validateRegistration({ ...playerValues, avatarUrl: '' }).avatarUrl).toBeUndefined();
    expect(validateRegistration({ ...playerValues, avatarUrl: 'bozuk' }).avatarUrl).toBeTruthy();
  });

  it('futbolcu icin mevki, ayak ve dogum tarihi zorunlu', () => {
    const errors = validateRegistration({
      ...playerValues,
      position: '',
      preferredFoot: '',
      birthDate: '',
    });

    expect(errors.position).toBeTruthy();
    expect(errors.preferredFoot).toBeTruthy();
    expect(errors.birthDate).toBeTruthy();
  });

  it('APIye eslenemeyen mevki ve ayak degerlerini reddeder', () => {
    const errors = validateRegistration({
      ...playerValues,
      position: 'Libero',
      preferredFoot: 'Farketmez',
    });

    expect(errors.position).toMatch(/Gecerli/);
    expect(errors.preferredFoot).toMatch(/Gecerli/);
  });

  it('makul olmayan yasi reddeder', () => {
    expect(validateRegistration({ ...playerValues, birthDate: '2024-01-01' }).birthDate).toMatch(
      /Yas/,
    );
  });

  it('kulup rolunde futbolcu alanlari aranmaz, kurum alanlari aranir', () => {
    const errors = validateRegistration({ ...clubValues, organization: '', expertise: '' });

    expect(errors.position).toBeUndefined();
    expect(errors.birthDate).toBeUndefined();
    expect(errors.organization).toBeTruthy();
    expect(errors.expertise).toBeTruthy();
  });
});
