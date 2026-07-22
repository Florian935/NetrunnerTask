import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon, ProgressBar, ProgressRing } from '../../components/ui'
import {
  ACCELERATOR_BY_ID,
  ACCELERATORS,
  acceleratorMultiplier,
  acceleratorResource,
  canStart,
  type AcceleratorDef,
} from '../../game/accelerators'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { formatCountdown } from './format'

// Identité RESSOURCE (indépendante du chrome, qui reste cyan) : cycles se lit
// cyan, data se lit magenta. Signifie « quoi est boosté » sans détourner le
// chrome du système accélérateurs.
type ResourceId = 'cycles' | 'data'
const RES: Record<ResourceId, { color: string; rgb: string; glow: string; icon: string }> = {
  cycles: { color: 'var(--cyan-400)', rgb: '0,240,255', glow: 'var(--text-glow-cyan)', icon: 'zap' },
  data: { color: 'var(--magenta-400)', rgb: '255,45,149', glow: 'var(--text-glow-magenta)', icon: 'database' },
}

// Une session « longue » déclenche l'expérience vivante (anneau scan + phases +
// aperçu de récompense). Heuristique sur la durée → non couplée à un `id`.
const LONG_SESSION_MS = 40 * 60 * 1000
const PHASE_KEYS = ['priming', 'indexing', 'correlation', 'synthesis', 'extraction'] as const

const mono = (x: CSSProperties = {}): CSSProperties => ({ fontFamily: 'var(--font-mono)', ...x })
const disp = (x: CSSProperties = {}): CSSProperties => ({ fontFamily: 'var(--font-display)', ...x })

/** Minutes annoncées d'une durée en ms (affichage). */
const toMin = (ms: number) => Math.round(ms / 60_000)

/** Horloge locale à la seconde, seulement pendant qu'une session/un boost est actif. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])
  return now
}

function PanelTitle({ sub, subColor }: { sub: string; subColor?: string }) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 13,
        gap: 8,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          ...disp({ fontWeight: 700 }),
          fontSize: 13,
          letterSpacing: '.18em',
          color: 'var(--cyan-400)',
          textShadow: '0 0 10px rgba(0,240,255,.4)',
        }}
      >
        <Icon name="gauge-circle" size={15} /> {t('builder.accelerators.heading')}
      </span>
      <span
        style={{
          ...mono(),
          fontSize: 9,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: subColor || 'var(--text-muted)',
        }}
      >
        {sub}
      </span>
    </div>
  )
}

/** Coque de panneau — chrome DS `<Card hud brackets halo="cyan">` (accent réservé). */
function PanelShell({
  children,
  sub,
  subColor,
  boost = false,
}: {
  children: ReactNode
  sub: string
  subColor?: string
  boost?: boolean
}) {
  return (
    <Card hud brackets halo="cyan" padding="16px" className={boost ? 'nw-acc-boost-glow' : undefined}>
      <PanelTitle sub={sub} subColor={subColor} />
      {children}
    </Card>
  )
}

/** Puce « ressource ciblée » (cycles=cyan / data=magenta). */
function ResChip({ res, big = false }: { res: ResourceId; big?: boolean }) {
  const { t } = useTranslation()
  const m = RES[res]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: big ? '4px 9px' : '3px 7px',
        border: `1px solid rgba(${m.rgb},.55)`,
        background: `rgba(${m.rgb},.12)`,
        clipPath: 'var(--clip-bevel-sm)',
        color: m.color,
        ...mono(),
        fontSize: big ? 10.5 : 9.5,
        letterSpacing: '.14em',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name={m.icon} size={big ? 13 : 11} /> {t(`builder.accelerators.resource.${res}`)}
    </span>
  )
}

function Metric({ icon, val, cap, color }: { icon: string; val: string; cap: string; color?: string }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '8px 4px',
        textAlign: 'center',
        background: 'var(--void-900)',
        border: '1px solid var(--border)',
        clipPath: 'var(--clip-bevel-sm)',
      }}
    >
      <span style={{ color: color || 'var(--cyan-400)', display: 'inline-flex' }}>
        <Icon name={icon} size={13} />
      </span>
      <div style={{ ...mono(), fontSize: 11.5, color: 'var(--frost-100)', marginTop: 3, letterSpacing: '.03em' }}>
        {val}
      </div>
      <div
        style={{
          ...mono(),
          fontSize: 8,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: 2,
        }}
      >
        {cap}
      </div>
    </div>
  )
}

