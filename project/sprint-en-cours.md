# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## Travail en cours

**Migration du design system → NIGHTWIRE V3** (hors cycle US classique, décision
#008). Branche `feature/migration-ds-nightwire` depuis `develop`.

## Étape du cycle de vie

Migration réalisée : tokens NIGHTWIRE en source unique, pont Tailwind recâblé,
polices auto-hébergées (Rajdhani + Share Tech Mono), icônes `lucide-react`
(registre statique), **kit complet porté** (21 composants `.tsx`), page de démo
réécrite, ancien design system + junk supprimés. Vérif **typecheck + lint +
build OK**. → **En attente de validation visuelle** avant commit/merge.

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [~] Migration design system → NIGHTWIRE V3 (impl. faite, validation visuelle en attente).
- [ ] US-002 — Modèle de données & persistance locale (Dexie) — prochaine US.

## Prochaine action

1. **Validation visuelle** de la démo (`npm run dev`) puis **commit/merge** via le
   skill `commit`.
2. Ensuite : démarrer **US-002 — Modèle de données & persistance locale (Dexie)**
   via `nouvelle-us`.

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
