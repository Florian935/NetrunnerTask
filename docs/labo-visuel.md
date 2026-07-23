# Labo visuel — briques d'effets réutilisables

> Carnet des effets visuels « wahou » prototypés hors périmètre d'une US, gardés
> pour un usage futur. Chaque entrée = une brique de code câblable au besoin,
> **non montée** dans l'app par défaut. On ne les branche que dans l'US qui les
> consomme (respect de la règle de périmètre, CLAUDE.md §8).

## Pluie de symboles « Matrix »

**Fichier** : [`src/components/effects/MatrixRain.tsx`](../src/components/effects/MatrixRain.tsx)
**Prototypé le** : 24/07/2026 (essai jetable sur `feature/US-037-voie-corrompue`, validé « stylé » par le PO, puis dé-câblé de l'app).

### Ce que c'est

Fond d'ambiance plein écran : des colonnes de katakana/chiffres/symboles qui
tombent, tête de colonne lumineuse (halo) et traînée qui s'estompe. Canvas
`position: fixed`, `pointer-events: none`, respecte `prefers-reduced-motion`.
Entièrement paramétrable (couleurs, caractères, taille, opacité, longueur des
traînées) via ses props — voir `MatrixRainProps`.

### Usages candidats

- **Corruption / voie sombre (Phase A4)** — fond glitch pendant la séquence
  d'éveil ou tant que la voie corrompue est embrassée (palette magenta/violet
  déjà cohérente avec `--crate-blackice-chroma-rgb`).
- Tout futur moment « wahou » (P9) : reveal, renaissance, écran spécial.

### Comment le câbler (rappel)

```tsx
import { MatrixRain } from '@/components/effects/MatrixRain'

// Monté en tête d'un conteneur, DERRIÈRE le contenu (zIndex 0 par défaut).
<MatrixRain />
```

⚠️ **Piège vécu au proto** : le composant ne touche pas au fond des conteneurs
au-dessus. Les fonds opaques de l'app (`.app-shell` → `--void-900`, `.nav-main`
→ `#141a29`) masquent le canvas. Pour le voir, il faut que le contenu par-dessus
soit **(semi-)transparent** sur la zone où l'on veut l'effet. Lors du proto, on
avait rendu ces deux fonds semi-transparents via un `<style>` d'override — hack
acceptable pour un fond global, à repenser proprement selon la surface ciblée
(ex. n'appliquer l'effet que sur un écran/panneau dédié plutôt que tout le shell).

### Réglages retenus au proto (rendu jugé bon)

- `fontSize: 16`, `bold`, `opacity: 0.85`
- Corps `rgba(139, 92, 246, 0.85)` (violet), tête `rgba(196, 181, 253, 0.95)`,
  accent `rgba(244, 114, 182, 1)` (rose, ~8 % des têtes), halo violet.
- `fadeAlpha: 0.08` (traînées longues), throttle ~55 ms/frame.

Ce sont les valeurs par défaut du composant.