// ── ÉTAT 1 · REPOS — le choix entre les protocoles ─────────────────────────
function OptionCard({ def, locked, onStart }: { def: AcceleratorDef; locked: boolean; onStart: () => void }) {
  const { t } = useTranslation()
  const res = acceleratorResource(def)
  const mult = acceleratorMultiplier(def)
  const m = RES[res]
  const resLabel = t(`builder.accelerators.resource.${res}`)
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--void-900)',
        border: '1px solid var(--border)',
        borderTop: `2px solid ${locked ? 'var(--border-strong)' : m.color}`,
        clipPath: 'var(--clip-bevel-sm)',
        padding: 12,
        opacity: locked ? 0.5 : 1,
        filter: locked ? 'grayscale(.4)' : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <span
          style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: locked ? 'var(--text-muted)' : m.color,
            background: `rgba(${m.rgb},.10)`,
            border: `1px solid rgba(${m.rgb},.4)`,
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          <Icon name={def.icon} size={20} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span
              style={{
                ...disp({ fontWeight: 600 }),
                fontSize: 13.5,
                color: 'var(--frost-100)',
                letterSpacing: '.03em',
                lineHeight: 1.1,
              }}
            >
              {t(`builder.accelerators.catalog.${def.id}.name`)}
            </span>
            <ResChip res={res} />
          </div>
          <div
            style={{
              ...mono(),
              fontSize: 8.5,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginTop: 3,
            }}
          >
            {t(`builder.accelerators.catalog.${def.id}.tag`)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            {t(`builder.accelerators.catalog.${def.id}.principle`)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
        <Metric icon="clock" val={`${toMin(def.durationMs)} min`} cap={t('builder.accelerators.capSession')} />
        <Metric icon={m.icon} val={`×${mult} ${resLabel}`} cap={t('builder.accelerators.capEffect')} color={m.color} />
        <Metric icon="hourglass" val={`${toMin(def.boostDurationMs)} min`} cap={t('builder.accelerators.capBoost')} />
      </div>
      <Button
        variant="secondary"
        hud
        disabled={locked}
        onClick={onStart}
        leftIcon={<Icon name={locked ? 'lock' : 'play'} size={13} />}
        style={{ width: '100%', marginTop: 11 }}
      >
        {locked ? t('builder.accelerators.locked') : t('builder.accelerators.start')}
      </Button>
      {locked && (
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            ...mono(),
            fontSize: 8,
            letterSpacing: '.16em',
            color: 'var(--amber-400)',
            border: '1px solid rgba(255,176,32,.4)',
            background: 'rgba(255,176,32,.08)',
            padding: '2px 6px',
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          {t('builder.accelerators.lockedBadge')}
        </span>
      )}
    </div>
  )
}

