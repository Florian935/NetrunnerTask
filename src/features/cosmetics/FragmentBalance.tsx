import { useTranslation } from 'react-i18next'
import { FRAGMENT_RGB, FragmentIcon } from './Fragment'

export interface FragmentBalanceProps {
  value: number
  /** Rendu compact (pastille sans libellé sous le chiffre). @default false */
  compact?: boolean
}

/**
 * Solde de fragments (US-035) — pastille compteur d'identité mint/cristal, à
 * loger dans les en-têtes (CAISSES / Forge). Purement esthétique.
 */
export function FragmentBalance({ value, compact = false }: FragmentBalanceProps) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: compact ? '5px 11px' : '7px 13px',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid rgba(${FRAGMENT_RGB}, 0.5)`,
        background: 'var(--bg-inset)',
        boxShadow: `0 0 16px -5px rgba(${FRAGMENT_RGB}, 0.7)`,
      }}
    >
      {!compact && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>
          {t('cosmetics.fragments.label')}
        </span>
      )}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--fragment)', textShadow: `0 0 10px rgba(${FRAGMENT_RGB}, 0.5)` }}>
        <FragmentIcon size={15} />
        {value.toLocaleString('fr-FR')}
      </span>
    </div>
  )
}
