import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import { crateCosmetics, rarityRank } from '../../game/cosmetics'
import { FORGE_COST } from '../../game/crates'
import { CosmeticCard } from './CosmeticCard'
import { FRAGMENT_COLOR, FRAGMENT_RGB } from './Fragment'
import { FragmentBalance } from './FragmentBalance'
import './cosmetics.css'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

export interface ForgePanelProps {
  owned: readonly string[]
  fragments: number
  /** Forge le cosmétique `id` (câblé au store par l'appelant). */
  onForge: (id: string) => void
}

/**
 * Forge (US-035) — dépenser des fragments pour débloquer un cosmétique choisi.
 * Liste les **exclusifs caisses non possédés** (les fragments viennent des
 * doublons de caisse ; les cosmétiques de jalon restent gagnés par le jeu),
 * triés par rareté croissante, en `CosmeticCard` état `forge`. Filet
 * déterministe contre la malchance.
 */
export function ForgePanel({ owned, fragments, onForge }: ForgePanelProps) {
  const { t } = useTranslation()
  const [forging, setForging] = useState<string | null>(null)
  const ownedSet = new Set(owned)
  const forgeable = crateCosmetics()
    .filter((c) => !ownedSet.has(c.id))
    .sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity))

  /**
   * Forge avec un court flash « FORGÉ » avant que la carte ne quitte la liste
   * (évite la disparition sèche). En reduced-motion, commit immédiat.
   */
  function handleForge(id: string): void {
    if (forging) return
    if (prefersReducedMotion()) {
      onForge(id)
      return
    }
    setForging(id)
    window.setTimeout(() => {
      onForge(id)
      setForging(null)
    }, 620)
  }

  return (
    <Card
      hud
      brackets
      padding="18px 20px"
      style={{ position: 'relative', marginBottom: 30, overflow: 'hidden', background: `linear-gradient(160deg, rgba(${FRAGMENT_RGB}, 0.05), transparent 50%), var(--bg-panel)` }}
    >
      {/* En-tête + solde */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
          <Icon name="hammer" size={18} color={FRAGMENT_COLOR} style={{ filter: `drop-shadow(0 0 6px rgba(${FRAGMENT_RGB}, 0.6))` }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '0.2em', color: 'var(--text-primary)' }}>
            {t('cosmetics.forge.title')}
          </span>
        </div>
        <FragmentBalance value={fragments} />
      </div>
      <p style={{ position: 'relative', margin: '0 0 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.55, letterSpacing: '0.03em', color: 'var(--text-secondary)', maxWidth: 640 }}>
        {t('cosmetics.forge.intro')}
      </p>

      {forgeable.length === 0 ? (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', clipPath: 'var(--clip-bevel-sm)', border: '1px dashed var(--border-strong)', background: 'var(--bg-inset)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          <Icon name="check-check" size={15} color={FRAGMENT_COLOR} /> {t('cosmetics.forge.complete')}
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {forgeable.map((c) => (
            <div key={c.id} style={{ position: 'relative' }}>
              <CosmeticCard
                item={c}
                state="forge"
                forgeCost={FORGE_COST[c.rarity]}
                fragments={fragments}
                onForge={() => handleForge(c.id)}
              />
              {forging === c.id && (
                <span
                  aria-hidden
                  className="nw-forged"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    gap: 8,
                    clipPath: 'var(--clip-bevel-md)',
                    background: `radial-gradient(circle at 50% 45%, rgba(${FRAGMENT_RGB}, 0.28), rgba(${FRAGMENT_RGB}, 0.06) 60%, transparent 75%)`,
                    border: `1px solid ${FRAGMENT_COLOR}`,
                    boxShadow: `0 0 24px -2px rgba(${FRAGMENT_RGB}, 0.7) inset, 0 0 20px -4px rgba(${FRAGMENT_RGB}, 0.6)`,
                    zIndex: 5,
                  }}
                >
                  <span style={{ display: 'grid', placeItems: 'center', width: 46, height: 46, clipPath: 'var(--clip-bevel-sm)', border: `1px solid ${FRAGMENT_COLOR}`, background: 'color-mix(in srgb, var(--bg-app) 55%, transparent)', color: FRAGMENT_COLOR }}>
                    <Icon name="hammer" size={22} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.2em', color: FRAGMENT_COLOR, textShadow: `0 0 10px rgba(${FRAGMENT_RGB}, 0.7)` }}>
                    {t('cosmetics.forge.forged')}
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
