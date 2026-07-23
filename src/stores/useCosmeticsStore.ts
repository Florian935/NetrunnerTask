import { create } from 'zustand'
import { cosmeticsRepo } from '../db'
import {
  DEFAULT_COSMETICS,
  equip as equipPure,
  type CosmeticsCore,
} from '../game/cosmetics'
import { DEFAULT_CALLSIGN, normalizeCallsign } from '../game/profile'
import { applyCosmeticTheme, mirrorCosmeticTheme } from '../features/cosmetics/theme'

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
  loaded: boolean
  load: () => Promise<void>
  /** Équipe le cosmétique `id` (no-op si inconnu/non possédé/déjà équipé). */
  equip: (id: string) => void
  /** Change le callsign (normalisé via `game/profile.ts`) ; persiste aussitôt. */
  setCallsign: (raw: string) => void
}

export const useCosmeticsStore = create<CosmeticsStoreState>((set, get) => {
  /** Persiste l'état courant (owned + equipped + callsign) en base. */
  function persist(): void {
    const { owned, equipped, callsign } = get()
    void cosmeticsRepo.save({ owned, equipped, callsign })
  }

  return {
    owned: [...DEFAULT_COSMETICS.owned],
    equipped: { ...DEFAULT_COSMETICS.equipped },
    callsign: DEFAULT_CALLSIGN,
    loaded: false,

    load: async () => {
      const state = await cosmeticsRepo.get()
      const owned = state?.owned ?? [...DEFAULT_COSMETICS.owned]
      const equipped = state?.equipped ?? { ...DEFAULT_COSMETICS.equipped }
      const callsign = state?.callsign ?? DEFAULT_CALLSIGN
      set({ owned, equipped, callsign, loaded: true })
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

    setCallsign: (raw) => {
      const callsign = normalizeCallsign(raw)
      if (callsign === get().callsign) return // inchangé → no-op
      set({ callsign })
      persist()
    },
  }
})
