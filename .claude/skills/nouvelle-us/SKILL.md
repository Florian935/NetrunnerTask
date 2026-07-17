---
name: nouvelle-us
description: Lance le cycle de vie d'une nouvelle US Netrunner Tasks — sélection dans le backlog, création de la branche feature depuis develop, puis démarrage du cadrage fonctionnel jusqu'à la première porte de validation.
---

# Skill `nouvelle-us`

Démarre le cycle de vie d'une US en respectant `CLAUDE.md` §3. S'arrête à la
**première porte de validation** (cadrage fonctionnel) — ne jamais coder ici.

## Étapes

1. **Sélection**
   - Lire `project/backlog.md`.
   - Choisir la prochaine US prioritaire du MVP courant (statut `à faire`,
     priorité la plus haute). En cas d'ambiguïté, proposer et demander confirmation.

2. **Branche**
   - S'assurer d'être à jour sur `develop` (la créer depuis `main` si absente).
   - Créer `feature/US-XXX-nom-court` depuis `develop`.

3. **Fichier de cadrage**
   - Créer `us/US-XXX-nom-court.md` à partir du gabarit de `us/README.md`.

4. **Cadrage fonctionnel** (porte de validation)
   - Rédiger : quoi / pour qui / critères d'acceptation testables
     (action → résultat attendu).
   - Mettre l'US en `en cours` dans `project/backlog.md`.
   - Mettre à jour `project/sprint-en-cours.md` (US active, étape = cadrage
     fonctionnel).
   - **STOP** — présenter le cadrage et demander validation avant toute suite.

## Rappels

- Ne pas enchaîner sur le cadrage technique sans validation explicite.
- Ne pas coder.
- Détecter si l'US aura un impact UI significatif et le signaler (étape design
  ultérieure).
