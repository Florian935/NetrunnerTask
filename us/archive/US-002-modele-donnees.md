# US-002 — Modèle de données & persistance locale (Dexie)

- **MVP :** 1
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-002-modele-donnees

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** poser le **modèle de données local** du cœur du MVP 1 et sa
  **persistance Dexie/IndexedDB**. C'est une US de **fondation** : elle ne livre
  pas d'écran, elle installe les entités et la couche d'accès sur lesquelles
  s'appuieront les US suivantes (création de contrat, liste, difficulté,
  progression). Elle remplace la table de démonstration `demoKV` d'US-001.

  Entités du périmètre (cœur MVP 1) :
  - **Contrat** (la tâche gamifiée) — l'objet central du to-do.
  - **Faction** (la catégorie de vie) — regroupe les contrats.
  - **Joueur** (singleton) — l'état de progression global (XP, niveau, crédits).

- **Pour qui :** indirectement l'utilisateur (ses données survivent aux
  rechargements et au hors-ligne) ; directement les US suivantes, qui branchent
  leur UI sur une fondation de données stable et typée.

- **Périmètre volontairement exclu** (reporté à l'US qui en a besoin, via une
  montée de version Dexie — pas de refonte) :
  - sous-tâches et récurrence des contrats → US-005 / US-006 ;
  - calcul effectif de la récompense (XP/crédits par difficulté) → US-008 ;
  - réputation par faction, streaks, contrats à risque, cosmétiques, caisses →
    MVP 2 / MVP 3.

  Le schéma est toutefois **conçu pour être étendu** sans perte de données.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Au démarrage, la base Dexie `netrunner-tasks` expose les tables
     **`contracts`**, **`factions`** et **`player`** ; l'ancienne table de
     démonstration `demoKV` n'est plus le modèle de référence.
  2. **Contrat persistant** : créer un contrat via la couche d'accès, recharger
     la page (F5) → le contrat est toujours présent avec des champs inchangés.
  3. **Modèle Contrat** : un contrat porte au minimum `id`, `titre`,
     `factionId` (optionnel), `difficulté` (échelle trivial → légendaire),
     `priorité`, `échéance` (optionnelle), `statut` (ouvert / terminé),
     `créléAt`, `terminéAt` (optionnel). _(Champs riches reportés, voir exclusions.)_
  4. **Factions par défaut** : au tout premier lancement, un jeu de factions est
     semé (ex. Boulot, Sport, Perso, Santé, Apprentissage) et interrogeable ;
     aux lancements suivants, **aucun re-seed** (pas de doublons).
  5. **Joueur singleton** : au premier lancement, un enregistrement `player`
     unique est créé avec les valeurs initiales (XP 0, niveau 1, crédits 0) ;
     il est lisible, modifiable, et persistant après reload.
  6. **Couche d'accès typée** : des opérations CRUD typées (TypeScript strict)
     existent pour les contrats et les factions, plus lecture/mise à jour du
     joueur. L'app n'accède aux données **que** par cette couche (pas de requête
     Dexie dispersée dans les composants).
  7. **Versioning** : le schéma est déclaré via `db.version(n)`, prêt à évoluer
     pour le MVP 2/3 sans casser les données existantes.
  8. **Pas de régression** : `npm run build` et `npm run lint` passent ; l'app
     démarre et la page de démonstration reste fonctionnelle (persistance
     éventuellement recâblée sur la nouvelle couche).

## 2. Cadrage technique  _(porte de validation)_

> Identifiants, tables et colonnes **en anglais** (convention). Commentaires et
> textes UI en français.

### Fichiers impactés

- `src/db/types.ts` **(nouveau)** — types du domaine : `Contract`, `Faction`,
  `Player` + unions (`Difficulty`, `Priority`, `ContractStatus`).
- `src/db/db.ts` **(refonte)** — classe Dexie typée, tables + versioning.
- `src/db/seed.ts` **(nouveau)** — `DEFAULT_FACTIONS` + `ensureSeeded()`.
- `src/db/repositories/contracts.ts`, `factions.ts`, `player.ts` **(nouveaux)** —
  couche d'accès CRUD typée.
- `src/db/index.ts` **(nouveau)** — barrel (db, types, repositories, seed).
- `src/main.tsx` **(modif.)** — appel `ensureSeeded()` au démarrage (avant rendu).
- `src/App.tsx` (démo) — inchangé fonctionnellement (voir « Démo » ci-dessous).

### Modèle de données (types)

```ts
type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary'
type Priority   = 'low' | 'normal' | 'high'
type ContractStatus = 'open' | 'done'

interface Contract {
  id: string            // crypto.randomUUID()
  title: string
  factionId: string | null
  difficulty: Difficulty
  priority: Priority
  dueDate: number | null // epoch ms, null = pas d'échéance
  status: ContractStatus
  createdAt: number      // epoch ms
  completedAt: number | null
}

interface Faction {
  id: string
  name: string
  color: string          // token/couleur d'accent NIGHTWIRE
  createdAt: number
}

interface Player {       // singleton
  id: 'me'               // clé fixe → une seule ligne
  xp: number
  level: number
  credits: number
}
```

