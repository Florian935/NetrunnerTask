# Backlog — Netrunner Tasks

> Statuts : `à faire` / `en cours` / `fait` / `gelé`. Priorité : `haute` / `moyenne` / `basse`.
> Le MVP 1 est détaillé. Les MVP 2 et 3 seront découpés en US à leur approche.

> **⚠️ PIVOT ACTÉ (19/07/2026, décision #022) — voir `docs/vision-plateforme.md`.**
> Le produit évolue vers un **jeu builder social**. **MVP 1 + US-011→014 = acquis**
> (futur « module perso »). **US-015→019 (état vide, rareté, caisses, inventaire,
> pity) et le MVP 3 historique sont GELÉS** : réinventés par le pivot. Une roadmap
> produit (Phases A/B) les remplacera une fois validée. Statut `gelé (#022)` = **ne
> pas implémenter en l'état**.

## MVP 1 — Le to-do jouable

Chemin critique de la boucle de base (créer → terminer → récompense → niveau) :
US-001 → US-002 → US-003 → US-004 → US-008 → US-009 → US-010.
Les US-005 à US-007 enrichissent le to-do.

| ID | Titre | MVP | Priorité | Statut |
|----|-------|-----|----------|--------|
| US-001 | Initialisation technique + design system | 1 | haute | fait |
| US-002 | Modèle de données & persistance locale (Dexie) | 1 | haute | fait |
| US-003 | Création rapide de contrat (règle des 2 s) | 1 | haute | fait |
| US-004 | Liste des contrats & complétion (voir / terminer / éditer / supprimer) | 1 | haute | fait |
| US-005 | Attributs de contrat (priorité, échéance, sous-tâches) | 1 | moyenne | fait |
| US-006 | Récurrence des contrats | 1 | moyenne | fait |
| US-007 | Factions (catégories) & filtrage | 1 | moyenne | fait |
| US-008 | Difficulté & calcul de récompense (XP + crédits) | 1 | haute | fait |
| US-009 | Progression joueur (XP, niveau netrunner, solde crédits) | 1 | haute | fait |
| US-010 | Tableau de bord / HUD (contrats du jour, niveau, solde) | 1 | moyenne | fait |

> **Dette design system (suite migration NIGHTWIRE, décision #008)** : les
> composants « game » et la rampe de rareté n'existent pas dans NIGHTWIRE et ont
> été retirés avec l'ancien design system. À **reconstruire sur NIGHTWIRE** dans
> l'US qui les consomme en premier :
> - `ContractCard` → US-004 (liste des contrats).
> - ~~`FactionBadge` → US-007~~ **fait** (reconstruit sur NIGHTWIRE en US-007).
> - Rampe de rareté `--rarity-*` + `RarityBadge` + `CosmeticCard` → MVP 2/3
>   (caisses, inventaire cosmétiques).

## MVP 2 — Progression & tension

> Découpé le 19/07/2026 (voir `docs/roadmap.md`). Chemin critique de rétention :
> **US-011 → US-012 → US-017 → US-018/019**. US-013/014/015 = enrichissements plus
> indépendants ; US-016 = socle technique juste avant les caisses.

| ID | Titre | MVP | Priorité | Statut | Dépend de |
|----|-------|-----|----------|--------|-----------|
| US-011 | Contrats permanents (habitudes) & streaks | 2 | haute | fait | contrats, récurrence |
| US-012 | Réputation par faction (paliers, gain/perte) | 2 | haute | fait | factions, US-011 |
| US-013 | Contrats à risque (mise de crédits) | 2 | moyenne | fait | crédits (US-009) |
| US-014 | Échéances horodatées + rappels / notifications PWA | 2 | moyenne | fait | échéances (US-005/006) |
| US-015 | État vide « aucun contrat pour ce filtre » | 2 | basse | gelé (#022) | filtre (US-007) |
| US-016 | Socle rareté (rampe `--rarity-*`, `RarityBadge`, `CosmeticCard`) | 2 | moyenne | gelé (#022) | design system |
| US-017 | Caisses & rituel d'ouverture (3 qualités, tables de probas) | 2 | haute | gelé (#022) | crédits, US-016 |
| US-018 | Inventaire cosmétiques + équipement | 2 | moyenne | gelé (#022) | caisses (US-017) |
| US-019 | Pity + fragments + caisse quotidienne/hebdo | 2 | moyenne | gelé (#022) | caisses (US-017) |

> **US-014** reprend l'évolution identifiée en US-006 (18/07/2026) : échéances
> gérées **au jour** aujourd'hui → **horodatées + rappels/notifications PWA**
> (l'heure d'échéance n'a de valeur qu'avec une alerte). Impacte la logique
> « en retard / du jour » et la réactivation des récurrents.

> **US-015** reprend l'amélioration identifiée en US-007 (18/07/2026) : état vide
> dédié quand le filtre de faction actif ne renvoie aucun contrat (aujourd'hui la
> file s'affiche vide, sans message ni action pour réinitialiser le filtre).

> **US-016** solde la dette design system #008 (rampe de rareté `--rarity-*` +
> `RarityBadge` + `CosmeticCard`), consommée par les US caisses/inventaire.

## Phase A — Jeu builder (pivot #022, local-first sans backend)

> Nouveau produit (voir `docs/roadmap.md` § « Roadmap produit — pivot #022 » et
> `docs/vision-plateforme.md`). Objectif : **prouver que le builder est fun** à
> coût d'infra nul. Chemin critique : **US-020 → US-021**. Colonne « MVP » = `A`.
> **Phase close (décision #028, 21/07/2026)** : A1→A5 livrés, mission accomplie ;
> A6 gelée. La suite est en **Phase A2** (ci-dessous).

| ID | Titre | MVP | Priorité | Statut | Dépend de |
|----|-------|-----|----------|--------|-----------|
| US-020 | A1 — Noyau du builder (ressource `cycles`, hack manuel, 1ᵉʳ générateur) | A | haute | fait | — |
| US-021 | A2 — Daemons & automatisation (générateurs auto, upgrades, montée exponentielle) | A | haute | fait | US-020 |
| US-022 | A3 — 2ᵉ couche de ressource + arbre de déblocage + 1ᵉʳ reveal caché | A | haute | fait | US-021 |
| US-023 | A4 — Accélérateurs réels **au choix** (catalogue vérifiable : focus + 1) | A | haute | fait | US-021 |
| US-024 | A5 — Hors-ligne & temps écoulé + embryon de prestige | A | moyenne | fait | US-021 |
| US-025 | A6 — Rebrancher le module perso (to-do/habitudes/factions → économie privée) | A | moyenne | gelé (#028) | US-020, module perso |

> **US-025 gelée (décision #028, 21/07/2026)** : brancher le to-do/habitudes
> **auto-déclarés** sur la production du Réseau créerait un canal farmable (le
> joueur peut cocher « fait » sans effort réel) — contraire à P1/P5, et
> redondant avec les accélérateurs **vérifiés** d'US-023 qui remplissent déjà
> ce rôle proprement. Le module perso reste **découplé** du builder : un to-do
> gamifié autonome, disponible tel quel, rien n'est perdu (P8). Pourrait
> reprendre sens plus tard en alimentant de l'**identité/cosmétique** (P1 :
> « nourrit le niveau perso et les cosmétiques », pas la puissance) une fois
> ces systèmes construits (post-MVP 3) — pas avant, et pas garanti.

## Phase A2 — Approfondissement & rétention (décision #029, 21/07/2026)

> Objectif : **approfondir le contenu et la fidélisation** du builder existant
> (A1→A5 a prouvé le fun ; il faut maintenant lui donner de la profondeur pour
> tenir sur la durée), sans repartir sur une nouvelle promesse produit. Née
> d'une session de brainstorming PO ↔ Claude (21/07/2026) — voir
> `docs/vision-plateforme.md` journal. Chemin critique : **US-027** en premier
> (le plus structurant, prolonge directement l'arbre de déblocage existant).

| ID | Titre | MVP | Priorité | Statut | Dépend de |
|----|-------|-----|----------|--------|-----------|
| US-027 | Marché crypto — 3ᵉ ressource (conversion `data`→crypto à cours fluctuant) + 2ᵉ branche de l'arbre de déblocage | A2 | haute | fait | US-022 |
| US-028 | Jalons / accomplissements du Réseau (milestones + feedback dédié) | A2 | moyenne | à faire | — |
| US-029 | Visualisation du Réseau (représentation qui grandit avec la progression) | A2 | moyenne | à faire | — |
| US-030 | Catalogue d'accélérateurs réels élargi (2ᵉ/3ᵉ accélérateur — podométrie, détox numérique…) | A2 | basse | à faire | US-023 |
| US-026 | Approfondissement prestige : seuil de renaissance **incrémental** + équilibrage de la courbe | A2 | basse | à faire | US-024 |

> **US-027** — le marché n'est **pas aléatoire** : cours calculé par une
> **fonction déterministe du temps réel** (même principe que le chrono des
> accélérateurs / le rattrapage hors-ligne), pour rester cohérent avec
> « instant absolu » et éviter toute complexité de rattrapage. Débloqué par un
> **nouveau nœud dans l'arbre `data` existant** (chaîne : daemons→data→nœud→
> crypto). Périmètre v1 volontairement simple : conversion basique (pas de
> montant libre sophistiqué), 3-4 nœuds sur la nouvelle branche, potentiel 2ᵉ
> reveal caché.
>
> **US-026** reprend une limite identifiée à la recette d'US-024 (21/07/2026) :
> le seuil de renaissance (`PRESTIGE_CONFIG.threshold`) est aujourd'hui **flat**
> (choix assumé pour l'embryon A5). Dans un système de prestige mature, il doit
> **monter à chaque renaissance** (sinon, la production accélérant en ×1,5
> composé, atteindre le même seuil devient trivial → renaissances en boucle,
> bonus qui gonfle trop vite). À traiter avec l'équilibrage global de la courbe
> de prestige (formule de seuil, valeur de `nextMult`).

## MVP 3 — Rétention profonde & identité

> À découper en US à l'approche du MVP 3 (voir `docs/roadmap.md`).
> Thèmes : catalogue cosmétiques complet, aperçu de collection, achievements &
> saisons, drops mythiques, profil / ID runner, polish & installabilité PWA.

| ID | Titre | MVP | Priorité | Statut |
|----|-------|-----|----------|--------|
| _—_ | _à détailler_ | 3 | _—_ | à faire |
