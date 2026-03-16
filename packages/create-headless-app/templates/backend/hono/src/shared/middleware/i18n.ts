/**
 * i18n middleware — parses Accept-Language header and sets locale in context.
 */

import { createMiddleware } from 'hono/factory';
import type { AppVariables } from '../types/index.ts';
import type { Locale } from '../lib/i18n/index.ts';

export const i18nMiddleware = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const acceptLanguage = c.req.header('Accept-Language') ?? '';

  let locale: Locale = 'en';

  // Parse the first language tag (e.g. "fr-FR,fr;q=0.9,en;q=0.8" → "fr")
  const firstTag = acceptLanguage.split(',')[0]?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (firstTag.startsWith('fr')) {
    locale = 'fr';
  }

  c.set('locale', locale);
  await next();
});
