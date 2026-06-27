import { describe, it, expect, afterAll } from 'vitest';
import i18n from '../i18n.js';

describe('i18n', () => {
  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('defaults to English and provides a complete Kiswahili translation', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('auth.title')).toBe('Sign in');
    expect(i18n.t('nav.pos')).toBe('Point of Sale');

    await i18n.changeLanguage('sw');
    expect(i18n.t('auth.title')).toBe('Ingia');
    expect(i18n.t('nav.pos')).toBe('Mauzo (POS)');
  });
});
