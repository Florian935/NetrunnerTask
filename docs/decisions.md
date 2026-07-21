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

### 014 — Outillage de test : Vitest (US-009, 18/07/2026)

- **Vitest** = framework de test unitaire du projet (premier test du dépôt).
  Config dédiée `vitest.config.ts` (environnement `node`, `include:
  src/**/*.test.ts`), sans les plugins de build (React/Tailwind/PWA).
- **Scripts** : `npm test` (`vitest run`, one-shot CI) et `npm run test:watch`.
- **Cible prioritaire** : la couche `src/game/` (logique de jeu pure —
  progression, priorité, récompenses), la plus rentable à tester unitairement.
  Premier jeu de tests : `src/game/progression.test.ts` (courbe XP → niveau).
- **Convention** : fichier de test à côté de la source (`*.test.ts`).

### 015 — Routeur & app-shell (US-010, 18/07/2026)

- **`react-router` v7** = routeur de l'app. Choix assumé (et non une bascule de
  vue ad hoc) en prévision des **nombreux écrans à venir** (progression,
  inventaire, caisses, profil — CDC §8).
- **App-shell** (`src/app/AppShell.tsx`) : chrome permanent = **rail de
  navigation** (barre inférieure sur mobile) + **barre de statut** (indicateur de
  niveau compact + gains de session + langue) + `<Outlet/>`. Route de layout avec
  filles `index` → **Tableau de bord** (`/`) et `/contracts` → **Contrats**.
- **Point d'entrée** : `/` = Tableau de bord (HUD).
- **Couche feedback partagée** : toasts, gains de session, toast de palier et
  flash sortent de `ContractsView` vers `useFeedbackStore` (Zustand) + hook
  `useCompleteContract`, hébergés par l'app-shell → mêmes retours depuis le HUD
  et la liste, sans duplication.
- **PWA** : `workbox.navigateFallback: 'index.html'` pour les liens profonds
  (`/contracts`) hors-ligne et au rechargement.
- **Sans impact modèle de données** : le HUD et l'app-shell sont des vues
  dérivées de l'état existant (contrats + joueur).

### 016 — Factions & filtrage (US-007, 18/07/2026)

- **Sans impact modèle de données / aucune migration Dexie** (reste **v5**) : le
  socle faction existait déjà et inexploité côté UI — `Contract.factionId` +
  **index `factionId` depuis v2**, `factionsRepo` (CRUD), `CreateContractInput.
  factionId` / `ContractFilter.factionId`, 5 factions semées. US-007 = couche UI
  + un store + i18n.
- **Libellés des factions « système » via clé i18n** mappée sur le `name` stocké
  (`factionLabel` + `DEFAULT_FACTION_KEYS`, `Boulot→work`, …). Le `name` en base
  est un **identifiant interne** (jamais affiché tel quel) ; repli sur `name` pour
  une faction hors table. Solde le report i18n des noms de factions.
