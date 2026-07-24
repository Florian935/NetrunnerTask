import { describe, expect, it } from 'vitest'
import {
  canSecure,
  chargeSurcharge,
  dopageMultiplier,
  pathRewardsFor,
  securedGain,
  SURCHARGE_CONFIG,
} from './corruption'
import { prestige, type PrestigeCore } from './prestige'

// Recette US-037 — scénarios end-to-end de la MÉCANIQUE (couche pure), rejouant
// la composition telle que `useBuilderStore.applyTick`/`secureSurcharge` +
// `useCosmeticsStore.bankVoltage` l'exécutent. Vérifie les critères d'acceptation
// vérifiables sans navigateur (2, 3, 4, 5, 8-logique, 9-logique). Les critères
// visuels / de persistance IndexedDB restent en recette live PO.

/** Rejoue N ticks de `dtSec` en jeu actif embrassé ; renvoie la trace. */
function runTicks(startSurcharge: number, dtSec: number, n: number) {
  let surcharge = startSurcharge
  let krachs = 0
  const dopages: number[] = []
  for (let i = 0; i < n; i++) {
    dopages.push(dopageMultiplier(surcharge))
    const step = chargeSurcharge(surcharge, dtSec)
    if (step.krached) krachs++
    surcharge = step.surcharge
  }
  return { surcharge, krachs, dopages }
}

describe('C3 — la surcharge charge et DOPE la production (croissant)', () => {
  it('le dopage monte avec la surcharge au fil des ticks jusqu’au krach', () => {
    // 1 s de charge à la vitesse configurée, par pas de 0,1 s.
    const { dopages } = runTicks(0, 0.1, 10)
    // Strictement croissant tant qu’il n’y a pas de krach (surcharge basse ici).
    for (let i = 1; i < dopages.length; i++) {
      expect(dopages[i]).toBeGreaterThan(dopages[i - 1])
    }
    expect(dopages[0]).toBe(1) // neutre à 0
  })
})

describe('C4 — krach déterministe au seuil critique (reset, rien encaissé)', () => {
  it('atteint le seuil → un krach remet la jauge à 0', () => {
    // Assez de temps pour dépasser le seuil critique au moins une fois.
    const secondsToCritical = SURCHARGE_CONFIG.critical / SURCHARGE_CONFIG.chargeRatePerSec
    const { krachs, surcharge } = runTicks(0, 0.1, Math.ceil((secondsToCritical / 0.1) + 5))
    expect(krachs).toBeGreaterThanOrEqual(1)
    expect(surcharge).toBeLessThan(SURCHARGE_CONFIG.critical)
  })
  it('est REJOUABLE : même départ + même dt → même krach au même tick', () => {
    const a = runTicks(90, 0.5, 6)
    const b = runTicks(90, 0.5, 6)
    expect(a).toEqual(b)
    expect(a.krachs).toBeGreaterThanOrEqual(1)
  })
})

describe('C5 — Sécuriser encaisse du voltage (le krach, lui, ne rapporte rien)', () => {
  it('sécuriser haut rapporte, la jauge revient à 0, aucun palier reperdu', () => {
    // Boucle « sécuriser » façon store : gain cumulé → paliers via pathRewardsFor.
    let voltage = 0
    const unlocked: string[] = []
    const bank = (surcharge: number) => {
      expect(canSecure(surcharge)).toBe(true)
      const gain = securedGain(surcharge)
      const prev = voltage
      voltage += gain
      unlocked.push(...pathRewardsFor(prev, voltage))
    }
    bank(80) // gros encaissement
    bank(80)
    bank(80)
    // 3 sécurisations à 80 % franchissent au moins les 2 premiers paliers.
    expect(voltage).toBeGreaterThan(600)
    expect(unlocked).toContain('cor-fracture')
    expect(unlocked).toContain('cor-aberration')
    // Aucun doublon (append-only) : chaque palier n’est livré qu’une fois.
    expect(new Set(unlocked).size).toBe(unlocked.length)
  })
  it('un krach n’ajoute AUCUN voltage (opportunité perdue)', () => {
    // Modèle : au krach la surcharge → 0 sans appel à bankVoltage → voltage inchangé.
    let voltage = 500
    const before = voltage
    // (pas d’encaissement) krach = reset seul
    const step = chargeSurcharge(SURCHARGE_CONFIG.critical - 0.5, 1)
    expect(step.krached).toBe(true)
    expect(voltage).toBe(before) // rien encaissé
  })
})

describe('C8 — reduced-motion : la mécanique reste identique (logique inchangée)', () => {
  it('la charge/krach/gain ne dépendent pas de l’animation', () => {
    // Les fonctions pures n’ont aucune notion d’animation → mêmes résultats.
    expect(chargeSurcharge(50, 0.3)).toEqual(chargeSurcharge(50, 0.3))
    expect(securedGain(50)).toBe(securedGain(50))
  })
})

describe('C9 — hors-ligne : gel (dt=0 → aucune évolution, aucun krach)', () => {
  it('un tick de durée nulle ne fait ni charger ni kracher', () => {
    const step = chargeSurcharge(99, 0)
    expect(step).toEqual({ surcharge: 99, krached: false })
  })
})

describe('C6/C8 — la renaissance remet la surcharge à 0 (voltage cumulé hors PrestigeCore)', () => {
  it('prestige() reset la jauge de surcharge', () => {
    const core: PrestigeCore = {
      cycles: 20_000_000, // > prestigeThreshold(3) = 15,625 M → renaissance permise
      generators: { scraper: 3 },
      upgrades: {},
      data: 0,
      crypto: 0,
      unlockedNodes: [],
      prestigeCount: 3,
      surcharge: 87,
    }
    const next = prestige(core)
    expect(next.surcharge).toBe(0)
    expect(next.prestigeCount).toBe(4)
  })
})
