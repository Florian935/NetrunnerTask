import { MotionConfig } from 'motion/react'
import { ContractsView } from './features/contracts'

/**
 * Racine de l'app. Depuis US-003, affiche l'écran « Contrats ».
 * `MotionConfig reducedMotion="user"` : les animations Framer Motion respectent
 * la préférence système « réduire les animations ».
 */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ContractsView />
    </MotionConfig>
  )
}
