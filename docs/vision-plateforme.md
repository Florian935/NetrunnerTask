# Vision — Plateforme Netrunner (exploration)

> **Statut : EXPLORATOIRE (19/07/2026).** Document de brainstorming vivant, issu
> d'aller-retours PO ↔ Claude. **Il ne remplace PAS** la roadmap ni le MVP en
> cours : le socle actuel reste `local-first, mono-utilisateur` (voir `CLAUDE.md`
> et `docs/roadmap.md`). Rien ici n'est décidé ni planifié tant que ce n'est pas
> tranché et inscrit dans `docs/decisions.md`. On rêve grand ici ; on continue à
> livrer petit là-bas.

---

## 1. L'étoile polaire

**Transformer la progression réelle — apprendre, bouger, se concentrer, faire le
bien — en un jeu social et compétitif, pour la culture gamer.**

Le to-do était **un** véhicule de motivation. La plateforme en aura plusieurs.
Trois exigences non négociables se superposent à cette vision :

1. **Fun & rétention** — on veut revenir tous les jours, comme sur un vrai jeu.
2. **Sain & pro-social** — ça stimule réellement l'utilisateur et promeut des
   comportements bénéfiques (pour lui et pour la société), sans l'enfermer.
3. **Incheatable là où ça compte** — la compétition ne récompense jamais le
   mensonge.

---

## 2. Principes fondateurs (les invariants qu'on a posés)

Ces règles sont le squelette. Toute idée du buffet (§3) doit s'y plier.

- **P1 — Deux économies séparées.**
  - *Économie privée* : nourrie par tout ce qui est **auto-déclaré** (to-do,
    habitudes, bonnes actions). Alimente le **niveau perso et les cosmétiques
    perso**. **Cachée : visible du seul utilisateur, jamais des autres.**
    Incheatable parce qu'elle ne compte que pour soi.
  - *Économie compétitive* : nourrie **uniquement** par des activités
    **vérifiables** (§P2). Alimente les classements.
  - → Empêche le trou à triche « spammer des tâches pour farmer le classement ».

- **P2 — La monnaie compétitive doit être vérifiable.** Un to-do auto-déclaré
  n'est pas vérifiable ; une activité que **l'app arbitre** l'est. Deux modèles
  d'équité acceptés : (a) *arbitré par l'app* (quiz corrigé, chrono in-app,
  capteur) ; (b) *jugé par les pairs* (vote de la communauté sur une
  contribution). Tout le reste reste en économie privée.

- **P3 — Deux classements, le clan facultatif.** Un **classement de clans** et un
  **classement individuel**. On peut jouer et grimper **sans clan**. À l'intérieur
  d'un clan : entraide et objectifs coopératifs.

- **P4 — Aucun avantage payant/fonctionnel.** Les récompenses sont cosmétiques /
  statutaires. Le hasard reste indexé sur l'effort, jamais accéléré par paiement.
  (Hérité de la roadmap actuelle.)

- **P5 — Santé d'abord (anti-addiction).** L'app pousse à **agir dans la vraie
  vie**, pas à rester scotché à l'écran. Le méta-moteur incrémental (§3-C) est
  **alimenté par de vraies actions**, pas par le simple temps passé. Garde-fous
  bien-être assumés (limites saines, « va vivre ta vie »).

- **P6 — Socle accessible, forêt cachée.** *(tranché le 19/07/2026)* Dès le
  départ, l'utilisateur dispose d'un **ensemble de fonctionnalités déjà jouables**
  — pas de mur pour les débutants. Mais **l'immense majorité de la profondeur est
  cachée** et se révèle progressivement, avec un **effet de surprise assumé**
  (« attends, il y a *encore* ça ?! »). L'arbre cache la forêt : à chaque
  déblocage, l'utilisateur découvre que le jeu était bien plus vaste qu'il ne le
  croyait. C'est la fusion opérationnelle du Pilier A (profondeur cachée) et du
  Pilier B (dévoilement progressif) — sans le mur d'entrée d'un pur Paperclips.

- **P7 — Monétisation saine, à valeur perçue.** *(posé le 19/07/2026)* La
  monétisation **finance l'infrastructure** (indispensable en connecté) mais
  respecte P4 & P5 : **jamais d'avantage compétitif ou fonctionnel**, **jamais de
  caisse payante à résultat aléatoire** (= loterie → remords + gambling réglementé).
  L'argent achète du **connu, choisi, direct**. Objectif ressenti : *« j'ai payé
  et ça valait grave le coup »*, moteur de bouche-à-oreille — pas du remords.

