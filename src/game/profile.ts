// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-032 (Phase A3) : identité du runner. Seule règle pure = la normalisation du
// callsign (le reste du profil est de la présentation qui lit l'état existant).

/** Callsign par défaut au premier lancement (avant personnalisation). */
export const DEFAULT_CALLSIGN = 'RUNNER'

/** Longueur maximale du callsign. */
export const CALLSIGN_MAX = 12

/**
 * Normalise un callsign saisi : passe en majuscules, ne garde que `A-Z 0-9`,
 * espace et tiret, rogne les bords, borne à `CALLSIGN_MAX`. Repli sur
 * `DEFAULT_CALLSIGN` si le résultat est vide. Fonction pure (idempotente).
 */
export function normalizeCallsign(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9 -]/g, '')
    .slice(0, CALLSIGN_MAX)
    .trim()
  return cleaned.length > 0 ? cleaned : DEFAULT_CALLSIGN
}
