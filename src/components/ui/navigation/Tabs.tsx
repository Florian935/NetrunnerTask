import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface TabItem {
  value: string
  label: ReactNode
}

export interface TabsProps {
  /** string[] ou {value,label}[]. */
  tabs?: (string | TabItem)[]
  value?: string
  onChange?: (value: string) => void
  style?: CSSProperties
}

/** Barre d'onglets soulignée avec indicateur actif néon lumineux. */
export function Tabs({
  tabs = [],
  value,
  onChange,
  style = {},
  ...rest
}: TabsProps & Omit<HTMLAttributes<HTMLDivElement>, keyof TabsProps>) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
        borderBottom: '1px solid var(--border)',
        ...style,
      }}
      {...rest}
    >
      {tabs.map((tt) => {
        const tab = typeof tt === 'string' ? { value: tt, label: tt } : tt
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange && onChange(tab.value)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: active ? 'var(--cyan-400)' : 'var(--text-secondary)',
              textShadow: active ? 'var(--text-glow-cyan)' : 'none',
              transition: 'color var(--dur-fast) var(--ease-out)',
            }}
          >
            {tab.label}
            {active && (
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  right: 8,
                  bottom: -1,
                  height: 2,
                  background: 'var(--cyan-500)',
                  boxShadow: '0 0 8px var(--cyan-500)',
                  animationName: 'nw-pulse-cyan',
                  animationDuration: '2.4s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'var(--ease-in-out)',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