- **P8 — Continuité inter-mondes : rien n'est jamais vain.** *(posé le 19/07/2026)*
  Un monde « terminé » ne remet pas les compteurs à zéro : il devient un **socle**
  pour le suivant. On repart avec un **nouveau personnage à faire monter**, mais
  **tout l'acquis reste** : identité & économie perso **persistent** (P1) ; l'ancien
  monde **continue de produire** en fond et alimente le nouveau ; une **monnaie
  d'héritage** + un **fil narratif** relient tous les mondes. Tout est
  interconnecté. Voir §3-C (changement de monde).

- **P9 — Immersion « wahou » dès l'arrivée.** *(posé le 19/07/2026 — exigence PO
  forte)* L'app doit **plonger** l'utilisateur dans l'univers du design system
  (NIGHTWIRE cyberpunk) dès l'ouverture : identité visuelle forte, effets et
  retours **« wahou »**, sensation d'**entrer dans un monde** — pas dans un tableur.
  L'immersion est un **critère de qualité de premier ordre**, traité à l'**étape
  design de chaque tranche** (en respectant `prefers-reduced-motion` et la
  perf/PWA). Nuance de cadrage : on ne **gold-plate** pas un squelette avant
  d'avoir prouvé le fun — sur les premières tranches on vise « **immersif mais pas
  sur-produit** », la pleine mise en scène arrivant quand la boucle est validée.

---

## 2bis. Monétisation — saine & à forte valeur perçue

> Contexte : la version connectée **coûte** (serveurs, sync, modération). Il
> **faut** monétiser. Cible PO : payer = *« grave le coup »*, jamais du remords.

> **RÈGLE D'OR *(tranchée le 19/07/2026)* :** *l'argent achète de l'**EXPRESSION**
> (cosmétique, skins, interfaces, design systems, effets, bannières, avatars,
> univers visuels premium) ; **l'effort** débloque le **CONTENU & le POUVOIR**
> (arènes, mécaniques, forêt cachée, tout ce qui touche au classement).* Vendre du
> contenu/pouvoir = pay-to-win (viole P4) **et** tue la surprise (viole P6).
> Les **caisses payantes à résultat aléatoire sont enterrées.**

**Modèles qui collent (valeur perçue forte, respect P4/P5/P7) :**
- ⭐ **Achat direct de cosmétiques** — tu **vois** ce que tu prends, tu le
  **choisis**, tu l'obtiens. Zéro hasard = zéro remords. (Modèle boutique Fortnite.)
- ⭐ **Passe de saison généreux** — payé une fois/saison, débloqué **en jouant**.
  « 50 objets pour le prix de 2 » → énorme valeur perçue + récompense l'assiduité +
  bouche-à-oreille. **Condition : ne jamais vendre le “skip du grind”.**
- **Statut fondateur / soutien** — prestige cosmétique pour ceux qui *veulent*
  financer un projet qu'ils aiment (badge, titre, « founder », nom au générique).
  Parfait pour un projet passion.
- **Volet don / impact réel** (§3-F) — une part finance des causes ; on paie aussi
  pour le bon sentiment. Très fort en bouche-à-oreille.
- *(option)* **Caisses cosmétiques** MAIS ouvertes avec **monnaie gagnée
  uniquement** — l'excitation gacha reste, l'argent n'achète **jamais** le tirage.

**Anti-patterns bannis (tuent la valeur perçue ET violent les principes) :**
- **Caisses payantes à résultat aléatoire** → loterie, remords, réglementé/interdit
  ailleurs (Belgique, Pays-Bas), scruté en France/UE. Incompatible P5.
- **Pay-to-win / avantage payant** → détruit l'intégrité des classements (critique
  maintenant qu'il y a de la compétition). Viole P4.
- **Paywall d'énergie / timers** bloquant l'outil → viole P5 et la règle « 2 s ».

