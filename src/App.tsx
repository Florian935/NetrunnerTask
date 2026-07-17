import { ContractsView } from './features/contracts'

/**
 * Racine de l'app. Depuis US-003, affiche l'écran « Contrats » (création rapide).
 * La page de démonstration d'US-001 a été retirée (Zustand/Dexie/PWA validés).
 */
export default function App() {
  return <ContractsView />
}
