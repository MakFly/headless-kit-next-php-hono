/**
 * i18n utility — key-based translation with parameter interpolation
 */

import { en } from './en.ts';
import { fr } from './fr.ts';

export type Locale = 'en' | 'fr';

const translations: Record<Locale, Record<string, string>> = { en, fr };

/**
 * Translate a key for the given locale.
 * Falls back to 'en' if the key is not found in the requested locale.
 * Supports {{param}} interpolation.
 */
export function t(locale: Locale, key: string, params?: Record<string, string>): string {
  const dict = translations[locale] ?? translations.en;
  let message = dict[key] ?? translations.en[key] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      message = message.replaceAll(`{{${k}}}`, v);
    }
  }

  return message;
}
