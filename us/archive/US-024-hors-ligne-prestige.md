# US-024 — A5 : Hors-ligne & temps écoulé + embryon de prestige

- **MVP :** A
- **Priorité :** moyenne
- **Statut :** fait (recette 9/9 PO le 21/07/2026)
- **Branche :** feature/US-024-hors-ligne-prestige

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  A5 ferme la boucle de rétention « reviens demain » de la Phase A
  (`docs/roadmap.md`). Deux volets livrés ensemble dans cette US :

  1. **Hors-ligne & temps écoulé.** Jusqu'ici, la production automatique du
     Réseau (cycles, et `data` une fois `oracle` possédé) ne progresse que
     tant que l'app est **ouverte et visible** (`useBuilderTick` borne
     volontairement le rattrapage, en attendant A5). À la réouverture de
     l'app après une fermeture/masquage prolongé, la production qui aurait
     eu lieu pendant l'absence doit être **calculée sur le temps réel écoulé**
     et créditée d'un coup — sur le même principe d'**instant absolu** que le
     chrono des accélérateurs (US-023). Les multiplicateurs actifs au moment
     de la fermeture (arbre de déblocage US-022, éventuelle SURCADENCE encore
     en cours US-023) s'appliquent au calcul. Un **plafond éventuel** de durée
     de rattrapage créditée (pour éviter un calcul dégénéré sur une absence de
     plusieurs mois) est à trancher en cadrage technique — pas un mur pour le
     joueur, une garde-fou de calcul.
  2. **Embryon de prestige / renaissance.** Une action **volontaire,
     explicite et irréversible**, accessible une fois un seuil minimal de
     progression atteint (seuil exact = cadrage technique), qui **réinitialise**
     la progression du Réseau (cycles, daemons, upgrades, `data`, arbre de
     déblocage) en échange d'un **bonus permanent** qui persiste à travers les
     renaissances (ex. multiplicateur de production, à préciser en cadrage
     technique). Cette version est délibérément un **embryon** : pas de mise en
     scène « changement de monde » (réservée à une tranche future, voir P8 —
     continuité inter-mondes — et §3-C de `vision-plateforme.md`), juste le
     geste de base « reset contre bonus permanent » qui prouve le concept.

- **Pour qui :**
  Le joueur qui **ferme l'app** (vie réelle, la contrainte des 2 s reste
  respectée — pas d'obligation de rester connecté) et veut retrouver une
  production qui a continué à tourner à son retour, sans sentiment de temps
  perdu. Et le joueur qui a poussé une 1ʳᵉ run assez loin et veut
  **recommencer plus fort** plutôt que stagner sur un plateau.

- **Critères d'acceptation :** (action → résultat attendu)
  1. Fermer l'onglet/l'app (ou le masquer) pendant une durée significative
     puis rouvrir → le solde de cycles (et `data` si `oracle` possédé)
     reflète la production qui aurait eu lieu pendant l'absence, calculée sur
     le temps réel écoulé.
  2. Le calcul du rattrapage tient compte des multiplicateurs actifs au
     moment de la fermeture (arbre de déblocage) — pas seulement la
     production de base.
  3. Un **feedback visible** informe le joueur du rattrapage à la réouverture
     (ex. bandeau/toast « +X cycles pendant ton absence ») — pas une simple
     hausse muette du compteur.
  4. Rouvrir l'app après une absence très courte (quelques secondes) ne
     déclenche aucun rattrapage anormal ni double-comptage avec le tick
     normal qui reprend.
  5. En dessous du seuil minimal de progression, l'action de renaissance
     reste **indisponible** (grisée) avec une explication de la condition à
     remplir.
  6. Le seuil atteint, l'action de renaissance devient accessible et demande
     une **confirmation explicite** avant application (irréversible).
  7. Après confirmation : cycles / daemons / upgrades / `data` / arbre de
     déblocage sont **remis à zéro**, un **bonus permanent** de renaissance
     est acquis, **visible** (indicateur dédié), et s'applique immédiatement à
     la nouvelle run.
  8. Recharger la page après une renaissance conserve le bonus permanent
     **et** l'état remis à zéro (persistance Dexie).
  9. **Non-régression** : le tick « app ouverte » (US-020→023) continue de
     fonctionner normalement ; l'arbre de déblocage (US-022) et les
     accélérateurs (US-023) restent cohérents après un rattrapage hors-ligne
     et après une renaissance.

