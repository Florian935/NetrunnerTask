import { Icon } from '../../components/ui'

/** Couleur/identité des fragments (token `crate.css`, US-035). */
export const FRAGMENT_COLOR = 'var(--fragment)'
export const FRAGMENT_RGB = 'var(--fragment-rgb)'

/** Glyphe cristal mint des fragments. */
export function FragmentIcon({ size = 15 }: { size?: number }) {
  return (
    <span style={{ color: FRAGMENT_COLOR, display: 'inline-flex', filter: `drop-shadow(0 0 5px rgba(${FRAGMENT_RGB}, 0.7))` }}>
      <Icon name="gem" size={size} />
    </span>
  )
}

export interface FragmentAmountProps {
  value: number
  /** Préfixe éventuel (ex. « + » pour un gain). */
  sign?: string
  size?: number
  /** Police display (chiffres marquants) plutôt que mono. */
  strong?: boolean
}

/** Montant de fragments : glyphe + valeur formatée (mint/cristal). */
export function FragmentAmount({ value, sign = '', size = 15, strong = false }: FragmentAmountProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: FRAGMENT_COLOR,
        fontFamily: strong ? 'var(--font-display)' : 'var(--font-mono)',
        fontWeight: strong ? 700 : undefined,
        fontSize: size,
        letterSpacing: '0.02em',
        textShadow: `0 0 10px rgba(${FRAGMENT_RGB}, 0.5)`,
      }}
    >
      <FragmentIcon size={Math.round(size * 0.9)} />
      {sign}
      {value.toLocaleString('fr-FR')}
    </span>
  )
}
