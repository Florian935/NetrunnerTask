import { useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** Texte de l'infobulle. */
  label: ReactNode
  children: ReactNode
  /** @default "top" */
  placement?: TooltipPlacement
  style?: CSSProperties
}

/** Infobulle au survol avec liseré néon + biseau. Enveloppe son déclencheur. */
export function Tooltip({
  label,
  children,
  placement = 'top',
  style = {},
  ...rest
}: TooltipProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof TooltipProps>) {
  const [show, setShow] = useState(false)
  const pos: Record<TooltipPlacement, CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  }
  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      {...rest}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 'var(--z-toast)',
            ...pos[placement],
            padding: '5px 10px',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--cyan-400)',
            background: 'var(--void-800)',
            border: '1px solid var(--cyan-600)',
            boxShadow: '0 0 12px rgba(0,240,255,.25)',
            clipPath: 'var(--clip-bevel-sm)',
            pointerEvents: 'none',
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}
