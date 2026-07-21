---
name: commit
description: Finalise une US ou un correctif Netrunner Tasks prêt à être livré. Utiliser lorsque l'utilisateur demande explicitement de relire, committer, pousser et intégrer le travail sur develop.
---

# Finaliser une livraison

Suivre ce workflow dans l'ordre. Ne jamais inclure des modifications étrangères
au périmètre demandé et ne jamais écraser le travail local existant.

## 1. Contrôler le contexte

- Lire `AGENTS.md`, `docs/conventions.md`, `project/sprint-en-cours.md` et le
  fichier de l'US concernée.
- Inspecter la branche, `git status`, le diff et les commits récents.
- Vérifier que la recette est terminée pour une US.
- Si la recette d'une US est absente ou incomplète, arrêter le workflow et
  signaler précisément les contrôles manquants.
- Si le worktree contient des changements sans rapport ou si la branche ne
  correspond pas au travail à livrer, arrêter le workflow et signaler
  précisément le blocage. Ne pas stasher ni déplacer ces changements sans
  autorisation.

## 2. Relire le travail

- Vérifier qualité, cohérence, conventions et respect strict du périmètre.
- Exécuter les vérifications proportionnées au changement.
- Corriger les problèmes relevant du périmètre avant de committer.

## 3. Mettre à jour le suivi

- Passer l'US à `fait` dans `project/backlog.md`.
- Mettre `project/sprint-en-cours.md` en accord avec l'état réel et `git log`.
- Vérifier que les résultats figurent dans `project/recettes.md`.
- Fermer dans `project/bugs.md` les bugs effectivement corrigés.
- Ajouter une décision dans `docs/decisions.md` seulement si un choix
  structurant a été pris.
- Pour une US uniquement, passer son fichier à `fait`, puis le déplacer dans
  `us/archive/` avec `git mv`, conformément à `us/README.md`.

## 4. Livrer

1. Créer un commit Conventional Commits en français selon
   `docs/conventions.md`.
2. Pousser la branche `feature/US-XXX-nom` ou `fix/nom`.
3. Fusionner la branche dans `develop` selon la convention du dépôt.
4. Pousser `develop`.

Ne jamais fusionner sur `main` avec ce skill. Ne jamais forcer un push.
