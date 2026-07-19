import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Icon, Input } from '../../components/ui'
import type { Contract } from '../../db'
import { isStakeEligible, stakePayout } from '../../game/risk'

export interface StakeControlProps {
  contract: Contract
  /** Solde de crédits du joueur (mise déjà débitée exclue). */
  balance: number
  /** Pose (montant > 0) ou retire (0) la mise. */
  onSetStake: (id: string, amount: number) => void
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-2xs)',
  letterSpacing: '0.16em',
  color: 'var(--steel-400)',
}
const cr = (n: number) => `${n} ¢`

/** En-tête commun du bloc : bandeau hachuré + libellé + pastille de statut. */
function StakeHeader({
  tone,
  status,
}: {
  tone: string
  status?: string
}) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 16,
            height: 8,
            background: `repeating-linear-gradient(-45deg, ${tone} 0, ${tone} 2px, transparent 2px, transparent 5px)`,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: tone,
          }}
        >
          {t('contracts.stake.label')}
        </span>
      </span>
      {status && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.14em',
            color: tone,
            padding: '2px 8px',
            clipPath: 'var(--clip-bevel-sm)',
            background: `color-mix(in srgb, ${tone} 14%, var(--bg-inset))`,
            border: `1px solid color-mix(in srgb, ${tone} 40%, transparent)`,
          }}
        >
          {status}
        </span>
      )}
    </div>
  )
}

