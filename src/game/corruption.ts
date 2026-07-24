// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-037 (Phase A4) : LA VOIE CORROMPUE — la profondeur mécanique de la voie
// sombre, jouable une fois la corruption EMBRASSÉE (US-036, flag persisté
// `corruption === 'embraced'`). Une jauge de SURCHARGE charge en temps réel et
// **dope** la production (multiplicateur global) ; au SEUIL CRITIQUE elle
// **krache** (reset brutal, le dopage retombe). Le joueur peut **SÉCURISER** à
// tout moment : encaisser la surcharge courante en **voltage de voie** sans
// krach. L'arbitrage : viser haut (plus de dopage + plus gros encaissement) ou
// sécuriser (le krach ne rapporte RIEN — le risque, c'est l'opportunité perdue).
// Le voltage cumulé débloque des cosmétiques glitch à des **paliers**.
//
// **Déterministe, zéro RNG** — la charge est linéaire dans le temps (comme le
// cours crypto est une fonction pure du temps). Le « tremblement instable » est
// un rendu CSS (UI), pas une variance de la mécanique. `crates.ts` reste le seul
// module hasardeux de `game/*`. Volontairement **découplé** de `builder.ts`/
// `prestige.ts` (types structurels minimaux) — la couche store compose le dopage
// avec les autres multiplicateurs avant `tick()`.

/** État minimal manipulé par les règles pures (sous-ensemble de `BuilderState`). */
export interface SurchargeCore {
  /** Jauge de surcharge courante, 0 → `critical`. Reset à la renaissance. */
  surcharge: number
}

/** Réglage de la voie (placeholders repris de la maquette, affinables en recette). */
export const SURCHARGE_CONFIG = {
  /** Seuil critique : la surcharge krache en l'atteignant. */
  critical: 100,
  /**
   * Vitesse de charge (points de surcharge par seconde d'app ouverte). ~12,5 s
   * pour une rampe complète 0 → critique. **Charge uniquement en jeu actif**
   * (voir `useBuilderStore.applyTick`) ; gelée hors-ligne.
   */
  chargeRatePerSec: 8,
  /** Exposant de la courbe de dopage (montée douce au début, forte en fin). */
  dopageExp: 1.25,
  /** Amplitude du dopage : `1 + 1^exp × span` = dopage max au seuil critique. */
  dopageSpan: 2.6,
  /** Facteur d'encaissement (voltage gagné en sécurisant, voir `securedGain`). */
  secureFactor: 4,
  /** Surcharge minimale pour que « sécuriser » soit permis (sous ce seuil = no-op). */
  minSecure: 3,
} as const

/** Dopage max de la voie (au seuil critique) — `dopageMultiplier(critical)`. */
export const DOPAGE_MAX = 1 + SURCHARGE_CONFIG.dopageSpan

/** Borne `s` dans `[0, critical]`. */
function clampSurcharge(s: number): number {
  return Math.max(0, Math.min(SURCHARGE_CONFIG.critical, s))
}

/**
 * Multiplicateur de production apporté par la surcharge (le **dopage**) :
 * `1 + (s / critical)^dopageExp × dopageSpan`. `1` à `s = 0` (neutre), `DOPAGE_MAX`
 * au seuil critique. Croissant et borné. Composé par la couche store **avec**
 * arbre × boost × prestige, uniquement quand la corruption est embrassée.
 */
export function dopageMultiplier(surcharge: number): number {
  const s = clampSurcharge(surcharge)
  return 1 + Math.pow(s / SURCHARGE_CONFIG.critical, SURCHARGE_CONFIG.dopageExp) * SURCHARGE_CONFIG.dopageSpan
}

/**
 * Avance la surcharge de `dtSec` secondes (charge linéaire déterministe). Si elle
 * atteint/dépasse le seuil critique → **krach** : reset à `0` et `krached = true`
 * (le dopage retombe, rien n'est encaissé). `dtSec ≤ 0` = no-op. Zéro RNG.
 */
export function chargeSurcharge(surcharge: number, dtSec: number): { surcharge: number; krached: boolean } {
  if (dtSec <= 0) return { surcharge, krached: false }
  const next = clampSurcharge(surcharge) + SURCHARGE_CONFIG.chargeRatePerSec * dtSec
  if (next >= SURCHARGE_CONFIG.critical) return { surcharge: 0, krached: true }
  return { surcharge: next, krached: false }
}

/**
 * Voltage de voie encaissé en **sécurisant** à la surcharge courante :
 * `round(s × (1 + s / critical) × secureFactor)` — **non-linéaire** (viser haut
 * rapporte bien plus). `0` sous `minSecure` (sécuriser y est interdit).
 */
export function securedGain(surcharge: number): number {
  const s = clampSurcharge(surcharge)
  if (s < SURCHARGE_CONFIG.minSecure) return 0
  return Math.round(s * (1 + s / SURCHARGE_CONFIG.critical) * SURCHARGE_CONFIG.secureFactor)
}

/** Peut-on sécuriser (surcharge suffisante) ? */
export function canSecure(surcharge: number): boolean {
  return clampSurcharge(surcharge) >= SURCHARGE_CONFIG.minSecure
}

/** Un palier de la voie : seuil de voltage cumulé → `id` du cosmétique débloqué. */
export interface CorruptionTier {
  /** Voltage sécurisé **cumulé** requis. */
  voltage: number
  /** `id` du cosmétique `source: 'corruption'` débloqué (catalogue `cosmetics.ts`). */
  reward: string
}

/**
 * Paliers de la voie (voltage cumulé → cosmétique glitch), croissants. Repris de
 * la maquette `corrupted-path`. Les `id` référencent le catalogue `cosmetics.ts`
 * (littéraux, même convention que `MILESTONE_DEFS.reward`).
 */
export const CORRUPTION_PATH_TIERS: readonly CorruptionTier[] = [
  { voltage: 200, reward: 'cor-fracture' },
  { voltage: 600, reward: 'cor-aberration' },
  { voltage: 1400, reward: 'cor-surtension' },
  { voltage: 3000, reward: 'cor-0xdead' },
] as const

/**
 * `id` des cosmétiques dont le palier est **franchi** en passant de `prevVoltage`
 * à `nextVoltage` (`prev < voltage ≤ next`), dans l'ordre des paliers. Sert au
 * câblage du déblocage (store) : `pathRewardsFor(avant, après)`. Aucun doublon
 * (append-only par construction : `grant` est idempotent côté store).
 */
export function pathRewardsFor(prevVoltage: number, nextVoltage: number): string[] {
  return CORRUPTION_PATH_TIERS.filter(
    (t) => t.voltage > prevVoltage && t.voltage <= nextVoltage,
  ).map((t) => t.reward)
}

/** Prochain palier non atteint pour un voltage donné, ou `null` si voie complétée. */
export function nextTier(voltage: number): CorruptionTier | null {
  return CORRUPTION_PATH_TIERS.find((t) => t.voltage > voltage) ?? null
}

/** Le seuil de voltage qui débloque ce cosmétique de voie, ou `undefined`. */
export function tierVoltageFor(cosmeticId: string): number | undefined {
  return CORRUPTION_PATH_TIERS.find((t) => t.reward === cosmeticId)?.voltage
}
