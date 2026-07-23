# Bugs — Netrunner Tasks

> Statuts : `ouvert` / `corrigé`. Gravité : `bloquant` / `majeur` / `mineur`.

| ID | Description | Gravité | Statut | US liée |
|----|-------------|---------|--------|---------|
| BUG-035-1 | Toast « caisse gagnée » (haut-gauche) peu lisible : fond `--bg-surface` (void-500) trop proche de la nav + titre en acier muet (qualité standard). **Corrigé** : fond opaque sombre (void-800) + titre `--text-primary`. | mineur | corrigé | US-035 |
| BUG-035-2 | Carte de caisse **disponible** sans fond distinct (`--bg-surface` void-500 ≈ panneau void-600) → paraît transparente, alors que l'état vide (void-900) se lit bien. **Corrigé** : surface surélevée opaque (void-400) + bordure renforcée. | mineur | corrigé | US-035 |
| BUG-035-3 | À la forge, la carte forgée disparaissait **sans animation** (rendu abrupt). **Corrigé** : flash « FORGÉ » (`nw-forged`, mint) avant le retrait ; commit immédiat en reduced-motion. | mineur | corrigé | US-035 |
| DOC-001 | `sprint-en-cours.md` référence les décisions #012 (US-008) et #013 (US-005) mais elles sont absentes de `docs/decisions.md` (qui s'arrête à #011). Rédiger les entrées manquantes ou corriger les renvois. | mineur | ouvert | US-008 / US-005 |
