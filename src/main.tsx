import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/fonts'
import './theme/index.css'
import './i18n'
import App from './App'
import {
  builderRepo,
  contractsRepo,
  cosmeticsRepo,
  ensureSeeded,
  factionsRepo,
  playerRepo,
} from './db'
import { bootCosmeticTheme } from './features/cosmetics/theme'
import { bootCorruption } from './features/corruption/corruptionTheme'

/**
 * Prépare les données locales (factions par défaut + joueur) avant le rendu,
 * puis monte l'app. En dev, expose les repositories sur `window` pour piloter
 * la recette de la couche de données en console (temporaire, US-002).
 */
async function bootstrap(): Promise<void> {
  // US-031 : applique le thème cosmétique mémorisé avant tout rendu (anti-FOUC).
  bootCosmeticTheme()
  // US-036 : idem pour l'état de corruption (le HUD corrompu ne doit pas flasher).
  bootCorruption()

  await ensureSeeded()

  if (import.meta.env.DEV) {
    Object.assign(window, {
      contractsRepo,
      factionsRepo,
      playerRepo,
      builderRepo,
      cosmeticsRepo,
    })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
