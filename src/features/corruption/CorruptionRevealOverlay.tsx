import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { COR_COLOR, COR_RGB, prefersReducedMotion } from './corruptionStyle'
import { GlitchMark } from './GlitchMark'
import { GlitchText } from './GlitchText'
import { Interference } from './Interference'
import { PactButton } from './PactButton'
import './corruption.css'

type Phase = 'glitch' | 'hail' | 'pact'
type Choice = 'accepted' | 'refused'

const GLYPHS = '▓▒░█#@%$&/\\<>|=+*'
/** Brouille une chaîne (glyphes défilants) pour l'effet « perte de contrôle ». */
function scramble(str: string, t: number): string {
  return str
    .split('')
    .map((ch, i) => (ch === ' ' ? ' ' : GLYPHS[(t + i * 3) % GLYPHS.length]))
    .join('')
}

export interface CorruptionRevealOverlayProps {
  /** Ferme l'overlay (après un choix + « Continuer »). */
  onClose: () => void
}

/**
 * Le REVEAL de la corruption (US-036) — overlay plein cadre qui prend le contrôle
 * du HUD. Séquence `glitch → hail → pacte`, puis l'issue du choix. En
 * `prefers-reduced-motion` : saute direct au pacte, sans animation agressive, tout
 * reste lisible et fonctionnel. Les choix appellent le store
 * (`embraceCorruption`/`refuseCorruption`) ; « Continuer » ferme.
 */
