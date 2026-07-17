# US-001 — Initialisation technique + design system

- **MVP :** 1
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-001-init-technique
- **Clôturée le :** 17/07/2026 — recette 8/8 (voir `project/recettes.md`)

## 1. Cadrage fonctionnel  _(porte de validation)_

### Quoi

Mettre en place le socle technique de l'application et y intégrer le design
system, de sorte que l'app démarre, s'affiche au thème cyberpunk, persiste des
données en local et soit installable en PWA. Aucune fonctionnalité métier
(contrats, XP…) n'est développée ici : c'est la fondation sur laquelle les US
suivantes s'appuieront.

Concrètement, cette US doit livrer :
- Le projet initialisé : React + TypeScript + Vite, Tailwind, Zustand, Dexie, PWA.
- Le design system branché : tokens (couleurs, typo, espacements, effets)
  disponibles dans l'app + configurés côté Tailwind, et les composants du DS
  réimplémentés en React/TypeScript à partir de `design-system/` (aujourd'hui en
  `.jsx`) pour être utilisables dans le code applicatif.
- Un écran de démonstration jetable (page d'accueil « SYS·OK ») prouvant que le
  thème, au moins un composant du DS et la persistance fonctionnent.

### Pour qui

- **Le développeur / chef de projet** (nous) : disposer d'un socle propre,
  typé et conventionné pour construire les US métier sans friction.
- **L'utilisateur final** (indirectement) : garantir dès le départ une app
  installable, hors-ligne, au thème immersif, rapide à démarrer.

### Critères d'acceptation (action → résultat attendu)

1. **Démarrage dev** — lancer la commande de dev (`npm run dev`) → l'app se
   lance sans erreur et affiche la page d'accueil de démonstration.
2. **Thème du design system** — ouvrir la page d'accueil → le fond, les couleurs
   néon, la typographie (Chakra Petch / Space Grotesk / JetBrains Mono) et le
   thème sombre par défaut du design system sont appliqués.
3. **Composant DS en React/TS** — la page affiche au moins un composant issu du
   design system (ex. `GlassCard` + `Button`) réimplémenté en React/TypeScript,
   au rendu conforme (verre translucide, halo néon, focus teal).
4. **État Zustand** — une valeur d'état gérée par un store Zustand est affichée
   et modifiable via une interaction de démonstration → la valeur se met à jour
   à l'écran.
5. **Persistance Dexie** — écrire une valeur de test dans la base Dexie, puis
   recharger la page (F5) → la valeur écrite est toujours présente après
   rechargement.
6. **PWA installable & hors-ligne** — après un build servi, l'app propose
   l'installation (manifest valide + service worker enregistré) et, une fois
   chargée, reste consultable sans réseau.
7. **Build de production** — lancer le build (`npm run build`) → il réussit sans
   erreur.
8. **Qualité TypeScript** — la vérification de types (mode strict) passe sans
   erreur (`tsc --noEmit` ou équivalent), et le lint configuré passe.

### Note design (étape 5 du cycle de vie)

L'US n'introduit **pas** de nouvel écran métier à maquetter : elle intègre un
design system déjà fourni et livre seulement une page de démonstration jetable.
→ **Je propose de sauter l'étape « Design / maquette Claude Design » pour US-001.**
À confirmer par toi.

## 2. Cadrage technique  _(porte de validation)_

### 2.1 Dépendances & outillage

- **Base :** Vite + React 18 + TypeScript (template `react-ts`), TypeScript en
  mode **strict**.
- **Styles :** Tailwind CSS + le design system (tokens CSS).
- **État :** Zustand.
- **Persistance :** Dexie (IndexedDB).
- **PWA :** `vite-plugin-pwa` (Workbox, `registerType: autoUpdate`, précache du
  shell pour le hors-ligne, manifest).
- **Polices :** `@fontsource/chakra-petch`, `@fontsource/space-grotesk`,
  `@fontsource/jetbrains-mono` (auto-hébergées → fonctionnent hors-ligne, pas de
  requête Google Fonts).
- **Qualité :** ESLint (template) + Prettier + `tsc --noEmit`.
- Pas de framework de test dans cette US (recette manuelle) — Vitest sera ajouté
  quand une première logique métier le justifiera (prévu US-008, calcul de
  récompense).

### 2.2 Arborescence cible `src/`

```
src/
  main.tsx                 # bootstrap React + import du thème + enregistrement PWA
  App.tsx                  # page de démonstration jetable (SYS·OK)
  theme/
    tokens/                # tokens copiés/adaptés depuis design-system/tokens
      colors.css
      typography.css
      spacing.css
      effects.css
      fonts.css            # remplace l'@import Google par les @fontsource
    index.css              # importe les tokens + styles de base (reset, body, fond ambiant)
  components/
    ui/                    # composants du DS réimplémentés en React/TS
      GlassCard/GlassCard.tsx (+ GlassCard.css)
      Button/Button.tsx (+ Button.css)
      ...                  # (périmètre exact : voir 2.4)
    styleUtil.ts           # conservé si on garde l'injection, sinon supprimé (voir 2.5)
  stores/
    useDemoStore.ts        # store Zustand de démonstration (jetable)
  db/
    db.ts                  # instance Dexie + table minimale de démo (jetable)
  vite-env.d.ts
```

Fichiers de config à la racine : `vite.config.ts` (React + PWA), `tailwind.config.js`,
`postcss.config.js`, `tsconfig.json` (strict), `.eslintrc` / `eslint.config.js`,
`.prettierrc`, `index.html`, `public/` (icônes PWA), `.gitattributes` (fins de
ligne), mise à jour du `.gitignore` (`node_modules`, `dist`).

### 2.3 Intégration des tokens ↔ Tailwind

- Les tokens du design system (`design-system/tokens/`) sont **copiés** dans
  `src/theme/tokens/` (le dossier `design-system/` reste la référence, pas une
  dépendance de build).
- `src/theme/index.css` importe les tokens ; il est importé une seule fois dans
  `main.tsx`.
- Tailwind est configuré pour **référencer les variables CSS** des tokens dans
  son thème (ex. `colors.accent = 'var(--accent)'`, familles de polices, rayons,
  espacements). On ne duplique pas les valeurs : les tokens CSS restent la source
  unique, Tailwind expose des utilitaires par-dessus.
- Thème sombre par défaut (`:root`), classe `theme-light` pour le clair (conforme
  au DS).

### 2.4 Réimplémentation des composants du DS (périmètre)

Les composants du DS sont en `.jsx` avec un contrat `.d.ts`. On les porte en
`.tsx` typés, mêmes noms de classes CSS et mêmes tokens (rendu identique).

**Proposé pour US-001 — les primitives génériques uniquement :**
`surfaces/GlassCard`, `actions/Button`, `actions/IconButton`,
`forms/TextField`, `forms/Checkbox`, `forms/QuickAddBar`,
`data/ProgressBar`, `data/StatChip`, `feedback/Badge`, `feedback/Tag`.

**Reportés à leur US métier** (car leurs props dépendent du modèle de données) :
les composants `game/` — `ContractCard` (→ US-004), `FactionBadge` (→ US-007),
`RarityBadge` et `CosmeticCard` (→ MVP 2). Cela respecte la règle anti-dérapage
(§8 de `CLAUDE.md`).

### 2.5 Stratégie CSS des composants

Les composants du DS injectent leur CSS au runtime via `injectCSS`. **Proposé :**
remplacer ce pattern par des **fichiers `.css` co-localisés** importés par le
composant (`import './Button.css'`) — Vite les intègre au bundle, pas
d'injection runtime, meilleur rendu initial et compatibilité PWA. Classes et
tokens identiques. `styleUtil` est alors supprimé.

### 2.6 État & persistance (démo jetable)

- **Zustand** (`useDemoStore`) : un état de démonstration (ex. compteur ou
  statut système) affiché et modifiable → prouve la réactivité (critère 4).
- **Dexie** (`db.ts`) : une table minimale de démo (ex. `demoKV { key, value }`).
  La page écrit une valeur au clic et la relit au chargement → prouve la
  persistance après F5 (critère 5).
- ⚠️ Ces éléments sont **jetables** : le vrai modèle de données (contrats,
  factions, joueur) est l'objet d'**US-002**. On ne le conçoit pas ici.

### 2.7 PWA

- `vite-plugin-pwa` : manifest (nom, thème couleur bordeaux/néon, icônes
  `public/`), service worker Workbox précachant le shell applicatif.
- Critère 6 : après `build` + service statique, l'app est installable et
  consultable hors-ligne.

### 2.8 Impacts modèle de données

Aucun modèle métier introduit dans cette US (juste une table Dexie de démo
jetable). Le modèle de données réel est cadré en **US-002**.

### 2.9 Décisions techniques — **validées le 17/07/2026**

1. **Tailwind v4** (config CSS-first `@theme`, alignée sur des tokens en
   variables CSS). ✅
2. **Polices auto-hébergées** via `@fontsource` (hors-ligne). ✅
3. **Périmètre composants** : primitives génériques maintenant, `game/` reporté
   à leur US métier (voir 2.4). ✅
4. **CSS co-localisé** (import `.css` par composant) au lieu de l'injection
   runtime (voir 2.5). ✅

## 3. Design  _(porte de validation, si impact UI significatif)_

**Non applicable pour US-001** — validé avec toi le 17/07/2026. L'US intègre un
design system déjà fourni et ne livre qu'une page de démonstration jetable ;
aucun écran métier à maquetter.

## 4. Plan d'implémentation  _(porte de validation)_

Étapes concrètes, dans l'ordre. Chaque étape référence les critères d'acceptation
(C1–C8) qu'elle sert.

1. **Scaffolding Vite + React + TS**
   - Générer un template `react-ts` dans un dossier temporaire, puis intégrer ses
     fichiers à la racine (`package.json`, `index.html`, `src/`, `tsconfig*.json`,
     `vite.config.ts`) **sans toucher** à `docs/`, `project/`, `us/`,
     `design-system/`, `CLAUDE.md`, `.claude/`.
   - Activer TypeScript **strict** dans `tsconfig`. → C7, C8

2. **Dépendances**
   - `tailwindcss` v4 + `@tailwindcss/vite`, `zustand`, `dexie`,
     `vite-plugin-pwa`, `@fontsource/chakra-petch`, `@fontsource/space-grotesk`,
     `@fontsource/jetbrains-mono`, `prettier`.

3. **Configuration**
   - `vite.config.ts` : plugins React + Tailwind v4 + `VitePWA`
     (`registerType: 'autoUpdate'`, manifest, précache du shell). → C6
   - `tailwind.config`/CSS `@theme` référençant les variables CSS des tokens.
   - `.prettierrc`, ESLint du template, `.gitattributes` (normalisation LF),
     `.gitignore` (`node_modules`, `dist`). → C8

4. **Thème (tokens)**
   - Copier `design-system/tokens/{colors,typography,spacing,effects}.css` dans
     `src/theme/tokens/`.
   - Créer `src/theme/tokens/fonts.css` avec les imports `@fontsource` (remplace
     l'`@import` Google). → C2
   - `src/theme/index.css` : import des tokens + styles de base (reset, `body`,
     fond ambiant néon + scanlines, thème sombre par défaut).
   - Importer `src/theme/index.css` dans `main.tsx`. → C2

5. **Portage des primitives du DS en `.tsx` + CSS co-localisé**
   - `GlassCard`, `Button`, `IconButton`, `TextField`, `Checkbox`, `QuickAddBar`,
     `ProgressBar`, `StatChip`, `Badge`, `Tag`.
   - Pour chacun : `Composant.tsx` (props typées d'après le `.d.ts` du DS) +
     `Composant.css` (extrait du CSS d'origine, mêmes classes/tokens). → C3

6. **État & persistance (démo jetable)**
   - `src/stores/useDemoStore.ts` (Zustand) : état de démo réactif. → C4
   - `src/db/db.ts` (Dexie) : table `demoKV { key, value }` + helpers lire/écrire. → C5

7. **Page de démonstration `App.tsx` (SYS·OK)**
   - Compose le thème + `GlassCard` + `Button` + un `StatChip`/`ProgressBar`,
     une interaction Zustand (C4) et un test d'écriture/lecture Dexie persistant
     après rechargement (C5). Écran jetable, remplacé dès US-002/US-010.

8. **Assets PWA**
   - Icônes dans `public/`, manifest (nom « Netrunner Tasks », couleurs charte),
     vérifier l'enregistrement du service worker. → C6

9. **Vérification (prépare la recette, étape 8 du cycle)**
   - `npm run dev` (C1), `npm run build` (C7), `tsc --noEmit` + lint (C8),
     test PWA hors-ligne sur le build servi (C6), persistance après F5 (C5).

10. **Recette puis commit** via les skills `recette` puis `commit`
    (revue, mise à jour du suivi, commit conventionnel, push, merge sur
    `develop`, push `develop`).

### Note de périmètre

Aucune logique métier (contrats, XP, factions…) n'est implémentée. Tout élément
métier repéré en cours de route part au `backlog.md`, pas dans cette US.
