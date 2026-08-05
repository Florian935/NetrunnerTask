import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Icon, ProgressBar } from '../../components/ui'
import { COSMETIC_BY_ID } from '../../game/cosmetics'
import {
  slotProgress,
  slotRequirement,
  topExposedRarity,
  totalSlots,
  unlockedSlots,
} from '../../game/showcase'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { RankPips } from '../cosmetics/RankPips'
import { rarityColor, rarityRgb } from '../cosmetics/rarityStyle'
import { TrophyPicker } from './TrophyPicker'
import { TrophySlot } from './TrophySlot'
import './showcase.css'

/**
 * Écran Salle des trophées (US-038) — le présentoir **composé par le joueur**.
 * Lit `useCosmeticsStore` (présentoir + possédés) et `useBuilderStore` (jalons,
 * dont dérive le nombre d'emplacements ouverts). La richesse exposée = rareté
 * maîtresse + paliers gagnés, **jamais** un compteur d'objets (#043).
 */
export function ShowcaseView() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const showcase = useCosmeticsStore((s) => s.showcase)
  const owned = useCosmeticsStore((s) => s.owned)
  const pinTrophy = useCosmeticsStore((s) => s.pinTrophy)
  const unpinTrophy = useCosmeticsStore((s) => s.unpinTrophy)
  const achieved = useBuilderStore((s) => s.achievedMilestones)

  const achievedCount = achieved.length
  const open = unlockedSlots(achievedCount)
  const total = totalSlots()
  const progress = slotProgress(achievedCount)
  const top = topExposedRarity(showcase)

  const [picking, setPicking] = useState<number | null>(null)
  const pinnedRefs = showcase.filter((s): s is { kind: 'cosmetic'; ref: string } => s !== null).map((s) => s.ref)

  // Deep-link du toast : `?pin` ouvre le sélecteur sur le 1ᵉʳ emplacement vide ouvert.
  useEffect(() => {
    if (!searchParams.has('pin')) return
    const firstEmpty = Array.from({ length: open }, (_, i) => i).find((i) => !showcase[i])
    if (firstEmpty !== undefined) setPicking(firstEmpty)
    searchParams.delete('pin')
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ padding: 'var(--space-6) var(--space-6) var(--space-8)', maxWidth: 1240, margin: '0 auto' }}>
      {/* En-tête */}
      <header
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 26,
          flexWrap: 'wrap',
          marginBottom: 26,
          paddingBottom: 18,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.34em', color: 'var(--text-muted)', marginBottom: 9 }}>
            {t('showcase.kicker')}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '2.1rem',
              letterSpacing: '0.12em',
              color: 'var(--text-primary)',
              textShadow: 'var(--text-glow-cyan)',
              lineHeight: 1,
            }}
          >
            {t('showcase.title')}
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginTop: 10, maxWidth: 520 }}>
            {t('showcase.subtitle')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Pièce maîtresse exposée (rareté la plus haute — jamais une quantité) */}
          <div
            style={{
              position: 'relative',
              padding: '11px 16px',
              clipPath: 'var(--clip-bevel-sm)',
              border: top ? `1px solid rgba(${rarityRgb(top)}, 0.5)` : '1px solid var(--border-strong)',
              background: top
                ? `linear-gradient(160deg, rgba(${rarityRgb(top)}, 0.12), transparent 60%), var(--void-900)`
                : 'var(--void-900)',
              minWidth: 178,
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {t('showcase.masterpiece')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 7 }}>
              {top ? (
                <>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '0.14em', color: rarityColor(top) }}>
                    {t(`cosmetics.rarity.${top}`)}
                  </span>
                  <RankPips rarity={top} />
                </>
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                  {t('showcase.masterpieceNone')}
                </span>
              )}
            </div>
          </div>

          {/* Emplacements ouverts + progression vers le prochain palier */}
          <div style={{ padding: '11px 16px', clipPath: 'var(--clip-bevel-sm)', border: '1px solid var(--border-strong)', background: 'var(--void-900)', minWidth: 210 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: 'var(--cyan-400)', textShadow: '0 0 10px rgba(0,240,255,.45)' }}>
                {open}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-label)' }}>
                {t('showcase.slotsOpen')}
              </span>
            </div>
            {progress.nextAt != null ? (
              <>
                <ProgressBar value={achievedCount} max={progress.nextAt} accent="gradient" height={5} style={{ marginTop: 9 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--text-muted)', marginTop: 6 }}>
                  {t('showcase.nextTier', { at: progress.nextAt, count: achievedCount })}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--text-muted)', marginTop: 9 }}>
                {t('showcase.allOpen')}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grille du présentoir */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 18 }}>
        {Array.from({ length: total }, (_, i) => {
          const featured = i === 0
          const locked = i >= open
          const pin = showcase[i] ?? null
          const cosmetic = pin ? COSMETIC_BY_ID[pin.ref] : undefined
          const state = locked ? 'locked' : cosmetic ? 'filled' : 'empty'
          return (
            <div key={i} style={{ gridColumn: featured ? 'span 2' : 'span 1', display: 'grid' }}>
              <TrophySlot
                index={i}
                featured={featured}
                state={state}
                cosmetic={cosmetic}
                requirement={locked ? slotRequirement(i) : null}
                onPin={() => setPicking(i)}
                onUnpin={() => unpinTrophy(i)}
              />
            </div>
          )
        })}
      </div>

      {/* Note de règle (#043) */}
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
        <Icon name="info" size={13} />
        {t('showcase.rule')}
      </div>

      {picking != null && (
        <TrophyPicker
          slotIndex={picking}
          pinnedRefs={pinnedRefs}
          owned={owned}
          onPick={(ref) => {
            pinTrophy(picking, ref)
            setPicking(null)
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}
