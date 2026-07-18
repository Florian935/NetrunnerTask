import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, ProgressBar } from '../../components/ui'
import { useContractsStore } from '../../stores/useContractsStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import type { Contract, Difficulty } from '../../db'
import { priorityRank } from '../../game/priority'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { ContractDetailConnected } from './ContractDetailConnected'
import { ContractList } from './ContractList'
import { QuickAddContract } from './QuickAddContract'
import { contractCode } from './contractCode'
import { useCompleteContract } from './useCompleteContract'
import './contracts.css'

/**
 * Écran « Contrats » (US-004) : en-tête (compteur ACTIFS · TOTAL + barre de
 * complétion), barre de création rapide, liste réactive des contrats (terminer /
 * éditer / supprimer), popup de confirmation de suppression. Depuis US-010, le
 * chrome (niveau/solde, gains de session, toasts) est porté par l'app-shell ;
 * la complétion passe par le hook partagé `useCompleteContract`.
 */
export function ContractsView() {
  const { t } = useTranslation()
  const contracts = useContractsStore((s) => s.contracts)
  const createContract = useContractsStore((s) => s.create)
  const reopen = useContractsStore((s) => s.reopen)
  const remove = useContractsStore((s) => s.remove)
  const completeContract = useCompleteContract()
  const pushToast = useFeedbackStore((s) => s.pushToast)
  const flashingId = useFeedbackStore((s) => s.flashingId)

  const [target, setTarget] = useState<Contract | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const handleCreate = async (title: string, difficulty: Difficulty) => {
    await createContract(title, difficulty)
    pushToast('success', t('contracts.toastCreated'), title)
  }

  const toggle = (id: string) => {
    const c = contracts.find((x) => x.id === id)
    if (!c) return
    if (c.status === 'done') {
      // Récurrent validé : verrouillé jusqu'à la réactivation (US-006).
      if (c.recurrence) return
      void reopen(id)
      return
    }
    completeContract(id)
  }

  const confirmDelete = () => {
    if (!target) return
    const c = target
    void remove(c.id)
    setTarget(null)
    pushToast('danger', t('contracts.toastPurged'), c.title)
  }

  const total = contracts.length
  const doneCount = contracts.filter((c) => c.status === 'done').length
  const active = total - doneCount
  const pct = total ? (doneCount / total) * 100 : 0

  // Tri d'affichage : ouverts d'abord, terminés en bas. Parmi les ouverts,
  // priorité (haute → basse) puis récence (US-005) ; les terminés restent triés
  // par récence. Tri dérivé — l'ordre du store est inchangé.
  const sortedContracts = [...contracts].sort((a, b) => {
    const aDone = a.status === 'done' ? 1 : 0
    const bDone = b.status === 'done' ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    if (aDone === 0) {
      const byPriority = priorityRank(b.priority) - priorityRank(a.priority)
      if (byPriority !== 0) return byPriority
    }
    return b.createdAt - a.createdAt
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '22px 26px 40px' }}>
      {/* En-tête : titre + compteur ACTIFS · TOTAL (niveau/solde → barre de statut) */}
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
            {t('contracts.overline')}
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
            {t('contracts.title')}
          </h1>
        </div>
        <div style={{ textAlign: 'right', flex: 'none', minWidth: 150 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.16em',
              color: 'var(--steel-400)',
              marginBottom: 4,
            }}
          >
            {t('contracts.activeTotal')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'flex-end',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              className="nw-neon-cyan"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xl)',
                lineHeight: 1,
              }}
            >
              {String(active).padStart(2, '0')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-lg)',
                color: 'var(--steel-600)',
              }}
            >
              /
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xl)',
                lineHeight: 1,
                color: 'var(--steel-400)',
              }}
            >
              {String(total).padStart(2, '0')}
            </span>
          </div>
          <ProgressBar value={pct} max={100} accent="mint" height={5} />
        </div>
      </div>

      {/* Barre de création rapide */}
      <QuickAddContract onCreate={handleCreate} />

      {/* Liste ou état vide */}
      <div style={{ marginTop: 22 }}>
        {total === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 14,
              padding: '60px 0',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Icon name="radio-tower" size={30} color="var(--cyan-500)" />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--steel-200)',
              }}
            >
              {t('contracts.emptyTitle')}
            </div>
            <p
              style={{
                maxWidth: 360,
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-md)',
                lineHeight: 1.5,
                color: 'var(--steel-400)',
              }}
            >
              {t('contracts.emptyBody')}
            </p>
          </div>
        ) : (
          <ContractList
            contracts={sortedContracts}
            onToggle={toggle}
            onOpenDetail={(c) => setDetailId(c.id)}
            onDelete={setTarget}
            flashingId={flashingId}
          />
        )}
      </div>

      {/* Popup de confirmation de suppression */}
      {target && (
        <ConfirmDialog
          title={t('contracts.delete.title')}
          status={contractCode(target.id)}
          message={t('contracts.delete.message')}
          itemCaption={`${t('contracts.delete.itemCaption')} · ${contractCode(target.id)}`}
          itemLabel={target.title}
          cancelLabel={t('contracts.delete.cancel')}
          confirmLabel={t('contracts.delete.confirm')}
          onCancel={() => setTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Surface de détail (priorité, échéance, sous-tâches) */}
      <ContractDetailConnected
        contractId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}
