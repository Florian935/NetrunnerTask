import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { COR_COLOR, COR_COLOR_HOVER, COR_RGB, corGlow, prefersReducedMotion } from './corruptionStyle'
import { GlitchText } from './GlitchText'
import { Interference } from './Interference'
import './corruption.css'

const MINT = 'var(--mint-500)'
const MINT_RGB = '46, 255, 194'

/**
 * Contrôle Purger / Ré-embrasser (US-036) — n'apparaît qu'une fois la corruption
 * embrassée au moins une fois (`embraced`/`purged`). Affiche l'état courant du
 * Réseau (CORROMPU / PURGÉ) et l'action pour basculer. Purger restaure le look
 * propre (le titre glitch reste possédé, P8) ; ré-embrasser réactive le thème.
 * Sur `<Card hud brackets>`. Placé dans la Garde-robe (hub cosmétique / thèmes).
 */
export function CorruptionControl() {
  const { t } = useTranslation()
  const corruption = useCosmeticsStore((s) => s.corruption)
  const purge = useCosmeticsStore((s) => s.purgeCorruption)
  const reembrace = useCosmeticsStore((s) => s.embraceCorruption)
  const [hover, setHover] = useState(false)

  // Visible seulement après un premier embrassement.
  if (corruption !== 'embraced' && corruption !== 'purged') return null

  const cor = corruption === 'embraced'
  const color = cor ? COR_COLOR : MINT
  const rgb = cor ? COR_RGB : MINT_RGB
  const live = cor && !prefersReducedMotion()

  return (
    <Card
      hud
      brackets
      className={live ? 'nw-cor-anim' : undefined}
      padding="var(--space-5)"
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid rgba(${rgb}, 0.5)`,
        background: `linear-gradient(160deg, rgba(${rgb}, 0.08), transparent 55%), var(--bg-panel)`,
        boxShadow: live ? undefined : `0 0 24px -10px rgba(${rgb}, 0.9)`,
        animation: live ? 'nw-cor-pulse 3s ease-in-out infinite' : 'none',
      }}
    >
      {cor && <Interference level={0.22} animated blocks={false} />}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.22em', color: 'var(--text-muted)' }}>
          <Icon name="git-branch" size={14} /> {t('corruption.control.title')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ width: 60, height: 60, flexShrink: 0, display: 'grid', placeItems: 'center', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${rgb}, 0.7)`, background: `rgba(${rgb}, 0.1)`, color, boxShadow: `0 0 20px -4px rgba(${rgb}, 1)` }}>
            <Icon name={cor ? 'skull' : 'shield-check'} size={28} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.24em', color: 'var(--text-muted)', marginBottom: 5 }}>{t('corruption.control.current')}</div>
            {cor ? (
              <GlitchText text={t('corruption.control.corrupted')} size={32} letterSpacing="0.08em" animated={!prefersReducedMotion()} />
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '0.1em', color: MINT, textShadow: 'var(--text-glow-mint, 0 0 14px rgba(46,255,194,.5))', lineHeight: 1 }}>
                {t('corruption.control.purged')}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.5, letterSpacing: '0.03em', color: 'var(--text-secondary)', marginTop: 7, maxWidth: 340 }}>
              {cor ? t('corruption.control.corruptedDesc') : t('corruption.control.purgedDesc')}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={cor ? purge : reembrace}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            height: 46,
            clipPath: 'var(--clip-bevel-sm)',
            border: `1px solid ${cor ? MINT : hover ? COR_COLOR_HOVER : COR_COLOR}`,
            background: cor
              ? hover
                ? 'rgba(46, 255, 194, 0.18)'
                : 'rgba(46, 255, 194, 0.1)'
              : hover
                ? `rgba(${COR_RGB}, 0.2)`
                : `rgba(${COR_RGB}, 0.1)`,
            color: cor ? MINT : COR_COLOR_HOVER,
            boxShadow: cor
              ? hover
                ? 'var(--glow-mint, 0 0 18px -4px rgba(46,255,194,.9))'
                : '0 0 14px -5px rgba(46, 255, 194, 0.9)'
              : hover
                ? corGlow(1.4)
                : corGlow(1),
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-md)',
            letterSpacing: '0.16em',
            transition: 'all var(--dur-fast) var(--ease-out)',
          }}
        >
          <Icon name={cor ? 'shield-x' : 'skull'} size={18} /> {cor ? t('corruption.control.purge') : t('corruption.control.reembrace')}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', color: cor ? 'var(--text-muted)' : 'var(--amber-500)' }}>
          <Icon name={cor ? 'rotate-ccw' : 'triangle-alert'} size={11} /> {cor ? t('corruption.control.purgeHint') : t('corruption.control.reembraceHint')}
        </div>
      </div>
    </Card>
  )
}
