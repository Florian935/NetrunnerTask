import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router'
import { router } from './app/router'

/**
 * Racine de l'app. Depuis US-010, monte le routeur (`react-router`, décision
 * #015) sous `MotionConfig` : l'app-shell et ses vues (Tableau de bord /
 * Contrats) sont rendus par le `RouterProvider`.
 * `MotionConfig reducedMotion="user"` : les animations Framer Motion respectent
 * la préférence système « réduire les animations ».
 */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