**Timing :** concerne la version **connectée** (là où il y a de l'infra à financer).
En solo local-first, aucun coût → pas de monétisation.

---

## 3. Le buffet d'idées (piliers de gameplay)

> ⭐ = piste forte à mes yeux. Rien n'est arbitré : c'est de la matière à trier.

### A. Arènes vérifiables — *carburant de la compétition*
Activités que l'app peut arbitrer → nourrissent classements clan **et** individuel.

- ⭐ **Duels de quiz / apprentissage** — langues, culture, code, histoire… L'app
  corrige. C'est le pilier éducation, et il *rend la compétition possible*.
- ⭐ **Sessions de focus chronométrées** — deep work en « run de hack » (type
  Forest), mais compétitif. L'app tient le chrono → vérifiable.
- **Mini-jeux d'entraînement cognitif** — calcul mental, mémoire, logique, frappe
  rapide. Fun *et* muscle de vraies compétences. Très « gamer ».
- ⭐ **Podométrie / capteurs** — pas du téléphone (plus tard : GPS course/marche).
  Plus dur à falsifier qu'une case cochée.
- **Répétition espacée** (flashcards type Anki gamifié) — révision notée par l'app.
- **Défis de lecture** — lire X minutes + quiz de compréhension pour valider.
- **Méditation / respiration guidée** — in-app, chronométré. Angle bien-être.
- **Code katas / défis de programmation** — vérifiés par tests. Public dev/gamer.
- **Défis créatifs jugés par les pairs** — écriture, dessin, photo du jour ; équité
  par vote communautaire (modèle P2-b). Peut alimenter surtout l'individuel.

### B. Motivation privée — *économie perso, système d'honneur*
Auto-déclaré, incheatable car privé. **Ne touche jamais aux classements.**

- **Module to-do** (gardé, petit) + **habitudes & streaks** (déjà construits).
- **Quêtes « bonnes actions »** — on partage l'histoire ; la célébration vaut plus
  que les points.

### C. Le méta-moteur incrémental — *l'esprit « usine à trombones »*
Ce qui relie tout et crée l'addiction saine de la découverte.

- ⭐ **Ta base / QG de netrunner** qui **produit passivement** des ressources
  (crédits, fragments) et **s'optimise pendant ton absence** — comme un
  idle-game. **MAIS** (P5) le « carburant » qui la fait tourner se **gagne par de
  vraies actions** (quiz, focus, pas). Sans effort réel, la machine s'essouffle →
  on réconcilie l'idle avec la mission pro-sociale.
- ⭐ **Arbre de déblocage (tech tree)** — le Pilier B formalisé : tu **commences
  avec très peu** (un seul module) et tu débloques **progressivement** arènes,
  modules, agents, mécaniques. L'app se **réinvente** en jouant.
- **Agents / bots automatisés** débloqués qui « farment » un peu hors-ligne, dans
  la limite du carburant réel accumulé.
- **Profondeur cachée (Pilier A)** — des plafonds affichés qui, une fois franchis,
  **révèlent des paliers secrets** (« attends, il y avait ça ?? »). Génère
  bouche-à-oreille, wikis, entraide *hors* app.
- **Prestige / renaissance** — recommencer avec un bonus, rétention long terme.
- ⭐ **Changement de monde / actes** *(idée 19/07/2026)* — expression ultime de
  P6 et pur ADN Paperclips : quand l'utilisateur « termine » la **forêt
  cyberpunk**, il ne débloque pas juste un palier, il **bascule dans un univers
  entièrement nouveau** — nouveau thème, nouveau design system, nouvelles
  mécaniques. Effet de choc total (« il y avait carrément *un autre monde* ?! »).
  Paperclips fait exactement ça (trombones → espace → univers). **Le fil qui
  relie les mondes** : la progression réelle de l'utilisateur et son **identité /
  économie perso persistantes**, qui traversent les mondes (les mondes sont des
  re-skins + nouveaux jeux de mécaniques par-dessus le même moteur de progrès
  réel — pas du hasard). Concept **« acte 2/3 »**, pas un prérequis de lancement.

### D. Colle sociale & clans
- ⭐ **Clans à identité** — bannière, **QG de clan qui monte de niveau** (= ton
  « XP de clan »), rôles, chat.
- **Raids / objectifs coopératifs de clan** — heures de focus ou score de quiz
  *collectifs*. C'est l'entraide intra-clan.
- **Mentorat / duo** — un vétéran parraine un nouveau ; les deux gagnent. Casse la
  toxicité du pur classement.
- **Amis & feed d'activité** — voir et encourager ses amis (kudos type Strava).
- **Défis entre amis (1v1)** — sur des arènes vérifiables uniquement (sinon triche).
- **Événements limités / mondiaux** — week-ends thématiques, objectif communautaire
  géant. Feeling live-service.

### E. Rétention & progression
- ⭐ **Ligues / divisions** (type Duolingo : bronze → diamant, promotion/relégation
  hebdo). Tu affrontes des gens **de ton niveau** → compétition perçue comme juste,
  pas écrasée par le top mondial.
- **Saisons / passe** — resets, cosmétiques saisonniers, « chapitres ». Gros moteur
  de rétention, nourrit le Pilier A.
- **Défis quotidiens / hebdomadaires** — daily quests.
- **Achievements (dont cachés)**, **collections & cosmétiques** (déjà roadmap MVP3).
- **Trame narrative cyberpunk** qui avance avec toi — donne du sens, crée le
  « et après ? ».

### F. Impact réel & santé — *l'angle sociétal*
- **Dons / impact réel** — convertir l'effort collectif en impact concret via
  partenariats (« le clan a couru X km → des arbres plantés »). Sens sociétal fort.
- **Garde-fous bien-être** — limites saines, rappels de déconnexion, design
  anti-addiction assumé (P5).

---

### G. Moments « WOW » — bibliothèque de reveals *(le cœur émotionnel, P6 poussé à fond)*
> But : l'utilisateur ne sait jamais ce qu'il y a derrière → il continue, il en
> parle, une communauté se forme. **« Ça ne s'arrête jamais. »** Tous **gagnés par
> l'effort** (P1–P7), jamais achetés. Chacun coûte cher → horizon lointain ; ce
> qu'on construit tôt, c'est le **cadre** qui permet d'en ajouter à l'infini.

**Famille 1 — L'app se révèle plus qu'une app (rupture de cadre)**
- ⭐ **Autres mondes / multivers** (déjà §3-C) — au bout du cyberpunk, un univers
  totalement neuf. Il croyait jouer à *une* app ; il en découvre dix.
- ⭐ **Le réveil de l'IA** — l'assistant/HUD utilitaire se révèle être une
  **conscience** avec sa voix, ses objectifs ; elle casse le 4ᵉ mur (pur Paperclips).
- **L'interface se métamorphose** — le HUD utilisé depuis des semaines se démonte
  et se reconstruit sous ses yeux à un cap. Le contenant devient contenu.
- **« Tu n'étais pas seul »** — ce qu'il croyait solo révèle le réseau mondial des
  netrunners (= le moment de bascule vers la couche connectée, mis en scène).

**Famille 2 — Les secrets qui exigent la COMMUNAUTÉ (moteur d'engouement)**
- ⭐ **Langage / glyphes à décoder** (type Tunic, Fez) — un cipher netrunner que
  **personne ne perce seul** ; la communauté collabore (Discord/wiki). LE générateur
  de communauté.
- ⭐ **Serrures mondiales** — une porte qui ne s'ouvre que si des milliers de
  joueurs cumulent X (heures de focus, quiz) → déblocage **mondial simultané**.
  « Le jour où le Réseau a ouvert la Faille. » Moment historique partagé.
- **Secrets uniques au monde** — le 1ᵉʳ à débloquer un truc obtient un objet/titre
  **non reproductible** (nom gravé). Course communautaire.
- **ARG / brèches dans le réel** — indices hors app (site, QR, coordonnées) qui
  débloquent du contenu. Le jeu déborde dans la réalité.

**Famille 3 — Le jeu réagit au réel & au temps**
- **Événements du monde réel** — l'app « sait » (heure, saison, fêtes) et fait
  surgir du contenu éphémère. « Il se passe un truc bizarre à minuit. »
- **Drops éphémères** — visibles 24 h, jamais revus. FOMO **sain** (présence, pas paiement).
- **Le monde vieillit avec toi** — après des mois : ta base devient mégapole, des
  PNJ te reconnaissent, ta légende se raconte.

**Famille 4 — Vertige mécanique (Paperclips pur)**
- ⭐ **Méta-mécaniques** — tu débloques la capacité de **changer les règles** :
  automatiser, programmer tes agents (mini-langage), **créer tes propres
  contrats/quiz** pour la communauté. Le joueur devient créateur.
- **Systèmes gigognes** — chaque système en révèle un autre imbriqué (économie →
  marché → spéculation → « hack du marché »…). Impression d'infini.
- **Prestige / renaissance** à effet visible — New Game+ qui réécrit le début.

**Famille 5 — Identité & statut légendaires**
- **Rangs mythiques quasi-inatteignables** — un sommet dont l'existence même est un
  mythe. Personne ne sait s'il est atteignable. Légende communautaire.
- **Devenir une figure du monde** — les meilleurs deviennent des PNJ/mentors que
  les autres croisent. Ton avatar entre dans le lore partagé.

**Famille 6 — L'émerveillement pur**
- **Le jeu se souvient** — il te ressort un truc fait il y a 6 mois. « Il s'en
  souvenait ?! »
- ⭐ **Fausses limites partout** — chaque « fin » (rang max, niveau max, fin d'un
  monde) est un leurre qui ouvre plus grand. **P6 systématisé** : plus rien n'est
  jamais vraiment le plafond.

**Seconde vague *(19/07/2026)***
- ⭐ **Événement live mondial daté** (façon concerts Fortnite) — à une date/heure
  précise, tout le monde se connecte pour un événement scénarisé **unique, jamais
  rejoué**. « J'y étais. »
- **Saisons qui transforment le monde** — la carte/l'univers change visiblement à
  chaque saison (un truc explose dans le ciel un dimanche soir, le monde n'est plus
  le même).
- **La corruption / le glitch** (façon *grandmapocalypse* de Cookie Clicker) — un
  jour « quelque chose tourne mal » : l'esthétique se corrompt, ouvrant une voie
  sombre alternative.
- **Le Réseau change la nuit** — un mode nuit *littéral* où d'autres mécaniques et
  contenus existent (monde nocturne ≠ diurne).
- **Ta légende s'écrit toute seule** — l'app génère un récit personnalisé de ton
  parcours réel, à relire / partager.
- **New Game+ où tu passes de l'autre côté** — après avoir tout fini, tu rejoues en
  incarnant l'IA / l'antagoniste.
- **Infiltration douce entre joueurs** — tu « hackes » la base d'un rival (PvP
  asynchrone, cosmétique, sans perte réelle).
- **Classes / spécialisations secrètes** débloquées par des chemins improbables.
- **Rêves / séquences oniriques** — mini-mondes surréalistes qui brisent les règles,
  débloqués par l'effort.

---

## 3ter. Le socle de jeu — quel est le « vrai jeu » ? *(question majeure, 19/07/2026)*

> Constat PO : se reposer **uniquement sur des quiz** est trop mince — ça doit
> devenir **un vrai jeu**. Question : quel est le **loop fondamental** auquel on
> joue, qui donne envie de rester et se dévoile avec le temps ? Contrainte : reste
> **nourri par l'effort réel** (sinon on perd l'âme pro-sociale) et respecte P1–P7.

