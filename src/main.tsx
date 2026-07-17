import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/fonts'
import './theme/index.css'
import './i18n'
import App from './App'
import { contractsRepo, ensureSeeded, factionsRepo, playerRepo } from './db'

/**
 * Prépare les données locales (factions par défaut + joueur) avant le rendu,
 * puis monte l'app. En dev, expose les repositories sur `window` pour piloter
 * la recette de la couche de données en console (temporaire, US-002).
 */
async function bootstrap(): Promise<void> {
  await ensureSeeded()

  if (import.meta.env.DEV) {
    Object.assign(window, { contractsRepo, factionsRepo, playerRepo })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
