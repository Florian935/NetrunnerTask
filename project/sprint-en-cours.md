# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-024 — A5 : Hors-ligne & temps
écoulé + embryon de prestige** (cycle complet — cadrages fonctionnel + technique
validés PO, maquette `network-renaissance` validée PO, plan 17 étapes validé PO,
implémentation faite, **recette 9/9 PO** le 21/07/2026, décision **#027**,
commit + merge sur `develop` + push).

Réalisé US-024 : ferme la boucle « reviens demain ». **Rattrapage hors-ligne** —
`offlineTick` (`game/builder.ts`, calendrier de segments de multiplicateurs,
domaine-agnostique) + `boostWindows` (`game/accelerators.ts`, 0-3 segments) ;
le store compose **arbre × boost × prestige** au `load()` depuis `updatedAt`
(anti double-comptage : calcul 1 fois, tick réamorcé indépendamment ; pas de
plafond, linéaire P5) ; bandeau `OfflineCatchupBanner` (`<Alert success>`) si
gain notable. **Embryon de prestige** — nouveau module pur **`game/prestige.ts`**
(seuil flat **1 000 000**, `prestigeMultiplier` **composé** `1,5 ** count`,
`prestige()` reset ciblé sans toucher l'accélérateur en cours) ; migration
**Dexie v14** (`prestigeCount`) ; bonus permanent composé dans `applyTick`
**et** le rattrapage **et** le débit affiché. UI `PrestigePanel` unique/permanent
sur **`<Card halo="red">`** (accent rouge réservé) en fin de colonne side,
confirmation via **`ConfirmDialog` étendu** (rétrocompatible : `icon`/`iconColor`
+ slot `children`). **Tests 159/159.** Recette PO : 9 critères conformes +
**correction du débit affiché** (n'intégrait pas le prestige) ; limite « seuil
flat » assumée (embryon) → approfondissement **US-026** au backlog.

**Prochaine US : US-025 — A6** (rebrancher le module perso : to-do/habitudes/
factions → économie privée) via le skill `nouvelle-us`. Roadmap produit :
`docs/roadmap.md` (Phase A A1–A6 / Phase B B1–B4).

Dernière US clôturée (antérieure) : **US-023 — A4 : Accélérateurs réels au choix** (cycle
complet — cadrages fonctionnel + technique validés PO, maquette
`network-accelerators` validée PO, plan 10 étapes validé PO, implémentation
faite, **recette 8/8 PO** le 20/07/2026, décision **#026**, commit + merge sur
`develop` + push).

Réalisé US-023 : 1ʳᵉ concrétisation de la **« Voie 2 »** — l'effort réel devient
un **accélérateur optionnel** (jamais imposé) d'un builder autonome. Nouveau
module pur **`game/accelerators.ts`** (**testé 16/16**), découplé de
`builder.ts`/`unlockTree.ts` : catalogue `ACCELERATORS` (1 entrée `focus`
extensible), machine d'état `canStart`/`start`/`cancel`/`resolve`/
`boostMultiplier`, `endsAt` en **instant absolu** (indépendant du 1ᵉʳ plan,
rattrapage app fermée via `resolve` au `load()` + à chaque `applyTick`).
Migration **Dexie v13** (`acceleratorRun`/`acceleratorBoost`). Store
`startAccelerator`/`cancelAccelerator` + composition `boostMultiplier` ×
multiplicateurs d'arbre avant `tick()` ; toasts succès (apparition boost, via
`useBuilderTick`) / neutre (abandon). UI `AcceleratorPanel` (3 états
repos/en cours/**SURCADENCE**) sur les composants DS `<Card hud brackets
halo="cyan">`/`<Button>`/`<ProgressBar>` — **accent cyan réservé**, layout
Option A (colonne stage, sous `HackZone`) ; anneau focus + glow SURCADENCE,
`prefers-reduced-motion` respecté ; i18n FR/EN ; 2 icônes (`play`/`brain`) +
helper `formatCountdown`. Réglages focus 25 min → SURCADENCE ×2 pendant 15 min
(placeholder). **Tests 142/142.** Recette PO : les 8 critères conformes,
**aucun bug ouvert**.

**US-024 — A5** (hors-ligne & temps écoulé + embryon de prestige) **clôturée**
le 21/07/2026 (recette 9/9 PO, décision #027, commit + merge + push).
**Prochaine : US-025 — A6.** Roadmap produit : `docs/roadmap.md` (Phase A
A1–A6 / Phase B B1–B4).

Dernière US clôturée : **US-022 — A3 : 2ᵉ couche de ressource + arbre de
déblocage + 1ᵉʳ reveal caché** (cycle complet — cadrages + maquette
`network-datatree` + plan validés PO, implémentation faite, **recette 8/8 PO**
le 20/07/2026, **commit + merge + push faits** — `874ca89`/`d41d7eb`,
`develop` à jour sur `origin`).

Réalisé US-022 : `game/builder.ts` étendu (`data`, `unlockedNodes`,
`dataPerSec()`, `tick()` avec multiplicateurs optionnels) ; nouveau module pur
**`game/unlockTree.ts`** (catalogue `UNLOCK_NODES` à 4 nœuds — `overclock`,
`parallelism`, `cryo-cache`, `ghost-protocol` caché ×3 data —, dépendance
`requiresNode`/`requiresGenerator`, **testé 19/19**) ; migration **Dexie v12**
(`data` + `unlockedNodes`, 2 champs) ; store `buyNode(id)` + composition des
multiplicateurs avant `tick()` ; UI `DataReadout` (panneau magenta
conditionnel) + `UnlockTreeSection`/`UnlockNodeCard`/`HiddenNodeCard` sur le
composant DS **`<Card hud brackets>`** (repères d'angle corrigés en recette,
voir `project/recettes.md`), irruption glitch du nœud caché,
`prefers-reduced-motion` respecté ; i18n FR/EN ; icônes `gauge`/`split`/
`snowflake`/`skull`/`triangle-alert`/`unlock`/`download`/`minus`. **Tests
126/126.** Recette PO : fonctionnel + rendu conformes ; note non-bloquante sur
la mise en page (linéaire, s'étoffera avec A4-A6).

Dernière US clôturée : **US-021 — A2 : Daemons & automatisation** (commit + merge
sur `develop`, décision **#024**, **recette 10/10 PO** le 20/07/2026, archivée).

Réalisé US-021 : `game/builder.ts` généralisé en **catalogue `GENERATORS`** (4
daemons, **upgrade par type**, déblocage chaîné) — **testé 18/18** ; `BuilderState`
→ maps `generators`/`upgrades` + **migration Dexie v11** (SCRAPER-01 + cycles
préservés) ; store `buyGenerator(id)`/`buyUpgrade(id)` ; `DaemonCard` (2 boutons
sur `<Card>` DS) + `TeaserCard` (verrouillé) + bandeau « Production réseau » ;
i18n FR/EN ; icônes `filter`/`ghost`/`radar`/`key-round`. **tests 100/100.**

## US précédente (clôturée)

**US-020 — A1 : Noyau du builder** clôturée le 20/07/2026 (décision **#023**,
recette **9/9 PO**, mergée sur `develop`, archivée). Réalisé : Dexie **v10** +
`BuilderState` + `builderRepo` ; `game/builder.ts` (**11/11**) ; `useBuilderStore`
+ `useBuilderTick` ; écran `/network` (`BuilderView`/`HackZone`/`DaemonCard` sur
`<Card>` DS) + onglet Réseau ; i18n `builder.*`. **tests 93/93.**

## Contexte — pivot builder (#022) acté & commité

Le rangement du pivot est **commité** (branche `chore/pivot-vision` mergée sur
`develop`, `2d35e3e`). Netrunner Tasks devient un **jeu builder** (façon Universal
Paperclips) dont la **progression réelle** est l'accélérateur ; le to-do +
habitudes + factions existants deviennent le **module perso privé**. Vision &
principes **P1–P8** : `docs/vision-plateforme.md`. Roadmap produit (Phase A A1–A6 /
Phase B B1–B4) : `docs/roadmap.md`. **US-015→019 gelées.**

## Étape du cycle de vie

**US-014 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **maquette reçue & validée**
(`docs/maquettes/US-014/`, révision « rappel = heure requise ») → plan 12 étapes →
implémentation → **recette 9/9 PO**. Contenu : **heure d'échéance optionnelle**
(**Dexie v9** : `dueHasTime` + `reminderLead` + `reminderNotifiedFor`) + **rappels
best-effort** (périmètre B). Cœur temporel unifié **`game/dueTime.ts`**
(`deadlineInstant` **DST-safe** ; testé, **non-régression**), refactor
`streak`/`risk`/`recurrence`/`dueDate` (`hasTime`, heure conservée), réactivation
via `isDue`. Service **`useReminders`** (tick 30 s + rattrapage, notif système +
toast, bandeau agrégé), `notifications.ts` (dégradation propre). UI : champ heure +
`ReminderControl` + permission, pastille horodatée + puce rappel, bandeau `Alert`.
**Revue de code** : 4 corrections avant merge (bug DST, garde anti-boucle, notif
agrégée, affichage heure). **Correctif visuel hors périmètre inclus** (validé PO) :
alignement du rond de difficulté. Vérifs vertes : **typecheck + lint + build +
tests 82/82**.

## Étape du cycle de vie (US antérieure)

**US-013 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **maquette reçue & validée**
(`docs/maquettes/US-013/` — bonus indexé difficulté, one-shot, plafond = solde,
bouton « Miser » explicite) → plan 13 étapes → implémentation → **recette 8/8 PO**.
Contenu : **mise de crédits** sur un contrat one-shot à échéance (**Dexie v8** :
`Contract.stake` + `stakeOutcome`), **débit immédiat** ; réussite avant échéance =
retour `mise × mult` (**barème `1,5/2/2,5/3/4`** indexé difficulté) ; échéance
dépassée = **perte** au `load()` (aucun mouvement de crédit). Réalisé : module pur
**`game/risk.ts`** (**testé 14/14**), `usePlayerStore.adjustCredits`
(**plancher 0**), `useContractsStore.setStake` + `settleStakeOnComplete` +
remboursements (suppression / retrait d'échéance / ajout de récurrence), UI
**`StakeControl`** (4 états) + **`StakeChip`** + toasts, i18n `contracts.stake.*`.
**Revue de code** : 2 bugs d'intégrité crédits corrigés avant merge (résolution de
mise gatée par la récompense de base ; `setRecurrence` ne soldait pas la mise en
jeu). Vérifs vertes : **typecheck + lint + build + tests 65/65**.

## Étape du cycle de vie (US antérieure)

**US-012 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **maquette reçue & validée**
(`docs/maquettes/US-012/`) → plan 13 étapes → implémentation → recette **9/9 PO**.
Contenu : `Faction.reputation` (**Dexie v7**, plancher 0) **monte** à la complétion
payante d'un contrat de la faction (barème `1/2/4/7/12`) et **descend** quand un
streak d'habitude rattaché casse (perte au `load()`, US-011, silencieuse) ; **rangs
dérivés par seuils** `0/25/75/200/500` (statut, sans avantage). Réalisé : module
pur **`game/reputation.ts`** (**testé 10/10**), `grantReputation`, gain +
**toasts** (gain teinté faction + passage de rang) dans `useCompleteContract`/
`AppShell`, pénalités au `load()` + **séquencement contrats→factions**, panneau
**`ReputationPanel`** (`HudPanel`) sur le tableau de bord (insigne 5 crans, barre
en **dégradé de teinte** local au panneau, état LÉGENDE), icônes `crown`/
`shield-check`, i18n `reputation.*` FR/EN. Vérifs vertes : **typecheck + lint +
build + tests 51/51**.

## Étape du cycle de vie (US antérieure)

**US-011 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **pas de maquette** (alignement sur
l'existant) → plan 10 étapes → implémentation → recette **7/7 PO**. Contenu : le
**streak** est une propriété des contrats **récurrents** (US-006) — série des
périodes complétées à temps (+1 à temps, repart à 1 en retard), **record** qui ne
diminue jamais, **remise à 0** sur période manquée (au `load()`, avec la
réactivation US-006). Anti-double garanti par le verrou « récurrent validé ».
Récompenses **inchangées** (conséquences réputation = **US-012**). Réalisé :
**migration Dexie v6** (`currentStreak`/`bestStreak` sur `Contract`, backfill 0),
module pur **`game/streak.ts`** (**testé 11/11**) branché dans `complete()` /
`load()` / `setRecurrence(null)`, puce **`StreakChip`** (icône `flame`, ambre si
active) sur la ligne + bloc **Série/Record** au détail, i18n `contracts.streak.*`
FR/EN. Vérifs vertes : **typecheck + lint + build + tests 41/41**.

> **MVP 2 découpé** le 19/07/2026 en 9 US (US-011 → US-019, voir `backlog.md`) ;
> **US-011 & US-012 faites** → **prochaine : US-013** (contrats à risque, mise de
> crédits). **MVP 1 terminé** (US-001 → US-010 `fait`) + chantier fond/cartes figé
> (#017).

## Chantier exploration figé (hors cycle US) — `test/fonds-halos` → `develop`

Exploration visuelle avant MVP 2 (branche depuis `develop`, **hors cycle US**,
validée PO en itération live). **Figée dans le produit** (décision **#017**) —
l'outillage d'exploration (labo `/labo`, sélecteur, `useBgLab`, 8 fonds candidats
+ overlays) a été **retiré** ; seul le choix retenu subsiste.
- **Fond signature** (`.nav-main`, `appShell.css`) : navy `#141a29` + quadrillage
  (carrés 28 px + lignes fines 4 px, opacité 0.016) + **4 halos néon d'angle**
  (HG cyan · BG violet · HD magenta · BD menthe). 100 % CSS (`::before`,
  `z-index:-1`) — pas d'image, PWA/hors-ligne préservés.
- **`<Card>` enrichie** (réutilisable) : props `halo` (halo permanent, `.nw-card-halo`
  → `card.css`) et `brackets` (2 repères d'angle blancs, coins non biseautés).
  `CardAccent` accepte `red`.
- **Lignes de contrat** (`ContractItem`) : surface **HUD** à **halo permanent**
  (couleur = accent de difficulté, mutée si terminé) + **2 brackets** ; survol
  intensifie bordure/lueur ; le flash « hack réussi » prime toujours.
- Vérifs vertes : **typecheck + lint + build + tests 30/30**.
- **À suivre (MVP 2)** : adopter `StatCard`/`HudPanel` sur le tableau de bord ;
  réserver le bouton plein `primary` à un CTA « héros ».

## Étape du cycle de vie

**US-007 clôturée** (commit + merge sur `develop`, décision #016). Cycle complet :
cadrages → maquette → plan → implémentation → recette **9/9 PO**. A exposé côté UI
le socle faction déjà présent (**aucune migration Dexie, reste v5**) : `factionLabel`
(name→clé i18n, testée 3/3), `useFactionsStore`, `setFaction`, `FactionBadge`
(reconstruit NIGHTWIRE), sélecteur de faction (modale), `FactionFilterBar` (filtre
mémoire non persisté). Maquette non versionnée (convention). Cadrages + maquette
validés PO le 18/07/2026 (`docs/maquettes/US-007/`). Plan en 9 étapes exécuté :
i18n FR/EN (clés `contracts.factions.*`, `faction.*`, `filter.*`) ; règle pure
`factionLabel` (name→clé i18n, **testée 3/3**) ; `useFactionsStore` (chargé dans
`AppShell`) ; `setFaction` (repo + store) ; `FactionBadge` (autonome, reconstruit
NIGHTWIRE) inséré en tête de rangée méta ; bloc FACTION (puces) dans
`ContractDetail` ; `FactionFilterBar` + filtre mémoire non persisté dans
`ContractsView` (compteur d'en-tête & état vide restent globaux). **Aucune
migration Dexie** (reste v5). Vérifs vertes : **typecheck + lint + build + tests
30/30**.
Cadrages (fonctionnel + technique) dans `us/US-007-factions.md`. Cadrage
fonctionnel **validé PO le 18/07/2026** (H1→H4, dont option « Sans faction »).
Le modèle de données faction **existe déjà** (table `factions` + **index Dexie
`factionId` depuis v2**, CRUD complet, `CreateContractInput.factionId` &
`ContractFilter.factionId`, 5 factions semées) mais n'est **jamais exposé côté
UI** (`factionId` toujours `null`). **Conséquence clé : US-007 = AUCUNE migration
Dexie (reste v5)** — US essentiellement front. Découpage technique : nouveau
`useFactionsStore` (chargé dans AppShell), helper pur `factionLabel` (name→clé
i18n, H3), action `setFaction` (store + repo), et 3 briques UI — `FactionBadge`
(à reconstruire NIGHTWIRE), sélecteur dans `ContractDetail`, `FactionFilterBar`
(filtre mémoire non persité dans `ContractsView`). **Impact UI significatif** →
étape design à prévoir avant implémentation.

> US-006 terminée : cycle complet (cadrages → plan → implémentation → **boucle de
recette** avec 2 ajustements validés PO → recette **13/13**). A introduit le type
`Recurrence` (2 modes : intervalle `{every, unit}` | jour fixe `{weekday}`) +
`Contract.recurrence` (**Dexie v5**), la couche pure `game/recurrence.ts`
(`firstOccurrence` + `nextOccurrence`, testées **12/12**), le contrôle de
récurrence (modale) + la puce `⟳`. **Modèle « validé jusqu'à réactivation »** :
compléter un récurrent le passe VALIDÉ (verrouillé) ; `load()` le **réactive** au
chargement quand l'échéance est atteinte. Échéance **auto-posée/recalculée** à la
définition. Pas de maquette (aligné sur l'existant).

> US-010 (avant) terminée : recette **12/12** PO. Routeur `react-router` +
> app-shell (#015), HUD, couche feedback partagée, `ProgressionIndicator bar`.

Report i18n des noms de factions : **soldé** par US-007 (`factionLabel` + clés
`contracts.factions.*`). Bug doc ouvert : **DOC-001** (décisions #012/#013
référencées mais absentes de `decisions.md`). Backlog MVP 2 : échéances horodatées
+ rappels/notifications PWA (US-006) ; état vide « aucun contrat pour ce filtre »
(US-007).

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [x] Migration design system → NIGHTWIRE V3 (**fait**, décision #008).
- [x] US-002 — Modèle de données & persistance locale (Dexie) (**fait**, décision #009).
- [x] Chantier i18n FR/EN (**fait**, décision #010).
- [x] US-003 — Création rapide de contrat (règle des 2 s) (**fait**).
- [x] US-004 — Liste des contrats & complétion (**fait**, décision #011).
- [x] US-008 — Difficulté & calcul de récompense (**fait**, décision #012).
- [x] US-005 — Attributs de contrat (priorité, échéance, sous-tâches) (**fait**, décision #013).
- [x] US-009 — Progression joueur (XP, niveau, crédits) (**fait**, décision #014 — Vitest).
- [x] US-010 — Tableau de bord / HUD (**fait**, décision #015 — routeur & app-shell).
- [x] US-006 — Récurrence des contrats (**fait** ; modèle « validé jusqu'à réactivation », Dexie v5).

**US-023 — A4** (accélérateurs réels au choix) **clôturée** le 20/07/2026
(recette 8/8 PO, décision #026, commit + merge + push). **US-024 — A5**
(hors-ligne & temps écoulé + embryon de prestige) **clôturée** le 21/07/2026
(recette 9/9 PO, décision #027, commit + merge + push). **Prochaine : US-025 —
A6.** Roadmap produit : `docs/roadmap.md` (Phase A A1–A6 / Phase B B1–B4).

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
