# US-030 — Catalogue d'accélérateurs réels élargi

- **MVP :** A2 (Phase A2 — Approfondissement & rétention)
- **Priorité :** basse
- **Statut :** fait
- **Branche :** feature/US-030-accelerateurs-elargi

## 1. Cadrage fonctionnel  _(porte de validation)_

### Quoi

Élargir le catalogue d'accélérateurs réels — aujourd'hui **une seule entrée**
(`focus`, session chrono de 25 min → SURCADENCE ×2 sur les cycles pendant
15 min) — avec **un ou deux accélérateurs supplémentaires**, pour donner du
choix (quel effort engager, quelle ressource accélérer) et étoffer la « Voie 2 »
(l'effort réel comme accélérateur optionnel).

**Invariant fondateur, non négociable.** Un accélérateur doit rester **vérifié
par l'app**, jamais auto-déclaré. C'est exactement la ligne qui a fait **geler
US-025** (décision #028) : un canal auto-déclaré serait *farmable* (le joueur
coche « fait » sans effort réel) → viole P1 (le builder ne récompense que ce qui
est réel) et P5 (pas de triche gratuite). Tout accélérateur ajouté ici doit
donc être **contrôlable par l'app** (chrono tenu par l'app, présence au
premier plan, ou signal matériel fiable) — sinon il ne rentre pas.

**Conséquence sur les exemples du backlog.** Les pistes citées (« podométrie,
détox numérique ») ne se valent pas au regard de cet invariant :

- **Variante chrono** (même mécanisme que `focus`, réglages différents) —
  **pleinement vérifiable** (l'app tient le compte à rebours). Risque nul,
  réutilise le moteur pur tel quel (le boost sait déjà cibler `cycles` **ou**
  `data`). Ex. : une session **longue** (« analyse en profondeur ») qui booste
  la **data** là où `focus` booste les **cycles** → vrai choix stratégique.
- **Détox numérique** — vérifiable *autrement* : via la présence au premier plan
  (Page Visibility API), à la façon des apps « forêt » — la session **échoue**
  si le joueur quitte l'app pendant la durée. Vérifiable, mais introduit un
  **nouvel état d'échec** (une session peut échouer en cours, pas seulement être
  abandonnée volontairement) → plus de logique et un état UI en plus.
