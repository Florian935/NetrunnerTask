# Roadmap — Netrunner Tasks

> Fil directeur : **le vrai to-do rapide d'abord**, la gamification se superpose
> ensuite, la rétention (caisses / cosmétiques) en dernier. On ne construit
> jamais la couche N+1 avant que la couche N tourne.

> **⚠️ PIVOT ACTÉ (19/07/2026, décision #022) — voir `docs/vision-plateforme.md`.**
> Le produit évolue d'un to-do gamifié vers un **jeu builder social** (façon
> Universal Paperclips, progression réelle = accélérateur). **MVP 1 + US-011→014
> restent acquis** (ils deviennent le « module perso »). **Le reste du MVP 2
> (US-015→019) et le MVP 3 historique ci-dessous sont GELÉS** — réinventés par le
> pivot. Une **roadmap produit (Phases A/B)** les remplacera une fois validée. Les
> sections ci-dessous sont conservées comme **archive** de la trajectoire initiale.

## MVP 1 — Le to-do jouable (la boucle de base)

**Objectif :** une app locale utilisable au quotidien, où créer une tâche prend
2 secondes et où finir un contrat rapporte XP et crédits, avec un niveau qui
progresse.

**Périmètre :**
- Initialisation technique (React + TS + Vite + Tailwind + Zustand + Dexie + PWA)
  et intégration du design system.
- Modèle de données local (contrats, factions, joueur) et persistance Dexie.
- Création rapide de contrat (règle des 2 s), édition, complétion, suppression.
- Attributs : priorité, échéance, sous-tâches, récurrence.
- Factions (catégories de vie) et filtrage.
- Difficulté (trivial → légendaire) → récompense XP + crédits.
- Progression : XP, niveau de netrunner, solde de crédits.
- Tableau de bord / HUD minimal : contrats du jour, niveau, solde.

## MVP 2 — Progression & tension (le moteur d'assiduité)

**Objectif :** donner des raisons de revenir et de tenir dans la durée.

**Périmètre :**
- Contrats permanents (habitudes) + streaks.
- Réputation par faction (gain par contrat, perte sur streak cassé, paliers).
- Contrats à risque (miser des crédits).
- Caisses : 3 qualités (standard / sécurisée / Black ICE), rituel d'ouverture,
  tables de probabilités affichées.
- Inventaire cosmétiques + paliers de rareté + équipement.
- Système de pity + fragments (anti-doublon) + caisse quotidienne/hebdo.

## MVP 3 — Rétention profonde & identité (le complétionnisme)

**Objectif :** polish, méta-jeu, statut et identité.

**Périmètre :**
- Catalogue cosmétiques complet (thèmes, skins, avatars, particules, sons,
  bannières).
- Aperçu de collection (« 3 légendaires restants dans le pool »).
- Achievements (dont cachés), saisons, drops mythiques / corrupted.
- Profil / ID runner (avatar, titre, faction, bannière).
- Polish animations & sons, respect de `prefers-reduced-motion`, installabilité
  PWA soignée.

## Contraintes permanentes (dès le MVP 1)

- Ajouter une tâche prend 2 secondes ; la gamification ne gêne jamais l'usage
  de base.
- Aucun cosmétique ne donne d'avantage fonctionnel.
- Le hasard reste toujours indexé sur l'effort, jamais accélérable par paiement.
- Local-first, hors-ligne, mono-utilisateur, pas de backend au départ.

---

## Roadmap produit — pivot #022 (19/07/2026)

> Remplace, à partir du pivot, les MVP 2/3 historiques ci-dessus (gelés). Vision &
> principes P1–P8 : `docs/vision-plateforme.md`. Chaque tranche de Phase A = une US
> (numérotation US-020+), portes de validation maintenues.

### Phase A — Jeu solo, local-first, sans backend
*Objectif : prouver que le builder est fun, à coût d'infra nul.*

- **A1 — Noyau du builder (squelette vertical)** : une ressource (`cycles`), un
  générateur de base, action manuelle « hack », dépense → 2ᵉ générateur. Boucle
  produire → dépenser → produire-plus. **Porte de vérité : est-ce satisfaisant ?**