- **Dates** stockées en **epoch ms** (`number`) : simple, triable, indexable.
- **Reporté** (non modélisé ici) : `subtasks`, `recurrence` (US-005/006), champs
  de récompense/réputation/streak (US-008 / MVP 2). Ajout par montée de version.

### Schéma Dexie & versioning

- Bump `db.version(2)` (v1 = `demoKV` d'US-001) :
  ```
  contracts: 'id, factionId, status, dueDate, createdAt'
  factions:  'id, name'
  player:    'id'
  demoKV:    'key'   // conservée pour la démo, retirée en US-010
  ```
- Index choisis selon les requêtes futures : contrats par `status`, par
  `factionId`, tri par `dueDate` / `createdAt`.

### Couche d'accès (API des repositories)

- `factionsRepo` : `list()`, `get(id)`, `create({name, color})`, `update(id, patch)`, `remove(id)`.
- `contractsRepo` : `list(filter?)`, `get(id)`, `create(input)`, `update(id, patch)`,
  `complete(id)` (passe `status='done'` + `completedAt`), `remove(id)`.
- `playerRepo` : `get()`, `update(patch)`.
- **Aucun** accès Dexie direct hors de `src/db/` (critère 6).
- **Pas de logique de récompense ici** : `complete()` ne fait que basculer le
  statut ; le calcul XP/crédits arrive en US-008. On garde la couche « données
  pures ».

### Seeding (idempotent)

- `ensureSeeded()` appelée au démarrage :
  - si `factions` vide → insérer `DEFAULT_FACTIONS` (Boulot, Sport, Perso, Santé,
    Apprentissage) avec des couleurs d'accent NIGHTWIRE ;
  - si pas de `player('me')` → créer le singleton (`xp:0, level:1, credits:0`).
- Idempotent par **test d'existence** (et non via `on('populate')`, qui ne se
  déclencherait pas lors d'une montée de version d'une base déjà créée) → pas de
  re-seed ni doublon (critères 4 & 5).

### Démo (page jetable)

Les helpers `readDemoValue` / `writeDemoValue` et la table `demoKV` sont
**conservés** tels quels : la page de démo reste fonctionnelle sans effort, et
tout (démo + table `demoKV`) disparaîtra à US-010 quand le vrai HUD la
remplacera. Pas de recâblage inutile d'un écran jetable (règle anti-dérapage).

### Impacts modèle de données

Première définition réelle du modèle → à **reporter dans `docs/architecture.md`**
(section « Modèle de données », aujourd'hui vide) et tracer une décision
`docs/decisions.md` (choix : epoch ms, player singleton, seeding idempotent,
couche repositories).

## 3. Design  _(porte de validation, si impact UI significatif)_

**Non applicable** — US de fondation, aucune UI livrée. (La page de démo n'est
pas un écran produit.)

## 4. Plan d'implémentation  _(porte de validation)_

Ordre d'implémentation (chaque étape compile avant la suivante) :

1. **Types** — `src/db/types.ts` : `Difficulty`, `Priority`, `ContractStatus`,
   `Contract`, `Faction`, `Player`.
2. **Base** — refonte `src/db/db.ts` : classe `NetrunnerDB` typée, `version(2)`
   avec stores `contracts / factions / player / demoKV` ; conserver `db` +
   `readDemoValue` / `writeDemoValue` (démo, Option A).
3. **Seed** — `src/db/seed.ts` : `DEFAULT_FACTIONS` (Boulot, Sport, Perso, Santé,
   Apprentissage, avec couleurs d'accent NIGHTWIRE) + `ensureSeeded()`
   idempotente (test d'existence : factions vides → seed ; pas de `player('me')`
   → créer).
4. **Repositories** — `src/db/repositories/{factions,contracts,player}.ts` :
   CRUD typé ; `contractsRepo.complete()` bascule le statut seulement (pas de
   récompense).
5. **Barrel** — `src/db/index.ts` : ré-exporte db, types, repositories, seed.
6. **Démarrage** — `src/main.tsx` : `await ensureSeeded()` avant `createRoot`.
7. **Hook de recette (dev only)** — sous `import.meta.env.DEV`, exposer les
   repositories sur `window` pour piloter create → reload → read en console
   pendant la recette. Temporaire, retiré quand une vraie UI/pipeline de test
   existera.
8. **Docs** — remplir `docs/architecture.md` § « Modèle de données » ; ajouter
   une entrée `docs/decisions.md` (epoch ms, player singleton, seeding
   idempotent, couche repositories, code en anglais).
9. **Vérif & recette** — `typecheck` + `lint` + `build` ; recette via DevTools
   (IndexedDB : tables présentes, 5 factions semées, 1 player) + console
   (créer un contrat → F5 → toujours là ; relancer → pas de re-seed / doublon).

**Reporté en backlog technique** (hors périmètre US-002) : mise en place d'un
runner de tests (`vitest` + `fake-indexeddb`) pour tester la couche d'accès sans
navigateur. Aujourd'hui pas de runner → recette manuelle via l'étape 7.
