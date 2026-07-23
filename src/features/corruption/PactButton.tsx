import { useState } from 'react'
import { Icon } from '../../components/ui'
import { COR_COLOR, COR_COLOR_HOVER, COR_RGB, corGlow } from './corruptionStyle'

export interface PactButtonProps {
  variant: 'embrace' | 'refuse'
  icon: string
  label: string
  sub: string
  onClick: () => void
}

/**
 * Bouton du pacte (US-036) — grand, à deux lignes (label + sous-texte). Le choix
 * « embrasser » est magenta tentant (halo qui s'intensifie au survol) ;
 * « refuser » reste sobre. Conventions DS (clip biseauté, polices, durées).
 */
export function PactButton({ variant, icon, label, sub, onClick }: PactButtonProps) {
  const [hover, setHover] = useState(false)
  const embrace = variant === 'embrace'
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        minWidth: 190,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '17px 20px 14px',
        clipPath: 'var(--clip-bevel-md)',
        border: `1px solid ${embrace ? (hover ? COR_COLOR_HOVER : COR_COLOR) : hover ? 'var(--steel-200, #c7d3e6)' : 'var(--border-strong)'}`,
        background: embrace
          ? hover
            ? `rgba(${COR_RGB}, 0.22)`
            : `rgba(${COR_RGB}, 0.12)`
          : hover
            ? 'var(--bg-hover)'
            : 'var(--void-900)',
        color: embrace ? COR_COLOR_HOVER : 'var(--frost-100, #eaf6ff)',
        boxShadow: embrace ? (hover ? corGlow(1.5) : corGlow(1)) : hover ? 'var(--shadow-2)' : 'none',
        transition: 'all var(--dur-fast) var(--ease-out)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '0.14em', textShadow: embrace ? `0 0 14px rgba(${COR_RGB}, 0.7)` : 'none' }}>
        <Icon name={icon} size={22} /> {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: embrace ? `rgba(${COR_RGB}, 0.85)` : 'var(--text-muted)', textAlign: 'center' }}>
        {sub}
      </span>
    </button>
  )
}
