// US-036 — identité visuelle partagée de la corruption (la voie sombre).
// Magenta glitch (#ff2d95) + cyan d'aberration, sur void. Aligné sur le token
// `--crate-blackice-chroma-rgb` (255,45,149) déjà présent. Réutilisé par toutes
// les surfaces corruption (GlitchText, Interference, GlitchMark, PactButton,
// CorruptionControl, CosmeticCard source:'corruption').

/** Magenta signature de la corruption. */
export const COR_COLOR = '#ff2d95'
export const COR_COLOR_HOVER = '#ff5cae'
export const COR_RGB = '255, 45, 149'
/** Magenta « brûlant » (surcharge critique / krach, US-037). */
export const COR_HOT = '#ffb8dc'
/** Cyan d'aberration chromatique (le 2ᵉ canal du décalage RGB). */
export const COR_CYAN_RGB = '0, 240, 255'

/** Halo magenta composable (k = intensité). */
export function corGlow(k = 1): string {
  const round = (n: number) => Math.round(n)
  return `0 0 0 1px rgba(${COR_RGB}, ${(0.5 * k).toFixed(2)}), 0 0 ${round(18 * k)}px rgba(${COR_RGB}, ${(0.4 * k).toFixed(2)}), 0 0 ${round(44 * k)}px rgba(${COR_RGB}, ${(0.18 * k).toFixed(2)})`
}

/** `prefers-reduced-motion: reduce` actif ? (SSR-safe). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}
