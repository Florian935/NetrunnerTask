# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-005** (archivée dans
`us/archive/`).

## Étape du cycle de vie

US-005 terminée : cycle complet (cadrages → maquette → plan → implémentation →
recette **15/15** → commit/merge). Introduit **`SubTask` + `Contract.subtasks`**
(**Dexie v4**), la couche `src/game/priority.ts` et `features/contracts/dueDate.ts`,
la **modale de détail** (`ContractDetail`, surface d'édition unique : titre +
difficulté + priorité + échéance + sous-tâches), les **barres de priorité**, la
**puce d'échéance** (en retard / bientôt), la **progression de sous-tâches** et
leur **réordonnancement animé**. Édition inline d'US-008 supprimée (un seul
bouton « modifier »). Prêt à démarrer **US-006** ou **US-009**.

Reports encore ouverts : **app-shell** — rail de nav + barre de statut (US-010) ;
**i18n des noms de factions** (US-007) ; **progression de niveau**
(dérivation `xp → level`, montée de niveau) et **affichage permanent solde/niveau**
→ US-009 / US-010.

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [x] Migration design system → NIGHTWIRE V3 (**fait**, décision #008).
- [x] US-002 — Modèle de données & persistance locale (Dexie) (**fait**, décision #009).
- [x] Chantier i18n FR/EN (**fait**, décision #010).
- [x] US-003 — Création rapide de contrat (règle des 2 s) (**fait**).
- [x] US-004 — Liste des contrats & complétion (**fait**, décision #011).
- [x] US-008 — Difficulté & calcul de récompense (**fait**, décision #012).
- [x] US-005 — Attributs de contrat (priorité, échéance, sous-tâches) (**fait**, décision #013).

## Prochaine action

Choisir la prochaine US via le skill `nouvelle-us` : **US-006 — Récurrence des
contrats** (enchaîne sur les attributs) ou **US-009 — Progression joueur** (boucle
XP → niveau, chemin critique). Restent aussi US-007 (factions & filtrage).

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
