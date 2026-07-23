import { useEffect, useState } from 'react'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { CorruptionRevealOverlay } from './CorruptionRevealOverlay'

/**
 * Hôte du reveal de corruption (US-036), monté dans `AppShell`. Ouvre l'overlay
 * dès que le pacte est **armé** (`corruption === 'offered'`) et le **verrouille
 * ouvert** (état local) : un choix fait passer le store à `embraced`/`refused`,
 * mais l'overlay reste monté pour jouer l'issue jusqu'à « Continuer » (`onClose`).
 * Ne se ré-ouvre qu'à un nouvel armement (nouvelle renaissance après refus).
 */
export function CorruptionRevealHost() {
  const corruption = useCosmeticsStore((s) => s.corruption)
  const loaded = useCosmeticsStore((s) => s.loaded)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (loaded && corruption === 'offered') setOpen(true)
  }, [loaded, corruption])

  if (!open) return null
  return <CorruptionRevealOverlay onClose={() => setOpen(false)} />
}
