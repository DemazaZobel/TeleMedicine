import i18n from '../i18n';

// A Set to track untranslated or missing keys queried during this session
const untranslatedKeys = new Set<string>();

export const translationService = {
  /**
   * Translates a key with localization fallback, interpolations, and missing key logging.
   */
  t(key: string, options?: Record<string, any>): string {
    if (!key) return '';
    
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
    return i18n.language || 'en';
  },

  /**
   * Changes the active language dynamically.
   */
  async changeLanguage(lang: string): Promise<void> {
    await i18n.changeLanguage(lang);
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
