import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type ProgressAccent = 'cyan' | 'magenta' | 'mint' | 'violet' | 'gradient'

const ACCENTS: Record<ProgressAccent, string> = {
  cyan: 'var(--cyan-500)',
  magenta: 'var(--magenta-500)',
  mint: 'var(--mint-500)',
  violet: 'var(--violet-500)',
  gradient: 'var(--grad-primary)',
}

export interface ProgressBarProps {
  value?: number
  max?: number
  /** @default "cyan" — ou n'importe quelle couleur/token CSS */
  accent?: ProgressAccent | string
  label?: ReactNode
  showValue?: boolean
  /** Hauteur de la piste en px. @default 8 */
  height?: number
  style?: CSSProperties
}

/** Barre de progression déterminée néon avec label + readout % optionnels. */
export function ProgressBar({
  value = 0,
  max = 100,
  accent = 'cyan',
  label,
  showValue = false,
  height = 8,
  style = {},
  ...rest
}: ProgressBarProps & Omit<HTMLAttributes<HTMLDivElement>, keyof ProgressBarProps>) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const fill = ACCENTS[accent as ProgressAccent] || accent
  const glowColor = accent === 'gradient' ? 'var(--magenta-500)' : fill
  return (
    <div style={{ ...style }} {...rest}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{label}</span>
          {showValue && (
            <span style={{ color: 'var(--text-primary)' }}>{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        style={{
          position: 'relative',
          height,
          background: 'var(--bg-inset)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: fill,
            boxShadow: `0 0 10px ${glowColor}`,
            borderRadius: 'var(--radius-pill)',
            transition: 'width var(--dur-med) var(--ease-out)',
          }}
        />
      </div>
    </div>
  )
}
