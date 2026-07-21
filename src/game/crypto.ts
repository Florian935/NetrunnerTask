// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-027 (Phase A2) : 3ᵉ ressource, le crypto. Comportement délibérément
// différent de `cycles`/`data` (qui s'accumulent passivement) : le crypto se
// **convertit manuellement** depuis `data`, à un cours qui fluctue dans le
// temps — 1ʳᵉ vraie décision de timing du jeu. Volontairement **découplé** de
// `builder.ts`/`unlockTree.ts` (types structurels minimaux, aucun import).

/** État minimal manipulé par les règles pures (sous-ensemble de `BuilderState`). */
export interface CryptoCore {
  data: number
  crypto: number
}

/**
 * Réglage du marché (placeholder, affinable en recette). Le cours est exprimé
 * en **CR pour 1 000 data convertis** (plus lisible qu'un taux par unité).
 * Somme de 3 oscillations de périodes/amplitudes différentes autour d'une
 * moyenne — reproduit un ressenti de marché (dérive + bruit + retour à la
 * moyenne) sans aléatoire réel, pour rester reproductible après un
 * reload/une absence (voir `marketRate`).
 */
export const MARKET_CONFIG = {
  /** Cours moyen (CR / 1 000 data). */
  mean: 2.0,
  waves: [
    { periodMs: 5 * 60 * 1000, amplitude: 0.35, phase: 0 },
    { periodMs: 32 * 60 * 1000, amplitude: 0.45, phase: 1.7 },
    { periodMs: 118 * 60 * 1000, amplitude: 0.15, phase: 4.2 },
  ],
} as const

/**
 * Cours du marché à l'instant `nowMs` (epoch ms) — **pure fonction
 * déterministe de l'horodatage**, aucune persistance, aucun état aléatoire.
 * Le même `nowMs` renvoie toujours le même cours (reload, absence, rattrapage
 * hors-ligne inclus — mais le crypto lui-même ne fait jamais partie du
 * rattrapage, voir `convert`). Bornée par construction (somme d'amplitudes
 * finies autour de `mean`), jamais négative en pratique avec ces réglages.
 */
export function marketRate(nowMs: number): number {
  const sum = MARKET_CONFIG.waves.reduce(
    (acc, w) => acc + w.amplitude * Math.sin((2 * Math.PI * nowMs) / w.periodMs + w.phase),
    0,
  )
  return MARKET_CONFIG.mean + sum
}

/** Peut-on convertir `dataAmount` de `data` (montant positif, solde suffisant) ? */
export function canConvert(core: CryptoCore, dataAmount: number): boolean {
  return dataAmount > 0 && dataAmount <= core.data
}

/**
 * Convertit `dataAmount` de `data` en crypto au `effectiveRate` fourni (CR /
 * 1 000 data — composé par la couche store à partir de `marketRate` et d'un
 * éventuel plancher, voir `game/unlockTree.ts` `cryptoFloorBonus`). **No-op**
 * (même référence) si `!canConvert`. Le crypto crédité est arrondi à l'entier
 * inférieur (pas de fraction de CR).
 */
export function convert<T extends CryptoCore>(
  core: T,
  dataAmount: number,
  effectiveRate: number,
): T {
  if (!canConvert(core, dataAmount)) return core
  const gained = Math.floor((dataAmount / 1000) * effectiveRate)
  return { ...core, data: core.data - dataAmount, crypto: core.crypto + gained }
}
