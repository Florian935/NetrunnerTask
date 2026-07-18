# Registre des décisions — Netrunner Tasks

> Une entrée par décision structurante. Consulté au démarrage des sessions
> concernées. Format des dates : JJ/MM/AAAA.

| # | Date | Décision | Contexte | Raison |
|---|------|----------|----------|--------|
| 001 | 17/07/2026 | Mise en place d'une gouvernance « dépôt = source de vérité » (Markdown versionné, cycle de vie US, portes de validation, skills). | Démarrage du projet, avant tout code applicatif. | Reconstituer l'état du projet à chaque session sans mémoire externe ; cadrer avant de coder. |
| 002 | 17/07/2026 | Stack : React + TypeScript + Vite + Tailwind + Zustand + Dexie ; app locale-first, mono-utilisateur, PWA. | Choix imposé par le cadrage initial du projet. | Simplicité locale-first, pas de backend, persistance navigateur. |
| 003 | 17/07/2026 | Convention de commit : Conventional Commits adaptée en français. | Besoin d'un format de commit homogène et lisible. | Historique clair, portée par US traçable. |
| 004 | 17/07/2026 | Design system intégré dans `design-system/` comme référence visuelle, nettoyé en version **source-only** (tokens + composants + doc ; retrait des specimens renderables et fichiers générés du canvas). | Design system fourni via Claude Design ; base non figée, ajustements à venir à l'implémentation. | Dépôt propre, sources exploitables directement ; les rendus de référence se regénèrent via Claude Design. |
| 005 | 17/07/2026 | Choix techniques US-001 : **Tailwind v4** (config CSS-first sur variables CSS), polices **auto-hébergées via @fontsource**, tokens copiés dans `src/theme/` (source unique en variables CSS, wirés à Tailwind), composants du DS portés en `.tsx` avec **CSS co-localisé** (fin de l'injection runtime), périmètre limité aux primitives génériques (composants `game/` reportés). | Init technique du projet + intégration du design system. | Hors-ligne fiable (fonts locales), rendu bundlé propre, alignement tokens↔Tailwind sans duplication, respect de la règle anti-dérapage. |
| 006 | 17/07/2026 | **Archivage des US terminées** : à la clôture d'une US (statut `fait`), son fichier de cadrage est déplacé de `us/` vers `us/archive/`, automatisé dans le skill `commit`. | Le dossier `us/` mélangeait sinon US à faire, en cours et terminées ; devenu illisible à mesure que le backlog avance. | Racine `us/` = travail vivant uniquement ; l'archive conserve la trace du cadrage sans repasser par l'historique Git. |
| 007 | 17/07/2026 | **Base visuelle des surfaces** : cartes en verre très translucides (fill `~0.10`, blur `24px`) avec halo néon en **liseré de bord** (pas de lavage de couleur), sheen + scanlines internes ; badges & chips avec **halo néon fort** coloré ; tags `#` laissés sobres. _(Remplacée par #008.)_ | Recette US-001 : le rendu par défaut du DS était trop opaque / peu « glassmorphism » ; calage de l'identité visuelle dès le socle. | Fixer les bases du look cyberpunk « écran de HUD » tout de suite, appliqué globalement (thème + référence DS) pour éviter les divergences. |
| 011 | 17/07/2026 | **US-004 : store contrats Zustand + Framer Motion** : `useContractsStore` (liste réactive au-dessus de `contractsRepo`) ; **Framer Motion** (`motion`) adopté comme bibliothèque d'animation (réordonnancement `layout`, entrée/sortie `AnimatePresence`, `MotionConfig reducedMotion="user"`), réutilisable pour les futures animations (complétion, caisses, cosmétiques) ; tri d'affichage ouverts→terminés ; suppression par **confirmation** (popup, pas d'undo). | Affichage & gestion de la liste + UX du réordonnancement. | Fondation réactive pour les écrans suivants ; animation fiable et mutualisée (auto-animate écarté). |
| 010 | 17/07/2026 | **Internationalisation FR/EN** (react-i18next) : UI bilingue, chaînes externalisées (**zéro chaîne en dur**), clés en anglais, catalogues `src/i18n/locales/{fr,en}.json`, détection navigateur + repli FR + persistance `localStorage`, sélecteur FR/EN, pluriels natifs. Fait avant US-004 (retrofit minimal). | Besoin bilingue anticipé alors que la surface d'UI est encore minime. | Éviter un retrofit transverse coûteux ; poser la règle « pas de chaîne en dur ». i18n des données (factions) reporté à US-007 ; formats de dates au moment de l'affichage. |
| 009 | 17/07/2026 | **Modèle de données MVP 1 & couche d'accès Dexie** (US-002) : entités `Contract` / `Faction` / `Player` (player singleton `id:'me'`), dates en **epoch ms**, IDs `crypto.randomUUID()`, **seeding idempotent** (factions par défaut + player), couche **`repositories/` typée** (aucun Dexie hors de `src/db/`), schéma **versionné** (`version(2)`). Code technique/tables/colonnes **en anglais**. | Première définition réelle du modèle, fondation du MVP 1. | Persistance locale fiable et extensible sans refonte ; logique métier (récompense, réputation) laissée aux US dédiées → couche « données pures ». |
| 008 | 17/07/2026 | **Remplacement complet du design system par NIGHTWIRE V3** (neon-on-void, cadres HUD biseautés, 3 polices). Remplace l'ancien DS Claude Design (#004/#005/#007 obsolètes). Kit complet porté (21 composants → `.tsx`, styles inline), tokens NIGHTWIRE = source unique, **thème clair abandonné** (dark-only), polices auto-hébergées (Space Grotesk→Rajdhani, JetBrains Mono→Share Tech Mono), icônes `lucide-react` en **registre statique** (offline, pas de CDN). | Nouveau design system extrait de Claude Design, préféré à l'ancien après arbitrage. | Direction visuelle plus aboutie ; migration peu coûteuse tant que la surface applicative est minime (une page de démo, avant le vrai HUD d'US-010). |
| 013 | 18/07/2026 | **US-005 : attributs de contrat.** Sous-tâches **embarquées** sur `Contract` (`SubTask[]`, pas de table séparée) → **Dexie v4** (rétro-remplissage `[]`). Priorité = **barres de signal** (forme, pas couleur) ; **tri** des ouverts par priorité (haute→basse) puis récence. Échéance = **signal visuel seul** (puce « EN RETARD » rouge / « BIENTÔT » amber, calcul au début de journée locale ; `<input type="date">` habillé). Sous-tâches = checklist **sans impact** sur récompense/complétion ; cochées **glissent en bas** (animé). **Surface d'édition unique** : un seul bouton « modifier » ouvre la modale de détail éditant titre + difficulté + priorité + échéance + sous-tâches (édition inline d'US-008 **supprimée**). Règles pures : `src/game/priority.ts`, `src/features/contracts/dueDate.ts`. | Enrichir le contrat en vrai gestionnaire de tâches (CDC §4) sans alourdir la création rapide. | Modèle extensible sans refonte ; UX sobre (une seule surface d'édition) ; logique isolée/testable ; frontière nette avec récurrence (US-006) et pénalités (MVP 2). |
| 012 | 17/07/2026 | **US-008 : difficulté & récompense.** Barème par difficulté (trivial 5/5 → légendaire 100/80). Nouvelle couche **`src/game/`** (règles de jeu pures : `rewards.ts`). Anti-farm par marqueur **`rewardGranted`** sur `Contract` (récompense versée **une seule fois** ; rouvrir/re-terminer ne repaie pas) → **Dexie v3** (rétro-remplissage : `done`→`true`, `open`→`false`). Nouveau **`usePlayerStore`** ; `complete()` du store contrats devient orchestrateur (renvoie la récompense ou `null`), l'**octroi au joueur + retour visuel sont câblés dans la vue**. **Frontière US-009** : US-008 accumule `xp`/`credits`, **ne dérive pas `level`**. Retour de gain = compteur **« GAINS · SESSION »** d'en-tête (cumul mémoire) **+ toast « hack réussi » + flash mint** sur la ligne. | Faire « payer » la boucle créer→terminer→récompense (US-008, chemin critique MVP 1). | Boucle de jeu enfin gratifiante ; règles de jeu isolées et testables ; anti-exploit dès l'origine ; découpage net avec la progression de niveau (US-009). |

## Détail des décisions

### 001 — Gouvernance dépôt-comme-source-de-vérité (17/07/2026)

Toute la gouvernance (rôle, cycle de vie, règles Git, suivi) vit dans des
fichiers Markdown versionnés. Voir `CLAUDE.md`.

### 002 — Stack technique (17/07/2026)

React + TypeScript + Vite + Tailwind + Zustand + Dexie. Voir `docs/architecture.md`.

### 003 — Convention de commit (17/07/2026)

Conventional Commits en français. Voir `docs/conventions.md`.

### 004 — Design system source-only (17/07/2026) — _obsolète, voir #008_

Le design system Claude Design est la référence visuelle de l'app (`design-system/`,
voir `design-system/HANDOFF.md`). Nettoyé pour ne garder que les sources
exploitables : `styles.css`, `tokens/`, `components/` (`.jsx` + `.d.ts` +
`.prompt.md`), `readme.md`. Les specimens renderables (`guidelines/`, `ui_kits/`,
`*.card.html`) et les fichiers générés (`_ds_bundle.js`, `_ds_manifest.json`,
`_adherence.oxlintrc.json`, `thumbnail.html`) ont été retirés. Base non figée :
ajustements visuels attendus à l'implémentation des maquettes.

### 005 — Choix techniques US-001 (17/07/2026) — _partiellement obsolète, voir #008_

Validés dans le cadrage d'US-001 (`us/US-001-init-technique.md`) :
- **Tailwind v4** (config CSS-first `@theme` référençant les variables CSS).
- **Polices auto-hébergées** via `@fontsource` (hors-ligne, pas de Google Fonts).
- **Tokens** copiés dans `src/theme/tokens/` : source unique en variables CSS,
  `design-system/` reste une référence et non une dépendance de build.
- **Composants** du DS portés en `.tsx` avec **CSS co-localisé** (import `.css`),
  fin du pattern d'injection runtime `injectCSS`.
- **Périmètre** limité aux primitives génériques ; composants `game/` reportés
  à leur US métier.

### 006 — Archivage des US terminées (17/07/2026)

À la clôture d'une US (statut `fait`), son fichier `us/US-XXX-*.md` est déplacé
dans `us/archive/`. La racine de `us/` ne contient donc que les US à faire ou en
cours. Ce déplacement est intégré à l'étape 2 du skill `commit` (mise à jour des
fichiers de suivi). Voir `us/README.md`.

### 007 — Base visuelle des surfaces & signaux (17/07/2026)

Calée pendant la recette d'US-001, appliquée globalement (thème `src/theme/` +
référence `design-system/`) :
- **Cartes en verre** : fill très translucide (`--glass` ≈ `rgba(...,0.10)`),
  `--glass-blur: blur(24px)`, halo en **liseré néon de bord** (drop-shadow `--_c`
  net + glows resserrés `0.30 / 0.12`), sheen en dégradé, scanlines internes
  discrètes (`mix-blend: screen`).
- **Badges & chips (StatChip)** : **halo néon fort** coloré selon le ton/kind
  (glow externe + liseré + léger glow du texte).
- **Tags `#`** : laissés sobres (principe du DS : le néon est un signal, pas une
  décoration omniprésente).

Base non figée : ajustable aux prochaines maquettes. _(Obsolète : surfaces
redéfinies par le design system NIGHTWIRE, voir #008.)_

### 008 — Remplacement du design system par NIGHTWIRE V3 (17/07/2026)

Bascule complète de l'ancien design system (Claude Design, décisions #004/#005/#007)
vers **NIGHTWIRE V3** — cyberpunk « neon-on-void » : surfaces bleu-nuit,
accents néon saturés (cyan primaire, magenta, mint, violet), cadres HUD
biseautés (`clip-path`), hachures, readouts mono, halos généreux.

Kit fourni via Claude Design (`design-system/NightwireDS_V3/extracted/`, conservé
comme référence : `readme.md`, `SKILL.md`, `tokens/`, `guidelines/`, `ui_kits/`,
`components/`).

**Ce qui change :**
- **Tokens** NIGHTWIRE (`src/theme/tokens/` : colors, typography, spacing,
  effects, base) = nouvelle source unique. Noms d'alias différents de l'ancien
  DS (`--bg-panel`, `--text-primary`, `--space-*`, `--text-md`…). Pont Tailwind
  (`src/theme/index.css`) recâblé.
- **Composants** : kit complet porté (21 primitives, `.jsx`+`.d.ts` → `.tsx`
  typés, **styles inline** — plus de CSS co-localisé), rangés par famille dans
  `src/components/ui/{core,forms,feedback,surfaces,navigation}/`.
- **Thème clair abandonné** : NIGHTWIRE V3 est dark-only (plus de `.theme-light`).
- **Polices** auto-hébergées (offline préservé) : Chakra Petch conservée,
  Space Grotesk → **Rajdhani**, JetBrains Mono → **Share Tech Mono**.
- **Icônes** : `lucide-react` en **registre statique** (`src/components/ui/core/Icon.tsx`)
  — pas de CDN, pas de chargement dynamique (qui précacherait ~1600 icônes) ;
  seules les icônes utilisées sont bundlées → précache PWA léger.

**Reporté (à reconstruire sur NIGHTWIRE dans leur US métier) :** les composants
`game/` de l'ancien export (ContractCard, RarityBadge, CosmeticCard,
FactionBadge) et la **rampe de rareté** (`--rarity-*`) — absents de NIGHTWIRE,
supprimés avec l'ancien export car bâtis sur des tokens/primitives disparus.
Voir `project/backlog.md`.

Migration effectuée sur branche `feature/migration-ds-nightwire`. Vérif :
typecheck + lint + build de production OK.

### 009 — Modèle de données MVP 1 & couche d'accès Dexie (17/07/2026)

Cadré et implémenté en US-002 (`us/US-002-modele-donnees.md`). Voir
`docs/architecture.md` § « Modèle de données » pour le détail des entités.

- **Entités** cœur MVP 1 : `Contract`, `Faction`, `Player`. Le joueur est un
  **singleton** (clé fixe `id: 'me'`).
- **Conventions de stockage** : dates en **epoch ms** (triables, indexables),
  IDs via `crypto.randomUUID()`.
- **Seeding idempotent** (`ensureSeeded()`, par test d'existence) plutôt que
  `on('populate')` — ce dernier ne se déclenche pas lors d'une montée de version
  d'une base déjà créée. Factions par défaut : Boulot, Sport, Perso, Santé,
  Apprentissage.
- **Couche `repositories/`** typée : unique point d'accès aux données, **aucun
  Dexie hors de `src/db/`**. `complete()` bascule seulement le statut — pas de
  calcul de récompense (US-008) : couche « données pures ».
- **Versioning** : `version(2)` (v1 = `demoKV`). Extensible MVP 2/3 sans perte.
- **Langue du code** : identifiants, tables et colonnes **en anglais**
  (convention actée, voir `docs/conventions.md`).

Périmètre reporté à leur US : sous-tâches & récurrence (US-005/006), récompense
(US-008), réputation/streaks/cosmétiques/caisses (MVP 2/3).

### 010 — Internationalisation FR/EN (17/07/2026)

Chantier fondation transverse (`us/i18n-fr-en.md`), fait avant US-004 pour un
retrofit minimal (une seule vue existante).

- **Techno** : `react-i18next` + `i18next-browser-languagedetector`.
- **UI bilingue** FR + EN, catalogues `src/i18n/locales/{fr,en}.json`
  (namespace par défaut, clés nichées par feature, ex. `contracts.*`).
- **Règle** : aucune chaîne d'UI en dur — tout via `t()` ; clés en anglais.
- **Langue** : détectée (`localStorage` → `navigator`), repli **FR**, choix
  persisté en `localStorage` (`nt-lang`) ; **sélecteur FR/EN** (`LanguageSwitcher`,
  en-tête de l'écran Contrats en attendant l'app-shell d'US-010).
- **Pluriels** natifs i18next (`buffer_one` / `buffer_other`).
- **Reporté** : i18n des données (noms de factions par défaut) → **US-007** ;
  formatage localisé des dates → au moment où des dates seront affichées.

L'EN est une réécriture in-world (ton netrunner), pas du mot-à-mot.

### 011 — Store contrats & Framer Motion (US-004, 17/07/2026)

- **`useContractsStore`** (Zustand) : source de vérité réactive de la liste,
  au-dessus de `contractsRepo` (chaque action mute Dexie puis l'état). Les
  écrans s'abonnent et se rafraîchissent seuls.
- **Framer Motion** (`motion`) = bibliothèque d'animation du projet. Ici :
  `ContractItem` en `motion.div` (`layout` + `initial/animate/exit`),
  `AnimatePresence` dans `ContractList`, `MotionConfig reducedMotion="user"` au
  niveau `App`. Réutilisable pour les animations à venir (« hack réussi »,
  ouverture de caisses, révélations cosmétiques). `@formkit/auto-animate` a été
  essayé puis écarté : n'animait de façon fiable que la suppression (pas
  l'ajout/déplacement) dans notre config React 19.
- **Tri d'affichage** : ouverts d'abord, puis terminés ; par date décroissante
  dans chaque groupe (cocher fait descendre, décocher remonte). Supersède le
  « reste en place » de la maquette.
- **Suppression** : confirmation par popup (modal HUD composé sur `HudPanel`),
  pas d'annulation par toast.
