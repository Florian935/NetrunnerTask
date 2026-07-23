import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { COSMETIC_BY_ID, rarityRank, type Rarity } from '../../game/cosmetics'
import type { CrateDraw, CrateQuality } from '../../game/crates'
import { CosmeticCard } from './CosmeticCard'
import { CrateIcon } from './CrateIcon'
import { CRATE_STYLE } from './crateStyle'
import { RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'

type Phase = 'anticipation' | 'reveal' | 'result'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/** Rayons de révélation derrière le résultat (intensité ~ rareté). */
function Rays({ rarity, spin }: { rarity: Rarity; spin: boolean }) {
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <span
      aria-hidden
      className={spin ? 'nw-crate-rays' : undefined}
      style={{
        position: 'absolute',
        inset: '-30%',
        pointerEvents: 'none',
        background: `repeating-conic-gradient(from 0deg, rgba(${rgb}, ${0.16 + glow * 0.14}) 0deg, transparent 7deg 22deg)`,
        maskImage: 'radial-gradient(circle, #000 20%, transparent 68%)',
        WebkitMaskImage: 'radial-gradient(circle, #000 20%, transparent 68%)',
      }}
    />
  )
}

export interface CrateOpeningModalProps {
  quality: CrateQuality
  /** Tirage déjà résolu par le store (`openCrate`). */
  draw: CrateDraw
  /** Équipe le cosmétique tiré puis ferme. */
  onEquip: (id: string) => void
  /** Ferme le rituel. */
  onClose: () => void
}

/**
 * Rituel d'ouverture (US-034) — overlay plein cadre. Séquence anticipation →
 * révélation → résultat ; halo/rayons intensifiés aux hautes raretés. En
 * `prefers-reduced-motion`, bascule directement sur le résultat (C5). Réutilise
 * `CosmeticCard` + `RarityBadge`. Cas « collection complète » : consolation
 * crédits (décision #3).
 */
