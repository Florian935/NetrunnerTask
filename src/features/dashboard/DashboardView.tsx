import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button, Icon } from '../../components/ui'
import type { Contract } from '../../db'
import { useContractsStore } from '../../stores/useContractsStore'
import { ContractDetailConnected } from '../contracts/ContractDetailConnected'
import { useCompleteContract } from '../contracts/useCompleteContract'
import { ReputationPanel } from '../reputation/ReputationPanel'
import { TodayContractRow } from './TodayContractRow'
import { todayContracts } from './todayContracts'

/** En-tête de sous-section (EN RETARD / AUJOURD'HUI) avec pastille + compteur. */
function SectionHeader({
  color,
  label,
  count,
}: {
  color: string
  label: string
  count: number
}) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: '0 0 11px',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.18em',
          color,
        }}
      >
        {t('dashboard.sectionCount', { label, count })}
      </span>
    </div>
  )
}

/**
 * Tableau de bord (HUD, US-010) : point d'entrée de l'app. Liste les contrats
 * du jour — ouverts à échéance dépassée (EN RETARD) ou aujourd'hui — groupés,
 * en retard d'abord. Complétion et ouverture du détail comme dans la liste.
 * État vide dédié renvoyant vers l'écran Contrats.
 */
export function DashboardView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const contracts = useContractsStore((s) => s.contracts)
  const completeContract = useCompleteContract()
  const [detailId, setDetailId] = useState<string | null>(null)

  const { overdue, today } = todayContracts(contracts, Date.now())
  const totalToday = overdue.length + today.length

  const openDetail = (c: Contract) => setDetailId(c.id)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 26px 40px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.22em',
              color: 'var(--cyan-500)',
              marginBottom: 7,
            }}
          >
            {t('dashboard.eyebrow')}
          </div>
          <h1
            className="nw-neon-cyan"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              letterSpacing: '0.05em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            {t('dashboard.title')}
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 13px',
            background: 'var(--bg-inset)',
            border: `1px solid color-mix(in srgb, var(--red-500) 30%, var(--border))`,
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          <span
            className="nw-neon-cyan"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xl)',
              lineHeight: 1,
            }}
          >
            {String(totalToday).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--steel-400)',
              maxWidth: 90,
              lineHeight: 1.2,
            }}
          >
            {t('dashboard.todayCount', { count: totalToday })}
          </span>
        </div>
      </div>

      {totalToday === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 15,
            padding: '60px 20px',
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border:
                '1px solid color-mix(in srgb, var(--mint-500) 30%, transparent)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--mint-500)',
              boxShadow: '0 0 22px -10px var(--mint-500)',
            }}
          >
            <Icon name="coffee" size={30} color="var(--mint-500)" />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--steel-200)',
            }}
          >
            {t('dashboard.emptyTitle')}
          </div>
          <p
            style={{
              maxWidth: 340,
              margin: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              lineHeight: 1.5,
              color: 'var(--steel-400)',
            }}
          >
            {t('dashboard.emptyBody')}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contracts')}
          >
            {t('dashboard.emptyCta')}
          </Button>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <SectionHeader
                color="var(--red-500)"
                label={t('contracts.due.overdue')}
                count={overdue.length}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdue.map((c) => (
                  <TodayContractRow
                    key={c.id}
                    contract={c}
                    kind="overdue"
                    onToggle={completeContract}
                    onOpen={openDetail}
                  />
                ))}
              </div>
            </div>
          )}
          {today.length > 0 && (
            <div>
              <SectionHeader
                color="var(--amber-500)"
                label={t('contracts.due.today')}
                count={today.length}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {today.map((c) => (
                  <TodayContractRow
                    key={c.id}
                    contract={c}
                    kind="today"
                    onToggle={completeContract}
                    onOpen={openDetail}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Réputation des factions (US-012) */}
      <div style={{ marginTop: 26 }}>
        <ReputationPanel />
      </div>

      <ContractDetailConnected
        contractId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}
