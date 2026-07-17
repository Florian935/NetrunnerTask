import type { CSSProperties, InputHTMLAttributes } from 'react'

export interface SliderProps {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  disabled?: boolean
  /** Affiche un readout % à droite. @default false */
  showValue?: boolean
  /** Couleur piste/curseur (couleur CSS ou token). @default cyan */
  accent?: string
  style?: CSSProperties
}

/** Curseur de plage néon avec pouce lumineux + piste remplie. */
export function Slider({
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = false,
  accent = 'var(--cyan-500)',
  style = {},
  ...rest
}: SliderProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof SliderProps>) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          height: 20,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 999,
            background: 'var(--bg-inset)',
            border: '1px solid var(--border)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${pct}%`,
            height: 4,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${pct}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: '999px',
            background: 'var(--void-900)',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            margin: 0,
            opacity: 0,
            height: 20,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        />
      </div>
      {showValue && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            minWidth: 34,
            textAlign: 'right',
          }}
        >
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
