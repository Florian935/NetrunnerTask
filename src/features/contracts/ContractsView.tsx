import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, ProgressBar, Toast } from '../../components/ui'
import { useContractsStore } from '../../stores/useContractsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import type { Contract, Difficulty } from '../../db'
import { priorityRank } from '../../game/priority'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { ContractDetail } from './ContractDetail'
import { ContractList } from './ContractList'
import { QuickAddContract } from './QuickAddContract'
import { contractCode } from './contractCode'
import './contracts.css'

interface ToastItem {
  id: string
  kind: 'success' | 'danger'
  title: string
  label: string
}

/**
 * Écran « Contrats » (US-004) : en-tête (compteur actifs/total + progression),
 * barre de création rapide, liste réactive des contrats (terminer / éditer /
 * supprimer), toasts, popup de confirmation de suppression.
 */
export function ContractsView() {
  const { t } = useTranslation()
  const contracts = useContractsStore((s) => s.contracts)
  const load = useContractsStore((s) => s.load)
  const createContract = useContractsStore((s) => s.create)
  const complete = useContractsStore((s) => s.complete)
  const reopen = useContractsStore((s) => s.reopen)
  const rename = useContractsStore((s) => s.rename)
  const setDifficulty = useContractsStore((s) => s.setDifficulty)
  const setPriority = useContractsStore((s) => s.setPriority)
  const setDueDate = useContractsStore((s) => s.setDueDate)
  const addSubtask = useContractsStore((s) => s.addSubtask)
  const toggleSubtask = useContractsStore((s) => s.toggleSubtask)
  const removeSubtask = useContractsStore((s) => s.removeSubtask)
  const remove = useContractsStore((s) => s.remove)
  const loadPlayer = usePlayerStore((s) => s.load)
  const grantReward = usePlayerStore((s) => s.grantReward)

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [target, setTarget] = useState<Contract | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  // Cumul des gains de la session (en mémoire, remis à zéro au rechargement).
  const [sessionGains, setSessionGains] = useState({ xp: 0, credits: 0 })
  // Contrat qui vient d'encaisser sa récompense → flash « hack réussi ».
  const [flashingId, setFlashingId] = useState<string | null>(null)

  useEffect(() => {
    void load()
    void loadPlayer()
  }, [load, loadPlayer])

  const dismiss = (id: string) =>
    setToasts((ts) => ts.filter((item) => item.id !== id))

  const pushToast = (kind: ToastItem['kind'], title: string, label: string) => {
    const id = crypto.randomUUID()
    const clipped = label.length > 42 ? `${label.slice(0, 42)}…` : label
    setToasts((ts) => [...ts, { id, kind, title, label: clipped }].slice(-3))
    window.setTimeout(() => dismiss(id), 2600)
  }

  const handleCreate = async (title: string, difficulty: Difficulty) => {
    await createContract(title, difficulty)
    pushToast('success', t('contracts.toastCreated'), title)
  }

  const toggle = (id: string) => {
    const c = contracts.find((x) => x.id === id)
    if (!c) return
    if (c.status === 'done') {
      void reopen(id)
      return
    }
    void complete(id).then((reward) => {
      // `reward` non nul = première complétion → on verse au joueur, on cumule
      // les gains de session, et on déclenche le retour visuel (toast + flash).
      if (!reward) return
      void grantReward(reward)
      setSessionGains((g) => ({ xp: g.xp + reward.xp, credits: g.credits + reward.credits }))
      pushToast(
        'success',
        t('contracts.toastReward'),
        t('contracts.reward', { xp: reward.xp, credits: reward.credits }),
      )
      setFlashingId(id)
      window.setTimeout(() => setFlashingId((cur) => (cur === id ? null : cur)), 720)
    })
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

  // Contrat affiché dans la modale de détail (live : reflète les maj du store).
  const detailContract = detailId
    ? (contracts.find((c) => c.id === detailId) ?? null)
    : null

  return (
    <div className="nw-grid-bg" style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 840,
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 30px 40px',
        }}
      >
        {/* En-tête : titre + sélecteur de langue + compteur actifs/total */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.22em',
                color: 'var(--cyan-500)',
                marginBottom: 8,
              }}
            >
              {t('contracts.overline')}
            </div>
            <h1
              className="nw-neon-cyan"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                letterSpacing: '0.06em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              {t('contracts.title')}
            </h1>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 12,
              flex: 'none',
              minWidth: 172,
            }}
          >
            <LanguageSwitcher />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, flex: 'none' }}>
              {/* GAINS · SESSION — cumul en mémoire des récompenses encaissées */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xs)',
                    letterSpacing: '0.16em',
                    color: 'var(--steel-400)',
                    marginBottom: 5,
                  }}
                >
                  {t('contracts.sessionGains')}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'flex-end',
                    gap: 6,
                  }}
                >
                  <span
                    className="nw-neon-mint"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xl)',
                      lineHeight: 1,
                    }}
                  >
                    +{sessionGains.xp}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-2xs)',
                      letterSpacing: '0.14em',
                      color: 'var(--mint-500)',
                    }}
                  >
                    XP
                  </span>
                  <span style={{ color: 'var(--steel-600)', margin: '0 3px' }}>·</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xl)',
                      lineHeight: 1,
                      color: 'var(--amber-500)',
                      textShadow: '0 0 8px rgba(255,176,32,.4)',
                    }}
                  >
                    +{sessionGains.credits}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-2xs)',
                      letterSpacing: '0.14em',
                      color: 'var(--amber-500)',
                    }}
                  >
                    ¢
                  </span>
                </div>
              </div>
              <div style={{ width: 1, height: 42, background: 'var(--border)' }} />
              <div style={{ textAlign: 'right', minWidth: 150 }}>
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
                  marginBottom: 9,
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
          </div>
        </div>

        {/* Barre de création rapide */}
        <QuickAddContract onCreate={handleCreate} />

        {/* Liste ou état vide */}
        <div style={{ flex: 1, marginTop: 26 }}>
          {total === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 14,
                padding: '30px 0',
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

        {/* Pile de toasts (bas-droite) */}
        <div
          style={{
            position: 'fixed',
            right: 18,
            bottom: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'flex-end',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {toasts.map((item) => (
            <div key={item.id} className="nw-toast-in" style={{ pointerEvents: 'auto' }}>
              <Toast kind={item.kind} title={item.title} onClose={() => dismiss(item.id)}>
                {item.label}
              </Toast>
            </div>
          ))}
        </div>
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
      {detailContract && (
        <ContractDetail
          contract={detailContract}
          onRename={rename}
          onSetDifficulty={setDifficulty}
          onSetPriority={setPriority}
          onSetDueDate={setDueDate}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onRemoveSubtask={removeSubtask}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}
