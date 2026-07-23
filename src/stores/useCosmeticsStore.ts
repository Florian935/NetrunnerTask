import { create } from 'zustand'
import { cosmeticsRepo } from '../db'
import {
  DEFAULT_COSMETICS,
  equip as equipPure,
  type CosmeticsCore,
} from '../game/cosmetics'
import { applyCosmeticTheme, mirrorCosmeticTheme } from '../features/cosmetics/theme'

/**
 * Store réactif de l'état cosmétique (US-031). État persisté (`cosmeticsState`) :
 * `owned` (possédés) + `equipped` (un `id` par type). Mutations via la logique
 * pure `game/cosmetics.ts` (module **découplé**, sans valeur de jeu).
 * Persistance **immédiate** à l'équipement (écriture rare). Le thème équipé est
 * appliqué au <html> (`applyCosmeticTheme`) + mémorisé en miroir localStorage
 * (`mirrorCosmeticTheme`) à chaque `load()`/`equip()`.
 */
interface CosmeticsStoreState extends CosmeticsCore {
  loaded: boolean
  load: () => Promise<void>
  /** Équipe le cosmétique `id` (no-op si inconnu/non possédé/déjà équipé). */
  equip: (id: string) => void
}

export const useCosmeticsStore = create<CosmeticsStoreState>((set, get) => ({
  owned: [...DEFAULT_COSMETICS.owned],
  equipped: { ...DEFAULT_COSMETICS.equipped },
  loaded: false,

  load: async () => {
    const state = await cosmeticsRepo.get()
    const owned = state?.owned ?? [...DEFAULT_COSMETICS.owned]
    const equipped = state?.equipped ?? { ...DEFAULT_COSMETICS.equipped }
    set({ owned, equipped, loaded: true })
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
    void cosmeticsRepo.save({ owned: next.owned, equipped: next.equipped })
  },
}))
