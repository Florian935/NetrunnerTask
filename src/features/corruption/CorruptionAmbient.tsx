import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { Interference } from './Interference'

/**
 * Ambiance de corruption **plein écran** (US-036) — montée dans `AppShell` quand
 * la corruption est **embrassée**. Un overlay fixe, `pointer-events: none`, qui
 * « scanne » tout le fond de l'app en magenta (scanlines renforcées + grain +
 * barre de scan verticale + vignette) : la voie sombre se sent partout, pas
 * seulement dans la palette. Neutralisé en `prefers-reduced-motion` (Interference
 * garde alors un rendu statique lisible). Sous les toasts/modales (z 1000+) et le
 * reveal (z 80), au-dessus du contenu.
 */
export function CorruptionAmbient() {
  const embraced = useCosmeticsStore((s) => s.corruption === 'embraced')
  if (!embraced) return null
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none', overflow: 'hidden' }}>
      <Interference level={0.4} animated blocks />
    </div>
  )
}