**Candidats de socle :**
- **A — Builder / idle-incrémental** (Paperclips, Cookie Clicker, Kittens) : le jeu
  = **bâtir et optimiser ta base/empire de netrunner**. L'effort réel (focus, quiz,
  pas) génère l'**énergie** que tu dépenses pour construire, automatiser, étendre.
  → colle au coup de cœur PO ; profondeur infinie ; la forêt cachée y vit
  naturellement.
- **B — RPG de progression** : avatar, arbre de compétences, équipement (cosmétique,
  P4), « missions » = tâches réelles. Familier, identitaire. Risque : « énième
  Habitica » sans twist fort.
- **C — Conquête de territoire / clans** (Ingress, Pokémon Go) : **carte partagée
  persistante** où les clans capturent des zones avec leur production d'effort
  collective. Énorme moteur de compétition/communauté ; nécessite le connecté tôt.
- **D — Exploration / mystère** (Outer Wilds, Tunic) : le jeu **EST la découverte**
  — on explore un réseau qui se dévoile, on décode, on perce des mystères. Colle
  pile à « rester parce qu'on ne sait pas ce qu'il y a derrière ». Plutôt une
  **couche** qu'un socle unique (chaque mystère = contenu à écrire).
- **E — Simulation / gestion narrative** : tu gères un réseau/équipage vivant ;
  événements émergents, récit.