- **Podométrie** — **non vérifiable de façon fiable** en PWA local-first (pas
  d'API santé stable, capteurs de mouvement peu fiables et permissifs). La
  retenir reviendrait à de l'auto-déclaré déguisé → **écartée en v1**, renvoyée
  au backlog (à ne considérer que si une vérification matérielle fiable devient
  disponible).

### Pour qui

Le joueur solo du Réseau qui utilise déjà les accélérateurs et veut **varier**
son effort (sessions courtes/longues, booster tantôt les cycles tantôt la data)
plutôt que répéter la seule session `focus`. Objectif rétention : renouveler le
geste d'effort réel sans le rendre obligatoire (il reste 100 % optionnel).

### Hypothèses explicites  _(à confirmer / arbitrer — dont le périmètre v1)_

- **H1 — Invariant d'admission maintenu.** Tout accélérateur ajouté est
  **vérifié par l'app**. Aucun accélérateur auto-déclaré (sinon on rouvre le
  piège d'US-025).
- **H2 — Périmètre v1 : Option A retenue (PO, 22/07/2026).** Ajouter **1
  accélérateur chrono** — « analyse en profondeur » : session plus longue
  (~50 min) → SURCADENCE plus longue (~30 min) qui booste la **data** (×2), là
  où `focus` booste les **cycles**. Réutilise le moteur pur sans le modifier ; le
  travail neuf est la **sélection** d'un accélérateur dans le panneau
  (aujourd'hui figé sur `focus`). **Option B (détox numérique) écartée de la
  v1** → backlog (mécanisme d'échec par présence au premier plan à part entière).
- **H3 — Podométrie écartée** de cette US (non vérifiable), consignée au backlog.
- **H4 — Anti-empilement conservé** : une seule session **ou** un seul boost à
  la fois, quel que soit l'accélérateur (règle `canStart` existante, US-023).
- **H5 — Impact UI significatif** : l'état « repos » du panneau, aujourd'hui
  câblé sur un accélérateur unique, doit présenter un **choix** entre plusieurs
  accélérateurs (sélecteur/liste). → **étape design probable** : je te
  signalerai les écrans concernés et attendrai une maquette avant le plan
  d'implémentation.

### Critères d'acceptation  _(action → résultat attendu, vérifiables)_

> **Périmètre v1 = Option A** (validé PO). Critères 1-7 + 10 en vigueur. Critères
> 8-9 (détox) **hors périmètre** — conservés grisés pour trace, reportés au backlog.

1. **Catalogue à plusieurs entrées.** Le catalogue expose au moins **2**
   accélérateurs (dont `focus` inchangé) ; l'ajout se fait par **donnée** (entrée
   de catalogue), sans réécriture du moteur — vérifiable par test unitaire sur
   `ACCELERATORS`/`ACCELERATOR_BY_ID`.
2. **Choix depuis le panneau.** En état repos, le joueur **voit et sélectionne**
   quel accélérateur lancer (durée / effet / ressource ciblée affichés pour
   chacun) → lancer celui choisi démarre bien **cet** accélérateur.
3. **Effort réellement vérifié.** Lancer un accélérateur chrono puis mener la
   session à son terme (chrono tenu par l'app) → SURCADENCE accordée ; abandonner
   avant la fin → **aucun** boost (comme US-023, pas de raccourci).
4. **Ressource boostée correcte.** Le boost d'un accélérateur qui cible la
   **data** multiplie la production de **data** (et non les cycles), et
   réciproquement pour `focus` (cycles) — vérifiable par test sur
   `boostMultiplier`/`boostWindows`.
5. **Anti-empilement.** Une session ou un boost déjà actif → impossible de
   lancer un **autre** accélérateur tant que le premier n'est pas terminé/abandonné
   (`canStart` renvoie faux) ; l'UI reflète l'indisponibilité.
6. **Persistance & rattrapage.** Fermer l'app pendant une session/boost puis
   rouvrir → l'état est résolu correctement à la réouverture (session échue →
   boost ; boost échu → neutre), pour **tous** les accélérateurs (non-régression
   `resolve`/hors-ligne US-024).
7. **i18n & DS.** Chaque accélérateur a ses libellés FR **et** EN (nom,
   principe, unités), aucune chaîne en dur ; le panneau reste sur les composants
   DS existants (`<Card hud brackets halo="cyan">`, accent cyan réservé).
8. _(Option B)_ **Détox vérifiée par présence.** Lancer la détox puis quitter
   l'app (onglet caché / arrière-plan) au-delà du seuil toléré → la session
   **échoue** (pas de boost), avec un retour clair ; rester présent jusqu'au
   terme → boost accordé.
9. _(Option B)_ **État d'échec distinct.** L'échec d'une détox est **distinct**
   d'un abandon volontaire dans l'UI et les retours (toast), sans pénalité
   au-delà de l'absence de boost (cohérent avec « jamais imposé »).
10. **Non-régression.** `typecheck` + `lint` + `build` + suite de tests au vert ;
    `focus` (US-023) et le calendrier hors-ligne (US-024) inchangés.

## 2. Cadrage technique  _(porte de validation)_  — Option A

### Principe

**Zéro changement de moteur, zéro changement de store, zéro migration Dexie.**
La logique pure (`game/accelerators.ts`) et le store (`useBuilderStore`) sont
déjà **génériques par `id`** et **déjà multi-ressources** :

- `applyTick` (store, l. 352-357) applique **`boost.data`** à la production de
  data et **`boost.cycles`** aux cycles ; le rattrapage hors-ligne (`load()`,
  l. 199-203) compose de même `w.cycles`/`w.data` via `boostWindows`.
- `boostMultiplier` / `boostWindows` lisent le `boostEffect` (`{cycles?, data?}`)
  de l'entrée de catalogue → un accélérateur qui déclare `{ data: 1 }` boostera
  la **data ×2** sans une ligne de logique nouvelle.
- `acceleratorRun`/`acceleratorBoost` persistent déjà `{ id, endsAt }` : l'`id`
  varie déjà, aucun nouveau champ n'est requis.
- `canStart` (anti-empilement) et `resolve` sont déjà agnostiques de l'`id`.

Le seul vrai travail neuf est **côté UI** : le panneau, aujourd'hui **câblé en
dur sur `ACCELERATORS[0]`** (`FOCUS`), doit (a) proposer un **choix** entre les
entrées du catalogue en état repos, et (b) afficher les états en cours / boost
**selon l'accélérateur actif** (durée, effet, ressource) au lieu de constantes
`FOCUS`.

### Fichiers impactés

- **`src/game/accelerators.ts`** — **1 entrée** ajoutée à `ACCELERATORS`
  (`ACCELERATOR_BY_ID` se remplit tout seul). Ex. :
  `{ id: 'deep-analysis', icon: '<lucide>', durationMs: 50*60_000,
  boostDurationMs: 30*60_000, boostEffect: { data: 1 } }`. Réglages placeholder,
  affinables en recette (même convention que `focus`).
- **`src/features/builder/AcceleratorPanel.tsx`** — **cœur du travail** :
  - Retirer la constante figée `FOCUS`/`BOOST_MULT` ; **itérer** sur
    `ACCELERATORS` en état repos (une carte/tuile par accélérateur, ou une liste
    sélectionnable) → `startAccelerator(def.id)`.
  - `AccRunning`/`AccBoost` : résoudre la def active via
    `ACCELERATOR_BY_ID[run.id]` / `[boost.id]` pour la durée (max de la
    `ProgressBar`), l'effet (`×N`) et **la ressource boostée** (cycles vs data)
    — au lieu de `FOCUS.*`.
  - Afficher **quelle ressource** est boostée (libellé/icône cycles vs data),
    puisque c'est désormais un point de choix ; suit la maquette (§3).
  - Retirer/adapter le `teaser` « + » (le catalogue n'est plus « à venir »).
- **`src/i18n/locales/fr.json` + `en.json`** — clés du nouvel accélérateur sous
  `builder.accelerators.catalog.<id>.*` (name, principle) + éventuels libellés
  génériques « ressource boostée » (cycles/data) si non déjà présents. Les deux
  catalogues (FR **et** EN).
- **`src/game/accelerators.test.ts`** — tests : catalogue ≥ 2 entrées ;
  `boostMultiplier` d'un boost `deep-analysis` renvoie `{ cycles: 1, data: 2 }`
  (data boostée, cycles neutres) ; `boostWindows` idem sur un run/boost de ce
  type ; `canStart` faux si une session/boost (quel qu'il soit) est déjà actif.

### Logique — réglages proposés (à figer, affinables en recette)

- **`deep-analysis`** : `durationMs = 50 min`, `boostDurationMs = 30 min`,
  `boostEffect = { data: 1 }` (→ **×2 data**). Session **plus longue** que
  `focus` (25 min) pour un **boost plus long** ciblant l'**autre** ressource →
  vrai arbitrage (accélérer les cycles vs la data), pas un simple doublon.
- Icône lucide à choisir (candidats : `microscope`, `scan-search`, `flask-conical`) —
  à valider avec la maquette ; ajout au registre `Icon` si absente.

### Impacts modèle de données

**Aucun.** Pas de nouveau champ `BuilderState`, **pas de migration Dexie** :
`acceleratorRun`/`acceleratorBoost` stockent déjà l'`id`. Un boost `deep-analysis`
en cours au moment de la mise à jour reste valide (l'`id` est simplement résolu
dans le nouveau catalogue). Non-régression `focus` (US-023) et hors-ligne
(US-024) garanties (aucune signature de fonction pure ne change).

## 3. Design  _(porte de validation, impact UI significatif — confirmé PO)_

**Étape design requise** (validée PO le 22/07/2026). Impact UI significatif :
l'état repos du panneau `AcceleratorPanel`, aujourd'hui figé sur un accélérateur
unique, devient un **choix** entre plusieurs accélérateurs, et les états en
cours/boost doivent exposer **quelle ressource** est accélérée.

- **Écran concerné :** panneau « Accélérateurs réels » sur `/network` (colonne
  stage, sous `HackZone`) — les 3 états repos / en cours / SURCADENCE.
- **Points à cadrer par la maquette :** présentation du choix (tuiles côte à
  côte vs liste), affichage par accélérateur (durée / effet / **ressource
  ciblée**), et le rendu des états en cours/boost quand l'accélérateur actif
  n'est pas `focus`. Reste sur le DS existant (`<Card hud brackets halo="cyan">`,
  accent cyan réservé).
- **Intention de design — motiver la session longue (PO, 22/07/2026).** Une
  session `deep-analysis` dure ~50 min : l'écran doit **récompenser la présence**
  et donner envie de tenir, pas afficher un chrono sec comme `focus`. Pistes à
  explorer dans la maquette (feedback **purement cosmétique** — aucune règle de
  jeu, aucun bonus additionnel, sinon hors périmètre / casse l'équilibrage) :
  - visu vivante pendant la session (effet analyse/scan, flux de data, anneau
    qui se charge) au-delà du compte à rebours ;
  - paliers/phases visuels sur la durée longue (ex. jalons ~10 min) pour
    matérialiser l'avancement et éviter l'effet tunnel ;
  - aperçu de la récompense qui « se charge » (SURCADENCE data ×2 à N %) ;
  - montée en intensité vers le terme + révélation satisfaisante au
    déclenchement de la SURCADENCE ;
  - accent **cyan** réservé, `prefers-reduced-motion` respecté (comme US-023).
- **Maquette :** **reçue** (`network-accelerators-v2`, Claude Design, 22/07/2026 —
  non versionnée, convention #007). Couvre les 3 états (repos+choix+indisponible,
  en cours focus/deep, SURCADENCE), l'icône (`scan-search` retenue) et le rendu
  `prefers-reduced-motion`. Tous les tokens employés existent déjà au thème.

  **Plan de réutilisation du DS (consigne PO) :**
  - *Réutilisés tels quels* : coque de panneau → `<Card hud brackets halo="cyan">` ;
    boutons Lancer/Abandonner → `<Button variant="secondary"/"ghost" hud>` ;
    barres de temps → `<ProgressBar accent="cyan">` ; icônes → `<Icon>` (+ ajout
    au registre des lucide manquantes : `scan-search`, `database`, `timer`,
    `hourglass`, `gift`…).
  - *Créés (absents du DS, cosmétiques)* : **`ProgressRing`** (anneau SVG +
    balayage scan) — placé dans `components/ui`, réutilisable ; bande de phases,
    aperçu de récompense qui se charge, puce ressource (cycles/data), flux de
    données — dans `features/builder`.

  **Arbitrages validés PO :** (1) l'état focus adopte aussi l'anneau (cohérence) ;
  (2) phases + « prête à N % » = **cosmétiques**, la récompense reste
  **tout-ou-rien** (abandon = zéro boost, AC3) ; (3) icône `deep-analysis` =
  `scan-search`. `id` technique retenu = **`deep-analysis`** (la maquette écrit
  `deep`).

## 4. Plan d'implémentation  _(porte de validation)_

> Périmètre : Option A (1 accélérateur `deep-analysis`, data ×2). Maquette
> `network-accelerators-v2` validée PO. Consigne PO : réutiliser le DS, créer
> seulement le manquant. Aucune règle de jeu nouvelle, aucune migration Dexie.

1. **Catalogue — `game/accelerators.ts`.** Ajouter l'entrée `deep-analysis` :
   `{ id: 'deep-analysis', icon: 'scan-search', durationMs: 50*60_000,
   boostDurationMs: 30*60_000, boostEffect: { data: 1 } }`. Rien d'autre à
   toucher (moteur pur déjà générique + multi-ressources).
2. **Tests moteur — `game/accelerators.test.ts`.** Ajouter : catalogue ≥ 2
   entrées & `deep-analysis` présent ; `boostMultiplier` d'un boost
   `deep-analysis` → `{ cycles: 1, data: 2 }` (data ×2, cycles neutres) ;
   `boostWindows` sur un run/boost `deep-analysis` (segment data boosté) ;
   `canStart` faux si un run **ou** un boost (quel qu'il soit) est actif
   (anti-empilement inter-accélérateurs). Non-régression `focus` conservée.
3. **Icônes — `components/ui/core/Icon.tsx`.** Enregistrer les lucide manquantes
   utilisées par la maquette : `ScanSearch`, `Timer`, `Hourglass`, `Gift`
   (les autres — `Database`, `Radar`, `GaugeCircle`, `Brain`, `Zap`, `Play`,
   `X`, `Lock`, `Info`, `ShieldAlert` — sont déjà là).
4. **Composant DS neuf — `components/ui/.../ProgressRing.tsx`.** Anneau SVG
   circulaire (props : `size`, `stroke`, `pct`, `color`, `track`, `scan?`,
   children), avec le balayage `scan` optionnel (conic-gradient masqué). Exporté
   par le barrel `components/ui`. Réutilisable (candidat DS), pas de logique jeu.
5. **CSS — `features/builder/builder.css`.** Keyframes cosmétiques préfixées
   `nw-acc-*` : `nw-acc-scan` (rotation balayage), `nw-acc-flux` (montée flux
   data), `nw-acc-shimmer` (aperçu récompense), `nw-acc-pulse` (icône
   SURCADENCE), `nw-acc-phase` (jalon actif) + réutilisation de
   `nw-acc-boost-glow`/`nw-acc-ring` existantes. Bloc `@media
   (prefers-reduced-motion: reduce)` qui neutralise ces animations (valeurs
   figées, lisible statique).
6. **Panneau — `features/builder/AcceleratorPanel.tsx` (cœur).** Dé-câbler le
   `FOCUS = ACCELERATORS[0]` figé ; piloter par `ACCELERATOR_BY_ID[id]`.
   - **Repos** : itérer `ACCELERATORS` → une carte de choix par accélérateur
     (nom, tag, description, métriques session/effet/SURCADENCE, **puce
     ressource** cycles=cyan / data=magenta, bouton « Lancer » →
     `startAccelerator(def.id)`). Si `!canStart` (run/boost actif) → les cartes
     passent **indisponibles** (bouton « verrouillé ») + bandeau anti-empilement.
   - **En cours** : résoudre la def active via `run.id`. `deep-analysis` = vue
     riche (`ProgressRing` + scan + flux magenta + **5 phases** dérivées du temps
     écoulé + **aperçu récompense** « prête à N % » — N = avancement session,
     cosmétique) ; `focus` = vue sobre (`ProgressRing` + ligne récompense).
     Bouton « Abandonner » (`<Button variant="ghost" hud>`) inchangé côté logique.
   - **SURCADENCE** : résoudre via `boost.id` ; chrome cyan, **ressource boostée
     colorée** (data magenta / cycles cyan), libellé `×2 DATA`/`×2 CYCLES`, barre
     de temps `<ProgressBar accent="cyan">`.
   - Sous-composants locaux : `ResChip`, `DeepPhases`, `RewardPreview`,
     `DataFlux`. Retirer le `teaser` « + » (catalogue désormais peuplé).
7. **i18n — `fr.json` + `en.json`.** Ajouter sous
   `builder.accelerators.catalog.deep-analysis.*` (name, tag, principle) ; les
   **noms de phases** (`builder.accelerators.phases.*` : amorçage/indexation/
   corrélation/synthèse/extraction) ; libellés ressource (cycles/data) et textes
   du panneau (choix, indisponible, aperçu récompense). FR **et** EN, aucune
   chaîne en dur.
8. **Vérifications** : `npm run typecheck` + `lint` + `build` + `test`
   (suite complète au vert ; `focus`/hors-ligne inchangés).
9. **Vérification visuelle** (si outil navigateur dispo, sinon dev server pour
   contrôle PO) : dérouler repos→choix, lancer `deep-analysis`, phases + aperçu,
   SURCADENCE data ×2, anti-empilement. Corriger les écarts.
10. **Recette PO** (skill `recette`, critères 1-7 + 10) puis **commit & merge &
    push** (skill `commit`).
