// US-031 — application du thème cosmétique équipé.
// Le re-skin est 100 % CSS : on pose `data-cosmetic-theme="<id>"` sur <html>,
// les surcharges vivent dans `theme/tokens/themes.css`. Aucun JS de theming au
// runtime → offline-safe, pas de recalcul. Le thème par défaut `nightwire` = pas
// d'attribut (les valeurs de `colors.css` s'appliquent telles quelles).

/** Clé du miroir localStorage de l'id de thème équipé (anti-FOUC au boot). */
export const THEME_STORAGE_KEY = 'nt-cosmetic-theme'

/** Thème par défaut : aucune surcharge (retire l'attribut). */
const DEFAULT_THEME_ID = 'nightwire'

/** Pose (ou retire) l'attribut `data-cosmetic-theme` sur <html>. */
export function applyCosmeticTheme(themeId: string): void {
  const root = document.documentElement
  if (themeId === DEFAULT_THEME_ID) root.removeAttribute('data-cosmetic-theme')
  else root.dataset.cosmeticTheme = themeId
}

/** Écrit le miroir localStorage (best-effort : ignore quota / mode privé). */
export function mirrorCosmeticTheme(themeId: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  } catch {
    /* stockage indisponible — le thème sera réappliqué au prochain load() */
  }
}

/**
 * Applique **synchronement au boot** le thème mémorisé dans le miroir
 * localStorage, avant le 1ᵉʳ rendu React — évite le flash du thème par défaut
 * (FOUC) le temps que la lecture Dexie (asynchrone) aboutisse. La source de
 * vérité reste Dexie ; ce miroir n'est qu'une optimisation d'affichage.
 */
export function bootCosmeticTheme(): void {
  try {
    const id = localStorage.getItem(THEME_STORAGE_KEY)
    if (id) applyCosmeticTheme(id)
  } catch {
    /* stockage indisponible — pas de pré-application, load() s'en chargera */
  }
}
