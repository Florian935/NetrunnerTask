import { create } from 'zustand'
import { cosmeticsRepo } from '../db'
import {
  COSMETIC_BY_ID,
  crateCosmetics,
  DEFAULT_COSMETICS,
  equip as equipPure,
  type CosmeticsCore,
} from '../game/cosmetics'
import {
  canForge,
  FORGE_COST,
  openCrate as openCratePure,
  type CrateDraw,
  type CrateQuality,
} from '../game/crates'
import { pathRewardsFor } from '../game/corruption'
import {
  pinSlot,
  reconcileShowcase,
  unpinSlot,
  type ShowcaseSlot,
} from '../game/showcase'
import { DEFAULT_CALLSIGN, normalizeCallsign } from '../game/profile'
import { newlyTriggeredReveals, type RevealContext } from '../game/reveals'
import { applyCosmeticTheme, mirrorCosmeticTheme } from '../features/cosmetics/theme'
import { applyCorruption, mirrorCorruption } from '../features/corruption/corruptionTheme'
import type { CorruptionState } from '../db/types'
import { useFeedbackStore } from './useFeedbackStore'

/** `id` du titre glitch débloqué en embrassant la corruption (US-036). */
const CORRUPTION_REWARD_ID = 'corrupt-glitch'

/** Stock de caisses initial (aucune) — miroir du seed / de la migration v20. */
const DEFAULT_CRATES: Record<CrateQuality, number> = {
  standard: 0,
  secured: 0,
  blackice: 0,
}

/**
 * Store réactif de l'état cosmétique / identité (US-031, US-032). État persisté
 * (`cosmeticsState`) : `owned` (possédés) + `equipped` (un `id` par type) +
 * `callsign` (identité runner, US-032). Mutations via la logique pure
 * `game/cosmetics.ts` (équipement) / `game/profile.ts` (normalisation callsign) —
 * modules **découplés**, sans valeur de jeu. Persistance **immédiate** (écriture
 * rare). Le thème équipé est appliqué au <html> + mémorisé en miroir localStorage
 * à chaque `load()`/`equip()`.
 */
interface CosmeticsStoreState extends CosmeticsCore {
  callsign: string
  /** Caisses non ouvertes par qualité (US-034). */
  crates: Record<CrateQuality, number>
  /** Fragments (US-035) — monnaie de complétion issue des doublons. */
  fragments: number
  /** Compteur de pity (US-035) — ouvertures depuis le dernier légendaire. */
  pity: number
  /** Ledger append-only des reveals dévoilés (US-036, `game/reveals.ts`). */
  discoveredReveals: string[]
  /** État du pacte de corruption (US-036). */
  corruption: CorruptionState
  /** `prestigeCount` au dernier armement de la corruption (US-036) ; borne la ré-offre. */
  corruptionArmedAt: number | null
  /** Voltage de voie sécurisé cumulé (US-037) — débloque les cosmétiques de voie. */
  securedVoltage: number
  /** Présentoir de la Salle des trophées (US-038) — composition choisie par le joueur. */
  showcase: ShowcaseSlot[]
  loaded: boolean
  load: () => Promise<void>
  /** Équipe le cosmétique `id` (no-op si inconnu/non possédé/déjà équipé). */
  equip: (id: string) => void
  /**
   * Débloque des cosmétiques (US-033) : ajoute aux `owned` ceux pas encore
   * possédés, persiste, et **renvoie les `id` réellement nouveaux** (pour le
   * feedback de déblocage). No-op (renvoie `[]`) si tous déjà possédés.
   */
  grant: (ids: readonly string[]) => string[]
  /** Change le callsign (normalisé via `game/profile.ts`) ; persiste aussitôt. */
  setCallsign: (raw: string) => void
  /** Ajoute une caisse `quality` au stock (US-034, gagnée en jouant) ; persiste. */
  grantCrate: (quality: CrateQuality) => void
  /**
   * Ouvre une caisse `quality` (US-034 + US-035) : décrémente le stock, tire via
   * `game/crates.ts` (avec le `pity` courant), applique le résultat (déblocage
   * cosmétique **ou** conversion doublon → **fragments**), met à jour le pity,
   * persiste, et **renvoie le tirage** pour le rituel. No-op (renvoie `null`) si
   * aucune caisse de cette qualité.
   */
  openCrate: (quality: CrateQuality) => CrateDraw | null
  /**
   * Forge (US-035) : dépense `FORGE_COST[rarity]` fragments pour débloquer le
   * cosmétique `id` (non possédé). No-op (renvoie `false`) si déjà possédé,
   * inconnu, ou solde insuffisant.
   */
  forge: (id: string) => boolean
  /**
   * Évalue les reveals (US-036) contre `ctx` (état de jeu, ex. `prestigeCount`).
   * Arme la corruption (`offered`) si nouvellement déclenchée depuis `dormant`,
   * **ou** la ré-offre depuis `refused` à une nouvelle renaissance. Appelé par le
   * store builder après une renaissance et au `load()`. Persiste si changement.
   */
  checkReveals: (ctx: RevealContext) => void
  /** Embrasse la corruption (US-036) : `embraced` + thème corrompu + titre glitch. */
  embraceCorruption: () => void
  /** Refuse la corruption (US-036) : `refused` (l'offre reviendra à la renaissance suivante). */
  refuseCorruption: () => void
  /** Purge la corruption (US-036) : `purged` — look propre, titre conservé, ré-embrassable. */
  purgeCorruption: () => void
  /**
   * Encaisse `gain` de voltage de voie (US-037, appelé par `secureSurcharge` du
   * store builder) : incrémente `securedVoltage`, débloque les cosmétiques dont
   * le palier est franchi (`pathRewardsFor` → `grant` idempotent + reveal), et
   * persiste. No-op si `gain ≤ 0`.
   */
  bankVoltage: (gain: number) => void
  /**
   * Épingle le cosmétique `ref` dans l'emplacement `slot` de la Salle des trophées
   * (US-038) : délègue à `game/showcase.ts` `pinSlot` (valide possédé + unicité par
   * `ref` + bornes), persiste. No-op si le tirage est refusé. **Ne touche jamais
   * `equipped`** (épingler ≠ équiper).
   */
  pinTrophy: (slot: number, ref: string) => void
  /** Retire le trophée de l'emplacement `slot` (US-038) ; persiste. No-op si vide. */
  unpinTrophy: (slot: number) => void
}

