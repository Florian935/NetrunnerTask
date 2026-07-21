---
name: nouvelle-us
description: Lance le cycle de vie d'une nouvelle user story Netrunner Tasks. Utiliser pour sélectionner la prochaine US, créer sa branche et rédiger son cadrage fonctionnel jusqu'à la première porte de validation.
---

# Démarrer une nouvelle US

Respecter `AGENTS.md` et s'arrêter à la première porte de validation. Ne jamais
enchaîner sur le cadrage technique ni coder pendant ce workflow.

## 1. Sélectionner l'US

- Lire `AGENTS.md`, `project/sprint-en-cours.md` et `project/backlog.md`.
- Choisir l'US à faire de priorité la plus élevée dans le MVP courant.
- En cas d'ambiguïté réelle entre plusieurs US, présenter le constat et demander
  la décision du PO.

## 2. Préparer la branche

- Inspecter la branche et le worktree avant toute opération Git.
- Ne pas écraser, stasher ou déplacer des modifications existantes sans
  autorisation.
- Partir de `develop` à jour et créer `feature/US-XXX-nom-court`.
- Créer `develop` depuis `main` uniquement s'il est absent et si l'historique du
  dépôt confirme que c'est approprié.

## 3. Rédiger le cadrage fonctionnel

- Créer `us/US-XXX-nom-court.md` depuis le gabarit de `us/README.md`.
- Laisser vides les sections de cadrage technique, design et plan.
- Décrire le quoi, le public concerné et des critères d'acceptation testables
  sous la forme action → résultat attendu.
- Passer l'US à `en cours` dans `project/backlog.md`.
- Mettre à jour `project/sprint-en-cours.md` avec l'US active et l'étape de
  cadrage fonctionnel.
- Détecter et signaler un impact UI significatif éventuel.

## 4. Respecter la porte de validation

Présenter le cadrage fonctionnel, puis arrêter le travail et demander sa
validation explicite. Ne pas commencer le cadrage technique.
