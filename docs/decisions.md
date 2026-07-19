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
