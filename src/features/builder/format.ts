// Helpers de présentation du builder (US-020) — formatage des nombres du HUD.
// Purement cosmétique (l'unité « /s » et les libellés viennent de l'i18n).

/** Groupe les milliers par espace fine insécable (ex. 12 345). */
function groupThousands(n: number): string {
  return Math.floor(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Solde de cycles lisible : entier groupé, puis K / M au-delà de 100 000. */
export function formatCycles(n: number): string {
  if (n < 100_000) return groupThousands(n)
  if (n < 1_000_000) return `${(n / 1_000).toFixed(1)} K`.replace('.', ',')
  return `${(n / 1_000_000).toFixed(2)} M`.replace('.', ',')
}

/** Débit de production (valeur nue ; l'unité « /s » est ajoutée via l'i18n). */
export function formatRate(r: number): string {
  return r % 1 === 0 ? String(r) : r.toFixed(1).replace('.', ',')
}
