import type { i18n as I18nInstance } from 'i18next';

// Lazy access breaks require cycle: i18n.ts -> translationService.ts -> i18n.ts
function getI18n(): I18nInstance {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../i18n').default;
}

// A Set to track untranslated or missing keys queried during this session
const untranslatedKeys = new Set<string>();

export const translationService = {
  /**
   * Translates a key with localization fallback, interpolations, and missing key logging.
   */
  t(key: string, options?: Record<string, any>): string {
    if (!key) return '';

    const i18n = getI18n();
    
    // Check if key exists in resource bundle
    if (!i18n.exists(key)) {
      untranslatedKeys.add(key);
      
      // Fallback: return the last part of the key as human-readable title-case text
      const parts = key.split(':').pop()!.split('.');
      const fallbackText = parts[parts.length - 1]
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim();
      return fallbackText.charAt(0).toUpperCase() + fallbackText.slice(1);
    }
    
    return i18n.t(key, options) as string;
  },

  /**
   * Returns the current active language code.
   */
  getLanguage(): string {
    return getI18n().language || 'en';
  },

  /**
   * Changes the active language dynamically.
   */
  async changeLanguage(lang: string): Promise<void> {
    await getI18n().changeLanguage(lang);
  },

  /**
   * Returns an array of missing or untranslated keys logged during the session.
   */
  generateUntranslatedReport(): string[] {
    return Array.from(untranslatedKeys);
  },

  /**
   * Clears logged untranslated keys.
   */
  clearUntranslatedKeys(): void {
    untranslatedKeys.clear();
  }
};
