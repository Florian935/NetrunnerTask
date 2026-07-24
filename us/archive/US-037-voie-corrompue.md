# US-037 — La Voie Corrompue

- **MVP :** A4 (Phase A4 — Corruption / Voie sombre, décision #041)
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-037-voie-corrompue

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** La **2ᵉ et dernière tranche** de la Phase A4 — **la profondeur
  mécanique** derrière le choc d'US-036. Là où US-036 livrait le choc + le cadre +
  le choix (le pacte, pur statut), US-037 donne enfin un **contenu jouable** à la
  voie sombre pour qui l'a **embrassée** : une **ressource corrompue instable** qui
  **dope la production** du Réseau, mais **au prix d'un risque** (l'instabilité).
  C'est un vrai **arbitrage risque/récompense** — pousser le dopage ou sécuriser
  ses gains — et un **pool de cosmétiques glitch** à gagner en parcourant la voie.
  La voie lit le flag `corruption: embraced` posé par US-036 et **ne s'active que
  s'il est présent**.

- **Pour qui :** Le **joueur solo engagé** qui, après la 3ᵉ renaissance, a **choisi
  d'embrasser** la corruption (US-036) et veut maintenant que ce choix ait des
  **conséquences de jeu** — pas seulement un re-skin. La voie lui offre une boucle
  supplémentaire à maîtriser (le levier « ça ne s'arrête jamais », P6) sans jamais
  être imposée : le Réseau propre reste pleinement jouable.

### Réconciliation avec l'invariant d'US-036

US-036 posait « **aucun avantage fonctionnel en v1** » : c'était un **report
explicite** de la mécanique, pas une interdiction. La roadmap Phase A4 (décision
#041) prévoit qu'US-037 introduise le dopage — *« accepter = branche risquée +
dopée + cosmétiques glitch »*. Le dopage **n'est pas** un avantage payant ni
compétitif (P4) : c'est un **arbitrage risque/récompense auto-contenu**, en **solo
local-first**, **gagné par le jeu**, **compensé par l'instabilité** (donc pas un
strict upgrade → embrasser ne devient jamais « obligatoire par optimisation »), et
**réversible** par la purge. P4/P5 restent respectés.

### Hypothèses de cadrage

- **H1 — La ressource corrompue « Surcharge » (instable, propre à la voie).** Une
  **nouvelle jauge** (`corruption`/glitch), **active seulement** si `corruption ===
  'embraced'`. Elle **monte** en fonction de l'activité du Réseau (indexée sur la
  production). Elle ne s'achète ni ne se dépense comme les 3 ressources classiques
  (`cycles`/`data`/`crypto`) : c'est un **état instable** qu'on gère. Persistée.

- **H2 — Production dopée indexée sur la Surcharge.** Tant que la voie est active,
  un **multiplicateur global de production** croît avec la Surcharge : plus elle est
  haute, plus le Réseau produit (dopage visible sur les débits `cycles`/`data`/
  `crypto`). C'est la **récompense** de la voie.

- **H3 — L'instabilité est la contrepartie (le risque), et elle est
  DÉTERMINISTE.** Au-delà d'un **seuil critique**, la Surcharge **krache** : elle se
  **réinitialise** et le dopage **retombe** (on perd le multiplicateur accumulé),
  signalé par une **secousse glitch**. Le comportement est **déterministe** (fonction
  du temps/état, **aucun nouveau RNG persisté**) — cohérent avec le cours crypto
  (US-027) et le rattrapage hors-ligne (US-024), pour que fermer/rouvrir l'app ne
  crée aucune incohérence.

- **H4 — Levier de gestion (le vrai gameplay du choix).** Le joueur peut **agir sur
  l'instabilité** : **sécuriser/encaisser** avant le krach (action manuelle qui
  **fige un gain définitif** — voir H5) plutôt que de subir la réinitialisation, ou
  **laisser monter** pour un dopage plus fort au risque de tout reperdre au krach.
  → un arbitrage, pas un bouton « plus de prod gratuite ».
  - _Reco à trancher :_ « sécuriser » **progresse la voie** (jalons → cosmétiques,
    H5), **pas** en une ressource classique définitive — pour ne pas créer un canal
    de production dopée permanente (ce qui trahirait « pas un strict upgrade »).

