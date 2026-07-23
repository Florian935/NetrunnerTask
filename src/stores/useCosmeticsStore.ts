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
import { DEFAULT_CALLSIGN, normalizeCallsign } from '../game/profile'
import { applyCosmeticTheme, mirrorCosmeticTheme } from '../features/cosmetics/theme'

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
}

export const useCosmeticsStore = create<CosmeticsStoreState>((set, get) => {
  /** Persiste l'état courant (owned + equipped + callsign + crates + US-035) en base. */
  function persist(): void {
    const { owned, equipped, callsign, crates, fragments, pity } = get()
    void cosmeticsRepo.save({ owned, equipped, callsign, crates, fragments, pity })
  }

  return {
    owned: [...DEFAULT_COSMETICS.owned],
    equipped: { ...DEFAULT_COSMETICS.equipped },
    callsign: DEFAULT_CALLSIGN,
    crates: { ...DEFAULT_CRATES },
    fragments: 0,
    pity: 0,
    loaded: false,

    load: async () => {
      const state = await cosmeticsRepo.get()
      const owned = state?.owned ?? [...DEFAULT_COSMETICS.owned]
      const equipped = state?.equipped ?? { ...DEFAULT_COSMETICS.equipped }
      const callsign = state?.callsign ?? DEFAULT_CALLSIGN
      const crates = state?.crates ?? { ...DEFAULT_CRATES }
      const fragments = state?.fragments ?? 0
      const pity = state?.pity ?? 0
      set({ owned, equipped, callsign, crates, fragments, pity, loaded: true })
      applyCosmeticTheme(equipped.theme)
      mirrorCosmeticTheme(equipped.theme)
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
  }
})