function ReposView({ locked, onStart }: { locked: boolean; onStart: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <PanelShell
      sub={locked ? t('builder.accelerators.subLocked') : t('builder.accelerators.subChoose')}
      subColor={locked ? 'var(--amber-400)' : undefined}
    >
      {locked && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            marginBottom: 12,
            padding: '8px 11px',
            border: '1px solid rgba(255,176,32,.35)',
            background: 'rgba(255,176,32,.07)',
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          <span style={{ color: 'var(--amber-400)', display: 'inline-flex' }}>
            <Icon name="shield-alert" size={15} />
          </span>
          <span style={{ ...mono(), fontSize: 10, letterSpacing: '.06em', color: 'var(--steel-200)', lineHeight: 1.4 }}>
            {t('builder.accelerators.antiStack')}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {ACCELERATORS.map((def) => (
          <OptionCard key={def.id} def={def} locked={locked} onStart={() => onStart(def.id)} />
        ))}
      </div>
      <div
        style={{
          ...mono(),
          fontSize: 9,
          letterSpacing: '.1em',
          color: 'var(--text-muted)',
          marginTop: 11,
          textAlign: 'center',
        }}
      >
        {t('builder.accelerators.chooseHint')}
      </div>
    </PanelShell>
  )
}

// ── ÉTAT 2 · EN COURS ──────────────────────────────────────────────────────
/** Flux de données cosmétique (magenta) — sous la session longue data. */
function DataFlux() {
  const cols = [8, 26, 50, 74, 92]
  return (
    <span aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {cols.map((left, i) => (
        <span
          key={i}
          className="nw-acc-flux"
          style={{
            position: 'absolute',
            left: `${left}%`,
            bottom: 6,
            width: 2,
            height: 14,
            background: 'linear-gradient(var(--magenta-400), transparent)',
            opacity: 0,
            borderRadius: 2,
            animationDelay: `${i * 0.32}s`,
            animationDuration: `${2.2 + (i % 3) * 0.5}s`,
          }}
        />
      ))}
    </span>
  )
}

/** Bande de phases-jalons (session longue) — matérialise l'avancement (cosmétique). */
function DeepPhases({ pct }: { pct: number }) {
  const { t } = useTranslation()
  const count = PHASE_KEYS.length
  const cur = Math.min(count - 1, Math.floor((pct / 100) * count))
  const inPhase = ((pct / 100) * count - cur) * 100 // % dans la phase courante
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ ...disp({ fontWeight: 600 }), fontSize: 11.5, letterSpacing: '.08em', color: 'var(--cyan-400)' }}>
          {t('builder.accelerators.phaseLabel', {
            n: cur + 1,
            total: count,
            name: t(`builder.accelerators.phases.${PHASE_KEYS[cur]}.name`),
          })}
        </span>
        <span style={{ ...mono(), fontSize: 8.5, letterSpacing: '.1em', color: 'var(--text-muted)' }}>
          {t(`builder.accelerators.phases.${PHASE_KEYS[cur]}.sub`)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {PHASE_KEYS.map((key, i) => (
          <div key={key} style={{ flex: 1 }}>
            <div
              style={{
                position: 'relative',
                height: 7,
                background: 'var(--void-900)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                clipPath: 'var(--clip-bevel-sm)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: i < cur ? '100%' : i === cur ? `${Math.max(6, inPhase)}%` : '0%',
                  background:
                    i < cur
                      ? 'var(--cyan-500)'
                      : i === cur
                        ? 'linear-gradient(90deg,var(--cyan-500),rgba(0,240,255,.35))'
                        : 'transparent',
                  boxShadow: i <= cur ? '0 0 8px var(--cyan-500)' : 'none',
                }}
              />
            </div>
            <div
              style={{
                ...mono(),
                fontSize: 6.8,
                letterSpacing: '.04em',
                textAlign: 'center',
                marginTop: 3,
                color: i === cur ? 'var(--cyan-400)' : i < cur ? 'var(--steel-400)' : 'var(--text-muted)',
              }}
            >
              {t(`builder.accelerators.phases.${key}.short`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Aperçu de la récompense qui « se charge » (cosmétique — la récompense reste tout-ou-rien). */
function RewardPreview({ res, mult, pct }: { res: ResourceId; mult: number; pct: number }) {
  const { t } = useTranslation()
  const m = RES[res]
  const resLabel = t(`builder.accelerators.resource.${res}`)
  return (
    <div
      style={{
        marginTop: 12,
        padding: '10px 11px',
        border: `1px solid rgba(${m.rgb},.4)`,
        background: `linear-gradient(120deg, rgba(${m.rgb},.10), transparent)`,
        clipPath: 'var(--clip-bevel-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            ...disp({ fontWeight: 600 }),
            fontSize: 11,
            letterSpacing: '.1em',
            color: m.color,
            textShadow: m.glow,
          }}
        >
          <Icon name="gift" size={13} /> {t('builder.accelerators.rewardTitle', { res: resLabel, mult })}
        </span>
        <span style={{ ...mono(), fontSize: 9.5, letterSpacing: '.06em', color: m.color }}>
          {t('builder.accelerators.rewardReady', { pct })}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 8,
          marginTop: 7,
          background: 'var(--void-900)',
          border: `1px solid rgba(${m.rgb},.3)`,
          overflow: 'hidden',
          clipPath: 'var(--clip-bevel-sm)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            right: `${100 - pct}%`,
            background: 'linear-gradient(90deg, rgba(255,45,149,.5), var(--magenta-500))',
            boxShadow: '0 0 10px var(--magenta-500)',
          }}
        >
          <span
            className="nw-acc-shimmer"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)',
              backgroundSize: '60% 100%',
            }}
          />
        </div>
      </div>
      <div style={{ ...mono(), fontSize: 8.5, letterSpacing: '.06em', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
        {t('builder.accelerators.rewardBuildup')}
      </div>
    </div>
  )
}

function RunningView({
  def,
  endsAt,
  now,
  onAbort,
}: {
  def: AcceleratorDef
  endsAt: number
  now: number
  onAbort: () => void
}) {
  const { t } = useTranslation()
  const res = acceleratorResource(def)
  const mult = acceleratorMultiplier(def)
  const m = RES[res]
  const remaining = Math.max(0, endsAt - now)
  const pct = Math.round(Math.max(0, Math.min(100, ((def.durationMs - remaining) / def.durationMs) * 100)))
  const long = def.durationMs >= LONG_SESSION_MS

  return (
    <PanelShell sub={t('builder.accelerators.subRunning')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: long ? 12 : 4 }}>
        <span
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-400)',
            background: 'rgba(0,240,255,.1)',
            border: '1px solid rgba(0,240,255,.4)',
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          <Icon name={def.icon} size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...disp({ fontWeight: 600 }),
              fontSize: 13,
              color: 'var(--frost-100)',
              letterSpacing: '.03em',
              lineHeight: 1.05,
            }}
          >
            {t(`builder.accelerators.catalog.${def.id}.name`)}
          </div>
          <div
            style={{
              ...mono(),
              fontSize: 8.5,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {t(long ? 'builder.accelerators.protocolLong' : 'builder.accelerators.protocolShort', {
              min: toMin(def.durationMs),
            })}
          </div>
        </div>
        <ResChip res={res} big />
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: long ? '4px 0 2px' : '10px 0 4px' }}>
        {long && <DataFlux />}
        <ProgressRing size={long ? 148 : 124} stroke={long ? 7 : 6} pct={pct} scan={long}>
          <span style={{ color: 'var(--cyan-400)', display: 'inline-flex', marginBottom: 2 }}>
            <Icon name={long ? 'scan-search' : 'brain'} size={16} />
          </span>
          <span
            style={{
              ...disp({ fontWeight: 700 }),
              fontSize: long ? 30 : 27,
              lineHeight: 1,
              color: 'var(--frost-100)',
              letterSpacing: '.03em',
              fontVariantNumeric: 'tabular-nums',
              textShadow: 'var(--text-glow-cyan)',
            }}
          >
            {formatCountdown(remaining)}
          </span>
          <span style={{ ...mono(), fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--cyan-400)', marginTop: 3 }}>
            {t('builder.accelerators.pctRemaining', { pct })}
          </span>
        </ProgressRing>
      </div>

      {long ? (
        <>
          <DeepPhases pct={pct} />
          <RewardPreview res={res} mult={mult} pct={pct} />
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            marginTop: 8,
            padding: '9px 11px',
            border: '1px solid rgba(0,240,255,.3)',
            background: 'rgba(0,240,255,.05)',
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          <span style={{ color: m.color, display: 'inline-flex' }}>
            <Icon name={m.icon} size={14} />
          </span>
          <span style={{ ...mono(), fontSize: 10, letterSpacing: '.06em', color: 'var(--steel-200)' }}>
            {t('builder.accelerators.rewardAtEnd', {
              res: t(`builder.accelerators.resource.${res}`),
              mult,
            })}
          </span>
        </div>
      )}

      <Button
        variant="ghost"
        hud
        onClick={onAbort}
        leftIcon={<Icon name="x" size={13} />}
        style={{ width: '100%', marginTop: 12 }}
      >
        {t('builder.accelerators.abort')}
      </Button>
    </PanelShell>
  )
}