## 2. Cadrage technique  _(porte de validation)_

> Révisé après maquette (`network-renaissance`, validée PO le 20/07/2026) —
> voir §3. Changements vs. 1ʳᵉ version : `prestigeMultiplier` est
> **composé/géométrique** (`nextMult ** count`, ex. ×1,5 → ×2,25 → ×3,375),
> pas additif comme envisagé initialement — cohérent avec une courbe de
> prestige classique de jeu incrémental, tranché par la maquette. Le seuil de
> renaissance (`PRESTIGE_CONFIG.threshold`) reste **flat** (ne progresse pas
> avec `prestigeCount`), choix délibérément simple pour cet embryon. La
> confirmation **étend** `ConfirmDialog` (icône + bloc « Perdu / Conservé »
> personnalisables) plutôt que de le consommer strictement « tel quel ».
> Aucune icône nouvelle nécessaire (`flame`/`lock`/`trash-2`/`check-circle`/
> `zap`/`database` déjà au registre).

- **Fichiers impactés :**
  - `src/game/builder.ts` — nouvelle fonction pure **`offlineTick(core, fromMs,
    toMs, schedule)`** : rejoue `tick()` sur un **calendrier de
    multiplicateurs** (segments chronologiques), domaine-agnostique (ignore
    d'où viennent les multiplicateurs). Reste **découplé** d'`accelerators.ts`.
  - `src/game/builder.test.ts` — tests `offlineTick` (segment unique, 2
    segments, 3 segments, `dt ≤ 0`).
  - `src/game/accelerators.ts` — nouvelle fonction pure **`boostWindows(core,
    fromMs)`** : calendrier du boost (0 à 2 bornes — fin d'un `run` qui devient
    boost, fin du boost) à partir d'un instant donné, **sans** connaître
    `builder.ts` (retourne des segments `{untilMs, boostEffect}` génériques,
    composés par le store).
  - `src/game/accelerators.test.ts` — tests `boostWindows` (aucun run/boost,
    boost seul en cours, run qui devient boost dans la fenêtre).
  - **Nouveau `src/game/prestige.ts`** (pur, testé) : `PRESTIGE_CONFIG`
    (seuil + bonus par palier, placeholders), `canPrestige(core)`,
    `prestigeMultiplier(count)`, `prestige(core, count)` (reset + incrément).
  - **Nouveau `src/game/prestige.test.ts`**.
  - `src/db/types.ts` — `BuilderState` gagne `prestigeCount: number`.
  - `src/db/db.ts` — **migration Dexie v14**.
  - `src/db/seed.ts` — `prestigeCount: 0` à la création du singleton.
  - `src/stores/useBuilderStore.ts` — `load()` calcule le rattrapage
    hors-ligne (`offlineTick` + `boostWindows` + multiplicateurs arbre/prestige)
    et signale un gain notable à `useFeedbackStore` ; `applyTick` compose
    **arbre × boost × prestige** ; nouvelle action `prestige()`.
  - `src/stores/useFeedbackStore.ts` — nouvel état `offlineCatchup: { cycles:
    number; data: number } | null` + `setOfflineCatchup`/`clearOfflineCatchup`
    (même modèle que `dueCatchup`, US-014).
  - `src/app/AppShell.tsx` — bandeau `<Alert kind="success">` de rattrapage
    hors-ligne (même emplacement/pattern que le bandeau `dueCatchup`).
  - `src/features/common/ConfirmDialog.tsx` — **étendu** (rétrocompatible) :
    `icon`/`iconColor` optionnels (défaut inchangé `shield-alert` rouge, la
    suppression de contrat ne change pas visuellement), nouveau slot
    `children` (contenu libre entre le message et les boutons) pour le bloc
    « Perdu / Conservé » de la renaissance. **Aucun nouveau composant de
    confirmation.**
  - **Nouveau `src/features/builder/PrestigePanel.tsx`** : panneau unique et
    permanent sur `<Card hud brackets halo="red">` (accent rouge réservé, même
    convention que `halo="violet"`/`"cyan"`/`"magenta"` ailleurs sur l'écran)
    — bonus acquis toujours visible + état verrouillé (barre de progression)
    ou éligible (bouton « Renaître » + glow pulsé + confirmation étendue).
  - `src/features/builder/BuilderView.tsx` — insertion de `PrestigePanel` en
    **fin de colonne side**, après `UnlockTreeSection` (layout validé,
    maquette).
  - `src/features/builder/builder.css` — styles du panneau prestige (glow
    pulsé état éligible, `prefers-reduced-motion`).
  - `src/i18n/locales/fr.json` / `en.json` — `builder.offline.*`,
    `builder.prestige.*`.
  - **Aucun ajout au registre d'icônes** (`flame`, `lock`, `trash-2`,
    `check-circle`, `zap`, `database` déjà tous présents).

- **Logique :**
  - **Rattrapage hors-ligne** : au `load()`, `fromMs = state.updatedAt`
    (dernier instant persisté — fiable car `useBuilderTick` persiste déjà au
    masquage/`pagehide`/démontage, US-020), `toMs = Date.now()`. La couche
    store construit un **calendrier de multiplicateurs** composé de 3
    facteurs :
    1. **Arbre de déblocage** (`cycleMultiplier`/`dataMultiplier`,
       `unlockTree.ts`) — **constant** sur toute la fenêtre (aucun achat
       possible app fermée).
    2. **Boost accélérateur** (`boostWindows`, `accelerators.ts`) — peut
       varier dans la fenêtre : un `run` en cours à la fermeture peut se
       terminer **pendant** l'absence et déclencher une SURCADENCE, qui peut
       elle-même expirer avant la réouverture (jusqu'à 3 segments : normal →
       boosté → normal).
    3. **Prestige** (`prestigeMultiplier`, `prestige.ts`) — **constant** sur
       la fenêtre (ne peut changer qu'en rejouant, donc jamais hors-ligne).
    `offlineTick(core, fromMs, toMs, schedule)` rejoue `tick()` segment par
    segment. Le `resolve()` des accélérateurs (US-023, déjà en place) reste
    appelé en parallèle pour mettre à jour `acceleratorRun`/`acceleratorBoost`
    eux-mêmes — les deux calculs partagent le même `now` mais restent
    indépendants (l'un avance les ressources, l'autre l'état de
    l'accélérateur).
  - **Pas de plafond de durée** (décision proposée, à confirmer PO) : le
    rattrapage est **linéaire** au temps réel écoulé (même taux que si l'app
    était restée ouverte) — aucun risque d'emballement combinatoire (pas
    d'exponentielle), et un plafond **pénaliserait** une longue absence, ce
    qui contredit l'esprit « reviens demain » (P5). Si le PO préfère un
    plafond de sécurité malgré tout, il est trivial à ajouter (`toMs =
    min(now, fromMs + CAP_MS)`).
  - **Anti double-comptage (AC4)** : le rattrapage est calculé **une seule
    fois** au `load()`, à partir de `updatedAt` — la boucle `useBuilderTick`
    réamorce ensuite son horloge sur `Date.now()` **indépendamment** (comme
    aujourd'hui), donc aucun chevauchement possible, quelle que soit la durée
    de l'absence (y compris quelques secondes → petit gain correct, pas un
    bug).
  - **Feedback (AC3)** : le bandeau de rattrapage ne s'affiche que si le gain
    est **notable** (seuil d'affichage placeholder : cycles ou data arrondis
    ≥ 1) — évite le bruit sur un rechargement quasi-instantané où le gain
    réel est nul ou infinitésimal.
  - **Embryon de prestige** : `canPrestige(core) = core.cycles >=
    PRESTIGE_CONFIG.threshold` (placeholder **1 000 000**, flat — ne progresse
    pas avec `prestigeCount`, affinable en recette ; pas de compteur cumulatif
    séparé, l'éligibilité s'évalue sur le solde courant, plus simple pour un
    embryon). `prestige(core, count)` réinitialise
    `cycles`/`generators`/`upgrades`/`data`/`unlockedNodes` et incrémente
    `prestigeCount`. **`acceleratorRun`/`acceleratorBoost` ne sont PAS
    touchés** (décision) : un focus en cours est un engagement réel du
    joueur, indépendant de l'économie du Réseau qu'on remet à zéro.
    `prestigeMultiplier(count) = PRESTIGE_CONFIG.nextMult ** count`
    (placeholder `nextMult = 1,5`, **composé** — ex. 1 renaissance → ×1,5,
    2ᵉ → ×2,25, 3ᵉ → ×3,375) — multiplicateur **permanent**, composé avec
    l'arbre et le boost partout où la production est calculée (tick live
    **et** rattrapage hors-ligne).
  - **Confirmation de la renaissance** : `ConfirmDialog` étendu (voir
    fichiers impactés) — icône `flame` rouge, message d'engagement
    (irréversible mais présenté comme un choix stratégique, pas une perte),
    et bloc **« Perdu / Conservé »** en 2 colonnes (perdu : cycles/data,
    daemons, nœuds de l'arbre ; conservé : le nouveau palier de bonus
    permanent, ex. « ×1,5 → ×2,25 »).

- **Impacts modèle de données :**
  - `BuilderState` gagne `prestigeCount: number` (défaut `0`).
  - **Migration Dexie v14** : même pattern que v11→v13 — schéma recopié à
    l'identique (aucun index nouveau), rétro-remplissage `prestigeCount: 0`
    sur la rangée singleton existante.
  - Aucun nouveau champ pour le rattrapage hors-ligne : il se déduit à la
    volée de `updatedAt` (déjà présent) à chaque `load()`, rien à persister
    de plus.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Maquette reçue et validée PO le 20/07/2026** (dossier `network-renaissance`,
jouable — bandeau hors-ligne, panneau Renaissance en 2 variantes, contenu de
la confirmation, aperçu d'insertion `/network`). Non versionnée dans le dépôt
(convention, comme les maquettes précédentes).

- **Écrans concernés :**
  - `AppShell` — bandeau `<Alert kind="success">` habillé (ton positif,
    fermable) : « Ton réseau a tourné en ton absence » + durée d'absence +
    cycles/data gagnés (data uniquement si > 0).
  - `/network` (`BuilderView`) — nouveau panneau `PrestigePanel` en **fin de
    colonne side**, après l'arbre de déblocage, sous un séparateur « Palier
    final » teinté rouge — c'est une action rare/structurante, pas un geste
    quotidien (raison retenue : cohérence avec le rangement daemons → arbre →
    renaissance comme dernier palier de progression, sans s'imposer au
    premier regard).
- **Décisions validées avec la maquette :**
  - Accent **rouge réservé** au panneau Renaissance (violet = daemons,
    magenta = data/arbre, cyan = accélérateurs, mint = nœud acquis).
  - **Panneau unique et permanent** (pas d'états exclusifs) : le bonus acquis
    (« Aucun — première renaissance à venir » au départ) reste **toujours**
    affiché, au-dessus de l'état verrouillé (progression vers le seuil,
    pas de bouton) ou éligible (bouton « Renaître », glow pulsé + « embers »
    discrets, repli statique `prefers-reduced-motion`).
  - Contenu de la confirmation figé : titre « Confirmer la renaissance »,
    message d'engagement stratégique (pas punitif), grille **Perdu / Conservé**.
  - Réglages : seuil **1 000 000 cycles** (flat), bonus **×1,5 composé** par
    renaissance.
- **Maquette :** `C:\Users\flori\Downloads\network-renaissance` (local, PO).

## 4. Plan d'implémentation  _(porte de validation)_

1. **Migration Dexie v14** (`db/db.ts`) + `BuilderState.prestigeCount: number`
   (`db/types.ts`) ; `.upgrade()` avec rétro-remplissage `0` sur la rangée
   singleton (même modèle que v11→v13) ; `db/seed.ts` initialise
   `prestigeCount: 0` à la création.
2. **`game/builder.ts`** : nouvelle fonction pure `offlineTick(core, fromMs,
   toMs, schedule: {untilMs, cycles, data}[])` — rejoue `tick()` segment par
   segment sur le calendrier fourni. Domaine-agnostique, réutilise `tick()`
   en interne, aucun import nouveau.
3. **`game/builder.test.ts`** : cas `offlineTick` — segment unique (pas de
   boost), 2 segments (boost déjà actif qui expire dans la fenêtre), 3
   segments (`run` qui devient boost puis expire dans la fenêtre), `toMs ≤
   fromMs` (no-op), non-régression des tests existants.
4. **`game/accelerators.ts`** : nouvelle fonction pure `boostWindows(core,
   fromMs)` → segments `{untilMs, boostEffect}` (0 à 2 bornes + 1 segment
   final `untilMs: Infinity` neutre). Aucun import de `builder.ts`.
5. **`game/accelerators.test.ts`** : cas `boostWindows` — aucun run/boost
   (1 segment neutre), boost seul en cours (2 segments), run qui devient
   boost dans la fenêtre (3 segments), `run`/`boost` déjà expirés au
   `fromMs` (garde défensive).
6. **Nouveau `game/prestige.ts`** (pur) : `PRESTIGE_CONFIG` (`threshold:
   1_000_000`, `nextMult: 1.5`, placeholders affinables en recette),
   `canPrestige(core): boolean`, `prestigeMultiplier(count): number`
   (`nextMult ** count`), `prestige(core, count): { core, count }` (reset
   cycles/generators/upgrades/data/unlockedNodes, `count + 1` ; ne touche pas
   `acceleratorRun`/`acceleratorBoost`).
7. **`game/prestige.test.ts`** (nouveau) : `canPrestige` (sous/au-dessus du
   seuil), `prestigeMultiplier` (composition géométrique — 0/1/2/3 paliers),
   `prestige` (reset correct, incrément, no-op si `!canPrestige`, accélérateur
   préservé).
8. **`stores/useFeedbackStore.ts`** : nouvel état `offlineCatchup: { cycles:
   number; data: number } | null` + `setOfflineCatchup`/`clearOfflineCatchup`
   (même modèle que `dueCatchup`, US-014).
9. **`stores/useBuilderStore.ts`** :
   - État étendu (`prestigeCount`).
   - `load()` : calcule `fromMs = state.updatedAt`, `toMs = Date.now()`,
     construit le calendrier (`boostWindows` × `cycleMultiplier`/
     `dataMultiplier` de l'arbre × `prestigeMultiplier` constant), appelle
     `offlineTick`, applique le résultat **avant** la résolution accélérateur
     existante (US-023, inchangée) ; si le gain arrondi est notable (≥ 1
     cycle ou ≥ 1 data), déclenche `setOfflineCatchup`.
   - `applyTick` : compose `cycleMultiplier(current) × boostMultiplier(...) ×
     prestigeMultiplier(prestigeCount)` (idem `data`).
   - Nouvelle action `prestige()` : `canPrestige` → no-op sinon ; reset +
     incrément + persistance immédiate (comme `buyNode`).
10. **`features/common/ConfirmDialog.tsx`** — extension rétrocompatible :
    props optionnelles `icon` (défaut `'shield-alert'`) et `iconColor`
    (défaut `'var(--red-500)'`), nouveau slot `children` rendu entre le bloc
    `itemLabel` et les boutons. Aucun changement visuel pour l'usage existant
    (suppression de contrat).
11. **Nouveau `features/builder/OfflineCatchupBanner.tsx`** : habillage
    d'`<Alert kind="success">` — titre, durée d'absence (helper
    `formatElapsed`, nouveau dans `format.ts`), cycles gagnés (+ data si > 0).
12. **`app/AppShell.tsx`** : branche `offlineCatchup`/`clearOfflineCatchup`,
    rendu du bandeau (même emplacement/pattern que le bandeau `dueCatchup`).
13. **Nouveau `features/builder/PrestigePanel.tsx`** : `<Card hud brackets
    halo="red">` — bloc bonus permanent (toujours visible), puis état
    verrouillé (`<ProgressBar accent="red" .../>` vers le seuil, indicateur
    « Seuil non atteint ») ou éligible (bouton « Renaître », glow pulsé) ;
    ouverture de `ConfirmDialog` étendu (icône `flame`, grille Perdu/Conservé)
    au clic, `prestige()` sur confirmation.
14. **`features/builder/BuilderView.tsx`** : insertion de `PrestigePanel` en
    fin de colonne side, après `UnlockTreeSection`, sous séparateur « Palier
    final ».
15. **CSS** (`builder.css`) : glow pulsé de l'état éligible + éventuels
    « embers » discrets, `prefers-reduced-motion` (repli statique).
16. **i18n FR/EN** : `builder.offline.*` (bandeau) et `builder.prestige.*`
    (panneau + confirmation).
17. **Vérifications** : `npm run typecheck && npm run lint && npm run build &&
    npm test` — non-régression complète (A1→A4 + nouveaux tests).
