# Recettes — Netrunner Tasks

> Tests de recette par US. Chaque test reprend un critère d'acceptation de l'US.
> Statuts : `à faire` / `validé` / `échoué`.

## US-001 — Initialisation technique + design system

Recette du 17/07/2026. Vérifs automatiques (dev/build/tsc/lint/PWA) + recette
visuelle navigateur confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | `npm run dev` → l'app démarre et affiche la page de démo | validé | 17/07/2026 |
| C2 | Thème du DS appliqué (néons, polices Chakra/Space/JetBrains, dark par défaut) + bascule thème clair | validé | 17/07/2026 |
| C3 | Composants DS en React/TS au rendu conforme (verre translucide, halo néon, focus teal) | validé | 17/07/2026 |
| C4 | Interaction Zustand → la valeur d'état se met à jour à l'écran | validé | 17/07/2026 |
| C5 | Valeur écrite dans Dexie → présente après rechargement (F5) | validé | 17/07/2026 |
| C6 | PWA installable (manifest valide + service worker) et consultable hors-ligne | validé | 17/07/2026 |
| C7 | `npm run build` réussit | validé | 17/07/2026 |
| C8 | TypeScript strict + lint passent sans erreur | validé | 17/07/2026 |

### Ajustements visuels issus de la recette (résolus dans l'US)

- **Cartes en verre trop opaques** → fill rendu très translucide (`0.28 → 0.10`),
  blur renforcé (`24px`), halo repensé en **liseré néon net** (le glow diffus
  coloriait l'intérieur), sheen + scanlines internes. Validé PO.
- **Badges & chips (StatChip)** → ajout d'un **halo néon fort** coloré selon le
  ton/kind. Validé PO. Tags `#` de catégorie laissés sobres (néon = signal).
- Ajustements portés dans le thème live (`src/theme/`) **et** synchronisés dans
  la référence `design-system/`.

**Verdict : recette US-001 validée (8/8 critères).**
