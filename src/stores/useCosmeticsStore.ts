import { create } from 'zustand'
import { cosmeticsRepo } from '../db'
import {
  crateCosmetics,
  DEFAULT_COSMETICS,
  equip as equipPure,
  type CosmeticsCore,
} from '../game/cosmetics'
import {
  openCrate as openCratePure,
  type CrateDraw,
  type CrateQuality,
} from '../game/crates'
import { DEFAULT_CALLSIGN, normalizeCallsign } from '../game/profile'
import { applyCosmeticTheme, mirrorCosmeticTheme } from '../features/cosmetics/theme'
import { usePlayerStore } from './usePlayerStore'

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
   * Ouvre une caisse `quality` (US-034) : décrémente le stock, tire via
   * `game/crates.ts`, applique le résultat (déblocage cosmétique **ou** crédits
   * de consolation), persiste, et **renvoie le tirage** pour le rituel. No-op
   * (renvoie `null`) si aucune caisse de cette qualité.
   */
  openCrate: (quality: CrateQuality) => CrateDraw | null
}

export const useCosmeticsStore = create<CosmeticsStoreState>((set, get) => {
  /** Persiste l'état courant (owned + equipped + callsign + crates) en base. */
  function persist(): void {
    const { owned, equipped, callsign, crates } = get()
    void cosmeticsRepo.save({ owned, equipped, callsign, crates })
  }

  return {
    owned: [...DEFAULT_COSMETICS.owned],
    equipped: { ...DEFAULT_COSMETICS.equipped },
    callsign: DEFAULT_CALLSIGN,
    crates: { ...DEFAULT_CRATES },
    loaded: false,

    load: async () => {
      const state = await cosmeticsRepo.get()
      const owned = state?.owned ?? [...DEFAULT_COSMETICS.owned]
      const equipped = state?.equipped ?? { ...DEFAULT_COSMETICS.equipped }
      const callsign = state?.callsign ?? DEFAULT_CALLSIGN
      const crates = state?.crates ?? { ...DEFAULT_CRATES }
      set({ owned, equipped, callsign, crates, loaded: true })
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

      const draw = openCratePure(quality, get().owned, crateCosmetics())
      // Décrémente la caisse consommée.
      set({ crates: { ...crates, [quality]: crates[quality] - 1 } })

      if (draw.kind === 'cosmetic') {
        get().grant([draw.id]) // ajoute aux owned (persiste l'état complet)
      } else {
        void usePlayerStore.getState().adjustCredits(draw.amount) // consolation
      }
      persist() // garantit l'écriture du stock (cas crédits : grant non appelé)
      return draw
    },
  }
})
