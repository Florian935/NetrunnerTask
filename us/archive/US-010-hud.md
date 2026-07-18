# US-010 — Tableau de bord / HUD (contrats du jour, niveau, solde)

- **MVP :** 1
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-010-hud

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** donner à l'app un **point d'entrée « tableau de bord »** qui, à
  l'ouverture, montre l'essentiel du jour : les **contrats du jour**, le
  **niveau/progression** et le **solde de crédits**. Cela implique de sortir du
  mono-écran actuel : introduire un **app-shell minimal** (navigation entre
  **Tableau de bord** et **Contrats**, + **barre de statut permanente**
  niveau/solde) et l'**écran HUD** lui-même. C'est le dernier maillon du chemin
  critique MVP 1 (…→ 008 → 009 → **010**) : la boucle de base devient une app
  complète.

- **Pour qui :** le joueur (utilisateur unique) qui ouvre l'app plusieurs fois
  par jour et veut, en un coup d'œil, **savoir quoi faire aujourd'hui** et **où
  il en est** (niveau, solde), sans dérouler toute la liste.

- **Périmètre proposé (à valider) — « HUD minimal » :**
  - **Inclus :** app-shell (bascule Tableau de bord ↔ Contrats + barre de statut
    permanente réutilisant `ProgressionIndicator` d'US-009) ; écran HUD =
    contrats du jour + progression + solde + accès rapide ; **réintégration du
    compteur « ACTIFS · TOTAL »** dans l'écran Contrats (retiré en US-009).
  - **Exclu (→ MVP 2/3) :** streaks actifs, caisse quotidienne à réclamer,
    réputation par faction, filtrage par faction (US-007). Le HUD réservera la
    place mais ne les implémente pas.
  - **« Contrats du jour » =** contrats **ouverts** dont l'échéance est
    **aujourd'hui ou dépassée** (en retard), en s'appuyant sur `dueDate` (US-005).

- **Décision de périmètre (validée 18/07/2026) :** app-shell construit sur un
  **vrai routeur** (`react-router`), et non une bascule de vue ad hoc — choix
  assumé en prévision des **nombreux écrans à venir** (progression, inventaire,
  caisses, profil… CDC §8). Le routage structure l'app dès maintenant.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Navigation** — depuis n'importe quelle vue, un élément de navigation
     permet de basculer entre **Tableau de bord** et **Contrats** ; la vue
     active est visuellement indiquée.
  2. **Point d'entrée** — au démarrage de l'app, la vue affichée est le
     **Tableau de bord**.
  3. **Barre de statut permanente** — niveau + progression + solde (composant
     `ProgressionIndicator`) sont visibles **sur les deux vues** et se mettent à
     jour immédiatement à la complétion d'un contrat (sans rechargement).
  4. **Contrats du jour** — le HUD liste les contrats **ouverts** dont
     l'échéance est **aujourd'hui ou en retard**, triés (en retard d'abord) ;
     chaque ligne montre titre + échéance + difficulté.
  5. **HUD vide** — s'il n'y a aucun contrat du jour, le HUD affiche un message
     dédié (ex. « aucun contrat pour aujourd'hui »), pas une liste vide.
  6. **Accès rapide** — depuis une ligne du HUD, une action ouvre le détail du
     contrat (modale `ContractDetail`) ou bascule vers l'écran Contrats
     positionné dessus.
  7. **Terminer depuis le HUD** — cocher un contrat du jour depuis le HUD le
     termine (récompense + progression, comme dans la liste) et il **quitte** la
     liste du jour.
  8. **Réintégration ACTIFS · TOTAL** — l'écran **Contrats** ré-affiche le
     compteur actifs/total + barre de complétion (retiré de l'en-tête en US-009).
  9. **i18n FR/EN** — tous les libellés du HUD et de la navigation via `t()`,
     catalogues FR **et** EN complets ; aucune chaîne en dur.
  10. **Non-régression** — l'écran Contrats (création 2 s, liste, complétion,
      détail, toasts, toast de palier US-009) fonctionne comme avant.

- **Impact UI :** **significatif** — nouvel écran (HUD), app-shell (navigation +
  barre de statut), et modification de l'en-tête Contrats. → **étape design
  (maquette) requise** après le cadrage technique. À maquetter : l'app-shell
  (disposition nav + barre de statut), l'écran HUD (contrats du jour + synthèse),
  l'état vide, et l'écran Contrats avec son compteur réintégré.

## 2. Cadrage technique  _(porte de validation)_

- **Dépendance ajoutée :** **`react-router`** (v7, compatible React 19 / Vite).
  Décision structurante → entrée `docs/decisions.md` (#015).

- **Routage (`src/app/`) :**
  - `App.tsx` monte le `RouterProvider` (routeur `createBrowserRouter`) sous le
    `MotionConfig` existant.
  - Route de layout **`AppShell`** (chrome permanent) avec routes filles :
    - `index` (`/`) → **`DashboardView`** (point d'entrée, critère 2).
    - `/contracts` → **`ContractsView`**.
  - Route « catch-all » → redirection vers `/` (liens inconnus).

- **App-shell (`src/app/AppShell.tsx` + `src/components/layout/`) :**
  - Chrome permanent : **rail de navigation** (`NavRail`, liens Tableau de bord
    / Contrats via `NavLink`, état actif stylé — critère 1) + **barre de statut**
    (hôte permanent de `ProgressionIndicator` d'US-009 + gains de session +
    `LanguageSwitcher`) + `<Outlet/>` pour la vue active.
  - **Chargement initial** des données remonté ici : `useContractsStore.load()` +
    `usePlayerStore.load()` au montage (aujourd'hui dans `ContractsView`).

- **Couche « feedback » partagée (refactor justifié par le critère 7) :** la
  complétion doit produire le même retour depuis le HUD **et** la liste
  (récompense + progression + toasts + toast de palier). Aujourd'hui cette
  logique vit dans `ContractsView.toggle`. On l'extrait :
  - **`useFeedbackStore` (Zustand)** : pile de toasts, `sessionGains`,
    `levelUp`, `flashingId`. Rendu par l'`AppShell` (toasts + `LevelUpToast`
    visibles quelle que soit la vue).
  - **`useCompleteContract()`** (hook partagé) : encapsule `complete(id)` →
    `grantReward` → mise à jour de `useFeedbackStore` (toasts, gains, palier,
    flash). Utilisé par `DashboardView` et `ContractsView`.

- **Écran HUD (`src/features/dashboard/`) :**
  - `DashboardView.tsx` : section **contrats du jour** (liste réutilisant la
    ligne de contrat / `ContractItem`), synthèse (progression + solde déjà en
    barre de statut ; compteur du jour), **état vide** dédié (critère 5). Ouvre
    le détail (`ContractDetail`) au clic (critère 6) ; complétion via
    `useCompleteContract` (critère 7).
  - `todayContracts.ts` **(pur, testé Vitest)** : filtre les contrats **ouverts**
    à échéance **aujourd'hui ou dépassée**, triés **en retard d'abord** puis par
    échéance. S'appuie sur un utilitaire jour-précis.

- **Réutilisations / modifs de l'existant :**
  - **`ContractsView`** : retire la barre de statut/gains/toasts (désormais dans
    l'`AppShell`) et le chargement initial ; **réintègre le compteur
    « ACTIFS · TOTAL »** + barre de complétion (critère 8) ; complétion via
    `useCompleteContract`.
  - **`dueDate.ts`** : exposer un utilitaire jour-précis (ex. `daysUntil(dueDate,
    now)`) réutilisé par `todayContracts.ts` (aujourd'hui `dueStatus` ne
    distingue pas aujourd'hui/demain).
  - **`ProgressionIndicator`**, `ContractDetail`, `ContractItem/List`,
    `LevelUpToast`, `Toast` : réutilisés tels quels.

- **PWA / offline :** app SPA multi-routes → ajouter le **fallback de navigation**
  Workbox (`navigateFallback: 'index.html'`) dans `vite.config.ts` pour que les
  liens profonds (`/contracts`) fonctionnent **hors-ligne** et au rechargement.

- **i18n :** libellés de navigation, titres/synthèse du HUD, état vide → clés
  FR **et** EN (ex. `nav.*`, `dashboard.*`). Aucune chaîne en dur.

- **Impacts modèle de données :** **aucun**. Le HUD et l'app-shell sont des vues
  dérivées de l'état existant (contrats + joueur). Pas de table ni de champ
  nouveau, pas de migration Dexie.

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans / états concernés :**
  1. **App-shell** — chrome permanent : **rail de navigation** (Tableau de bord /
     Contrats, état actif) + **barre de statut** hébergeant `ProgressionIndicator`
     (US-009) + gains de session + sélecteur de langue + zone de contenu
     (`<Outlet/>`). Définir la disposition (rail latéral vs barre) et le
     comportement responsive (desktop / mobile PWA).
  2. **Tableau de bord (HUD)** — section **contrats du jour** (contrats ouverts à
     échéance aujourd'hui/dépassée, en retard d'abord), **synthèse** (compteur du
     jour ; niveau/solde déjà en barre de statut), et **état vide** (« aucun
     contrat pour aujourd'hui »).
  3. **Écran Contrats** — inchangé, sauf en-tête : la barre de statut niveau/solde
     part dans l'app-shell, l'en-tête **réaffiche « ACTIFS · TOTAL »** + barre de
     complétion (réintégration US-009).

- **Maquette :** fournie (Claude Design), **validée le 18/07/2026**. Écrans `6a`
  (app-shell desktop + HUD plein), `6b` (HUD vide), `6c` (PWA mobile),
  `6d` (écran Contrats ajusté). Non versionnée (convention).

- **Specs retenues + précisions d'implémentation :**
  - **Rail de nav** (66px) : marque « NW// », **Tableau de bord** (`layout-dashboard`,
    « HUD ») et **Contrats** (`crosshair`, « CTR ») actifs ; destinations
    **futures grisées** (Progression `trending-up`, Inventaire `package`, Caisses
    `box`, Profil `user`) affichées désactivées (préparent MVP 2/3). Actif = cyan
    + liseré interne + glow.
  - **Barre de statut** (56px) : à gauche « NIGHTWIRE // <écran actif> » ; à
    droite un **indicateur de niveau COMPACT horizontal** (NIV. │ barre 96px +
    ratio │ crédits), les **gains de session**, le **sélecteur FR/EN**.
    → l'indicateur d'US-009 devient une **variante** : ajouter `variant`
    (`panel` = bloc US-009, `bar` = compact) à `ProgressionIndicator`. Le gros
    bloc n'est plus monté dans l'en-tête Contrats (niveau/solde vivent en barre
    de statut).
  - **HUD** : titre « CONTRATS DU JOUR » + puce compteur « N CONTRATS
    AUJOURD'HUI ». Liste **groupée** : sous-section **EN RETARD · n** (liseré
    gauche rouge) puis **AUJOURD'HUI · n** (liseré gauche ambre). → `todayContracts.ts`
    renvoie `{ overdue, today }` (pur, testé).
  - **Ligne HUD** = **ligne compacte dédiée** (case + barres de priorité + titre
    + `CTR · hex` + difficulté + puce d'échéance, liseré coloré, **sans** outils
    éditer/supprimer). Clic → ouvre `ContractDetail` ; case → complétion.
  - **État vide** (`6b`) : icône `coffee`, « GRID CALME », message + bouton
    « VOIR LES CONTRATS » (navigue vers `/contracts`).
  - **Responsive** : rail latéral (desktop) ↔ **barre inférieure** (mobile PWA)
    + barre de statut compacte, via media query.
  - **Écran Contrats** (`6d`) : en-tête `ACTIFS · TOTAL` + `ProgressBar`
    réintégrés ; plus de bloc niveau/solde/gains dans cet en-tête.
  - **Icônes à ajouter** au registre : `layout-dashboard`, `crosshair`,
    `package`, `box`, `user`, `coffee`.

## 4. Plan d'implémentation  _(porte de validation)_

1. **Dépendance & décision** — installer `react-router` (v7) ; entrée
   `docs/decisions.md` **#015** (routeur + app-shell).
2. **Couche pure `features/dashboard/todayContracts.ts` (+ tests Vitest)** —
   `todayContracts(contracts, now) → { overdue, today }` : contrats **ouverts**
   à échéance dépassée / aujourd'hui, chaque groupe trié par échéance. S'appuie
   sur un utilitaire jour-précis ajouté à `dueDate.ts` (`daysUntilDue`). Tests
   des cas (dépassé, aujourd'hui, demain exclu, sans échéance exclu, terminé
   exclu).
3. **Icônes** — ajouter au registre `Icon.tsx` : `layout-dashboard`, `crosshair`,
   `package`, `box`, `user`, `coffee`.
4. **Couche feedback partagée** —
   - `stores/useFeedbackStore.ts` (Zustand) : `toasts`, `sessionGains`,
     `levelUp`, `flashingId` + actions (`pushToast`, `dismiss`, `addGains`,
     `setLevelUp`, `setFlashing`).
   - `features/contracts/useCompleteContract.ts` (hook) : `complete(id)` →
     `contractsStore.complete` → `playerStore.grantReward` → alimente
     `useFeedbackStore` (toast récompense, gains, palier + flash). Renvoie de
     quoi lier l'UI (flashingId).
5. **`ProgressionIndicator` — variante compacte** — ajouter `variant?: 'panel' |
   'bar'` (`panel` = rendu US-009 inchangé ; `bar` = compact horizontal de la
   barre de statut : NIV. │ barre 96px + ratio │ crédits).
6. **App-shell** —
   - `components/layout/NavRail.tsx` : `NavLink` Tableau de bord / Contrats
     (actif stylé) + destinations futures **désactivées** ; responsive : rail
     (desktop) / barre inférieure (mobile) via classes + media query
     (`appShell.css`).
   - `components/layout/StatusBar.tsx` : libellé écran actif + `ProgressionIndicator
     variant="bar"` + gains de session + `LanguageSwitcher`.
   - `app/AppShell.tsx` : layout route (NavRail + StatusBar + `<Outlet/>` +
     **hôte des toasts et du `LevelUpToast`** lus depuis `useFeedbackStore`).
     Chargement initial des stores (`load` contrats + joueur) ici.
7. **Routeur** — `app/router.tsx` (`createBrowserRouter`) : layout `AppShell` →
   `index` `DashboardView`, `/contracts` `ContractsView`, catch-all → `/`.
   `App.tsx` monte `RouterProvider` sous `MotionConfig`.
8. **HUD `features/dashboard/`** —
   - `TodayContractRow.tsx` : ligne compacte (case + barres de priorité + titre
     + `CTR · hex` + difficulté + puce d'échéance + liseré coloré ; pas d'outils).
   - `DashboardView.tsx` : en-tête (titre + puce compteur), sections **EN RETARD**
     / **AUJOURD'HUI** via `todayContracts`, **état vide** (`coffee`, bouton →
     `/contracts`). Complétion via `useCompleteContract` ; clic ligne → ouverture
     `ContractDetail` (état local + réutilisation du composant).
9. **`ContractsView` — refactor** — retirer barre de statut/gains/toasts/level-up
   et le chargement initial (désormais dans l'app-shell) ; **réintégrer
   « ACTIFS · TOTAL » + `ProgressBar`** ; complétion via `useCompleteContract` ;
   conserver création rapide, liste, détail, tri.
10. **PWA** — `vite.config.ts` : `workbox.navigateFallback: 'index.html'`
    (+ `navigateFallbackDenylist` si besoin) pour les liens profonds hors-ligne.
11. **i18n** — clés `nav.*`, `dashboard.*` (titre, compteur, sections, état vide)
    FR **et** EN. Aucune chaîne en dur.
12. **Recette + vérifs** — dérouler les 10 critères (skill `recette`),
    `typecheck` + `lint` + `test` + `build`.
