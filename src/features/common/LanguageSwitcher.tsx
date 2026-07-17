import { useTranslation } from 'react-i18next'

const LANGS = ['fr', 'en'] as const

/**
 * Sélecteur de langue FR|EN (deux pastilles segmentées, actif en néon cyan).
 * Bascule l'app à chaud ; le choix est persisté par le détecteur i18n.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language

  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      {LANGS.map((lng) => {
        const active = current === lng
        return (
          <button
            key={lng}
            type="button"
            aria-pressed={active}
            onClick={() => void i18n.changeLanguage(lng)}
            style={{
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              border: 'none',
              background: active ? 'var(--cyan-500)' : 'transparent',
              color: active ? 'var(--void-900)' : 'var(--text-secondary)',
              boxShadow: active ? 'var(--glow-cyan)' : 'none',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >
            {lng}
          </button>
        )
      })}
    </div>
  )
}
