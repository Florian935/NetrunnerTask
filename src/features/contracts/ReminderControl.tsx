import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Icon } from '../../components/ui'
import {
  getPermission,
  requestPermission,
} from '../reminders/notifications'
import type { PermissionState } from '../reminders/notifications'

export interface ReminderControlProps {
  /** Minutes avant l'échéance (`null` = aucun rappel). */
  reminderLead: number | null
  /** Le rappel exige une **heure** (US-014) : inactif si l'échéance est au jour. */
  hasTime: boolean
  onSetReminderLead: (lead: number | null) => void
}

const OPTIONS: { lead: number | null; key: string }[] = [
  { lead: null, key: 'none' },
  { lead: 0, key: 'due' },
  { lead: 10, key: 'm10' },
  { lead: 60, key: 'h1' },
]

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-2xs)',
  letterSpacing: '0.16em',
  color: 'var(--steel-400)',
}

/**
 * Contrôle de rappel (US-014) : segments Aucun / À l'échéance / 10 min / 1 h.
 * **Actif seulement si l'échéance est horodatée** (`hasTime`) ; sinon inactif +
 * note explicative. Gère la **permission** de notification (demandée à
 * l'activation, honnête si refusée — best-effort local).
 */
export function ReminderControl({
  reminderLead,
  hasTime,
  onSetReminderLead,
}: ReminderControlProps) {
  const { t } = useTranslation()
  const [permission, setPermission] = useState<PermissionState>('default')

  useEffect(() => {
    setPermission(getPermission())
  }, [])

  const pick = (lead: number | null) => {
    onSetReminderLead(lead)
    // Activer un rappel demande la permission (jamais au chargement, US-014 H4).
    if (lead !== null && permission === 'default') {
      void requestPermission().then(setPermission)
    }
  }

  const active = reminderLead !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={labelStyle}>{t('contracts.reminder.label')}</span>

      <div
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          opacity: hasTime ? 1 : 0.5,
          pointerEvents: hasTime ? 'auto' : 'none',
        }}
      >
        {OPTIONS.map((o) => {
          const selected = o.lead === reminderLead
          return (
            <div
              key={o.key}
              role="button"
              onClick={() => pick(o.lead)}
              style={{
                cursor: 'pointer',
                padding: '7px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                color: selected ? 'var(--void-900)' : 'var(--steel-400)',
                background: selected ? 'var(--cyan-500)' : 'transparent',
                fontWeight: selected ? 700 : 500,
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}
            >
              {t(`contracts.reminder.opt.${o.key}`)}
            </div>
          )
        })}
      </div>

      {/* Sans heure : rappel indisponible */}
      {!hasTime && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            ...labelStyle,
            color: 'var(--steel-600)',
          }}
        >
          <Icon name="info" size={12} color="var(--steel-600)" />
          {t('contracts.reminder.needTime')}
        </span>
      )}

      {/* Permission (seulement si un rappel est actif et l'échéance horodatée) */}
      {hasTime && active && permission !== 'granted' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: 4,
          }}
        >
          <Icon
            name={permission === 'denied' ? 'bell-off' : 'bell'}
            size={14}
            color={
              permission === 'denied' ? 'var(--amber-500)' : 'var(--steel-400)'
            }
          />
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--steel-400)',
              lineHeight: 1.4,
            }}
          >
            {permission === 'denied'
              ? t('contracts.reminder.denied')
              : permission === 'unsupported'
                ? t('contracts.reminder.unsupported')
                : t('contracts.reminder.off')}
          </span>
          {permission === 'default' && (
            <Button
              variant="ghost"
              size="sm"
              hud
              onClick={() => void requestPermission().then(setPermission)}
            >
              {t('contracts.reminder.enable')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
