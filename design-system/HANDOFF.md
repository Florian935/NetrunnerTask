# Handoff développeur — Netrunner Task Design System

Guide court pour intégrer ce design system dans une nouvelle app (React + Vite/Next, ou tout HTML).

## 1. Contenu du dossier (version source-only)

Ce dossier a été nettoyé pour ne garder que ce qui sert directement au dev :

- `styles.css` — point d'entrée unique (n'importe que des `@import`)
- `tokens/` — toutes les variables CSS (couleurs, type, espacements, effets) + fonts
- `components/` — primitives React (dépendent uniquement de React + des variables CSS), chacune avec son `.d.ts` (contrat de props) et son `.prompt.md` (usage)
- `readme.md` — la charte (voice, foundations, règles)
- `assets/README.md` — note sur les assets

> Les specimens visuels renderables (`guidelines/`, `ui_kits/`, les `*.card.html`)
> et les fichiers générés par le canvas Claude Design (`_ds_bundle.js`,
> `_ds_manifest.json`, `_adherence.oxlintrc.json`, `thumbnail.html`) ont été
> retirés. Pour revoir un rendu de référence, regénérer via Claude Design.

## 2. Brancher les styles

Charge `styles.css` **une fois**, globalement. Il tire fonts + tous les tokens.

```jsx
// main.jsx / _app.tsx
import './design-system/styles.css';
```

```html
<!-- ou en HTML pur -->
<link rel="stylesheet" href="/design-system/styles.css">
```

Les fonts (Chakra Petch, Space Grotesk, JetBrains Mono) se chargent via un `@import` Google Fonts dans `tokens/fonts.css`. Pour de la prod sans requête externe, héberge les binaires et remplace cet `@import` par des `@font-face` locaux.

## 3. Thème

Sombre par défaut (`:root`). Ajoute la classe `theme-light` sur un ancêtre (souvent `<html>` ou `<body>`) pour le thème clair. Les composants suivent automatiquement via les alias sémantiques.

## 4. Utiliser un composant

Chaque dossier `components/<groupe>/<Nom>/` expose `export function <Nom>(props)`. Import direct :

```jsx
import { ContractCard } from './design-system/components/game/ContractCard.jsx';
import { Button } from './design-system/components/actions/Button.jsx';

<ContractCard
  code="NX-0042"
  title="Breach the Arasaka subnet"
  difficulty={4}
  faction={{ name: 'Voidrunners', color: 'var(--nt-violet-500)' }}
  urgent xp={120} credits={340} rep={15}
  status="active"
  onComplete={() => markDone()}
/>
```

Chaque composant a un `.d.ts` (contrat de props) et un `.prompt.md` (usage + variantes) à côté.

## 5. Règles non négociables (voir readme.md)

- Lisibilité et calme priment sur le style.
- Néon = signal uniquement (actif, urgent, série, rareté) — jamais décoratif partout.
- Cartes en verre **transparentes** (glassmorphism) : coins chanfreinés + halo néon via `drop-shadow` (pas `box-shadow`, sinon le chanfrein rogne le halo).
- Jamais de sens porté par la couleur seule (toujours + icône/label).
- Focus = toujours l'anneau teal (`--focus-ring`).
- Mono en MAJUSCULES pour labels HUD / dates / heures ; casse normale pour le contenu.
- Pas d'emoji. Respecter `prefers-reduced-motion`.

## 6. Tokens clés (référence rapide)

```
--accent            teal primaire   #25e8d6
--nt-violet-500     secondaire      #c657ff
--nt-magenta-500    alerte          #ff4d7d
--surface-glass     fond des cartes (verre translucide)
--glass-blur        backdrop-filter du verre
--focus-ring        anneau de focus teal
--radius-*, --sp-*  rayons / espacements (grille 4px)
```

Utilise toujours les alias sémantiques (`--surface-card`, `--text-body`, `--accent`…) plutôt que les valeurs brutes : ils basculent avec le thème.