// ── ÉTAT 3 · SURCADENCE active ─────────────────────────────────────────────
function BoostView({ def, endsAt, now }: { def: AcceleratorDef; endsAt: number; now: number }) {
  const { t } = useTranslation()
  const res = acceleratorResource(def)
  const mult = acceleratorMultiplier(def)
  const m = RES[res]
  const remaining = Math.max(0, endsAt - now)
  const pct = Math.max(0, Math.min(100, (remaining / def.boostDurationMs) * 100))
  const resLabel = t(`builder.accelerators.resource.${res}`)
  return (
    <PanelShell boost sub={t('builder.accelerators.boostActive')} subColor={m.color}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span
          className="nw-acc-pulse"
          style={{
            flexShrink: 0,
            width: 52,
            height: 52,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: m.color,
            background: `rgba(${m.rgb},.15)`,
            border: `1px solid ${m.color}`,
            clipPath: 'var(--clip-bevel-sm)',
            boxShadow: `0 0 16px -2px rgba(${m.rgb},.8)`,
          }}
        >
          <Icon name={m.icon} size={24} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...mono(), fontSize: 8.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--cyan-400)' }}>
            {t('builder.accelerators.boostActive')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 1 }}>
            <span style={{ ...disp({ fontWeight: 700 }), fontSize: 38, lineHeight: 1, color: m.color, textShadow: m.glow }}>
              ×{mult}
            </span>
            <span style={{ ...disp({ fontWeight: 700 }), fontSize: 20, lineHeight: 1, color: 'var(--frost-100)', letterSpacing: '.06em' }}>
              {resLabel}
            </span>
          </div>
          <div style={{ ...mono(), fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
            {t(`builder.accelerators.boostVerb.${res}`)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 13, marginBottom: 6 }}>
        <span style={{ ...mono(), fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {t('builder.accelerators.boostRemainingLabel')}
        </span>
        <span style={{ ...mono(), fontSize: 17, color: 'var(--frost-100)', fontVariantNumeric: 'tabular-nums', textShadow: 'var(--text-glow-cyan)' }}>
          {formatCountdown(remaining)}
        </span>
      </div>
      <ProgressBar accent="cyan" value={pct} max={100} height={8} />
      <div style={{ ...mono(), fontSize: 8.5, letterSpacing: '.1em', color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
        {t('builder.accelerators.boostFootnote')}
      </div>
    </PanelShell>
  )
}

/**
 * Panneau « Accélérateurs réels » (US-023 + US-030, catalogue à plusieurs
 * protocoles). 3 états : repos (choix entre protocoles + indisponible si une
 * session/boost tourne), en cours (session longue vivante ou courte sobre),
 * SURCADENCE (ressource boostée lisible). Chrome cyan réservé (DS
 * `<Card hud brackets halo="cyan">`) ; la ressource boostée se lit à sa couleur
 * (cycles cyan / data magenta). Toute la logique vit dans `useBuilderStore` /
 * `game/accelerators.ts` — ce composant affiche et déclenche les actions.
 * Maquette `network-accelerators-v2` (validée PO le 22/07/2026).
 */
export function AcceleratorPanel() {
  const { t } = useTranslation()
  const run = useBuilderStore((s) => s.acceleratorRun)
  const boost = useBuilderStore((s) => s.acceleratorBoost)
  const startAccelerator = useBuilderStore((s) => s.startAccelerator)
  const cancelAccelerator = useBuilderStore((s) => s.cancelAccelerator)
  const pushToast = useFeedbackStore((s) => s.pushToast)

  const now = useNow(run !== null || boost !== null)

  const handleAbort = () => {
    cancelAccelerator()
    pushToast(
      'info',
      t('builder.accelerators.toastInterruptTitle'),
      t('builder.accelerators.toastInterruptBody'),
    )
  }

  const boostDef = boost ? ACCELERATOR_BY_ID[boost.id] : undefined
  const runDef = run ? ACCELERATOR_BY_ID[run.id] : undefined

  let view: ReactNode
  if (boost && boostDef) {
    view = <BoostView def={boostDef} endsAt={boost.endsAt} now={now} />
  } else if (run && runDef) {
    view = <RunningView def={runDef} endsAt={run.endsAt} now={now} onAbort={handleAbort} />
  } else {
    // Repos. `locked` ne survient en pratique que sur un état corrompu (run/boost
    // dont l'`id` a disparu du catalogue) : on montre alors le repos indisponible
    // plutôt que de proposer un lancement — l'anti-empilement normal passe par
    // l'affichage des vues en cours/SURCADENCE ci-dessus.
    const locked = !canStart({ acceleratorRun: run, acceleratorBoost: boost }, ACCELERATORS[0].id)
    view = <ReposView locked={locked} onStart={startAccelerator} />
  }

  return <div className="builder__acc-wrap">{view}</div>
}
