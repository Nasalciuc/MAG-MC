import { ro } from './ro';
import { en } from './en';
import type { Lang } from '../lib/types';

export type { Translations } from './ro';

const translations = { ro, en } as const;

export function t(lang: Lang): typeof ro {
  return translations[lang];
}