/** Coque biseautée du bloc, teintée selon l'état. */
function Shell({
  tone,
  muted,
  children,
}: {
  tone: string
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 14,
        clipPath: 'var(--clip-bevel-sm)',
        background: muted
          ? 'var(--bg-inset)'
          : `color-mix(in srgb, ${tone} 6%, var(--bg-inset))`,
        border: `1px solid ${
          muted ? 'var(--border)' : `color-mix(in srgb, ${tone} 40%, transparent)`
        }`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Bloc « Mise à risque » (US-013) dans le détail d'un contrat. Quatre états :
 * inéligible (pas d'échéance / récurrent), saisie (montant + aperçu du retour +
 * poser/retirer), gagné (menthe, lecture seule), perdu (rouge, lecture seule).
 * La pose se fait sur **confirmation** (bouton « Miser »), débit immédiat.
 */
export function StakeControl({ contract, balance, onSetStake }: StakeControlProps) {
  const { t } = useTranslation()
  const { stake, stakeOutcome, difficulty } = contract

  // Brouillon de saisie (synchronisé sur la mise en base, jamais pendant la frappe
  // — `stake` ne change qu'à la confirmation).
  const [draft, setDraft] = useState(stake > 0 ? String(stake) : '')
  useEffect(() => {
    setDraft(stake > 0 ? String(stake) : '')
  }, [contract.id, stake, stakeOutcome])

  // --- États résolus (figés) -------------------------------------------------
  if (stakeOutcome === 'won') {
    const payout = stakePayout(stake, difficulty)
    return (
      <Shell tone="var(--mint-500)">
        <StakeHeader tone="var(--mint-500)" status={t('contracts.stake.won')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon name="check-circle" size={28} color="var(--mint-500)" />
          <div style={{ flex: 1 }}>
            <div style={{ ...labelStyle, color: 'var(--mint-600)' }}>
              {t('contracts.stake.wonLabel')}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-xl)',
                color: 'var(--mint-500)',
                lineHeight: 1.1,
              }}
            >
              {cr(payout)}
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              color: 'var(--steel-400)',
              lineHeight: 1.7,
            }}
          >
            <div>
              {t('contracts.stake.mise')}{' '}
              <b style={{ color: 'var(--frost-100)' }}>{stake}</b>
            </div>
            <div>
              {t('contracts.stake.gainNet')}{' '}
              <b style={{ color: 'var(--mint-500)' }}>+{payout - stake}</b>
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  if (stakeOutcome === 'lost') {
    const target = stakePayout(stake, difficulty)
    return (
      <Shell tone="var(--red-500)">
        <StakeHeader tone="var(--red-500)" status={t('contracts.stake.lost')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon name="x-circle" size={28} color="var(--red-500)" />
          <div style={{ flex: 1 }}>
            <div style={{ ...labelStyle, color: 'var(--red-400)' }}>
              {t('contracts.stake.lostLabel')}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-xl)',
                color: 'var(--red-500)',
                lineHeight: 1.1,
              }}
            >
              −{cr(stake)}
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              color: 'var(--steel-600)',
              lineHeight: 1.7,
            }}
          >
            <div>{t('contracts.stake.targetReturn')}</div>
            <div
              style={{
                textDecoration: 'line-through',
                textDecorationColor: 'var(--red-500)',
              }}
            >
              {cr(target)}
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  // --- Inéligible ------------------------------------------------------------
  if (!isStakeEligible(contract)) {
    return (
      <Shell tone="var(--steel-400)" muted>
        <StakeHeader tone="var(--steel-400)" />
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <Icon name="lock" size={17} color="var(--steel-600)" />
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.5,
              color: 'var(--steel-400)',
            }}
          >
            {t('contracts.stake.needEligible')}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.1em',
                color: 'var(--steel-600)',
                marginTop: 5,
              }}
            >
              {t('contracts.stake.needEligibleHint')}
            </div>
          </div>
        </div>
      </Shell>
    )
  }

  // --- Saisie (éligible, non résolu) -----------------------------------------
  const tone = 'var(--amber-500)'
  const available = balance + stake // l'ancienne mise est remboursable
  const parsed = draft === '' ? 0 : Number.parseInt(draft, 10)
  const amount = Number.isFinite(parsed) ? parsed : 0
  const over = amount > available
  const showPreview = amount >= 1 && !over
  const canStake = amount >= 1 && !over && amount !== stake
  const payout = showPreview ? stakePayout(amount, difficulty) : 0

  const onDraft = (v: string) => setDraft(v.replace(/[^0-9]/g, ''))

  return (
    <Shell tone={tone}>
      <StakeHeader
        tone={tone}
        status={
          stake > 0 ? t('contracts.stake.atRisk') : `×${payoutMult(difficulty)}`
        }
      />

      {/* Solde & plafond (= solde disponible) */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', ...labelStyle }}
      >
        <span>
          {t('contracts.stake.solde')}{' '}
          <span style={{ color: 'var(--mint-500)' }}>{cr(balance)}</span>
        </span>
        <span>
          {t('contracts.stake.plafond')}{' '}
          <span style={{ color: 'var(--steel-200)' }}>{cr(available)}</span>
        </span>
      </div>

      {/* Champ de montant + MAX */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input
          size="md"
          hud
          icon="coins"
          error={over}
          type="text"
          inputMode="numeric"
          placeholder={t('contracts.stake.placeholder')}
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="ghost"
          size="sm"
          hud
          onClick={() => setDraft(String(available))}
        >
          {t('contracts.stake.max')}
        </Button>
      </div>

      {over && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.08em',
            color: 'var(--red-500)',
          }}
        >
          {t('contracts.stake.insufficient')}
        </div>
      )}

      {/* Aperçu du retour — mise → retour → gain net */}
      {showPreview && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '11px 13px',
            clipPath: 'var(--clip-bevel-sm)',
            background: 'var(--void-900)',
            border: `1px solid color-mix(in srgb, ${tone} 38%, transparent)`,
          }}
        >
          <div>
            <div style={labelStyle}>{t('contracts.stake.mise')}</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-lg)',
                color: 'var(--frost-100)',
                lineHeight: 1,
              }}
            >
              {amount}
            </div>
          </div>
          <Icon name="arrow-right" size={18} color={tone} />
          <div>
            <div style={labelStyle}>{t('contracts.stake.retour')}</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-lg)',
                color: tone,
                lineHeight: 1,
              }}
            >
              {payout}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={labelStyle}>{t('contracts.stake.gainNet')}</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-md)',
                color: 'var(--mint-500)',
              }}
            >
              +{cr(payout - amount)}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant="primary"
          size="sm"
          hud
          disabled={!canStake}
          onClick={() => onSetStake(contract.id, amount)}
          leftIcon={<Icon name="zap" size={14} />}
          style={{ flex: 1 }}
        >
          {t('contracts.stake.stakeBtn', { amount })}
        </Button>
        {stake > 0 && (
          <Button
            variant="danger"
            size="sm"
            hud
            onClick={() => onSetStake(contract.id, 0)}
            leftIcon={<Icon name="undo-2" size={14} />}
          >
            {t('contracts.stake.remove')}
          </Button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.08em',
          color: 'var(--steel-600)',
        }}
      >
        <Icon name="alert-triangle" size={12} color="var(--steel-600)" />
        {t('contracts.stake.debitWarning')}
      </div>
    </Shell>
  )
}

/** Multiplicateur de retour affiché en pastille (pré-saisie). */
function payoutMult(difficulty: Contract['difficulty']): number {
  return stakePayout(100, difficulty) / 100
}