**Synthèse recommandée (F — l'économie d'effort) :** le socle **invariant** n'est
pas *un* jeu, c'est une **économie d'énergie** : *effort réel → énergie → dépensée
dans un arbre de systèmes de jeu qui grandit sans fin.* Le **builder (A)** en est
le **cœur battant** et le premier système ; les autres (RPG, territoire, mystère…)
se **branchent** dessus au fil des déblocages. Le **quiz devient un input parmi
d'autres** (avec focus, pas, lecture…), plus jamais *LE* jeu. → C'est ça qui rend
« ça ne s'arrête jamais » tenable : un **moteur extensible**, pas une liste finie.

### 3ter.1 — Socle tranché : le BUILDER *(19/07/2026)*
**Cœur battant confirmé = le builder / base à optimiser façon Paperclips.** La
magie visée : progression qui semble infinie, et le vertige de « regarder d'où on
est parti, avec presque rien ». C'est l'invariant du jeu.

### 3ter.2 — Que devient l'effort réel ? *(TRANCHÉ 19/07/2026 : Voie 2)*
Le PO se demande si les inputs réels (podométrie, quiz…) sont encore souhaitables.
Deux voies, aux conséquences opposées :
- **Voie 1 — Jeu pur.** On coupe le réel. On obtient un bon incrémental… qui
  **entre en concurrence avec 10 000 idle games** et **abandonne ce qui donnait du
  sens** (mission pro-sociale P5) et rendait la compétition quasi-incheatable (P2).
