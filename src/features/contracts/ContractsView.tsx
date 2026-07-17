import { useState } from 'react'
import { Icon, Toast } from '../../components/ui'
import { contractsRepo } from '../../db'
import { QuickAddContract } from './QuickAddContract'
import './contracts.css'

interface ToastItem {
  id: string
  label: string
}

/**
 * Écran « Contrats » (version minimale, US-003) : en-tête + compteur de session,
 * barre de création rapide, état vide / buffer, pile de toasts de confirmation.
 * L'app-shell (rail de nav, barre de statut) et la liste des contrats viendront
 * en US-010 / US-004 — cet écran est pensé pour les accueillir.
 */
export function ContractsView() {
  const [count, setCount] = useState(0)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = (id: string) =>
    setToasts((ts) => ts.filter((t) => t.id !== id))

  const handleCreate = async (title: string) => {
    await contractsRepo.create({ title })
    setCount((c) => c + 1)
    const id = crypto.randomUUID()
    const label = title.length > 42 ? `${title.slice(0, 42)}…` : title
    setToasts((ts) => [...ts, { id, label }].slice(-3))
    window.setTimeout(() => dismiss(id), 2600)
  }

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
        {/* En-tête + compteur de session */}
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
              NIGHTWIRE // OPS
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
              CONTRATS
            </h1>
          </div>
          <div style={{ textAlign: 'right', flex: 'none' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.16em',
                color: 'var(--steel-400)',
                marginBottom: 2,
              }}
            >
              CRÉÉS · SESSION
            </div>
            <div
              key={count}
              className="nw-count"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xl)',
                lineHeight: 1,
                color: 'var(--mint-500)',
                textShadow: 'var(--text-glow-mint)',
              }}
            >
              {String(count).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Barre de création rapide */}
        <QuickAddContract onCreate={handleCreate} />

        {/* État vide / buffer */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 14,
            padding: '20px 0',
            marginTop: 26,
          }}
        >
          {count === 0 ? (
            <>
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
                AUCUN CONTRAT ACTIF
              </div>
              <p
                style={{
                  maxWidth: 380,
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-md)',
                  lineHeight: 1.5,
                  color: 'var(--steel-400)',
                }}
              >
                Le réseau est calme, runner. Ton premier contrat commence par une
                ligne — saisis-le ci-dessus et jacke-toi dedans.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(46,255,194,.35)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 0 22px -8px var(--mint-500)',
                }}
              >
                <Icon name="database" size={30} color="var(--mint-500)" />
              </div>
              <div
                className="nw-neon-mint"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                }}
              >
                {count} CONTRAT{count > 1 ? 'S' : ''} EN BUFFER
              </div>
              <p
                style={{
                  maxWidth: 400,
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-md)',
                  lineHeight: 1.5,
                  color: 'var(--steel-400)',
                }}
              >
                Signal reçu — tes contrats sont chargés dans le grid. Le tableau
                des missions arrive dans un prochain module. Continue à empiler,
                ou jacke-toi dedans.
              </p>
            </>
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
          {toasts.map((t) => (
            <div key={t.id} className="nw-toast-in" style={{ pointerEvents: 'auto' }}>
              <Toast kind="success" title="CONTRAT CRÉÉ" onClose={() => dismiss(t.id)}>
                {t.label}
              </Toast>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
