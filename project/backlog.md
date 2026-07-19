# Backlog — Netrunner Tasks

> Statuts : `à faire` / `en cours` / `fait`. Priorité : `haute` / `moyenne` / `basse`.
> Le MVP 1 est détaillé. Les MVP 2 et 3 seront découpés en US à leur approche.

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
| US-013 | Contrats à risque (mise de crédits) | 2 | moyenne | à faire | crédits (US-009) |
| US-014 | Échéances horodatées + rappels / notifications PWA | 2 | moyenne | à faire | échéances (US-005/006) |
| US-015 | État vide « aucun contrat pour ce filtre » | 2 | basse | à faire | filtre (US-007) |
| US-016 | Socle rareté (rampe `--rarity-*`, `RarityBadge`, `CosmeticCard`) | 2 | moyenne | à faire | design system |
| US-017 | Caisses & rituel d'ouverture (3 qualités, tables de probas) | 2 | haute | à faire | crédits, US-016 |
| US-018 | Inventaire cosmétiques + équipement | 2 | moyenne | à faire | caisses (US-017) |
| US-019 | Pity + fragments + caisse quotidienne/hebdo | 2 | moyenne | à faire | caisses (US-017) |

> **US-014** reprend l'évolution identifiée en US-006 (18/07/2026) : échéances
> gérées **au jour** aujourd'hui → **horodatées + rappels/notifications PWA**
> (l'heure d'échéance n'a de valeur qu'avec une alerte). Impacte la logique
> « en retard / du jour » et la réactivation des récurrents.

> **US-015** reprend l'amélioration identifiée en US-007 (18/07/2026) : état vide
> dédié quand le filtre de faction actif ne renvoie aucun contrat (aujourd'hui la
> file s'affiche vide, sans message ni action pour réinitialiser le filtre).

> **US-016** solde la dette design system #008 (rampe de rareté `--rarity-*` +
> `RarityBadge` + `CosmeticCard`), consommée par les US caisses/inventaire.

## MVP 3 — Rétention profonde & identité

> À découper en US à l'approche du MVP 3 (voir `docs/roadmap.md`).
> Thèmes : catalogue cosmétiques complet, aperçu de collection, achievements &
> saisons, drops mythiques, profil / ID runner, polish & installabilité PWA.

| ID | Titre | MVP | Priorité | Statut |
|----|-------|-----|----------|--------|
| _—_ | _à détailler_ | 3 | _—_ | à faire |
