---
name: commit
description: À invoquer quand une US ou un fix Netrunner Tasks est prêt(e). Exécute dans l'ordre revue de code, mise à jour des fichiers de suivi, commit conventionnel, push de la branche, merge sur develop, puis push de develop.
---

# Skill `commit`

À invoquer quand une US (ou un fix) est prête. Exécuter **systématiquement**,
dans l'ordre, sans sauter d'étape.

## Étapes

1. **Revue de code**
   - Relire le travail réalisé : qualité, cohérence, respect des conventions
     (`docs/conventions.md`), respect strict du périmètre de l'US.
   - Corriger avant de commiter si nécessaire.

2. **Mise à jour des fichiers de suivi**
   - `project/backlog.md` : passer l'US en `fait`.
   - `project/sprint-en-cours.md` : refléter la clôture (US terminée, étape
     commit/merge).
   - `project/recettes.md` : consigner les résultats de recette.
   - `project/bugs.md` : fermer les bugs corrigés (statut `corrigé`, US liée).
   - `docs/decisions.md` : ajouter une entrée si un choix structurant a été fait.
   - **Archivage de l'US** (US uniquement, pas les fix) : mettre le statut du
     fichier `us/US-XXX-*.md` à `fait`, puis le déplacer dans `us/archive/`
     (`git mv`). Voir `us/README.md`.

3. **Commit**
   - Message respectant la convention de `docs/conventions.md`
     (Conventional Commits en français), ex. `feat(us-001): ...`.

4. **Push de la branche** (`feature/US-XXX-nom` ou `fix/nom`) sur le remote.

5. **Merge** de la branche sur `develop`.

6. **Push de `develop`** sur le remote.

## Rappels

- Ne pas merger sur `main` ici (réservé aux MVP livrés stables).
- Vérifier que la recette est faite avant de clôturer une US
  (skill `recette` si besoin).