- **Voie 2 — Réel = accélérateur *(recommandation)*.** On ne **supprime pas**
  l'effort réel, on le **rétrograde** : le builder tient **100 % debout tout seul**
  (rétention), et les actions réelles deviennent l'**overclock** qui rend ton
  empire *surhumain*. Le réel n'est plus une corvée obligatoire, c'est le
  « cheat-code » légitime. → garde l'âme **et** le fun.

### 3ter.3 — Pistes concrètes de loop (le « vrai jeu »)
- **Métaphore centrale** (au choix) : ton **Réseau** de nœuds qui s'étend · ta
  **forge de données** (miner → raffiner → revendre → réinvestir) · ton **essaim de
  daemons** (bots qui bossent/s'upgradent) · ton **rig** qui monte en puissance.
- **Loop de ressources** : une ressource produite en continu (**cycles / compute /
  bande passante**) ; des générateurs ; on dépense pour acheter mieux → croissance
  exponentielle. Puis **couches successives** (compute → data → crypto → influence
  → ???), chacune **recadre** le jeu (effet Paperclips).
- **Agir, pas juste attendre** : action « **hack** » = mini-jeu de crack d'ICE
  (bursts) ; **allocation stratégique** de la compute ; **choix à conséquences** ;
  **arbre techno** géant (la forêt cachée) ; **milestones** qui débloquent des
  mécaniques entières ; **prestige/renaissance**.
- **Branchement du réel (Voie 2)** : focus réel → **overclock** de production ;
  pas/sport → **refroidissement** (pousser plus loin) ; apprentissage → **points
  de compétence** ; bonnes actions → **karma** ; check-in quotidien → anti-déclin.

### 3ter.4 — Accélérateurs réels, par niveau de vérifiabilité *(anti-farming, 19/07/2026)*
> Règle (P1/P2) : seuls les accélérateurs **vérifiables** peuvent nourrir la
> **compétition de clans** ; les autres n'accélèrent que ton **empire perso** (tu
> ne triches que toi).

- **Niveau 1 — L'app est l'arbitre (incheatable) :** **focus** chronométré (écran
  éteint / app au 1ᵉʳ plan), **quiz & modules d'apprentissage**, **mini-jeux
  cognitifs** (calcul, mémoire, frappe), **méditation/respiration guidée**,
  **lecture in-app + quiz de compréhension**, **code katas** (vérifiés par tests).
- **Niveau 2 — Capteurs de l'appareil (dur à falsifier) :** **pas** (podomètre /
  Santé / Google Fit), **distance GPS** (marche/course/vélo), **sommeil** &
  **fréquence cardiaque/séances** via wearables, **temps en extérieur** (GPS + lumière).