export function CrateOpeningModal({ quality, draw, onEquip, onClose }: CrateOpeningModalProps) {
  const { t } = useTranslation()
  const [reduced] = useState(prefersReducedMotion)
  const [phase, setPhase] = useState<Phase>(reduced ? 'result' : 'anticipation')
  const s = CRATE_STYLE[quality]

  useEffect(() => {
    if (reduced) return
    const t1 = window.setTimeout(() => setPhase('reveal'), 1500)
    const t2 = window.setTimeout(() => setPhase('result'), 2500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [reduced])

  const cosmetic = draw.kind === 'cosmetic' ? COSMETIC_BY_ID[draw.id] : undefined
  const rarity = cosmetic?.rarity
  const high = rarity !== undefined && rarityRank(rarity) >= 4
  const revealing = phase === 'reveal'
  const showResult = phase === 'result'
  const frameColor = showResult && rarity ? rarityColor(rarity) : s.color
  const frameRgb = showResult && rarity ? rarityRgb(rarity) : s.rgb

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={showResult ? onClose : undefined}
      style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 'var(--space-4)', background: 'color-mix(in srgb, var(--bg-app) 82%, transparent)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 460,
          maxWidth: '100%',
          height: 440,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          clipPath: 'var(--clip-notch, var(--clip-bevel-md))',
          border: `1px solid rgba(${frameRgb}, 0.5)`,
          background: 'radial-gradient(circle at 50% 42%, var(--void-600), var(--void-900) 70%)',
        }}
      >
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'var(--grid-lines)', backgroundSize: '28px 28px', opacity: 0.28 }} />
        <span className="nw-scanlines" aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        {/* halo de fond teinté */}
        <span aria-hidden style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, rgba(${frameRgb}, ${revealing ? 0.3 : 0.16}), transparent 65%)`, filter: 'blur(6px)' }} />
        {(revealing || (showResult && high)) && rarity && <Rays rarity={rarity} spin={revealing} />}

        {/* Bandeau de phase */}
        <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.24em', color: frameColor, padding: '5px 12px', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${frameRgb}, 0.5)`, background: 'color-mix(in srgb, var(--bg-app) 55%, transparent)' }}>
            <span className={!reduced && !showResult ? 'nw-blink' : undefined} style={{ display: 'inline-flex' }}>
              <Icon name={showResult ? 'sparkles' : revealing ? 'unlock' : reduced ? 'zap' : 'orbit'} size={13} />
            </span>
            {reduced
              ? t('cosmetics.crates.ritual.instant')
              : phase === 'anticipation'
                ? t('cosmetics.crates.ritual.anticipation', { quality: t(`cosmetics.crates.quality.${quality}.label`) })
                : revealing
                  ? t('cosmetics.crates.ritual.reveal')
                  : t('cosmetics.crates.ritual.result')}
          </span>
        </div>

        {/* Anticipation : le coffre charge */}
        {phase === 'anticipation' && (
          <div style={{ position: 'relative', display: 'grid', placeItems: 'center', gap: 20 }}>
            <CrateIcon quality={quality} size={118} charging={!reduced} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '0.2em', color: s.color, textShadow: `0 0 14px rgba(${s.rgb}, ${s.glow * 0.6})` }}>
                {t('cosmetics.crates.ritual.opening')}
              </div>
            </div>
          </div>
        )}

        {/* Révélation / résultat */}
        {(revealing || showResult) &&
          (draw.kind === 'credits' ? (
            <div className={!reduced ? 'nw-reveal' : undefined} style={{ position: 'relative', width: 300, maxWidth: '80%' }}>
              <div style={{ position: 'relative', clipPath: 'var(--clip-bevel-md)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', padding: '20px 18px', textAlign: 'center' }}>
                <span style={{ display: 'inline-grid', placeItems: 'center', width: 44, height: 44, clipPath: 'var(--clip-bevel-sm)', border: '1px solid var(--amber-400)', background: 'rgba(255,176,32,.1)', color: 'var(--amber-500)', marginBottom: 12 }}>
                  <Icon name="coins" size={22} />
                </span>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.16em', color: 'var(--text-secondary)' }}>
                  {t('cosmetics.crates.ritual.complete.title')}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', lineHeight: 1.5, letterSpacing: '0.04em', color: 'var(--text-muted)', margin: '7px auto 0', maxWidth: 220 }}>
                  {t('cosmetics.crates.ritual.complete.desc')}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginTop: 14, padding: '7px 16px', clipPath: 'var(--clip-bevel-sm)', border: '1px solid var(--amber-400)', background: 'rgba(255,176,32,.08)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--amber-500)', textShadow: '0 0 12px rgba(255,176,32,.5)' }}>+{draw.amount}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>{t('cosmetics.crates.ritual.complete.credits')}</span>
                </div>
                {showResult && (
                  <div style={{ marginTop: 16 }}>
                    <ContinueButton label={t('cosmetics.crates.ritual.continue')} onClick={onClose} />
                  </div>
                )}
              </div>
            </div>
          ) : cosmetic ? (
            <div className={!reduced ? (high ? 'nw-crate-rise' : 'nw-reveal') : undefined} style={{ position: 'relative', width: 256, maxWidth: '72%' }}>
              {high && rarity && <span aria-hidden style={{ position: 'absolute', inset: -18, clipPath: 'var(--clip-bevel-md)', boxShadow: `0 0 60px 6px rgba(${rarityRgb(rarity)}, ${0.35 + RARITY_GLOW[rarity] * 0.25})`, pointerEvents: 'none' }} />}
              <CosmeticCard item={cosmetic} state="unequipped" />
              {showResult && (
                <div style={{ marginTop: 12, display: 'flex', gap: 9 }}>
                  <button
                    type="button"
                    onClick={() => onEquip(cosmetic.id)}
                    style={{ flex: 1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 36, clipPath: 'var(--clip-bevel-sm)', border: `1px solid ${rarity ? rarityColor(rarity) : 'var(--accent)'}`, background: rarity ? `rgba(${rarityRgb(rarity)}, 0.12)` : 'var(--bg-hover)', color: rarity ? rarityColor(rarity) : 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.14em' }}
                  >
                    <Icon name="check-check" size={14} /> {t('cosmetics.crates.ritual.equip')}
                  </button>
                  <ContinueButton label={t('cosmetics.crates.ritual.continue')} onClick={onClose} flex />
                </div>
              )}
            </div>
          ) : null)}

        {/* Liseré « ajouté à la collection » (résultat cosmétique) */}
        {showResult && draw.kind === 'cosmetic' && (
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.16em', color: 'var(--text-secondary)' }}>
              <Icon name="check" size={12} /> {t('cosmetics.crates.ritual.added')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Bouton « Continuer » (ferme le rituel). */
function ContinueButton({ label, onClick, flex }: { label: string; onClick: () => void; flex?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ flex: flex ? 1 : undefined, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 36, padding: flex ? undefined : '0 18px', clipPath: 'var(--clip-bevel-sm)', border: '1px solid var(--border-strong)', background: 'var(--void-900)', color: 'var(--text-label)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xs)', letterSpacing: '0.14em' }}
    >
      {label} <Icon name="arrow-right" size={13} />
    </button>
  )
}