export const useCosmeticsStore = create<CosmeticsStoreState>((set, get) => {
  /** Persiste l'état courant (owned + equipped + callsign + crates + US-035/036) en base. */
  function persist(): void {
    const { owned, equipped, callsign, crates, fragments, pity } = get()
    const { discoveredReveals, corruption, corruptionArmedAt, securedVoltage, showcase } = get()
    void cosmeticsRepo.save({
      owned,
      equipped,
      callsign,
      crates,
      fragments,
      pity,
      discoveredReveals,
      corruption,
      corruptionArmedAt,
      securedVoltage,
      showcase,
    })
  }

  return {
    owned: [...DEFAULT_COSMETICS.owned],
    equipped: { ...DEFAULT_COSMETICS.equipped },
    callsign: DEFAULT_CALLSIGN,
    crates: { ...DEFAULT_CRATES },
    fragments: 0,
    pity: 0,
    discoveredReveals: [],
    corruption: 'dormant',
    corruptionArmedAt: null,
    securedVoltage: 0,
    showcase: [],
    loaded: false,

    load: async () => {
      const state = await cosmeticsRepo.get()
      const owned = state?.owned ?? [...DEFAULT_COSMETICS.owned]
      const equipped = state?.equipped ?? { ...DEFAULT_COSMETICS.equipped }
      const callsign = state?.callsign ?? DEFAULT_CALLSIGN
      const crates = state?.crates ?? { ...DEFAULT_CRATES }
      const fragments = state?.fragments ?? 0
      const pity = state?.pity ?? 0
      const discoveredReveals = state?.discoveredReveals ?? []
      const corruption = state?.corruption ?? 'dormant'
      const corruptionArmedAt = state?.corruptionArmedAt ?? null
      const securedVoltage = state?.securedVoltage ?? 0
      // US-038 : réconcilie le présentoir avec l'inventaire possédé (filet de
      // sécurité — vide les emplacements orphelins/en doublon, plafonne la taille).
      const showcase = reconcileShowcase(state?.showcase ?? [], owned)
      set({
        owned,
        equipped,
        callsign,
        crates,
        fragments,
        pity,
        discoveredReveals,
        corruption,
        corruptionArmedAt,
        securedVoltage,
        showcase,
        loaded: true,
      })
      applyCosmeticTheme(equipped.theme)
      mirrorCosmeticTheme(equipped.theme)
      // US-036 : le thème corrompu est actif tant que la corruption est embrassée.
      const corrupted = corruption === 'embraced'
      applyCorruption(corrupted)
      mirrorCorruption(corrupted)
    },

    equip: (id) => {
      const current: CosmeticsCore = { owned: get().owned, equipped: get().equipped }
      const next = equipPure(current, id)
      if (next === current) return // inconnu / non possédé / déjà équipé → no-op
      set({ owned: next.owned, equipped: next.equipped })
      applyCosmeticTheme(next.equipped.theme)
      mirrorCosmeticTheme(next.equipped.theme)
      persist()
    },

    grant: (ids) => {
      const owned = get().owned
      const ownedSet = new Set(owned)
      const fresh = ids.filter((id) => !ownedSet.has(id))
      if (fresh.length === 0) return [] // tout déjà possédé → no-op
      set({ owned: [...owned, ...fresh] })
      persist()
      return fresh
    },

    setCallsign: (raw) => {
      const callsign = normalizeCallsign(raw)
      if (callsign === get().callsign) return // inchangé → no-op
      set({ callsign })
      persist()
    },

    grantCrate: (quality) => {
      const crates = get().crates
      set({ crates: { ...crates, [quality]: crates[quality] + 1 } })
      persist()
    },

    openCrate: (quality) => {
      const crates = get().crates
      if (crates[quality] <= 0) return null // aucune caisse → no-op

      const { draw, pity } = openCratePure(quality, get().owned, crateCosmetics(), get().pity)
      // Décrémente la caisse consommée + met à jour le pity.
      set({ crates: { ...crates, [quality]: crates[quality] - 1 }, pity })

      if (draw.kind === 'cosmetic') {
        get().grant([draw.id]) // nouveau → ajoute aux owned (persiste)
      } else {
        set({ fragments: get().fragments + draw.amount }) // doublon → fragments
      }
      persist() // garantit l'écriture du stock/pity/fragments
      return draw
    },

    forge: (id) => {
      const cosmetic = COSMETIC_BY_ID[id]
      if (cosmetic === undefined) return false // inconnu
      if (get().owned.includes(id)) return false // déjà possédé
      if (!canForge(get().fragments, cosmetic.rarity)) return false // solde insuffisant
      set({ fragments: get().fragments - FORGE_COST[cosmetic.rarity] })
      get().grant([id]) // débloque + persiste
      persist() // garantit l'écriture du solde de fragments
      return true
    },

    checkReveals: (ctx) => {
      const { discoveredReveals, corruption, corruptionArmedAt } = get()
      const fresh = newlyTriggeredReveals(discoveredReveals, ctx)

      if (fresh.includes('corruption') && corruption === 'dormant') {
        // 1er dévoilement : arme le pacte + inscrit au ledger (empêche la reprise).
        set({
          corruption: 'offered',
          corruptionArmedAt: ctx.prestigeCount,
          discoveredReveals: [...discoveredReveals, 'corruption'],
        })
        persist()
        return
      }

      // Ré-offre (H4) : après un refus, l'offre revient à une NOUVELLE renaissance.
      if (corruption === 'refused' && ctx.prestigeCount > (corruptionArmedAt ?? 0)) {
        set({ corruption: 'offered', corruptionArmedAt: ctx.prestigeCount })
        persist()
      }
    },

    embraceCorruption: () => {
      const { corruption } = get()
      if (corruption !== 'offered' && corruption !== 'purged') return // no-op
      set({ corruption: 'embraced' })
      applyCorruption(true)
      mirrorCorruption(true)
      get().grant([CORRUPTION_REWARD_ID]) // titre glitch (idempotent, gardé à vie)
      persist()
    },

    refuseCorruption: () => {
      if (get().corruption !== 'offered') return // no-op
      set({ corruption: 'refused' })
      persist()
    },

    purgeCorruption: () => {
      if (get().corruption !== 'embraced') return // no-op
      set({ corruption: 'purged' })
      applyCorruption(false) // look propre — le titre glitch reste possédé (P8)
      mirrorCorruption(false)
      persist()
      // La jauge de surcharge (BuilderState) se remet à 0 côté store builder au
      // 1ᵉʳ tick « non embrassé » — ré-embrasser repart de zéro (décision 4).
    },

    bankVoltage: (gain) => {
      if (gain <= 0) return // no-op
      const prev = get().securedVoltage
      const next = prev + gain
      set({ securedVoltage: next })
      const granted = get().grant(pathRewardsFor(prev, next)) // idempotent + persiste owned
      for (const cid of granted) useFeedbackStore.getState().triggerCosmeticUnlock(cid)
      persist() // garantit l'écriture de securedVoltage (grant no-op si aucun palier)
    },

    pinTrophy: (slot, ref) => {
      const next = pinSlot(get().showcase, slot, ref, get().owned)
      if (next === get().showcase) return // refusé (non possédé / doublon / bornes) → no-op
      set({ showcase: next })
      persist()
    },

    unpinTrophy: (slot) => {
      const next = unpinSlot(get().showcase, slot)
      if (next === get().showcase) return // déjà vide / hors bornes → no-op
      set({ showcase: next })
      persist()
    },
  }
})
