# Conventions — Netrunner Tasks

## Langue

- **Commentaires et documentation** : **français**.
- **Tout le code technique s'écrit en anglais** : identifiants (variables,
  fonctions, types, interfaces, hooks, stores), **noms de tables et de colonnes**
  de la base, clés d'objets, valeurs d'énumérations, **clés de traduction i18n**.
  Pas de franglais dans le code.
- **UI bilingue FR/EN via i18n** : **aucune chaîne d'UI en dur** — tout passe par
  `t()` (react-i18next) et les catalogues `src/i18n/locales/{fr,en}.json`. Les
  clés sont en anglais (ex. `contracts.title`), les valeurs sont les traductions.
  Toute US ajoute ses libellés dans les **deux** catalogues. Voir décision #010.
- Dates : documentation en **JJ/MM/AAAA** ; dans l'UI, format **localisé** selon
  la langue (FR JJ/MM/AAAA, EN format local).

## Nommage

- **Composants React :** `PascalCase` (`ContractCard.tsx`).
- **Hooks :** `camelCase` préfixé `use` (`usePlayerStore.ts`).
- **Stores Zustand :** `useXxxStore` (`usePlayerStore`).
- **Fichiers utilitaires / logique :** `camelCase` (`computeReward.ts`).
- **Types & interfaces :** `PascalCase` (`Contract`, `PlayerState`).
- **Constantes globales :** `SCREAMING_SNAKE_CASE`.
- **Dossiers :** `kebab-case`.

## Structure des fichiers (à affiner à la première US technique)

Conventions à confirmer : composants par fonctionnalité, stores centralisés,
logique métier pure isolée de l'UI.

## Messages de commit — Conventional Commits (adapté)

Format : `type(portée): description courte à l'impératif`

- **type** : `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`.
- **portée** (optionnelle) : l'US concernée (`us-001`) ou le module.
- **description** : en français, à l'impératif présent, sans point final.

Exemples :

```
feat(us-001): initialise le projet Vite + React + TypeScript
fix(contrats): corrige le calcul d'XP sur contrat expiré
docs(gouvernance): pose l'arborescence de pilotage
chore: configure Tailwind et le thème cyberpunk
```

Corps de commit (optionnel) : expliquer le **pourquoi** si non évident.
Référencer l'US et fermer les bugs quand pertinent.

## Qualité

- TypeScript strict.
- Pas de code mort ni de `console.log` oublié en dehors du debug volontaire.
- Respect strict du périmètre de l'US en cours (voir `CLAUDE.md` §8).