- **H5 — Pool de cosmétiques glitch de la voie (déterministe, étend US-036).**
  Parcourir la voie débloque **plusieurs** cosmétiques glitch `source: 'corruption'`
  (au-delà du titre unique d'US-036), gagnés à des **jalons de la voie** (ex.
  atteindre un palier de Surcharge, survivre à N krachs, cumul sécurisé) —
  **déterministes** (pas de caisses/RNG, patron « voie déterministe » d'US-033),
  marqués « corruption » en Garde-robe, **gagnés jamais achetés**, **survivent à la
  renaissance**.
  - _Reco à trancher :_ **3-4 cosmétiques** (volumes cohérents avec la Phase A3).

- **H6 — Garde-fous : réversibilité + jamais imposée (P4/P5/P8).** **Purger**
  (US-036) **désactive** la voie : la Surcharge se **gèle/arrête**, le dopage
  disparaît, retour au Réseau propre — **les cosmétiques déjà gagnés sont
  conservés** (P8). **Ré-embrasser** réactive la voie. Le **Réseau propre reste
  pleinement jouable et progressable** : refuser/purger ne bloque **aucune**
  progression (renaissance, jalons, autres cosmétiques).

- **Invariant :** la voie corrompue est un **arbitrage risque/récompense
  auto-contenu, solo, 100 % local-first** ; le dopage est **réel mais compensé par
  l'instabilité** (embrasser n'est jamais « obligatoire par optimisation ») ;
  **aucun nouveau RNG persisté** (déterministe, cohérent hors-ligne/crypto) ;
  cosmétiques **gagnés jamais achetés**, marqués « corruption », survivant à la
  renaissance ; **réversible** (purge) ; **jamais imposée** (le Réseau propre reste
  entier) ; aucun paywall.

### Points d'arbitrage — **tranchés par le PO le 24/07/2026** ✓

1. **Modèle d'instabilité** → **montée → krach au seuil critique** (cycle volatil,
   le plus riche en gameplay). _(alternatives écartées : décroissance/entretien ;
   volatilité pure façon cours crypto.)_
2. **Sort de la Surcharge à la renaissance** → **réinitialisée** (comme les
   ressources) ; seuls la découverte de la voie et les cosmétiques survivent.
3. **Effet de « sécuriser »** → **progresse la voie** (jalons → cosmétiques), **pas**
   une ressource classique définitive (cf. H4).
4. **Taille du pool** → **3-4 cosmétiques glitch** (cf. H5).

**Cadrage fonctionnel validé PO le 24/07/2026** (6 hypothèses + invariant + 10
critères ; 4 arbitrages tranchés sur les recos).

### Critères d'acceptation _(action → résultat attendu, vérifiables)_

1. **Voie inactive hors embrassement** — corruption `dormant`/`refused`/`purged` :
   **aucune** Surcharge, **aucun** dopage ; la production, l'arbre et les ressources
   sont **identiques** au Réseau propre (prolonge l'invariant d'US-036 pour l'état
   non-embrassé).
2. **Activation** — embrasser la corruption (US-036) : la Surcharge **démarre et
   monte** ; un indicateur de voie corrompue apparaît dans l'UI.
3. **Dopage vérifiable** — à Surcharge croissante, le **débit de production affiché
   est supérieur** à l'équivalent Réseau propre, et **croît avec la Surcharge**
   (à état de jeu par ailleurs égal).
4. **Krach au seuil critique** — laisser la Surcharge atteindre le seuil critique :
   un **krach** se produit (Surcharge réinitialisée, dopage retombé), **signalé
   visuellement** (glitch). **Déterministe** : même état de départ → même krach au
   même moment (rejouable).
5. **Levier de gestion** — déclencher l'action **« sécuriser/encaisser »** : l'effet
   attendu se produit (gain figé / progression de la voie) **et** la trajectoire
   d'instabilité est modifiée de façon **observable** (pas de krach subi sur ce
   palier).
6. **Cosmétiques de la voie** — atteindre un **jalon de la voie** : un cosmétique
   glitch `source: 'corruption'` se débloque, **visible en Garde-robe marqué
   « corruption »**, **gagné** (jamais présenté à l'achat).
7. **Purge propre** — depuis l'état embrassé, **Purger** : Surcharge/dopage
   **s'arrêtent**, retour au **Réseau propre** ; **les cosmétiques gagnés restent
   possédés** ; **Ré-embrasser** réactive la voie (Surcharge repart).
8. **Survie renaissance** — après une renaissance : la **découverte de la voie** et
   les **cosmétiques gagnés survivent** (non remis à zéro) ; la Surcharge suit la
   règle tranchée au point d'arbitrage 2.
9. **Hors-ligne déterministe** — fermer l'app en état corrompu, rouvrir après un
   délai : l'évolution de la Surcharge (et d'éventuels krachs) est **rattrapée de
   façon déterministe et cohérente** (patron US-024/US-027), **sans RNG**.
