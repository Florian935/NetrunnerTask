import { useEffect, useRef } from 'react'

/**
 * Effet « pluie de symboles » à la Matrix — brique visuelle réutilisable.
 *
 * Canvas plein écran (`position: fixed`), pensé comme **fond d'ambiance** derrière
 * le contenu. Non câblé à l'app par défaut : à monter ponctuellement pour un effet
 * « wahou » (candidat : Phase A4 corruption / voie sombre). Voir `docs/labo-visuel.md`.
 *
 * - Respecte `prefers-reduced-motion` (ne rend rien si l'utilisateur réduit les
 *   animations).
 * - `pointer-events: none` : n'intercepte jamais les clics.
 * - Tête de colonne lumineuse (halo) + traînée qui s'estompe.
 *
 * ⚠️ Ce composant n'ajuste PAS le fond des conteneurs au-dessus : pour qu'il soit
 * visible, le contenu placé par-dessus doit être (semi-)transparent.
 */
export type MatrixRainProps = {
  /** Jeu de caractères qui « pleut ». */
  chars?: string
  /** Couleur du corps de la traînée (rgba/hex). */
  bodyColor?: string
  /** Couleur de la tête de colonne (la plus lumineuse). */
  headColor?: string
  /** Couleur d'accent, tirée aléatoirement pour quelques têtes. */
  accentColor?: string
  /** Probabilité qu'une tête prenne la couleur d'accent (0–1). */
  accentChance?: number
  /** Couleur du halo autour de la tête (glow). */
  glowColor?: string
  /** Taille de police en px (définit aussi l'espacement des colonnes). */
  fontSize?: number
  /** Opacité globale du canvas (0–1). */
  opacity?: number
  /** Alpha du voile de fondu par frame : plus bas = traînées plus longues. */
  fadeAlpha?: number
  /** Couleur du voile de fondu (doit matcher le fond derrière l'effet). */
  fadeColor?: string
  /** z-index du canvas. */
  zIndex?: number
}

const DEFAULT_CHARS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ﾘｯﾌﾟΞΨΩ<>[]{}/'

export function MatrixRain({
  chars = DEFAULT_CHARS,
  bodyColor = 'rgba(139, 92, 246, 0.85)',
  headColor = 'rgba(196, 181, 253, 0.95)',
  accentColor = 'rgba(244, 114, 182, 1)',
  accentChance = 0.08,
  glowColor = 'rgba(167, 139, 250, 0.9)',
  fontSize = 16,
  opacity = 0.85,
  fadeAlpha = 0.08,
  fadeColor = '11, 6, 20',
  zIndex = 0,
}: MatrixRainProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const gap = fontSize
    let w = 0
    let h = 0
    let cols = 0
    let drops: number[] = []
    const resize = () => {
      w = cv.width = window.innerWidth
      h = cv.height = window.innerHeight
      cols = Math.floor(w / gap)
      drops = Array.from({ length: cols }, () => Math.random() * -80)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = 0
    const step = (t: number) => {
      raf = requestAnimationFrame(step)
      if (t - last < 55) return
      last = t
      ctx.fillStyle = `rgba(${fadeColor}, ${fadeAlpha})`
      ctx.fillRect(0, 0, w, h)
      ctx.font = `bold ${fontSize}px monospace`
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * gap
        // Tête de colonne : lumineuse + halo.
        ctx.shadowColor = glowColor
        ctx.shadowBlur = 8
        ctx.fillStyle = Math.random() < accentChance ? accentColor : headColor
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * gap, y)
        // Caractère précédent (corps de traînée), sans halo.
        ctx.shadowBlur = 0
        ctx.fillStyle = bodyColor
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * gap, y - gap)
        if (y > h && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [
    chars,
    bodyColor,
    headColor,
    accentColor,
    accentChance,
    glowColor,
    fontSize,
    fadeAlpha,
    fadeColor,
  ])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex, opacity, pointerEvents: 'none' }}
    />
  )
}
