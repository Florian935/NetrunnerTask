import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './card.css'

export type CardAccent = 'cyan' | 'magenta' | 'mint' | 'violet' | 'red'

export interface CardProps {
  children?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  /** Contenu aligné à droite dans l'en-tête (ex. un IconButton). */
  actions?: ReactNode
  /** Rail d'accent en haut + bordure teintée : cyan | magenta | mint | violet. */
  accent?: CardAccent
  /**
   * Halo néon permanent (fond légèrement teinté + lueur douce) présent AU REPOS
   * et intensifié au survol. Styles portés par la classe `.nw-card-halo`
   * (voir `./card.css`). Prend le pas sur `accent`/`glow`.
   */
  halo?: CardAccent
  /** Coins HUD biseautés au lieu d'arrondis. @default false */
  hud?: boolean
  /**
   * Repères d'angle blancs (style HUD, cf. card.png) : 2 repères en diagonale,
   * collés aux coins NON biseautés (haut-droite + bas-gauche du chanfrein `hud`).
   * @default false
   */
  brackets?: boolean
  glow?: boolean
  padding?: string
  style?: CSSProperties
}

/** Un repère d'angle en L (coin HUD). `pos` place le coin ; `borders` choisit les côtés. */
function Bracket({ pos, borders }: { pos: CSSProperties; borders: string }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        width: 14,
        height: 14,
        borderColor: 'rgba(230,241,255,.85)',
        borderStyle: 'solid',
        borderWidth: borders,
        pointerEvents: 'none',
        ...pos,
      }}
    />
  )
}

/** Conteneur de surface de base avec en-tête, rail d'accent et coins HUD optionnels. */
export function Card({
  children,
  title,
  subtitle,
  actions,
  accent,
  halo,
  hud = false,
  brackets = false,
  glow = false,
  padding = 'var(--space-5)',
  style = {},
  className,
  ...rest
}: CardProps & Omit<HTMLAttributes<HTMLDivElement>, keyof CardProps>) {
  const accentColor = accent ? `var(--${accent}-500)` : null
  // Mode halo : la classe `.nw-card-halo` porte fond/bordure/lueur (repos +
  // survol) ; on n'impose donc pas ces trois-là en inline pour la laisser gagner.
  const haloClass = halo
    ? `nw-card-halo${className ? ` ${className}` : ''}`
    : className
  const haloVars = halo
    ? ({ ['--halo']: `var(--${halo}-500)` } as CSSProperties)
    : null
  return (
    <div
      className={haloClass}
      style={{
        position: 'relative',
        ...(halo
          ? null
          : {
              background: 'var(--bg-panel)',
              border: `1px solid ${accentColor ? `color-mix(in srgb, ${accentColor} 35%, var(--border))` : 'var(--border)'}`,
              boxShadow:
                glow && accentColor
                  ? `var(--shadow-2), 0 0 20px -6px ${accentColor}`
                  : 'var(--shadow-2)',
            }),
        borderRadius: hud ? 0 : 'var(--radius-md)',
        clipPath: hud ? 'var(--clip-bevel-md)' : 'none',
        overflow: 'hidden',
        ...haloVars,
        ...style,
      }}
      {...rest}
    >
      {brackets && (
        <>
          {/* Coins NON biseautés du chanfrein `hud` : haut-droite + bas-gauche,
              collés au coin (inset 0). */}
          <Bracket pos={{ top: 0, right: 0 }} borders="2px 2px 0 0" />
          <Bracket pos={{ bottom: 0, left: 0 }} borders="0 0 2px 2px" />
        </>
      )}
      {accentColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
      )}
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            padding,
            paddingBottom: 'var(--space-3)',
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--weight-semibold)',
                  letterSpacing: 'var(--tracking-wide)',
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-2xs)',
                  letterSpacing: 'var(--tracking-wide)',
                  color: 'var(--text-muted)',
                  marginTop: 3,
                  textTransform: 'uppercase',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {actions}
        </div>
      )}
      <div style={{ padding, paddingTop: title || actions ? 0 : padding }}>
        {children}
      </div>
    </div>
  )
}