10. **Jamais imposée** — en refusant/purgeant, le **Réseau propre reste pleinement
    jouable et progressable** : renaissance, jalons et cosmétiques hors-voie
    restent accessibles ; ne pas embrasser ne **bloque** aucune progression.

> **Impact UI potentiellement significatif détecté** (nouvelle jauge Surcharge +
> indicateur de dopage + feedback de krach « glitch » + levier de gestion + cartes
> cosmétiques de la voie en Garde-robe). → **étape design/maquette Claude Design
> probablement requise** ; je te le confirmerai précisément après validation des
> cadrages fonctionnel puis technique.

## 2. Cadrage technique  _(porte de validation)_

### Le modèle mécanique retenu (v1)

La voie corrompue est une **jauge de Surcharge** active uniquement quand
`corruption === 'embraced'` (flag posé par US-036) :

- **Charge** : la Surcharge monte **en temps réel tant que l'app est ouverte** (dans
  `applyTick`), à un rythme temporel (indépendant du volume de production → hors-ligne
  simple et déterministe).
- **Dopage** : un **multiplicateur global de production** croît avec la Surcharge
  (`dopageMultiplier(surcharge)`), composé dans `applyTick` **à côté** de
  arbre × boost × prestige. C'est la récompense.
- **Krach** (l'instabilité = la contrepartie) : quand la Surcharge atteint le
  **seuil critique**, elle **krache** → reset à 0, le dopage retombe, secousse glitch.
  **100 % déterministe, zéro RNG.**
- **Sécuriser** (le levier) : convertit la Surcharge courante en **voltage sécurisé**
  (progression de voie) **et** reset à 0 **sans** krach. Plus on sécurise haut, plus
  on gagne — mais viser trop haut = risque de krach (rampe **gâchée**, rien
  sécurisé). **Le risque, c'est l'opportunité perdue** (temps/idle), pas une
  destruction de ressource.
- **Cosmétiques de voie** : des paliers de **voltage sécurisé cumulé** débloquent des
  cosmétiques glitch `source: 'corruption'` (déterministe, patron `rewardsFor`
  d'US-033), qui **survivent à la renaissance**.

### Fichiers impactés

**Créés :**
- `src/game/corruption.ts` _(pur, testé — patron `crypto.ts`/`accelerators.ts`,
  découplé, zéro import de `builder`/`prestige`)_ :
  `SURCHARGE_CONFIG` (`chargeRatePerSec`, `critical`, `dopageMax`, réglages
  placeholder) ; `SurchargeCore { surcharge }` ; `dopageMultiplier(surcharge)`
  (croissant, borné, `1` si `surcharge = 0`) ; `chargeSurcharge(surcharge, dtSec):
  { surcharge; krached }` (avance ; krach = reset 0 au franchissement du critique) ;
  `securedGain(surcharge)` (voltage gagné en sécurisant à ce niveau) ; table des
  **paliers de voie** `CORRUPTION_PATH_TIERS` (seuils de voltage → `id` cosmétique) +
  `pathRewardsFor(prevVoltage, nextVoltage): string[]`. **Déterministe, zéro RNG.**
- `src/game/corruption.test.ts` — dopage monotone + borné, détection de krach,
  `securedGain`, `pathRewardsFor` (paliers franchis), déterminisme, absence de RNG.

**Modifiés :**
- `src/game/cosmetics.ts` — **+3-4 cosmétiques** `source: 'corruption'` (le pool de
  voie ; le titre `corrupt-glitch` d'US-036 reste). `corruptionCosmetics()` existe
  déjà. Met à jour `game/cosmetics.test.ts`.
- `src/db/types.ts` — `BuilderState` gagne **`surcharge: number`** (jauge live,
  reset à la renaissance) ; `CosmeticsState` gagne **`securedVoltage: number`**
  (cumulatif, survit à la renaissance).
- `src/db/db.ts` — **migration Dexie v23** (rétro-remplissage `surcharge: 0` sur
  `builderState` **et** `securedVoltage: 0` sur `cosmeticsState` ; patron des
  migrations de champ v11→v22).
- `src/db/seed.ts` — seed des deux singletons avec les nouveaux champs.
- `src/game/prestige.ts` — `PrestigeCore` gagne `surcharge` ; `prestige()` la
  **remet à 0** (la jauge live fait partie de l'économie remise à zéro — arbitrage 2).
- `src/stores/useBuilderStore.ts` :
  - state `surcharge` ; vue `prestigeCore` inclut `surcharge` ; `persist` l'écrit.
  - `applyTick` : si `useCosmeticsStore.getState().corruption === 'embraced'`,
    `chargeSurcharge` (avance + détecte krach → feedback), puis compose
    `dopageMultiplier(surcharge)` dans les multiplicateurs `cycles`/`data`.
  - **`secureSurcharge()`** (nouvelle action) : lit `surcharge`, calcule
    `securedGain`, reset `surcharge` à 0, délègue à
    `useCosmeticsStore.getState().bankVoltage(gain)` (voir ci-dessous), persiste.
  - `prestige()` : reset de `surcharge` déjà porté par `prestige()` pur.
  - `load()` : `surcharge` chargée telle quelle, **gelée hors-ligne** (aucune avance,
    aucun krach) ; le rattrapage hors-ligne garde les multiplicateurs **de base**
    (arbre × prestige × boost), **sans dopage** (voir décision 3).
- `src/stores/useCosmeticsStore.ts` :
  - state `securedVoltage` ; `persist` l'écrit ; `load` le lit.
  - **`bankVoltage(gain)`** : `securedVoltage += gain`, calcule
    `pathRewardsFor(avant, après)` → `grant(rewards)` (idempotent) + feedback de
    déblocage (patron `grantMilestoneRewards` d'US-033) ; persiste.
  - `purgeCorruption()` : (option) reset local de la Surcharge — voir décision 4.
- `src/stores/useFeedbackStore.ts` — événement **krach** (toast/secousse glitch,
  patron `triggerCrateEarned`/`triggerMilestone`) ; réutilise `triggerCosmeticUnlock`
  (US-033) pour les cosmétiques de voie.
- `src/features/corruption/` — **panneau Surcharge** (jauge `ProgressBar`/
  `ProgressRing` DS + `dopage ×N` + bouton **Sécuriser**, visible **seulement** si
  `embraced`), réutilise `GlitchText`/`Interference` (US-036) ; feedback de krach
  (pic d'`Interference`). `index.ts` exports.
- `src/features/.../BuilderView`/`HackZone` (écran Réseau) — insère le panneau
  Surcharge (surface exacte tranchée au design).
- `src/components/ui/core/Icon.tsx` — icône(s) de voie si besoin (sinon réutilise
  `zap`/`triangle-alert`/`skull` déjà au registre).
- `src/i18n/locales/{fr,en}.json` — bloc `corruption.path.*` (surcharge, dopage,
  message de krach, bouton sécuriser, noms des cosmétiques/paliers). **Style compact
  une ligne préservé.** EN écrit.

### Logique

- **Charge (online)** : `applyTick` compose, quand `embraced`,
  `dopageMultiplier(surcharge)` **avec** `cycleMultiplier × boost × prestige`
  (cycles) et l'équivalent data. Puis `chargeSurcharge(surcharge, dtSec)` avance la
  jauge ; si `krached`, reset (déjà fait par la fonction) + déclenche le feedback de
  krach. Persistance sur la cadence throttlée existante (le krach peut forcer un
  `persist()`).
- **Sécuriser** : `secureSurcharge()` (builder) → `securedGain(surcharge)` → reset →
  `bankVoltage(gain)` (cosmétique) → paliers → cosmétiques.
- **Renaissance** : `prestige()` pur remet `surcharge = 0` (jauge live) ;
  `securedVoltage` et cosmétiques (identité) **survivent**.
- **Hors-ligne (`load`)** : Surcharge **gelée** (déterministe, aucun krach subi en
  l'absence du joueur → pas de feel-bad) ; production rattrapée aux multiplicateurs
  **de base** (dopage exclu — voir décision 3).

### Impacts modèle de données

- **`BuilderState` + `surcharge: number`** (reset renaissance) **et**
  **`CosmeticsState` + `securedVoltage: number`** (survit renaissance) →
  **migration Dexie v23** (rétro-remplissage `0` sur les deux singletons ; patron
  v11→v22). **Aucune reconciliation d'`owned`** (les cosmétiques de voie sont du
  contenu neuf). Le **split** des deux champs est **principiel** : il calque la
  frontière `BuilderState` (remis à zéro par `prestige()`) / `CosmeticsState`
  (identité, survit) posée depuis US-031.
- **Aucun nouveau RNG.** Le seul module hasardeux de `game/*` reste `crates.ts`.

### Décisions techniques à valider

1. **Placement de l'état** : `surcharge` (jauge live, reset renaissance) sur
   **`BuilderState`** (+ `PrestigeCore`) ; `securedVoltage` (cumulatif, survit) sur
   **`CosmeticsState`**. Une **migration v23** couvre les deux tables.
2. **Instabilité 100 % déterministe** : nouveau module pur **`game/corruption.ts`**
   (charge temporelle + krach au seuil, zéro RNG) — cohérent avec `crypto.ts` et le
   rattrapage hors-ligne.
3. **Dopage = bonus de jeu ACTIF (online seulement)** : composé dans `applyTick`,
   **exclu du rattrapage hors-ligne** (offline = multiplicateurs de base, Surcharge
   **gelée**). ⚠️ **Raffine le critère fonctionnel 9** : hors-ligne, la Surcharge ne
   krache pas et le dopage ne s'applique pas (comportement déterministe, prévisible,
   sans feel-bad ; cohérent avec le crypto qui ne s'accumule jamais hors-ligne, et
   avec P5 « récompense l'action »).
4. **Le risque = l'opportunité perdue** : seul **Sécuriser** convertit la Surcharge
   en voltage ; un **krach ne rapporte rien** (rampe gâchée). Pas de débit de
   ressource au krach (sting optionnel réglable en recette). À la **purge** : reset
   de la Surcharge à 0 (re-embrasser repart de zéro) — _à confirmer_.
5. **Cosmétiques de voie déterministes** : **3-4** entrées `source: 'corruption'`,
   débloquées à des **paliers de `securedVoltage`** (`CORRUPTION_PATH_TIERS`), patron
   `rewardsFor` d'US-033.
6. **⚠️ À surveiller en recette (pas un blocage de cadrage)** : le dopage **accélère
   les renaissances** → interaction avec la courbe de prestige incrémentale (US-026,
   invariant anti-boucle). Régler `dopageMax` pour ne pas trivialiser la renaissance.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Cadrage technique validé PO le 24/07/2026** (6 décisions, dont le raffinement du
critère 9 : Surcharge gelée hors-ligne, dopage online-only).

**Impact UI significatif CONFIRMÉ** → **maquette Claude Design requise** avant le
plan d'implémentation. Le thème corrompu global (`data-corruption`) et le rendu
glitch (`GlitchText`/`Interference`) existent déjà (US-036) et sont réutilisés ; le
neuf porte sur le **système de jeu de la voie**.

### Surfaces à maquetter

1. **Le panneau Surcharge (la surface centrale, la plus critique)** — visible sur
   l'écran Réseau **seulement quand `corruption === 'embraced'`** :
   - la **jauge de Surcharge** (0 → seuil critique) avec sa montée « instable » ;
   - l'**indicateur de dopage** courant (`×N` sur la production) ;
   - le **bouton « Sécuriser »** (état actif quand il y a du voltage à encaisser) ;
   - la lisibilité du **risque** (proximité du krach) — comment on « sent » qu'on
     s'approche du seuil critique.
2. **Le feedback de krach** — la secousse glitch quand la Surcharge krache (reset) :
   réutilise `Interference` (pic), à cadrer visuellement (durée, intensité) ;
   **variante `prefers-reduced-motion`** (comme US-036).
3. **Le retour de « Sécuriser »** — feedback quand on encaisse du voltage
   (montant sécurisé, progression vers le prochain palier de voie).
4. **Les cosmétiques de voie en Garde-robe** — les 3-4 nouvelles `CosmeticCard`
   `source: 'corruption'` (traitement magenta/glitch **déjà en place** depuis US-036) ;
   vérifier l'indice de palier (« Débloqué en sécurisant X voltage » ou équivalent).

### Points à trancher au design

- **Emplacement** du panneau Surcharge sur l'écran Réseau (colonne stage sous
  `HackZone` façon `AcceleratorPanel` ? autre ?).
- **Forme** de la jauge : `ProgressBar` DS vs `ProgressRing` (US-030) — laquelle
  porte le mieux la tension « instable ».
- **Ambiance** : le panneau vit-il dans le thème corrompu global (déjà appliqué) ou
  ajoute-t-il un accent local ?

### Maquette

Reçue le 24/07/2026 (`C:\Users\flori\Downloads\corrupted-path`, **non versionnée** —
convention #007). Démo interactive (boucle live partagée) + stills des états clés,
4 surfaces. **Très fidèle à notre DS réel + à l'acquis US-036** (vérifié) :
réutilise `Icon`/`StatCard`/`ProgressBar`/`HudPanel`/`Button`/`Tag`/`Badge`, les
primitives glitch **déjà livrées** `GlitchText`/`Interference` (US-036,
`features/corruption/`), `RarityBadge`/`RankPips` (US-031) et l'accent **magenta
réservé** (`corruptionStyle.ts`, `COR_COLOR`/`COR_RGB`).

**La maquette me donne aussi les courbes de la mécanique** (précieux, repris comme
placeholders affinables en recette) :
- **Dopage** `multOf(g) = 1 + (g/100)^1.25 × 2.6` → **×1.00 → ×3.60** au seuil (=
  `dopageMultiplier`, `dopageMax ≈ 3,6`).
- **Seuil critique** `CRIT = 100` ; **danger** dès ~58 % ; phases stable/tension
  (60 %)/critique (85 %)/krach.
- **Encaissement** `gainOf(g) = round(g × (1 + g/100) × 4)` — **non-linéaire**
  (viser haut rapporte bien plus) = `securedGain`.
- **4 paliers de voltage** : 200 / 600 / 1400 / 3000 V (`CORRUPTION_PATH_TIERS`).

**Plan de réutilisation :**
- **Réutilisé tel quel :** `StatCard`, `ProgressBar` (accent `magenta`), `HudPanel`,
  `Button`, `Tag`, `Icon`, `RarityBadge`/`RankPips` ; `GlitchText`/`Interference`
  (US-036) ; `corruptionStyle.ts` ; **`CosmeticCard`** (gère **déjà**
  `source: 'corruption'` — badge/indice « corruption », cadenas skull magenta) ;
  thème corrompu global `data-corruption` (US-036).
- **Nouveau** (dans `features/corruption/`, justifié, respecte le DS) :
  **`OverloadRing`** (anneau de surcharge — s'inspire de `ProgressRing` mais ajoute
  redline zone critique 85→100, graduations, tremblement `nw-tremble`, couleur
  pilotée par le danger) ; **`OverloadPanel`** (le panneau Surcharge — jauge +
  dopage ×N + alerte de risque + bouton **Sécuriser**) ; **`KrachFeedback`**
  (secousse `nw-krach-shake` + flash `nw-krach-flash` + pic `Interference`,
  reduced-motion) ; **`SecureFeedback`** (retour d'encaissement, accent **mint** =
  gain/succès, cohérent fragments US-035) ; keyframes dans `corruption.css`
  (**toutes sous garde `prefers-reduced-motion`**).

**Écarts / interprétations (à valider PO) :**
1. **Types des cosmétiques de voie** — la maquette invente « cadre d'avatar » et
   « effet d'écran » : **types inexistants** chez nous (`theme|avatar|banner|title`),
   et les **effets sont reportés** (roadmap A3). → **mapping proposé sur nos types
   existants** : Palier I (200 V, `rare`) = **titre** « Fracture » · Palier II
   (600 V, `epic`) = **bannière** « Aberration » · Palier III (1400 V, `legendary`)
   = **avatar** « Surtension » · Palier IV (3000 V, `legendary`) = **titre**
   « 0xDEAD ». Tous `source: 'corruption'`. **+4 au pool** (le titre `corrupt-glitch`
   d'embrassement US-036 reste) → pool corruption = 5, cohérent « 3-4 nouveaux ».
2. **Pas de 6ᵉ rareté** — la « rareté corruption » de la maquette (rank 5) =
   **`legendary` + `source: 'corruption'`** (traitement magenta piloté par la
   source), exactement comme tranché en US-036. Confirmé.
3. **⚠️ Déterminisme (invariant + critère 9)** — la montée « instable » de la démo
   utilise `Math.random()` (jitter). **Écarté** : la charge réelle est
   **déterministe et linéaire dans le temps** (`chargeSurcharge`, **zéro RNG**). Le
   « tremblement instable » est un **rendu CSS déterministe** (`nw-tremble`, pilotée
   par le danger) — aucun impact sur le ressenti, mais garantit l'invariant.
4. **Pas de « LANCER LA CHARGE »** — le bouton play/pause est un **artefact de
   démo**. En vrai, la Surcharge **monte automatiquement dès que la corruption est
   `embraced`** (dans `applyTick`) ; le **seul** contrôle joueur = **Sécuriser**.
5. **Chrome de démo écarté** : « DÉBIT DOPÉ 9.4M », « 2 048 NŒUDS », `HudPanel` FLUX
   CORROMPU / bouton « CANALISER », toggles démo. La vraie intégration : le **débit
   déjà affiché** sur l'écran Réseau est simplement **multiplié par le dopage**
   (composition `applyTick`) — pas de widget « canaliser » bespoke.
6. **Carte verrouillée + progression** — la maquette ajoute une **mini-barre
   voltage/seuil** sur la carte verrouillée. `CosmeticCard` actuel montre un indice
   statique. → petit **ajout optionnel** : passer une progression (`voltage/seuil`)
   à l'état verrouillé `source: 'corruption'` (fidèle maquette, faible coût). _À
   confirmer._

**Arbitrages tranchés par la maquette (recos confirmées) :** (1) **emplacement** =
colonne « stage » sous la zone de HACK (façon `AcceleratorPanel`) ; (2) **forme** =
**anneau** (`OverloadRing`), la `ProgressBar` en lecture secondaire (« trace
d'instabilité ») ; (3) **ambiance** = thème global **+ accent local** dont
l'`Interference` **monte avec la surcharge** (le panneau « chauffe » vers le krach →
l'ambiance devient un indicateur de risque). ✔ Alignés avec §2.

**Alignements notables :** « le krach = rampe gâchée, rien encaissé » colle
exactement à la décision technique 4 (le risque = l'opportunité perdue) ;
reduced-motion géré partout (secousse → flash figé + libellé) = critère 8 ;
`source: 'corruption'` déjà porté par `CosmeticCard` = surface 4 quasi gratuite.

**Maquette validée PO le 24/07/2026** (3 écarts tranchés : mapping des 4 types de
voie sur nos types existants — titre/bannière/avatar/titre, tous `source:
'corruption'` ; charge **déterministe** zéro RNG, tremblement = rendu CSS ; mini-barre
de progression ajoutée à la carte verrouillée).

## 4. Plan d'implémentation  _(porte de validation)_

Ordre bas→haut (pur → données → stores → feedback → UI → i18n → vérifs). Chaque étape
laisse `typecheck` vert. Réglages = **placeholders de la maquette**, affinables en
recette.

**Couche pure (`game/`) — la mécanique + le contenu**
1. **`game/corruption.ts`** _(pur, testé, zéro RNG — patron `crypto.ts`)_ :
   `SURCHARGE_CONFIG` (`critical = 100`, `chargeRatePerSec`, `dopageMax ≈ 3.6`,
   `dopageExp = 1.25`, seuils de danger/phases) ; `SurchargeCore { surcharge }` ;
   `dopageMultiplier(surcharge)` (= `1 + (s/100)^1.25 × 2.6`, croissant/borné) ;
   `chargeSurcharge(surcharge, dtSec): { surcharge; krached }` (avance linéaire ;
   krach = reset 0 au franchissement de `critical`) ; `securedGain(surcharge)` (=
   `round(s × (1 + s/100) × 4)`) ; `CORRUPTION_PATH_TIERS` (200/600/1400/3000 V →
   `id` cosmétique) + `pathRewardsFor(prevVoltage, nextVoltage): string[]`.
2. **`game/corruption.test.ts`** — dopage monotone + borné + `1` à 0 ; krach détecté
   au seuil ; `securedGain` croissant ; `pathRewardsFor` (paliers franchis, aucun
   doublon) ; déterminisme (mêmes entrées → mêmes sorties) ; absence de RNG.
3. **`game/cosmetics.ts`** — **+4 cosmétiques** `source: 'corruption'` : `cor-fracture`
   (`title`, `rare`), `cor-aberration` (`banner`, `epic`), `cor-surtension`
   (`avatar`, `legendary`), `cor-0xdead` (`title`, `legendary`). `corruptionCosmetics()`
   existe déjà. Met à jour `game/cosmetics.test.ts` (compte du pool corruption = 5).

**Données (Dexie) — persistance**
4. **`db/types.ts`** — `BuilderState` gagne **`surcharge: number`** (reset
   renaissance) ; `CosmeticsState` gagne **`securedVoltage: number`** (survit).
5. **`game/prestige.ts`** — `PrestigeCore` gagne `surcharge` ; `prestige()` la
   **remet à 0** (+ mettre à jour `prestige.test.ts`).
6. **`db/db.ts`** — **migration v23** : `surcharge: 0` sur `builderState` **et**
   `securedVoltage: 0` sur `cosmeticsState` (patron des migrations de champ v11→v22 ;
   aucune reconciliation d'`owned`).
7. **`db/seed.ts`** — seed des deux singletons avec les nouveaux champs.

**Stores — la logique**
8. **`useCosmeticsStore.ts`** — state `securedVoltage` (+ `persist`/`load`) ;
   **`bankVoltage(gain)`** : `securedVoltage += gain`, `pathRewardsFor(avant, après)`
   → `grant(rewards)` + `triggerCosmeticUnlock` (patron `grantMilestoneRewards`
   d'US-033) ; persiste. `purgeCorruption()` : appelle en plus
   `useBuilderStore.getState().resetSurcharge()` (re-embrasser repart de 0 —
   décision 4).
9. **`useBuilderStore.ts`** — state `surcharge` ; `prestigeCore` inclut `surcharge` ;
   `persist` l'écrit. **`applyTick`** : si
   `useCosmeticsStore.getState().corruption === 'embraced'` → compose
   `dopageMultiplier(surcharge)` dans les multiplicateurs `cycles`/`data`, puis
   `chargeSurcharge` (si `krached` → `triggerCorruptionKrach` + `persist` forcé).
   **`secureSurcharge()`** (nouvelle action) : `securedGain(surcharge)` → reset
   `surcharge = 0` → `bankVoltage(gain)` → `SecureFeedback` → persiste (no-op si
   `surcharge` trop bas). **`resetSurcharge()`** (petite action pour la purge).
   **`load()`** : `surcharge` chargée telle quelle, **gelée hors-ligne** (le
   calendrier `offlineTick` garde arbre × prestige × boost, **sans dopage**).
10. **`useFeedbackStore.ts`** — **`triggerCorruptionKrach()`** (secousse glitch) +
    file/état pour **`SecureFeedback`** (patron `triggerCrateEarned`/
    `setOfflineCatchup`) ; réutilise `triggerCosmeticUnlock` (US-033) pour les
    cosmétiques de voie.

**Feedback (animations)**
11. **`corruption.css`** — keyframes `nw-tremble` (anneau instable), `nw-krach-shake`
    + `nw-krach-flash` (krach), **toutes sous garde `prefers-reduced-motion`**.

**UI — anneau, panneau, feedbacks**
12. **`features/corruption/OverloadRing.tsx`** — anneau de surcharge (SVG, s'inspire
    de `ProgressRing` : redline zone critique 85→100, graduations, tremblement piloté
    par le danger, couleur magenta → magenta brûlant) ; centre = DOPAGE ×N / KRACH.
13. **`features/corruption/OverloadPanel.tsx`** — le panneau : en-tête + phase,
    `OverloadRing`, `ProgressBar` « trace d'instabilité » (secondaire), **alerte de
    risque** (stable/tension/critique/krach), bouton **Sécuriser** (`+N V`).
    Réutilise `Interference` (`level` branché sur le danger). Prop `compact`.
14. **`features/corruption/KrachFeedback.tsx`** — la secousse au reset (écoute
    l'événement krach du feedback store) ; reduced-motion = flash + libellé figé.
15. **`features/corruption/SecureFeedback.tsx`** — carte d'encaissement (accent
    **mint** : montant + dopage capté + progression vers le prochain palier via
    `nextPalier`/`ProgressBar`). Hébergée comme les toasts (AppShell).
16. **Écran Réseau** (`BuilderView`/`HackZone`) — monte `OverloadPanel` en **colonne
    stage** (façon `AcceleratorPanel`) **seulement si `corruption === 'embraced'`** ;
    câble `onSecure` → `secureSurcharge()`. `features/corruption/index.ts` exports.
17. **`CosmeticCard.tsx`** — **mini-barre de progression** optionnelle sur l'état
    verrouillé `source: 'corruption'` (prop `progress={{ current, target }}`, écart 6) ;
    `WardrobeView` passe `securedVoltage` + le seuil du palier. Vérifier le rendu du
    titre glitch équipé sous `data-corruption`.

**Finitions**
18. **`Icon.tsx`** — ajouter `waves` (en-tête panneau) si absent ; réutiliser
    `shield-check`/`zap-off`/`alert-triangle`/`trending-up`/`check-check`/`skull`/
    `lock`/`unlock` (déjà au registre).
19. **i18n** `locales/{fr,en}.json` — bloc `corruption.path.*` (surcharge, dopage,
    phases, alertes de risque, bouton sécuriser + libellé, krach, noms/sous-titres des
    4 cosmétiques, libellés de paliers) ; **style compact une ligne préservé** ; EN
    écrit.
20. **Vérifs** : `typecheck` + `lint` + `build`/PWA + `tests` (corruption + cosmetics
    + prestige), viser **vert**. Vérif visuelle navigateur en recette (charge, dopage,
    krach + reduced-motion, sécuriser, paliers → cosmétiques, purge/ré-embrasser,
    survie renaissance, gel hors-ligne, réglage `dopageMax` × courbe prestige).

**Plan validé PO le 24/07/2026.**

### État d'implémentation (24/07/2026)

**Terminée.** Les 20 étapes sont livrées. **Vérifs vertes : typecheck + lint +
build/PWA + tests 296/296 (+16).** Écart d'implémentation mineur : le feedback de
krach est **intégré au `OverloadPanel`** (lit l'événement `corruptionKrach` du
feedback store) plutôt qu'en composant `KrachFeedback` distinct — le `KrachDemo` de
la maquette n'était qu'un support de démonstration. Reste : **recette PO** (vérif
visuelle navigateur).
