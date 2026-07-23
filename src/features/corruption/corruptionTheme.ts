// US-036 — application du thème corrompu (le re-skin global de la voie sombre).
// Axe CSS **distinct** du thème cosmétique équipé (`data-cosmetic-theme`) : on
// pose `data-corruption="on"` sur <html>, les surcharges vivent dans
// `theme/tokens/corruption.css` et **composent par-dessus** le thème équipé
// (importées après `themes.css` → gagnent à spécificité égale). 100 % CSS →
// offline-safe, pas de recalcul JS. Calque exact de `features/cosmetics/theme.ts`.

/** Clé du miroir localStorage de l'état de corruption (anti-FOUC au boot). */
export const CORRUPTION_STORAGE_KEY = 'nt-corruption'

/** Pose (ou retire) l'attribut `data-corruption="on"` sur <html>. */
export function applyCorruption(on: boolean): void {
  const root = document.documentElement
  if (on) root.dataset.corruption = 'on'
  else root.removeAttribute('data-corruption')
}

/** Écrit le miroir localStorage (best-effort : ignore quota / mode privé). */
export function mirrorCorruption(on: boolean): void {
  try {
    if (on) localStorage.setItem(CORRUPTION_STORAGE_KEY, 'on')
    else localStorage.removeItem(CORRUPTION_STORAGE_KEY)
  } catch {
    /* stockage indisponible — l'état sera réappliqué au prochain load() */
  }
}

/**
 * Applique **synchronement au boot** l'état de corruption mémorisé (miroir
 * localStorage), avant le 1ᵉʳ rendu React — évite le flash du thème propre le
 * temps que la lecture Dexie (asynchrone) aboutisse. La source de vérité reste
 * Dexie ; ce miroir n'est qu'une optimisation d'affichage.
 */
export function bootCorruption(): void {
  try {
    if (localStorage.getItem(CORRUPTION_STORAGE_KEY) === 'on') applyCorruption(true)
  } catch {
    /* stockage indisponible — pas de pré-application, load() s'en chargera */
  }
}
