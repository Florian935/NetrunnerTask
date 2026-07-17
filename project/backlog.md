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
| US-004 | Liste des contrats & complétion (voir / terminer / éditer / supprimer) | 1 | haute | à faire |
| US-005 | Attributs de contrat (priorité, échéance, sous-tâches) | 1 | moyenne | à faire |
| US-006 | Récurrence des contrats | 1 | moyenne | à faire |
| US-007 | Factions (catégories) & filtrage | 1 | moyenne | à faire |
| US-008 | Difficulté & calcul de récompense (XP + crédits) | 1 | haute | à faire |
| US-009 | Progression joueur (XP, niveau netrunner, solde crédits) | 1 | haute | à faire |
| US-010 | Tableau de bord / HUD (contrats du jour, niveau, solde) | 1 | moyenne | à faire |

> **Dette design system (suite migration NIGHTWIRE, décision #008)** : les
> composants « game » et la rampe de rareté n'existent pas dans NIGHTWIRE et ont
> été retirés avec l'ancien design system. À **reconstruire sur NIGHTWIRE** dans
> l'US qui les consomme en premier :
> - `ContractCard` → US-004 (liste des contrats).
> - `FactionBadge` → US-007 (factions & filtrage).
> - Rampe de rareté `--rarity-*` + `RarityBadge` + `CosmeticCard` → MVP 2/3
>   (caisses, inventaire cosmétiques).

## MVP 2 — Progression & tension

> À découper en US à l'approche du MVP 2 (voir `docs/roadmap.md`).
> Thèmes : contrats permanents & streaks, réputation par faction, contrats à
> risque, caisses & rituel d'ouverture, inventaire cosmétiques, pity & fragments.

| ID | Titre | MVP | Priorité | Statut |
|----|-------|-----|----------|--------|
| _—_ | _à détailler_ | 2 | _—_ | à faire |

## MVP 3 — Rétention profonde & identité

> À découper en US à l'approche du MVP 3 (voir `docs/roadmap.md`).
> Thèmes : catalogue cosmétiques complet, aperçu de collection, achievements &
> saisons, drops mythiques, profil / ID runner, polish & installabilité PWA.

| ID | Titre | MVP | Priorité | Statut |
|----|-------|-----|----------|--------|
| _—_ | _à détailler_ | 3 | _—_ | à faire |