- **Pas de CRUD faction utilisateur en MVP 1** : on s'appuie sur les 5 factions
  par défaut (`useFactionsStore` chargé une fois au montage dans l'app-shell).
- **Faction réglée dans la surface de détail** (comme priorité/échéance, US-005),
  optionnelle (« Aucune ») ; création rapide (2 s) inchangée.
- **Filtre de faction mono-sélection, en mémoire, non persisté** (`FactionFilterBar`
  + état local de `ContractsView`) : `Toutes` / une faction / `Sans faction`.
  Non destructif, appliqué avant le tri (US-005). Compteur d'en-tête et état vide
  restent **globaux**. Multi-sélection et persistance : hors périmètre.
- **`FactionBadge` reconstruit sur NIGHTWIRE** (retiré à la migration DS, #008) :
  composant autonome (résout la faction via le store), badge = pastille couleur +
  libellé mono, en tête de la rangée méta.

### 017 — Fond signature & cartes de contrat HUD à halo (exploration, 18/07/2026)

- **Hors cycle US** : chantier d'exploration visuelle avant MVP 2 (branche
  `test/fonds-halos`), validé PO en itération live puis **figé** dans le produit.
  L'outillage d'exploration (labo `/labo`, sélecteur de fond, `useBgLab`, 8 fonds
  candidats + overlays) a été **retiré** au moment de figer — seul le choix
  retenu subsiste.
- **Fond signature** (zone de contenu `.nav-main`) : **navy `#141a29` +
  quadrillage** (carrés de 28 px et lignes horizontales fines tous les 4 px, tous
  les traits au même style, opacité 0.016) surmonté de **4 halos néon d'angle**
  (haut-gauche cyan · bas-gauche violet · haut-droite magenta · bas-droite menthe,
  tailles/intensités inégales). Rendu 100 % CSS (couche `::before`, `z-index:-1`,
  `isolation:isolate`) — pas d'image, PWA/hors-ligne préservés.
- **Diagnostic des « divergences » maquettes** : le design system était **fidèle
  mais sous-exploité** — surfaces riches (`Card`/`StatCard`/`HudPanel`) jamais
  branchées, halo systématiquement « au survol » au lieu de « au repos renforcé
  au survol », variant `primary` (bouton plein) utilisé sur **aucun** écran.
- **`<Card>` enrichie (réutilisable)** : prop **`halo`** (fond teinté + lueur au
  repos, intensifiés au survol ; classe `.nw-card-halo`, `./card.css`) et prop
  **`brackets`** (2 repères d'angle blancs en diagonale, coins non biseautés du
  chanfrein `hud`). `CardAccent` accepte désormais `red`.
- **Lignes de contrat** (`ContractItem`) : surface **HUD** (coins biseautés
  `clip-bevel-sm`) à **halo permanent** dont la couleur = **accent de difficulté**
  (`--ctr-halo`, muté en gris si terminé) + **2 brackets** ; survol qui intensifie
  bordure/lueur + liseré interne. Le flash « hack réussi » (mint) prime toujours.
  Fond/bordure/lueur pilotés en CSS (pas d'inline) — Framer Motion `layout` ne
  nettoie pas les clés de style disparues.
- **À suivre (backlog MVP 2)** : adoption de `StatCard`/`HudPanel` sur le tableau
  de bord ; réserver le bouton plein `primary` à un CTA « héros ».

### 018 — Contrats permanents & streaks (US-011, 19/07/2026)

- **Le streak est une propriété des contrats récurrents** (US-006), pas un
  nouveau type (H1) : tout contrat avec une `recurrence` devient une habitude
  suivie ; un one-shot n'a pas de série.
- **Règle de série** (`game/streak.ts`, pur, testé **11/11**) : complétion **à
  temps** → `currentStreak + 1` ; complétion **en retard** → repart à `1` ;
  `bestStreak = max(...)` **ne diminue jamais**. « À temps »/« manqué » comparés
  au **jour local** (l'échéance est à minuit, cohérent avec `recurrence.ts`).
- **Remise à zéro** d'une période manquée détectée **au chargement** (`load()`,
  récurrent `open` dont l'échéance est dépassée), **en plus** de la réactivation
  des récurrents `done` échus (cas exclusifs). Écriture idempotente (seulement si
  la valeur change).
- **Anti-double garanti par construction** : le verrou « récurrent validé »
  (US-006) empêche une seconde complétion dans le même cycle → une seule
  incrémentation par période (pas de champ « déjà compté »).
- **Récompenses inchangées** (H5) : US-011 ne fait que suivre + afficher. Les
  **conséquences** de la série (réputation gagnée/perdue, paliers) = **US-012**.
- **Modèle** : `currentStreak` / `bestStreak` sur `Contract`, **migration Dexie
  v6** (backfill à `0`, pas d'index nouveau — patron v3/v4/v5).
- **UI sans maquette** (alignée sur l'existant) : puce `StreakChip` (icône Lucide
  `flame`, ambre si série active) sur la ligne des récurrents + bloc « Série /
  Record » dans la surface de détail. i18n `contracts.streak.*` FR/EN.

### 019 — Réputation par faction (US-012, 19/07/2026)

- **Réputation = champ par faction** (`Faction.reputation`, entier **plancher 0**),
  **migration Dexie v7** (backfill `0`). Le **rang** est **dérivé par seuils**
  (règle pure, pas de stockage) — modèle analogue au niveau depuis l'XP (US-009).
- **Règle pure `game/reputation.ts`** (testée **10/10**) : barème de gain par
  difficulté **`1/2/4/7/12`** ; 5 rangs **`unknown 0 · contact 25 · associate 75 ·
  fixer 200 · legend 500`** (`rankForReputation`) ; `reputationProgress` (barre =
  `courant / seuil suivant` depuis 0, comme la maquette) ; `applyReputationDelta`
  = `max(0, …)` (plancher, sert au gain **et** à la perte).
- **Gain** à la **complétion payante** d'un contrat rattaché à une faction
  (`useCompleteContract` → `useFactionsStore.grantReputation`), une fois par
  one-shot / **par occurrence** d'un récurrent. **Perte** = malus égal au gain,
  appliquée au **`load()`** quand un streak d'habitude rattaché casse (US-011),
  **silencieuse**, agrégée par faction, plancher 0.
- **Séquencement `AppShell`** : **contrats chargés avant factions** (les pénalités
  sont écrites en base pendant `loadContracts` avant la lecture de la réputation).
- **Paliers = statut/identité, aucun avantage fonctionnel** (contrainte roadmap).
- **UI (maquette `docs/maquettes/US-012/`, validée PO)** : panneau `ReputationPanel`
  (`HudPanel`) sur le tableau de bord — ligne/faction = pastille + nom + **insigne
  5 crans** (`RankInsignia`) + rang + **barre teintée** ; **LÉGENDE** = couronne +
  RANG MAX. **Rétroactions** : `ReputationGainToast` (teinté faction, `avant→après`,
  ~2,6 s) et `RankUpToast` (passage de rang, `shield-check`, glow pulsé teinté via
  `--rank-c`, ~4 s). Icônes `crown` + `shield-check`. i18n `reputation.*` FR/EN.
- **Ajustement PO** : barres **en cours** en **dégradé de teinte** (couleur voisine
  → couleur faction), **local au panneau** (composant `ProgressBar` partagé
  **inchangé**). LÉGENDE reste plein + hachuré.

### 020 — Contrats à risque (US-013, 19/07/2026)

- **Mise = deux champs par contrat** (`Contract.stake` entier + `stakeOutcome`
  `none|pending|won|lost`), **migration Dexie v8** (backfill `0` / `none`).
  Invariant : `stake > 0 ⇔ stakeOutcome ≠ 'none'` ; crédits « en jeu » stockés
  **uniquement** dans le `stake` d'un contrat `pending` (débit à la pose).
- **Règle pure `game/risk.ts`** (testée **14/14**) : bonus **indexé sur la
  difficulté** (multiplicateurs **`1,5 / 2 / 2,5 / 3 / 4`**), `stakePayout` =
  `round(mise × mult)` ; `isStakeEligible` (**one-shot** + échéance + ouvert) ;
  `isStakeLost` (`pending` + ouvert + **jour d'échéance strictement passé** — le
  jour même reste gagnable, aligné sur `isOnTime` US-006).
- **Décisions gameplay (validées PO)** : **débit immédiat** à la pose ; mise
  réservée aux **one-shot à échéance** ; **plafond = solde disponible** (pas de cap
  distinct) ; **perte = aucun mouvement de crédit** (déjà débité), constatée au
  **`load()`** ; **résolu (`won`/`lost`) = figé** (rouvrir ne relance rien) ; pose
  sur **confirmation** explicite (bouton « Miser »).
- **Crédits** : `usePlayerStore.adjustCredits(delta)` (**plancher 0**, jamais
  négatif), réutilisé pour débit/remboursement/gain. Orchestration :
  `useContractsStore.setStake` (validation ≤ solde, remboursement + débit) ;
  **remboursement** à la suppression, au **retrait d'échéance** et à l'**ajout de
  récurrence** d'une mise en jeu (garde l'invariant « pending ⇒ one-shot éligible ») ;
  `settleStakeOnComplete` (gain si à temps / perte sinon) appelé à **toute**
  complétion dans `useCompleteContract` (même sans récompense de base, ex. contrat
  rouvert re-misé) ; perte au `load()` collectée → toasts via `AppShell`.
- **UI (maquette `docs/maquettes/US-013/`, validée PO)** : `StakeControl` (4 états —
  inéligible / saisie avec aperçu **Mise → Retour → Gain net** / gagné / perdu) dans
  le détail ; `StakeChip` sur la ligne (en jeu **ambre** / gagné **menthe** / perdu
  **rouge**, exclusif du `StreakChip`) ; toasts « mise réussie » / « mise perdue ».
  i18n `contracts.stake.*` FR/EN. 5 icônes ajoutées au registre (`arrow-right`,
  `lock`, `undo-2`, `x-circle`, `zap`).
- **Deux bugs corrigés en revue** (avant merge) : (1) la résolution de mise était
  gatée par la récompense de base → mise non réglée sur un contrat rouvert re-misé ;
  (2) `setRecurrence` ne soldait pas une mise en jeu → mise « prisonnière » et
  confiscable sur un récurrent. Corrigés (symétrie avec `setDueDate`).

### 021 — Échéances horodatées & rappels PWA (US-014, 19/07/2026)

- **Heure optionnelle** sur l'échéance : `Contract.dueHasTime` (**Dexie v9**,
  backfill `false`) — `dueDate` reste l'epoch ms (minuit si au jour, instant exact
  si horodaté). `reminderLead` (minutes avant, `null` = aucun) + `reminderNotifiedFor`
  (dédoublonnage). **Rappel réservé aux contrats horodatés** (révision design PO).
- **Unification `game/dueTime.ts`** (testé, non-régression) : `deadlineInstant`
  (horodaté → instant ; au jour → **minuit suivant**, calculé par arithmétique de
  date = **DST-safe**) → `isPastDeadline` unifie en retard / manqué / mise perdue ;
  `occurrenceInstant`/`isDue` (début de période) pilotent la **réactivation** des
  récurrents. `dueState` (`soon` = dans l'heure si horodaté, aujourd'hui/demain
  sinon) ; `reminderTrigger`. Les prédicats `streak`/`risk`/`recurrence`/`dueDate`
  délèguent et reçoivent `hasTime` ; `nextOccurrence` **conserve l'heure**.
- **Périmètre B (best-effort local)** : pas de serveur push → notification système
  émise **seulement quand l'app tourne** + **rattrapage** à l'ouverture ; honnête
  sur la limite (C — arrière-plan garanti — écarté car hors local-first).
- **Service `useReminders`** (monté dans `AppShell`) : tick **30 s** + 1ʳᵉ passe
  gatée sur `loaded` (rattrapage) ; garde mémoire anti-boucle ; notif système
  (`notifications.ts`, **dégradation propre** si API absente, permission demandée
  **sur action utilisateur** uniquement) + toast in-app ; rattrapage agrégé →
  bandeau `Alert` + une seule notif. `useFeedbackStore` : toasts élargis
  (`warning`/`info`) + `dueCatchup`.
- **UI (maquette `docs/maquettes/US-014/`, validée PO)** : `ContractDetail`
  (champ heure + `ReminderControl` segments Aucun/À l'échéance/10 min/1 h +
  permission), `ContractItem` (pastille horodatée + puce rappel violette),
  `todayContracts` (via `isPastDeadline`). i18n `contracts.due.*`/`reminder.*`.
  5 icônes ajoutées (`bell`, `bell-off`, `calendar`, `calendar-clock`, `clock`).
- **Revue de code** : 4 points corrigés avant merge — **bug DST** sur l'instant
  limite au jour (arithmétique de date), garde anti-boucle du rappel, notif de
  rattrapage **agrégée**, cohérence d'affichage de l'heure.
- **Hors périmètre inclus** (correctif rapide validé PO) : alignement vertical du
  rond de difficulté (`line-height: 1`) sur `ContractItem`.

### 023 — Noyau du builder « Réseau » (US-020, A1, 20/07/2026)

Première brique du **pivot builder (#022)**, Phase A (local-first, sans backend).
Écran « Réseau » (`/network`) : jeu incrémental nu — une ressource `cycles`, un
HACK manuel, un daemon générateur (production automatique). But : **valider le fun
du socle** avant d'investir.

- **Modèle** : nouvelle entité **singleton `BuilderState`** (`cycles`,
  `generatorCount`, `updatedAt`), **migration Dexie v10** (nouvelle table
  `builderState`, seed idempotent à 0, patron #009), `builderRepo`. **Aucune modif**
  de `Contract`/`Faction`/`Player`.
- **Logique pure `game/builder.ts`** (**testée 11/11**) : réglages regroupés en
  **objet config** `BUILDER_CONFIG` (manuel 1 ; daemon base 15 · croissance ×1,15 ·
  1 cycle/s — **placeholders**) ; `nextGeneratorCost` (escalade), `productionPerSec`,
  `hack`, `buyGenerator` (no-op si solde <), `tick(dt)`.
- **Store `useBuilderStore`** + hook **`useBuilderTick`** (monté dans `AppShell`,
  cadence 250 ms, **pause `visibilitychange`**, persistance throttlée + au masquage/
  `pagehide`/démontage). **Pas de rattrapage hors-ligne** → reporté **A5/US-024**.
- **UI** : `BuilderView` + `HackZone` (hack juteux) + `DaemonCard` **sur le composant
  DS `<Card hud brackets halo>`** (pas de carte maison). Fond immersif **hérité de
  `.nav-main`** (#017, pas de duplication) ; `prefers-reduced-motion` respecté (P9).
  Route `/network` + onglet **Réseau** ; « Stats »/« Profil » de la maquette **non**
  implémentés.
- **Archi évolutive (réponse PO)** : bonnes frontières + tokens sémantiques + config ;
  **pas** de « world-engine » spéculatif (généralisation des générateurs → **A2**,
  sur 2 cas réels). Détail futur dans `docs/architecture.md`.
- i18n `builder.*` + `nav.network*` FR/EN ; icônes `cpu`/`share-2`. Vérifs :
  typecheck + lint + build/PWA + **tests 93/93**. Maquette (`docs/maquettes/US-020/`,
  proto JSX) **non versionnée** (convention #007) — supprimée après implémentation.

### 024 — Daemons & automatisation (US-021, A2, 20/07/2026)

2ᵉ brique de la Phase A (pivot #022). **Généralisation** du builder d'un seul
daemon vers un **catalogue** + **upgrade par type** + **déblocage chaîné**.

- **Catalogue data-driven `GENERATORS`** (4 daemons : scraper / sifter / wraith /
  oracle) : coût base+croissance, production/u, `upgrade` {baseCost, costGrowth,
  multiplier}, `unlockAfter`, icône, clés i18n. **Ajouter un daemon = une entrée de
  données** (zéro migration) — bénéfice de la généralisation anticipée en US-020.
- **Modèle** : `BuilderState.generatorCount` → maps **`generators`** (compte/type)
  + **`upgrades`** (niveau/type). **Migration Dexie v11** (`generatorCount` →
  `generators.scraper`, `upgrades:{}`) : SCRAPER-01 + cycles **préservés**.
- **Logique pure `game/builder.ts`** (**testée 18/18**) : `generatorCost`,
  `upgradeCost`, `upgradeMultiplier`, `generatorProduction`, `productionPerSec`
  (somme), `isUnlocked` (chaîné), `nextLockedGenerator`, `buyGenerator(id)`,
  `buyUpgrade(id)`, `tick`.
- **Store** : `buyGenerator(id)` / `buyUpgrade(id)` (persistance immédiate) ;
  `useBuilderTick` inchangé.
- **UI** : `DaemonCard` paramétré sur le composant DS **`<Card hud brackets halo>`**
  (2 boutons **Compiler** / **Améliorer**, flash au level-up) ; **`TeaserCard`**
  (daemon verrouillé : « ??? » + scanline + condition de déblocage) ; bandeau
  **« Production réseau »** ; liste en grille 2 colonnes (desktop). i18n
  `builder.generators.*`/`upgrade`/`teaser`/`total` FR/EN ; icônes `filter`/`ghost`/
  `radar`/`key-round`. `prefers-reduced-motion` respecté (P9).
- Vérifs : typecheck + lint + build/PWA + **tests 100/100**. Recette **10/10 PO**.
  Maquette (`docs/maquettes/US-021/`) non versionnée (convention #007) — supprimée.

### 025 — 2ᵉ couche de ressource + arbre de déblocage + 1ᵉʳ reveal caché (US-022, A3, 20/07/2026)

3ᵉ brique de la Phase A (pivot #022). **1ᵉʳ recadrage** façon Paperclips : la
chaîne des 4 daemons (achevable depuis A2) ne plafonne plus le jeu — une 2ᵉ
ressource ouvre un nouvel axe de progression, et le **1ᵉʳ reveal caché** (P6)
est livré.

- **2ᵉ ressource `data`** : dérivée de `productionPerSec` (proportion
  `BUILDER_CONFIG.dataRate`), activée seulement une fois `oracle` possédé
  (`BUILDER_CONFIG.dataUnlockGenerator`). `game/builder.ts` gagne `data` +
  `unlockedNodes` sur `BuilderCore`, `dataPerSec()`, et `tick()` accepte des
  **multiplicateurs optionnels** (`{cycles?, data?}`, défaut 1 → A1/A2
  inchangés).
- **Nouveau module pur `game/unlockTree.ts`** (**testé 19/19**), **découplé**
  de `game/builder.ts` (aucun import croisé — la couche store compose les
  deux) : catalogue data-driven `UNLOCK_NODES` (4 nœuds : `overclock`,
  `parallelism`, `cryo-cache`, `ghost-protocol` caché), dépendance de nœud
  **généralisée** à `requiresNode` **et/ou** `requiresGenerator` (chaîne
  d'arbre et/ou condition sur `generators`/`upgrades`), `visibleNodes`/
  `canBuyNode`/`buyNode`/`cycleMultiplier`/`dataMultiplier`.
- **Reveal caché (P6)** : `ghost-protocol` est **filtré de `visibleNodes`**
  tant que sa condition (12× `wraith`) n'est pas remplie — aucune info
  communiquée, contrairement au teaser des daemons (A2). Une fois révélé :
  bonus fort (+200 % `dataPerSec`, soit ×3) et **indépendant** du reste de
  l'arbre (surgit d'un axe différent, plus surprenant).
- **Migration Dexie v12** : `data` + `unlockedNodes` (2 champs — un 3ᵉ champ
  `dataEarnedTotal` envisagé en cadrage a été **abandonné** après la maquette,
  la condition du reveal reposant finalement sur `generators`).
- **Store** : `buyNode(id)` (persistance immédiate) ; `applyTick` compose
  `cycleMultiplier`/`dataMultiplier` avant `tick()`.
- **UI** : `DataReadout` (panneau magenta conditionnel, badge « nouveau
  flux ») + `UnlockTreeSection`/`UnlockNodeCard`/`HiddenNodeCard` sur le
  composant DS **`<Card hud brackets halo>`** (états `acquired`/`available`/
  nœud caché révélé ; `locked`/`sealed` restent des cartes pointillées custom,
  sans repères, sur le modèle de `TeaserCard`) ; irruption glitch du nœud
  caché (clip-path saccadé + aberration chromatique), `prefers-reduced-motion`
  respecté (P9). i18n `builder.data.*`/`unlockTree.*` FR/EN ; icônes
  `gauge`/`split`/`snowflake`/`skull`/`triangle-alert`/`unlock`/`download`/
  `minus`.
- Vérifs : typecheck + lint + build/PWA + **tests 126/126**. Recette **8/8
  PO**. Maquette (`network-datatree`) non versionnée (convention #007).

### 026 — Accélérateurs réels au choix (US-023, A4, 20/07/2026)

4ᵉ brique de la Phase A (pivot #022). 1ʳᵉ concrétisation de la **« Voie 2 »**
(`vision-plateforme.md` §3ter.2) : l'effort réel n'est **pas** une corvée
obligatoire mais un **accélérateur optionnel** d'un builder qui tient déjà
debout seul (A1→A3). Livré : le **cadre extensible** + **1 accélérateur**
(focus chronométré, niveau 1 « l'app est l'arbitre »).

- **Nouveau module pur `game/accelerators.ts`** (**testé 16/16**), **découplé**
  de `game/builder.ts` et `game/unlockTree.ts` (aucun import croisé — la couche
  store compose les trois) : catalogue data-driven `ACCELERATORS` (1 entrée
  `focus`, extensible comme `GENERATORS`), machine d'état `canStart`/`start`/
  `cancel`/`resolve`/`boostMultiplier`.
- **Instant absolu** : `acceleratorRun`/`acceleratorBoost` portent un `endsAt`
  epoch ms **indépendant du 1ᵉʳ plan de l'app** — choix délibéré (permet
  d'éteindre l'écran pendant le focus, cohérent avec §3ter.4 « écran éteint » ;
  évite un mur technique de détection de 1ᵉʳ plan hors périmètre A4). `resolve`
  enchaîne `run→boost→null` en un appel (rattrapage app fermée), invoqué à
  chaque `applyTick` **et** au `load()`.
- **Anti-empilement (AC6)** : `canStart` exige `run === null && boost === null`
  — une seule session/boost à la fois. **Abandon sans pénalité (AC5)** : `cancel`
  vide seulement `run` (no-op sur un boost), aucune conséquence au-delà de
  l'absence de bonus.
- **Réglages placeholder** (affinables en recette, comme `BUILDER_CONFIG`) :
  focus 25 min → **SURCADENCE** ×2 sur les cycles pendant 15 min.
- **Collision de nom tranchée** : le boost temporaire s'appelle **« SURCADENCE »**
  (FR) / **« OVERDRIVE »** (EN), **distinct** du nœud d'arbre permanent
  **« OVERCLOCK »** (US-022) — le code/i18n d'`accelerators.ts` n'emploie jamais
  le terme `overclock`.
- **Migration Dexie v13** : `acceleratorRun` + `acceleratorBoost` (2 champs
  nullables), même modèle que v11/v12.
- **Store** : `startAccelerator(id)`/`cancelAccelerator()` (persistance
  immédiate) ; `applyTick` compose `boostMultiplier` avec `cycleMultiplier`/
  `dataMultiplier` (arbre) avant `tick()`. Toast succès (apparition du boost,
  via `useBuilderTick`, visible depuis tout écran) / toast neutre (abandon).
- **UI** : `AcceleratorPanel` (3 états repos/en cours/SURCADENCE) sur les
  composants DS **`<Card hud brackets halo="cyan">`** + **`<Button>`** +
  **`<ProgressBar accent="cyan">`** — **accent cyan réservé** (violet =
  daemons, magenta = data/arbre). Layout **Option A** (colonne stage, sous
  `HackZone`). Anneau de focus + glow SURCADENCE, `prefers-reduced-motion`
  respecté (P9). Teaser d'extensibilité discret (« d'autres accélérateurs en
  développement »). 2 icônes ajoutées (`play`, `brain`) ; helper
  `formatCountdown`. i18n `builder.accelerators.*` FR/EN.
- Vérifs : typecheck + lint + build/PWA + **tests 142/142**. Recette **8/8
  PO**. Maquette (`network-accelerators`) non versionnée (convention #007).

### 027 — Hors-ligne & temps écoulé + embryon de prestige (US-024, A5, 21/07/2026)

5ᵉ brique de la Phase A (pivot #022). Ferme la boucle de rétention « reviens
demain » : la production tourne **pendant l'absence**, et un **embryon de
prestige** (reset contre bonus permanent) pose la mécanique de renaissance.

- **Rattrapage hors-ligne** : nouvelle fonction pure `offlineTick(core, fromMs,
  toMs, schedule)` dans `game/builder.ts` — rejoue `tick()` sur un **calendrier
  de segments de multiplicateurs**, domaine-agnostique. `game/accelerators.ts`
  gagne `boostWindows(core, fromMs)` (0-3 segments : un `run` en cours peut
  devenir SURCADENCE puis expirer pendant l'absence). La couche store compose
  **arbre × prestige (constants) × fenêtres de boost (variables)** et appelle
  `offlineTick` au `load()`, à partir de `updatedAt` (déjà persisté au
  masquage/`pagehide`, US-020). **Anti double-comptage** : calcul **une seule
  fois** au `load()`, le tick « app ouverte » réamorce son horloge
  indépendamment. Pas de plafond de durée (linéaire, cohérent P5).
- **Feedback** : `useFeedbackStore.offlineCatchup` + `OfflineCatchupBanner`
  (habillage `<Alert kind="success">`, ton positif) affiché par `AppShell` si
  le gain est notable (≥ 1).
- **Embryon de prestige** : nouveau module pur `game/prestige.ts` (**testé**),
  découplé — `PRESTIGE_CONFIG` (seuil **flat 1 000 000** cycles, `nextMult 1,5`),
  `canPrestige`, `prestigeMultiplier(count) = nextMult ** count` (**composé**,
  ×1,5 → ×2,25 → ×3,375…), `prestige(core)` (reset cycles/generators/upgrades/
  data/unlockedNodes + `count+1`, **ne touche pas** `acceleratorRun`/
  `acceleratorBoost` — engagement réel du joueur). Bonus permanent composé dans
  `applyTick` **et** dans le rattrapage hors-ligne.
- **Migration Dexie v14** : `prestigeCount` (1 champ), même modèle que v11→v13.
- **UI** : `PrestigePanel` (**unique et permanent**) sur **`<Card hud brackets
  halo="red">`** (accent rouge réservé) — bonus acquis toujours visible + état
  verrouillé (`<ProgressBar>` vers le seuil) ou éligible (bouton « Renaître »,
  glow pulsé). Placé en **fin de colonne side** (après l'arbre, séparateur
  « Palier final »). Confirmation via **`ConfirmDialog` étendu** (props `icon`/
  `iconColor` + slot `children`, **rétrocompatible** — la suppression de contrat
  ne change pas) portant la grille « Perdu / Conservé ». `prefers-reduced-motion`
  respecté (P9). Aucune icône nouvelle. i18n `builder.offline.*`/
  `builder.prestige.*` FR/EN (« RENAISSANCE » / « REBIRTH »).
- **Correction issue de la recette** : le débit **affiché** (« +X/s », total)
  n'intégrait pas le bonus de prestige (appliqué pourtant à la production
  réelle) → composé désormais dans `BuilderView` (le boost temporaire SURCADENCE
  reste hors du débit affiché, convention héritée d'US-023).
- **Limite assumée** (embryon) : seuil de renaissance **flat**. Approfondissement
  (seuil incrémental + équilibrage de courbe) → **US-026** au backlog.
- Vérifs : typecheck + lint + build/PWA + **tests 159/159**. Recette **9/9
  PO**. Maquette (`network-renaissance`) non versionnée (convention #007).

### 028 — US-025 (A6) gelée ; fin de la Phase A « preuve du fun », place au polish/rétention (21/07/2026)

Après A1→A5 (US-020→024), le builder tient debout seul, a un geste manuel
(HACK), une automatisation (daemons), un recadrage (2ᵉ ressource + arbre), un
accélérateur réel vérifié (focus/SURCADENCE) et une boucle de rétention
(hors-ligne + prestige). **A6 (« rebrancher le module perso ») est gelée** —
retirée du chemin actif, pas juste reportée sans raison :

- **Pourquoi geler** : brancher le to-do/habitudes **auto-déclarés** sur la
  production du Réseau ouvrirait un canal **farmable** (cocher « fait » sans
  effort réel crédite quand même le builder) — contraire à **P1** (l'économie
  auto-déclarée doit rester **privée**, incheatable seulement parce qu'elle ne
  compte que pour soi) et **P5** (santé/anti-triche). Ça fait aussi doublon
  avec les accélérateurs **vérifiés** d'US-023, qui remplissent déjà
  proprement le rôle « effort réel → boost ».
- **Rien n'est perdu (P8)** : le module perso (to-do, habitudes, streaks,
  factions, réputation) reste tel quel, autonome, disponible. Il n'est
  simplement **plus dans le plan actif**. Il pourrait reprendre sens plus tard
  en alimentant de l'**identité/cosmétique** (P1 : l'auto-déclaré nourrit « le
  niveau perso et les cosmétiques », jamais la puissance) — mais ces systèmes
  n'existent pas encore (post-MVP 3, gelés depuis #022) ; **pas garanti**.
- **Conséquence de planning** : la Phase A (« prouver que le builder est fun »)
  est considérée **jouée et suffisante** avec A1→A5. La suite n'est **pas**
  A6 : place à une phase de **polish/approfondissement du builder existant**
  et de **réflexion rétention** (brainstorming PO ↔ Claude à partir du
  21/07/2026, voir `docs/vision-plateforme.md` journal), avant de redéfinir la
  prochaine US.

### 029 — Phase A2 « Approfondissement & rétention » définie (5 tranches, 21/07/2026)

Issue de la session de brainstorming PO ↔ Claude ouverte par #028 : analyse
fonctionnelle du builder existant (A1→A5) → 4 manques identifiés (contenu,
jalons, visualisation, catalogue d'accélérateurs) + la limite de prestige déjà
notée (US-026). Cadrés en **Phase A2** (`docs/roadmap.md`, `project/backlog.md`),
chemin critique **US-027** en premier :

- **US-027 — Marché crypto** (priorité haute, retenue en premier) : 3ᵉ
  ressource au comportement **différent** de `cycles`/`data` — conversion
  manuelle à un **cours fluctuant**, calculé par une **fonction déterministe
  du temps réel** (cohérent avec l'« instant absolu » déjà établi en A4/A5 —
  aucune complexité de rattrapage nouvelle). Débloquée par un nœud de l'arbre
  `data` existant (chaîne daemons→data→nœud→crypto) ; finance une **2ᵉ
  branche** de l'arbre (réutilise `UnlockTreeSection`/`UnlockNodeCard`).
  Suite explicite de la progression **compute→data→crypto→influence→???**
  envisagée dans `vision-plateforme.md` §3ter.3.
- **US-028 — Jalons/accomplissements**, **US-029 — Visualisation du Réseau**,
  **US-030 — Catalogue d'accélérateurs élargi** : priorité moyenne/basse,
  cadrage détaillé reporté à leur tour.
- **US-026** (seuil de prestige incrémental, déjà backloguée) rattachée à
  cette phase.

**Prochaine étape** : cadrage fonctionnel d'US-027 via le skill `nouvelle-us`.

### 022 — Pivot produit : de « to-do gamifié » vers « jeu builder social » (19/07/2026)

Décision structurante actée après un brainstorming PO ↔ Claude (voir
`docs/vision-plateforme.md`, principes **P1–P8**). **Réoriente le produit** ; le
reste du MVP 2 et le MVP 3 historiques (US-015→019 : caisses/inventaire/rareté/
pity) sont **gelés**.

- **Nouveau socle** : un **jeu builder / incrémental** (façon Universal Paperclips)
  — bâtir et optimiser un **Réseau de netrunner peuplé de daemons** — qui **tient
  debout seul**. La **progression réelle** (focus, sport, apprentissage, détox
  numérique…) devient un **accélérateur** (« Voie 2 »), jamais une corvée obligatoire.
- **Principes gravés** (détail dans la vision) : deux économies séparées (perso
  cachée / compétitive **vérifiable**) ; deux classements (clan + individuel,
  clan facultatif) ; **aucun avantage payant** ; **santé / anti-addiction** ;
  **socle accessible + « forêt cachée »** ; monétisation par **expression**
  (l'argent achète l'esthétique, l'effort débloque le contenu) ; **continuité
  inter-mondes** (« rien n'est jamais vain »).
- **Phasage** : **Phase A** = jeu solo **local-first, sans backend** (valider le
  fun à coût nul) ; **Phase B** = couche connectée (backend, comptes, clans,
  classements, mondes, **validation côté serveur**). La Phase B seule réécrira les
  lignes « local-first / mono-utilisateur » de `CLAUDE.md` et de la roadmap — **pas
  avant**.
- **Rien n'est jeté** : le to-do + habitudes + factions déjà construits deviennent
  le **module perso privé** du nouveau produit.
- **Statut** : vision **adoptée comme cap** ; **roadmap produit détaillée (Phases
  A/B) à valider** ; puis cadrage de la 1ʳᵉ tranche jouable (cycle de vie US
  inchangé, portes de validation maintenues).