- **A2 — Daemons & automatisation** : générateurs automatiques (daemons), montée
  exponentielle, upgrades. Le jeu tourne seul, on optimise.
- **A3 — 2ᵉ couche + arbre de déblocage** : nouvelle ressource/mécanique qui
  **recadre** le jeu (1ᵉʳ effet Paperclips) + 1ᵉʳ **reveal caché** (P6).
- **A4 — Accélérateurs réels AU CHOIX** : un **catalogue** d'accélérateurs
  vérifiables (focus chronométré, podométrie, quiz…) parmi lesquels **le joueur
  choisit** celui qu'il exécute — **jamais imposé** (renforce P5). Livrer le
  **cadre extensible + 1-2 accélérateurs** d'abord, en ajouter au fil du temps.
- **A5 — Hors-ligne & temps écoulé** : production calculée au retour, sauvegarde
  locale robuste, embryon de **prestige/renaissance**. Le « reviens demain ».
- ~~**A6 — Rebrancher le module perso**~~ **gelée (décision #028, 21/07/2026)** :
  brancher le to-do/habitudes **auto-déclarés** sur la production du Réseau
  créerait un canal farmable (contraire à P1/P5) et fait doublon avec les
  accélérateurs **vérifiés** d'A4. Le module perso reste **découplé**, autonome
  (rien n'est perdu, P8). Pourrait reprendre sens plus tard côté
  identité/cosmétique (P1), pas garanti. **A1→A5 = Phase A jouée comme
  suffisante pour prouver le fun** ; la suite passe par le **polish/
  approfondissement du builder** et la réflexion rétention (voir journal
  `vision-plateforme.md`), pas par A6.

### Phase A2 — Approfondissement & rétention (décision #029, 21/07/2026)
*Objectif : approfondir le contenu et la fidélisation du builder existant —
A1→A5 a prouvé le fun, il faut maintenant qu'il tienne dans la durée. Pas une
nouvelle promesse produit, un enrichissement de l'existant.*

Née d'une session de brainstorming PO ↔ Claude (21/07/2026, voir journal
`vision-plateforme.md`) partant d'une analyse fonctionnelle du builder : peu de
contenu (4 daemons, 4 nœuds, 1 seul reveal), aucun jalon de progression, aucune
visualisation qui grandit, 1 seul accélérateur réel, prestige encore sec.

- **US-027 — Marché crypto** : 3ᵉ ressource, comportement **différent** des
  deux premières (pas d'accumulation passive — conversion manuelle de `data`
  à un **cours fluctuant**, 1ʳᵉ vraie décision de timing du jeu). Cours calculé
  par une **fonction déterministe du temps réel** (cohérent avec l'« instant
  absolu » déjà établi — accélérateurs A4, rattrapage hors-ligne A5 — donc
  aucune complexité de rattrapage supplémentaire). Débloqué par un nœud de
  l'arbre `data` existant (chaîne daemons→data→nœud→crypto). Finance une **2ᵉ
  branche** de l'arbre de déblocage (réutilise `UnlockTreeSection`/
  `UnlockNodeCard`), avec un 2ᵉ reveal caché possible. Suite explicite de la
  progression **compute → data → crypto → influence → ???** envisagée dans
  `vision-plateforme.md` §3ter.3.
- **US-028 — Jalons / accomplissements** : liste de milestones (1ᵉʳ daemon,
  seuils de cycles, 1ʳᵉ renaissance…) avec petit feedback dédié. Effort faible,
  impact rétention élevé.
- **US-029 — Visualisation du Réseau** : une représentation qui **grandit
  visuellement** avec la progression, au lieu de panneaux de stats seuls. Le
  plus gros potentiel « wow », le plus gros effort — à cadrer en détail le
  moment venu.
- **US-030 — Catalogue d'accélérateurs élargi** : 2ᵉ/3ᵉ accélérateur réel
  (podométrie, **détox numérique** — la « pépite » de `vision-plateforme.md`
  §3ter.4, jamais construite).
- **US-026 — Prestige : seuil incrémental** *(déjà backloguée, rattachée ici)*.

