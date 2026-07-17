import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  GlassCard,
  ProgressBar,
  QuickAddBar,
  StatChip,
  Tag,
  TextField,
} from './components/ui'
import { useDemoStore } from './stores/useDemoStore'
import { readDemoValue, writeDemoValue } from './db/db'
import './App.css'

const NOTE_KEY = 'demo-note'

/**
 * Page de démonstration jetable (US-001) : prouve que le thème, un panel de
 * composants du design system, la réactivité Zustand et la persistance Dexie
 * fonctionnent. Elle sera remplacée par le vrai HUD à partir d'US-010.
 */
export default function App() {
  const pings = useDemoStore((s) => s.pings)
  const ping = useDemoStore((s) => s.ping)

  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [light, setLight] = useState(false)

  // Relit la note persistée au chargement → prouve la survie après F5.
  useEffect(() => {
    void readDemoValue(NOTE_KEY).then((v) => {
      if (v != null) {
        setSavedNote(v)
        setNote(v)
      }
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', light)
  }, [light])

  const save = async () => {
    await writeDemoValue(NOTE_KEY, note)
    setSavedNote(note)
  }

  return (
    <div className="app">
      <header className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="hud-label">// netrunner tasks</span>
          <h1 className="app__brand">Initialisation système</h1>
        </div>
        <div className="row">
          <Badge tone="success" variant="soft" dot>
            SYS·OK
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLight((v) => !v)}
          >
            Thème : {light ? 'clair' : 'sombre'}
          </Button>
        </div>
      </header>

      <p className="readout" style={{ margin: '12px 0 24px' }}>
        Socle technique US-001 — React + TypeScript + Vite + Tailwind + Zustand
        + Dexie + PWA, design system intégré. Écran de démonstration.
      </p>

      <div className="grid2">
        <GlassCard glow="teal" brackets>
          <h2 className="card-title">État réactif — Zustand</h2>
          <div className="stack">
            <p className="readout">
              Pings envoyés : <b>{pings}</b>
            </p>
            <div className="row">
              <StatChip kind="level" label="Pings" value={pings} />
              <Button variant="primary" onClick={ping}>
                Envoyer un ping
              </Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="violet" brackets>
          <h2 className="card-title">Persistance — Dexie</h2>
          <div className="stack">
            <TextField
              label="Note de démonstration"
              placeholder="Écris quelque chose…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
        </GlassCard>
      </div>

      <GlassCard
        glow="teal"
        rounded
        style={{ marginTop: 16 }}
      >
        <h2 className="card-title">Composants du design system</h2>
        <div className="stack">
          <QuickAddBar showHint onAdd={() => undefined} />
          <ProgressBar variant="xp" label="XP" value={64} max={100} />
          <ProgressBar variant="rep" label="Réputation" value={30} max={100} />
          <div className="row">
            <Badge tone="accent">Accent</Badge>
            <Badge tone="warning" variant="outline">
              Warning
            </Badge>
            <Badge tone="danger" variant="soft" dot>
              Urgent
            </Badge>
            <Tag>boulot</Tag>
            <Tag color="var(--nt-violet-500)">sport</Tag>
          </div>
          <div className="row">
            <Checkbox label="Contrat trivial terminé" defaultChecked />
            <Checkbox label="Contrat en attente" />
          </div>
        </div>
      </GlassCard>

      <p className="hud-label" style={{ marginTop: 32 }}>
        // fin de la démonstration · US-001
      </p>
    </div>
  )
}
