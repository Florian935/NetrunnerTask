import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from './locales/fr.json'
import en from './locales/en.json'

/**
 * Configuration i18n (react-i18next).
 * - Langues : FR (repli) + EN.
 * - Langue initiale détectée depuis localStorage puis le navigateur.
 * - Choix persisté en localStorage (clé `nt-lang`).
 * Règle projet : aucune chaîne d'UI en dur — tout passe par `t()` et les
 * catalogues `src/i18n/locales/{fr,en}.json`.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'nt-lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
