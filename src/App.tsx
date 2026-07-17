import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  HudPanel,
  Input,
  ProgressBar,
  StatCard,
  Tag,
} from './components/ui'
import { useDemoStore } from './stores/useDemoStore'
import { readDemoValue, writeDemoValue } from './db/db'
import './App.css'

const NOTE_KEY = 'demo-note'

/**
 * Page de démonstration jetable (US-001) : prouve que le thème NIGHTWIRE, un
 * panel de composants du design system, la réactivité Zustand et la persistance
 * Dexie fonctionnent. Elle sera remplacée par le vrai HUD à partir d'US-010.
 */
export default function App() {
  const pings = useDemoStore((s) => s.pings)
  const ping = useDemoStore((s) => s.ping)

  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [done, setDone] = useState({ trivial: true, pending: false })

  // Relit la note persistée au chargement → prouve la survie après F5.
  useEffect(() => {
    void readDemoValue(NOTE_KEY).then((v) => {
      if (v != null) {
        setSavedNote(v)
        setNote(v)
      }
    })
  }, [])

  const save = async () => {
    await writeDemoValue(NOTE_KEY, note)
    setSavedNote(note)
  }

  return (
    <div className="nw-grid-bg" style={{ minHeight: '100vh' }}>
      <div className="app">
        <header className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <span className="hud-label">// netrunner tasks</span>
            <h1 className="app__brand">Initialisation système</h1>
          </div>
          <Badge tone="mint" glow>
            SYS·OK
          </Badge>
        </header>

        <p className="readout" style={{ margin: '12px 0 24px' }}>
          Socle technique US-001 — React + TypeScript + Vite + Tailwind + Zustand +
          Dexie + PWA, design system NIGHTWIRE intégré. Écran de démonstration.
        </p>

        <div className="grid2">
          <HudPanel title="État réactif — Zustand" status="ZUSTAND" accent="cyan">
            <div className="stack">
              <StatCard label="Pings" value={pings} icon="activity" accent="cyan" />
              <Button variant="primary" onClick={ping}>
                Envoyer un ping
              </Button>
            </div>
          </HudPanel>

          <HudPanel title="Persistance — Dexie" status="DEXIE" accent="violet">
            <div className="stack">
              <div className="stack" style={{ gap: 6 }}>
                <span className="hud-label">Note de démonstration</span>
                <Input
                  placeholder="Écris quelque chose…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  icon="save"
                />
              </div>
              <div className="row">
                <Button variant="primary" onClick={() => void save()}>
                  Sauvegarder
                </Button>
                <span className="readout">
                  Persistée : <b>{savedNote ?? '—'}</b>
                </span>
              </div>
              <p className="readout hud-label">
                Recharge la page (F5) : la note persiste → Dexie OK
              </p>
            </div>
          </HudPanel>
        </div>

        <HudPanel
          title="Composants du design system"
          status="NIGHTWIRE V3"
          accent="mint"
          style={{ marginTop: 16 }}
        >
          <div className="stack">
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <Input
                placeholder="Nouveau contrat…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                icon="plus"
                style={{ flex: 1 }}
              />
              <Button variant="primary" onClick={() => setDraft('')}>
                Ajouter
              </Button>
            </div>
            <ProgressBar accent="cyan" label="XP" value={64} showValue />
            <ProgressBar accent="violet" label="Réputation" value={30} showValue />
            <div className="row">
              <Badge tone="cyan">Accent</Badge>
              <Badge tone="amber">Warning</Badge>
              <Badge tone="red" glow>
                Urgent
              </Badge>
              <Tag tone="cyan" icon="briefcase">
                boulot
              </Tag>
              <Tag tone="violet" icon="dumbbell">
                sport
              </Tag>
            </div>
            <div className="row">
              <Checkbox
                label="Contrat trivial terminé"
                checked={done.trivial}
                onChange={(v) => setDone((d) => ({ ...d, trivial: v }))}
              />
              <Checkbox
                label="Contrat en attente"
                checked={done.pending}
                onChange={(v) => setDone((d) => ({ ...d, pending: v }))}
              />
            </div>
          </div>
        </HudPanel>

        <p className="hud-label" style={{ marginTop: 32 }}>
          // fin de la démonstration · US-001
        </p>
      </div>
    </div>
  )
}
