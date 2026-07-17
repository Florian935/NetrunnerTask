# Architecture — Netrunner Tasks

> Décisions techniques et modèle de données. À remplir au fil du projet.
> Les choix structurants sont aussi tracés dans `docs/decisions.md`.

## Vue d'ensemble

- **Type d'app :** locale-first, mono-utilisateur, PWA.
- **Frontend :** React + TypeScript + Vite.
- **Style :** Tailwind CSS.
- **État :** Zustand.
- **Persistance locale :** Dexie (IndexedDB).

## Arborescence du code applicatif

- `src/theme/` — design system NIGHTWIRE (tokens + pont Tailwind + polices).
- `src/components/ui/` — composants du design system (core / forms / feedback /
  surfaces / navigation).
- `src/db/` — **couche de données** : `types.ts`, `db.ts` (Dexie), `seed.ts`,
  `repositories/`, `index.ts` (barrel). Point d'accès unique aux données.
- `src/features/` — code par fonctionnalité (ex. `contracts/` : `ContractsView`,
  `QuickAddContract` ; `common/` : `LanguageSwitcher`). Consomme la couche
  `src/db/` et les composants `ui/`.
- `src/i18n/` — internationalisation (config react-i18next + catalogues
  `locales/{fr,en}.json`). Aucune chaîne d'UI en dur (voir #010).
- `src/stores/` — état applicatif (Zustand).

## Modèle de données

App locale (IndexedDB via Dexie, base `netrunner-tasks`). **Aucun accès Dexie
hors de `src/db/`** : tout passe par les repositories typés.

### Entités (MVP 1)

- **Contract** — la tâche gamifiée : `id`, `title`, `factionId` (`null` = aucune),
  `difficulty` (`trivial | easy | medium | hard | legendary`), `priority`
  (`low | normal | high`), `dueDate` (epoch ms | `null`), `status`
  (`open | done`), `createdAt`, `completedAt` (epoch ms | `null`).
- **Faction** — catégorie de vie : `id`, `name`, `color` (accent NIGHTWIRE),
  `createdAt`. Semées par défaut au 1ᵉʳ lancement (Boulot, Sport, Perso, Santé,
  Apprentissage).
- **Player** — singleton de progression (clé fixe `id: 'me'`) : `xp`, `level`,
  `credits`.

Conventions : dates en **epoch ms**, IDs via `crypto.randomUUID()` (sauf player,
clé fixe). Seeding **idempotent** (`ensureSeeded()`, test d'existence).

### Schéma Dexie & versioning

- **v1** (US-001) : `demoKV: 'key'` (démo jetable).
- **v2** (US-002) : `contracts: 'id, factionId, status, dueDate, createdAt'`,
  `factions: 'id, name'`, `player: 'id'`, `demoKV: 'key'`.

Les évolutions (sous-tâches & récurrence, récompense, réputation, streaks,
cosmétiques, caisses) se feront par **nouvelles versions** Dexie, sans perte de
données.

## Décisions techniques

_Renvoyer vers `docs/decisions.md` pour l'historique daté des choix._