export function CorruptionRevealOverlay({ onClose }: CorruptionRevealOverlayProps) {
  const { t } = useTranslation()
  const [reduced] = useState(prefersReducedMotion)
  const embrace = useCosmeticsStore((s) => s.embraceCorruption)
  const refuse = useCosmeticsStore((s) => s.refuseCorruption)

  const [phase, setPhase] = useState<Phase>(reduced ? 'pact' : 'glitch')
  const [choice, setChoice] = useState<Choice | null>(null)
  const [tick, setTick] = useState(0)
  const timers = useRef<number[]>([])

  // Enchaînement des phases (sauté si reduced-motion).
  useEffect(() => {
    if (reduced) return
    timers.current.push(window.setTimeout(() => setPhase('hail'), 1600))
    timers.current.push(window.setTimeout(() => setPhase('pact'), 3200))
    return () => {
      timers.current.forEach(window.clearTimeout)
      timers.current = []
    }
  }, [reduced])

  // Ticker du brouillage pendant la phase glitch.
  useEffect(() => {
    if (phase !== 'glitch' || reduced) return
    const id = window.setInterval(() => setTick((n) => n + 1), 90)
    return () => window.clearInterval(id)
  }, [phase, reduced])

  function choose(c: Choice) {
    if (c === 'accepted') embrace()
    else refuse()
    setChoice(c)
  }

  const done = choice !== null
  const accepted = choice === 'accepted'
  const accentRgb = choice === 'refused' ? '46, 255, 194' : COR_RGB
  const accent = choice === 'refused' ? 'var(--mint-500)' : COR_COLOR

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', padding: 'var(--space-4)', background: 'color-mix(in srgb, var(--bg-app) 88%, transparent)' }}
    >
      <div
        style={{
          position: 'relative',
          width: 560,
          maxWidth: '100%',
          minHeight: 480,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: 30,
          clipPath: 'var(--clip-notch, var(--clip-bevel-md))',
          border: `1px solid rgba(${accentRgb}, 0.5)`,
          background: 'radial-gradient(circle at 50% 40%, var(--void-700), var(--void-900) 72%)',
        }}
      >
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'var(--grid-lines)', backgroundSize: '30px 30px', opacity: 0.22 }} />
        {!done && <Interference level={phase === 'pact' ? 1 : phase === 'hail' ? 0.7 : 0.5} animated={!reduced} blocks={!reduced} />}
        {done && <Interference level={accepted ? 0.55 : 0.12} animated={!reduced && accepted} blocks={false} />}

        {/* Bandeau d'intrusion */}
        <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 4 }}>
          <span
            className={!reduced && !done ? 'nw-cor-anim' : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.24em',
              color: accent,
              padding: '5px 13px',
              clipPath: 'var(--clip-bevel-sm)',
              border: `1px solid rgba(${accentRgb}, 0.55)`,
              background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)',
              animation: !reduced && !done ? 'nw-cor-flicker 1.6s steps(2) infinite' : 'none',
            }}
          >
            <Icon name={done ? (accepted ? 'skull' : 'shield-check') : 'triangle-alert'} size={13} />
            {done ? (accepted ? t('corruption.intrusion.active') : t('corruption.intrusion.purged')) : t('corruption.intrusion.corrupted')}
          </span>
        </div>

        {/* Issue du choix */}
        {done ? (
          <div className={!reduced ? 'nw-cor-anim' : undefined} style={{ position: 'relative', textAlign: 'center', display: 'grid', placeItems: 'center', gap: 16, maxWidth: 440, animation: !reduced ? 'nw-cor-rise 0.5s var(--ease-out) both' : 'none' }}>
            {accepted ? (
              <GlitchMark size={104} glyph="skull" animated={!reduced} />
            ) : (
              <span style={{ width: 104, height: 104, display: 'grid', placeItems: 'center', clipPath: 'var(--clip-bevel-md)', border: '1px solid var(--mint-500)', background: 'rgba(46, 255, 194, 0.08)', color: 'var(--mint-500)', boxShadow: 'var(--glow-mint, 0 0 24px -6px rgba(46,255,194,.8))' }}>
                <Icon name="shield-check" size={50} />
              </span>
            )}
            {accepted ? (
              <GlitchText text={t('corruption.acceptedTitle')} size={32} letterSpacing="0.08em" animated={!reduced} />
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '0.1em', color: 'var(--mint-500)', textShadow: 'var(--text-glow-mint, 0 0 14px rgba(46,255,194,.5))' }}>
                {t('corruption.refusedTitle')}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.6, letterSpacing: '0.04em', color: 'var(--text-secondary)', maxWidth: 360 }}>
              {accepted ? t('corruption.acceptedBody') : t('corruption.refusedBody')}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ marginTop: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 20px', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${accentRgb}, 0.6)`, background: `rgba(${accentRgb}, 0.1)`, color: accent, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.16em' }}
            >
              <Icon name="check-check" size={14} /> {t('corruption.continue')}
            </button>
          </div>
        ) : phase === 'glitch' ? (
          /* Le glitch s'installe : le HUD se corrompt, le texte se brouille. */
          <div style={{ position: 'relative', textAlign: 'center', display: 'grid', placeItems: 'center', gap: 18 }}>
            <GlitchMark size={108} glyph="triangle-alert" animated={!reduced} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, letterSpacing: '0.12em', color: COR_COLOR, minHeight: 24, textShadow: `0 0 12px rgba(${COR_RGB}, 0.6)` }}>
              {reduced ? t('corruption.glitch.lossOfControl') : scramble(t('corruption.glitch.lossOfControl'), tick)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--steel-400, #6b7a92)', minHeight: 18 }}>
              {reduced ? t('corruption.glitch.injection') : scramble(t('corruption.glitch.injection'), tick + 4)}
            </div>
          </div>
        ) : (
          /* Hail (message menaçant) + pacte (les deux choix). */
          <div className={!reduced ? 'nw-cor-anim' : undefined} style={{ position: 'relative', width: '100%', maxWidth: 520, display: 'grid', placeItems: 'center', gap: 18, animation: !reduced ? 'nw-cor-rise 0.45s var(--ease-out) both' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <GlitchMark size={68} glyph="skull" animated={!reduced} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xs, 8.5px)', letterSpacing: '0.28em', color: 'var(--text-muted)', marginBottom: 4 }}>{t('corruption.source')}</div>
                <GlitchText text={t('corruption.entity')} size={28} letterSpacing="0.12em" animated={!reduced} />
              </div>
            </div>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.06em', color: 'var(--frost-100, #eaf6ff)', textShadow: `0 0 16px rgba(${COR_RGB}, 0.4)`, marginBottom: 12 }}>
                {t('corruption.hailTitle')}
              </div>
              <div style={{ display: 'grid', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.55, letterSpacing: '0.03em', color: 'var(--steel-200, #c7d3e6)', textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
                <div>{t('corruption.hail1')}</div>
                <div>{t('corruption.hail2')}</div>
                <div>{t('corruption.hail3')}</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <GlitchText text={t('corruption.offerTitle')} size={19} letterSpacing="0.1em" color={COR_COLOR} animated={!reduced} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginTop: 6 }}>{t('corruption.offerSub')}</div>
            </div>
            {phase === 'pact' && (
              <div style={{ width: '100%', display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <PactButton variant="embrace" icon="skull" label={t('corruption.embrace')} sub={t('corruption.embraceSub')} onClick={() => choose('accepted')} />
                  <PactButton variant="refuse" icon="shield-x" label={t('corruption.refuse')} sub={t('corruption.refuseSub')} onClick={() => choose('refused')} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--amber-500)' }}>
                  <Icon name="triangle-alert" size={12} /> {t('corruption.irreversible')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
