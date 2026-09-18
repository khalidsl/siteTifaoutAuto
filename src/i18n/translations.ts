import { fr, type TranslationSchema } from './locales/fr';
import { ar } from './locales/ar';

export type Language = 'fr' | 'ar';
export type { TranslationSchema };

export const translations = {
  fr,
  ar
} as const;

export default translations;