### Phase A3 — Identité & Collection (décision #035, 22/07/2026)
*Objectif : donner un **statut qui se garde** et une **raison de revenir dans un
mois** — collectionner, s'afficher, compléter. Toujours local-first, sans
backend. C'est la **rétention long-terme** qui manquait : A1→A2 ont donné des
systèmes et des jalons, mais rien à collectionner ni aucune identité. **Prépare**
la Phase B (clans/classements n'ont d'intérêt qu'avec une identité et une
collection à montrer) plutôt que de la court-circuiter.*

Née d'une session de brainstorming PO ↔ Claude (22/07/2026) à la clôture de la
Phase A2. **Réinvente pour le builder** les thèmes gelés du MVP 2/3 historique
(caisses, inventaire, rareté, pity, catalogue cosmétiques, aperçu de collection,
achievements, profil runner) — recadrés, pas réactivés en l'état. **Acquisition
hybride** : socle déterministe (accomplissements → cosmétiques garantis) +
caisses (RNG, pity/fragments). **Cosmétiques v1** : thèmes/palettes HUD + profil
(avatar/bannière/titre) ; effets/particules et sons **reportés**.

**Garde-fous permanents** : aucun cosmétique ne donne d'avantage fonctionnel
(pur statut) ; les caisses se **gagnent** par le jeu, jamais par une monnaie
farmable (hasard indexé sur l'effort). Chemin critique : **US-031 → US-032**.

- **US-031 — Socle cosmétique & rareté** *(fondation, en 1ᵉʳ)* : modèle de
  données cosmétiques (catalogue typé `theme`/`avatar`/`banner`/`title`), rampe
  de rareté `--rarity-*` + `RarityBadge` + `CosmeticCard` (**solde la dette DS
  #008/#022**), moteur d'application d'un thème équipé, inventaire possédé/équipé
  persisté (Dexie).
- **US-032 — Profil / ID runner** *(la vitrine)* : écran de profil assemblant
  avatar + bannière + titre équipés + stats runner (niveau, prestige, jalons).
- **US-033 — Achievements-récompenses + aperçu de collection** *(voie
  déterministe)* : achievements (dont cachés) → cosmétiques ciblés garantis,
  reliés aux jalons d'US-028, + aperçu « X légendaires restants dans le pool ».
- **US-034 — Caisses & rituel d'ouverture** *(voie aléatoire)* : caisses gagnées
  par le jeu (3 qualités), rituel d'ouverture, tables de probas affichées.
- **US-035 — Pity + fragments anti-doublon** *(approfondit les caisses)* : filet
  anti-malchance + conversion des doublons.

### Phase A4 — Corruption / Voie sombre (décision #041, 23/07/2026)
*Objectif : prouver la **rétention long-terme en solo** en attaquant le levier
« ça ne s'arrête jamais » (**P6**) resté inexploité. Toujours local-first, sans
backend. On bâtit un **cadre de reveals extensible** dont le **premier moment
« wahou » est la corruption / le glitch** (le *grandmapocalypse* de Cookie
Clicker, version netrunner). Prépare la Phase B sans la précipiter : le cadre de
reveals resservira, et un solo qui ne s'arrête jamais est le meilleur argument
avant d'investir dans le connecté.*

Née d'une session de brainstorming PO ↔ Claude (23/07/2026) à la clôture de la
Phase A3. Le vrai actif de long terme est le **moteur de reveals** réutilisable
(registre à prédicat de déclenchement pur + flag persisté append-only des reveals
découverts, patron `achievedMilestones` d'US-028), pas la corruption seule : la
corruption en est la **première entrée**. Contenu révélé = une **voie sombre à
embrasser AU CHOIX** (le **pacte** : accepter = branche risquée + dopée +
cosmétiques glitch ; refuser = Réseau propre — respecte P5 « jamais imposé »).
Déclencheur = la **renaissance/prestige** (après **N renaissances**, seuil retenu
3ᵉ, ajustable en recette).

**Garde-fous** : la voie sombre est toujours un choix, jamais requise (P4/P5) ;
rien de définitif n'est détruit (P8 — refuser n'est jamais un cul-de-sac, embrasser
est réversible par une purge) ; cosmétiques glitch gagnés par la voie, jamais
achetés (P4) ; reduced-motion + perf/PWA respectés. Chemin critique : **US-036 →
US-037**.

- **US-036 — L'Éveil de la Corruption** *(le choc + le cadre + le choix)* : moteur
  `game/reveals.ts` + déclenchement au prestige + **séquence glitch « wahou »**
  (aberration chromatique magenta, scanlines, message menaçant ; variante
  `prefers-reduced-motion` obligatoire, P9) + **pacte accepter/refuser** persisté +
  **thème corrompu** (re-skin global) + **1 cosmétique/titre glitch exclusif**.
  Impact UI significatif → **étape design/maquette Claude Design requise**.
- **US-037 — La Voie Corrompue** *(la profondeur mécanique)* : ressource corrompue
  **instable** + production **dopée** avec sa contrepartie (le risque) + pool de
  cosmétiques glitch à gagner en parcourant la voie. Lit le flag `corruption:
  embraced` posé par US-036.

### Phase A5 — Vitrine & prestige de collection (décision #045, 24/07/2026)
*Objectif : donner un **lieu de fierté** où le joueur met en scène ce qu'il a
gagné. Toujours local-first, sans backend. A3 a construit la collection, A4 lui a
donné de la profondeur (corruption) ; A5 lui donne une **raison de s'afficher** —
d'abord pour soi (solo), et surtout **prépare la Phase B** : quand le social
arrivera, le présentoir sera déjà curaté, prêt à impressionner un public.*

Née d'un brainstorming PO ↔ Claude (24/07/2026) à la clôture de la Phase A4, dans
le prolongement de la direction **« collection / vitrine enrichie »** retenue par
le **benchmark IA (décision #043)**. Cœur : une **Salle des trophées** (écran
dédié) où le joueur **compose lui-même** un présentoir mettant en scène ses
**pièces maîtresses** — contenu épinglable **hétérogène** (cosmétiques +
accomplissements), **emplacements qui se gagnent** avec la progression.

**Garde-fous (issus de #043)** : richesse exposée = **complétion et rareté gagnée,
jamais solde ni quantité** ; **`tradeable = false`** posé sur tout objet de statut
dès l'évolution du modèle ; gagné jamais acheté, survit à la renaissance ;
fragments US-035 réutilisés pour les doublons ; **marché entre joueurs écarté**.
Chemin critique : **US-038 → US-039**.

- **US-038 — Socle Salle des trophées** *(fondation, en 1ᵉʳ)* : écran dédié +
  abstraction **« trophée épinglable »** (type + référence) + épingler des
  **cosmétiques** possédés + **1er palier d'emplacements gagnés** + mise en scène
  des pièces maîtresses (réutilise `RarityBadge`/`rarityStyle`/`CosmeticCard`).
  **Pose `tradeable=false`**. → un présentoir jouable de bout en bout.
- **US-039 — Accomplissements épinglables + provenance** : étend l'abstraction aux
  **jalons (US-028) / corruption (US-036) / prestige** ; rend la **provenance
  visible** (« gagné en… », génération/date) — la collection qui se raconte.
- **US-040 — Sets & complétion** *(optionnelle)* : regroupe les objets en
  **ensembles thématiques**, récompense/statut de complétion, éventuel **rang de
  collectionneur** dérivé de la rareté gagnée.

### Phase B — Couche connectée (backend requis, après la preuve du fun)

- **B1** — Comptes/auth + sync local↔serveur + bascule **serveur-autoritatif** (compétitif).
- **B2** — Clans + deux classements + ligues/divisions.
- **B3** — Arènes vérifiables arbitrées serveur (quiz…) alimentant la compétition.
- **B4** — Saisons, événements, mondes partagés, reveals communautaires (serrures mondiales…).

> La Phase B réécrira les contraintes « local-first / mono-utilisateur » de
> `CLAUDE.md` et la section « Contraintes permanentes » ci-dessus — **pas avant**.
