/**
 * Insigne de rang (US-012) — 5 crans biseautés ; le rang atteint remplit
 * `rankIndex + 1` crans (INCONNU = 1 … LÉGENDE = 5), teintés de la couleur de la
 * faction, le reste en gris. Purement décoratif.
 */
export function RankInsignia({
  rankIndex,
  color,
  height = 12,
}: {
  rankIndex: number
  color: string
  height?: number
}) {
  return (
    <span
      aria-hidden
      style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i <= rankIndex
        return (
          <i
            key={i}
            style={{
              width: 4,
              height,
              background: filled ? color : 'rgba(139,155,180,.20)',
              boxShadow: filled
                ? `0 0 5px color-mix(in srgb, ${color} 70%, transparent)`
                : 'none',
              transform: 'skewX(-16deg)',
            }}
          />
        )
      })}
    </span>
  )
}