- ⭐ **Niveau 2 bis — Détox numérique** *(la pépite)* : l'app récompense le fait de
  **ne PAS être sur son téléphone** (temps d'écran OS). « Tes daemons tournent plus
  fort quand tu te déconnectes. » Transforme le principe anti-addiction **P5** en
  **mécanique de jeu**. Très fort, très on-brand.
- **Niveau 3 — Preuve (semi-vérifiable) :** **photo** (contrôle IA/communauté),
  **check-in géolocalisé** (salle, biblio), **QR/NFC** chez des partenaires (fort,
  mais demande des accords).
- **Niveau 4 — Système d'honneur (économie perso uniquement) :** to-do générique,
  bonnes actions, hydratation, journal. → **jamais** dans la monnaie compétitive.

### 3ter.5 — Métaphore centrale du monde 1 *(reco Claude, à confirmer, 19/07/2026)*
**Reco : un Réseau clandestin qui s'étend, peuplé de Daemons.**
- Tu **colonises des nœuds** sur une grille de cyberspace qui grandit sans fin, et
  tu les peuples de **daemons** (tes travailleurs/IA) qui minent, produisent, défendent.
- Pourquoi ça accroche le mieux : les **daemons = satisfaction immédiate** (armée
  qui grossit + automatisation « ils bossent sans moi ») ; le **réseau = expansion
  infinie** et **devient naturellement la carte de conquête de clans** plus tard
  (candidat C). Cible évidente pour l'accélérateur réel : focus → **overclock des
  daemons**.
- Alternatives valables : **forge de données** (économie pure) ; **rig** (RPG plus
  linéaire, mais plafonne le sentiment d'infini).

---

## 4. Modèle d'équité & anti-triche (récap)

- Compétition **uniquement** sur monnaie vérifiable (P2). Le déclaratif reste privé.
- **Ligues par niveau** (§3-E) + **rendements décroissants / plafonds** limitent
  l'intérêt de tricher.
- **Redevabilité sociale** (clan, amis) police mieux qu'un algorithme.
- Vérité assumée : le déclaratif réel est **invérifiable** ; on ne le combat pas,
  on le **sort** de la surface compétitive.

---

## 5. Ce qu'on garde de l'existant

- Le **to-do, les habitudes, les streaks, les factions, la difficulté, l'XP/crédits**
  déjà construits (MVP 1 + US-011/012) → deviennent le **module perso privé** (§3-B)
  et une brique de l'économie privée. Rien n'est jeté.
- Le socle **local-first** actuel est un **tremplin** : la version connectée
  ajoutera serveur + comptes + sync + validation côté serveur **par-dessus**, ce
  n'est pas un « refaire à zéro ».
- L'identité **cyberpunk / netrunner** et la charte se prolongent naturellement.

---

## 6. Ce que ce virage implique (les yeux ouverts)

Passer de local-first mono-utilisateur à **connecté multi-utilisateur** =
**changement de nature du produit**, pas une feature. Implique : backend, comptes
& authentification, synchronisation, **validation côté serveur** (clé de
l'anti-triche), modération, coûts & exploitation continue. → **Décision
structurante à inscrire** dans `docs/decisions.md` le jour où on tranche, avec
mise à jour de `CLAUDE.md` et `docs/roadmap.md`.

**Conséquence d'architecture à anticiper dès maintenant** (à cause du
« changement de monde », §3-C) : construire l'app **agnostique au thème** dès le
départ — thème = **pack de données/tokens** (design system, textes, mécaniques
activées), jamais du visuel codé en dur. On ne **livre** qu'un monde (cyberpunk)
au lancement, mais l'architecture doit permettre d'en **ajouter un autre sans
réécriture**. Ça ne coûte presque rien maintenant et évite un mur plus tard. À
détailler dans `docs/architecture.md` le moment venu.

### Refonte ou évolution ? *(réponse honnête, 19/07/2026)*
Pas « tout jeter », mais **un nouveau produit sur les mêmes fondations.**
- **Ce qui reste** : la stack (React/TS/Vite/Tailwind), la **discipline** (modules
  `game/*.ts` purs & testés), la direction **agnostique au thème**, et **Dexie** qui
  devient le **cache local** d'une archi *local-first + sync* (pas jeté). Le to-do
  actuel devient **un petit module** de la nouvelle app.
- **Net-neuf & lourd** : le **jeu builder** (logique nouvelle, pas un refactor du
  to-do), un **backend** (comptes/auth, clans, classements, saisons, mondes), la
  **validation côté serveur** (clé anti-triche : le client n'est plus source de
  vérité pour la monnaie compétitive), la **sync** local↔serveur, l'anti-abus /
  modération, l'hébergement & l'exploitation.

### Le phasage qui dé-risque tout
**Le builder + les accélérateurs se construisent 100 % en local-first, SANS
backend** (un incrémental tourne très bien côté client). Donc :
- **Phase A — Jeu solo local-first (zéro backend)** : bâtir + **valider que le
  builder est fun** + accélérateurs réels, coût d'infra **nul**. Apprendre avant de payer.
- **Phase B — Couche connectée (backend requis)** : comptes, clans, deux
  classements, mondes partagés, server-authority. N'arrive **qu'après** la preuve du jeu.

**Gouvernance** : ce pivot réécrit des lignes de `CLAUDE.md` (local-first, mono-
utilisateur) et de la roadmap → le jour où on le décide, ça devient une **décision
inscrite** dans `docs/decisions.md`, pas une dérive.

---

## 7. Questions ouvertes (prochaines itérations)

1. ~~**Structure façon Paperclips**~~ — **TRANCHÉ le 19/07/2026** : socle
   accessible dès le départ **+** immense profondeur cachée révélée
   progressivement. Voir principe **P6**.
2. ~~**Monétisation : caisses aléatoires ?**~~ — **TRANCHÉ le 19/07/2026** :
   caisses payantes aléatoires **enterrées**. Monétisation = **achat direct**
   (cosmétiques, skins, interfaces, design systems, effets, univers visuels) +
   **passe de saison** + fondateur + don. **Règle d'or** : argent = expression,
   effort = contenu/pouvoir (voir §2bis).
3. Le **cœur d'identité** : quels 2-3 piliers du buffet définissent l'app ?
4. Hébergement & prix : gratuit + achats ? modèle exact du passe de saison ?
5. Où commence-t-on concrètement une fois le socle solo terminé (MVP « online » ?).

---

## 8. Journal des itérations

- **19/07/2026** — Création. Pivot exploré : de to-do solo local-first vers
  plateforme sociale connectée (clans, deux classements, arènes vérifiables,
  méta-moteur incrémental). Principes P1–P5 posés. To-do → module perso privé.
- **19/07/2026** — Tranché : **socle accessible + forêt cachée** (nouveau principe
  **P6**), plutôt qu'un démarrage « une seule fonction » à la Paperclips. Question
  ouverte §7.1 résolue.
- **19/07/2026** — Idée **« changement de monde / actes »** (§3-C) : terminer un
  univers en révèle un tout nouveau (thème + design system + mécaniques). En
  déduit une **contrainte d'architecture** : app agnostique au thème dès le départ
  (§6).
- **19/07/2026** — **Monétisation** ajoutée (principe **P7** + section §2bis). Cadre
  posé : achats directs + passe de saison généreux + statut fondateur + volet don ;
  **caisses payantes aléatoires et pay-to-win bannis**.
- **19/07/2026** — **Tranché (§7.2)** : caisses payantes aléatoires enterrées.
  **Règle d'or** posée — *l'argent achète l'expression, l'effort débloque le contenu
  et le pouvoir*. Les « modules à débloquer » restent **gagnés par l'effort**, jamais
  vendus (sinon pay-to-win + mort de la forêt cachée).
- **19/07/2026** — Ajout **§3-G « Moments WOW »** (6 familles de reveals) : le cœur
  émotionnel de l'app, la promesse « ça ne s'arrête jamais ». Reveals gagnés par
  l'effort ; priorité future = bâtir le **cadre** qui permet d'en ajouter à l'infini.
- **19/07/2026** — Seconde vague de reveals ajoutée à §3-G. Nouvelle question
  majeure **§3ter — le socle de jeu** : le quiz seul est trop mince, il faut un vrai
  jeu. 5 candidats (builder / RPG / territoire / mystère / gestion) + synthèse
  recommandée **F — « économie d'effort »** (builder = cœur, le reste se branche
  dessus, le quiz devient un input parmi d'autres). **À trancher.**
- **19/07/2026** — **Socle tranché : le BUILDER** (§3ter.1). Nouveau **fork ouvert**
  (§3ter.2) : l'effort réel disparaît-il (jeu pur) ou devient-il un **accélérateur**
  d'un builder autonome (recommandation) ? Pistes concrètes de loop notées (§3ter.3).
- **19/07/2026** — **Tranché : Voie 2** (§3ter.2) — builder autonome + réel =
  accélérateur « surhumain ». Ajout **§3ter.4** (accélérateurs réels par niveau de
  vérifiabilité, dont la **détox numérique**). Nouveau principe **P8** : continuité
  inter-mondes (« rien n'est jamais vain » — un monde fini devient socle du suivant).
- **19/07/2026** — Reco métaphore monde 1 (§3ter.5) : **Réseau + Daemons**. Réponse
  archi (§6) : pas une refonte totale mais un **nouveau produit** ; **phasage** clé
  = Phase A jeu **local-first sans backend** (valider le fun), Phase B connectée.
- **21/07/2026** — A1→A5 livrés (US-020→024). **A6 gelée** (décision **#028**,
  `docs/decisions.md`) : brancher le to-do auto-déclaré sur la production du
  Réseau violerait P1/P5 (canal farmable) et fait doublon avec les
  accélérateurs vérifiés d'A4 ; le module perso reste autonome, découplé, rien
  n'est perdu (P8). **Phase A considérée jouée** pour prouver le fun. Ouverture
  d'une **phase de brainstorming polish/rétention** sur le builder existant
  (PO ↔ Claude) — objectif : identifier ce qui manque/mériterait d'être
  approfondi avant de redéfinir la prochaine tranche.
- **21/07/2026** — Issue du brainstorming : analyse fonctionnelle du builder →
  4 manques identifiés (**profondeur de contenu**, aucun **jalon/
  accomplissement**, aucune **visualisation** qui grandit, un seul
  **accélérateur réel**). Choix de creuser d'abord la profondeur de contenu
  via un **nouveau recadrage** (dans l'esprit A3) plutôt qu'un simple ajout de
  daemons/nœuds. Direction retenue : un **marché crypto** — 3ᵉ ressource
  convertie manuellement depuis `data` à un **cours fluctuant** (calculé par
  une fonction déterministe du temps réel, cohérent avec l'« instant absolu »
  déjà établi), débloqué par un nœud de l'arbre existant, finançant une **2ᵉ
  branche** de l'arbre de déblocage. Reprend explicitement la progression
  **compute→data→crypto→influence→???** de §3ter.3. **Phase A2 —
  Approfondissement & rétention** cadrée (décision **#029**) : 5 tranches
  (US-026→030), chemin critique US-027 (marché crypto) en premier.
