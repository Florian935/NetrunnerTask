import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { Recurrence } from '../../db'

export interface RecurrenceControlProps {
  value: Recurrence | null
  onChange: (recurrence: Recurrence | null) => void
}

type Mode = 'none' | 'interval' | 'weekday'
const UNITS: ReadonlyArray<'day' | 'week' | 'month'> = ['day', 'week', 'month']
const UNIT_KEY = {
  day: 'unitDay',
  week: 'unitWeek',
  month: 'unitMonth',
} as const
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const

/** Segment cliquable (même look que le sélecteur de priorité). */
function Segment({
  selected,
  onClick,
  title,
  children,
}: {
  selected: boolean
  onClick: () => void
  title?: string
  children: React.ReactNode
}) {
  const style: CSSProperties = {
    flex: 1,
    textAlign: 'center',
    cursor: 'pointer',
    padding: '8px 4px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-2xs)',
    letterSpacing: '0.12em',
    color: selected ? 'var(--void-900)' : 'var(--steel-400)',
    background: selected ? 'var(--cyan-500)' : 'transparent',
    boxShadow: selected ? '0 0 12px -2px var(--cyan-500)' : 'none',
    transition: 'all var(--dur-fast) var(--ease-out)',
  }
  return (
    <div role="button" title={title} onClick={onClick} style={style}>
      {children}
    </div>
  )
}

const groupStyle: CSSProperties = {
  display: 'flex',
  background: 'var(--bg-inset)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  overflow: 'hidden',
}

/**
 * Contrôle de récurrence de la modale de détail (US-006) : aucune / intervalle
 * (tous les N jours·semaines·mois) / jour de semaine fixe. Composé des mêmes
 * briques que le sélecteur de priorité (segments) — pas de maquette dédiée.
 */
export function RecurrenceControl({ value, onChange }: RecurrenceControlProps) {
  const { t } = useTranslation()
  const mode: Mode = value === null ? 'none' : value.mode

  const selectMode = (next: Mode) => {
    if (next === 'none') return onChange(null)
    if (next === 'interval') {
      onChange(
        value?.mode === 'interval'
          ? value
          : { mode: 'interval', every: 1, unit: 'day' },
      )
    } else {
      onChange(
        value?.mode === 'weekday' ? value : { mode: 'weekday', weekday: 1 },
      )
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.16em',
          color: 'var(--steel-400)',
        }}
      >
        {t('contracts.recurrence.label')}
      </span>

      <div style={groupStyle}>
        <Segment selected={mode === 'none'} onClick={() => selectMode('none')}>
          {t('contracts.recurrence.none')}
        </Segment>
        <Segment
          selected={mode === 'interval'}
          onClick={() => selectMode('interval')}
        >
          {t('contracts.recurrence.modeInterval')}
        </Segment>
        <Segment
          selected={mode === 'weekday'}
          onClick={() => selectMode('weekday')}
        >
          {t('contracts.recurrence.modeWeekday')}
        </Segment>
      </div>

      {value?.mode === 'interval' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.12em',
              color: 'var(--steel-400)',
              flex: 'none',
            }}
          >
            {t('contracts.recurrence.everyField')}
          </span>
          <input
            type="number"
            min={1}
            value={value.every}
            onChange={(e) => {
              const n = Math.max(1, Math.floor(Number(e.target.value) || 1))
              onChange({ ...value, every: n })
            }}
            style={{
              width: 56,
              height: 36,
              textAlign: 'center',
              background: 'var(--bg-inset)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--frost-100)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              colorScheme: 'dark',
            }}
          />
          <div style={{ ...groupStyle, flex: 1 }}>
            {UNITS.map((u) => (
              <Segment
                key={u}
                selected={value.unit === u}
                onClick={() => onChange({ ...value, unit: u })}
              >
                {t(`contracts.recurrence.${UNIT_KEY[u]}`, { count: 1 })}
              </Segment>
            ))}
          </div>
        </div>
      )}

      {value?.mode === 'weekday' && (
        <div style={groupStyle}>
          {WEEKDAYS.map((d) => (
            <Segment
              key={d}
              selected={value.weekday === d}
              onClick={() => onChange({ mode: 'weekday', weekday: d })}
              title={t(`contracts.recurrence.weekdayLong${d}`)}
            >
              {t(`contracts.recurrence.weekdayShort${d}`)}
            </Segment>
          ))}
        </div>
      )}
    </div>
  )
}
