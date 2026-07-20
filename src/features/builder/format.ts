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

/** Durée restante en `mm:ss` (US-023, accélérateurs). `ms ≤ 0` → `00:00`. */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const mm = Math.floor(totalSec / 60)
  const ss = totalSec % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

/**
 * Durée d'absence lisible (US-024, rattrapage hors-ligne) : `Xh YY` au-delà
 * d'une heure, sinon `Y min` (plancher 1 min pour un gain notable mais court).
 */
export function formatElapsed(ms: number): string {
  const totalMin = Math.max(1, Math.round(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`
}
