import { createBrowserRouter, Navigate } from 'react-router'
import { ContractsView } from '../features/contracts'
import { DashboardView } from '../features/dashboard'
import { AppShell } from './AppShell'

/**
 * Routeur de l'app (US-010, décision #015). Layout `AppShell` (chrome permanent)
 * avec vues filles : Tableau de bord (`/`, point d'entrée) et Contrats
 * (`/contracts`). Toute route inconnue redirige vers le tableau de bord.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardView /> },
      { path: 'contracts', element: <ContractsView /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
