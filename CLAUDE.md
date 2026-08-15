# Borsci Rénovation — site vitrine

Site une page, statique, sans build ni dépendance. Tout est dans
`index.html` ; déploiement par glisser-déposer (Cloudflare Pages),
prévisualisation sur GitHub Pages. Doit tourner 3 ans sans maintenance.

## ⚠ Visuels temporaires en place (15/08/2026)

**Deux exceptions**, ce sont de vraies photos de Vitalii Borsci :
`chantier-a-avant|apres.*` et `chantier-b-avant|apres.*` dans
`assets/chantiers/` — les deux avant/après de la section « Travaux
livrés ». Ne pas les remplacer. Originaux dans `sources-photos/`.

Tout le reste de `assets/chantiers/` et `assets/artisan/` **n'est pas
constitué de photos de chantiers de Borsci Rénovation**. Ce sont des
visuels de substitution, destinés uniquement à présenter la maquette au
client.

- la page porte un `<meta name="robots" content="noindex, nofollow">`
  tant qu'elles sont en place ; le retirer en même temps qu'elles
- un avertissement figure en commentaire au sommet d'`index.html`
- les remplacer par de vraies photos avant toute publication : les
  légender comme des chantiers réalisés serait une pratique commerciale
  trompeuse (art. L121-2 code de la consommation)
- fiche de prise de vue rédigée pour l'artisan : 4 photos suffisent

## Décisions actées — ne pas revenir dessus sans accord explicite

- **Ordre de la page, acté le 15/08/2026** : en-tête → 01 Prestations →
  02 Méthode → 03 Décrire un projet → 04 Travaux livrés → bande de
  rappel → pied de page. Le formulaire est le cœur du site : il passe
  avant les chantiers, et une bande de rappel en fin de page offre un
  second point d'entrée à qui a tout lu avant de se décider. Cette bande
  ne porte volontairement pas de numéro de section.
- **Traitement du formulaire, acté le 15/08/2026** : panneau sombre
  pleine largeur (`--encre`), colonne de gauche collante portant la
  promesse, trois points de réassurance et les deux voies directes
  (téléphone, WhatsApp) — c'est elle qui remplit la hauteur du
  formulaire au lieu de laisser un vide. Le formulaire est posé sur une
  carte claire. Deux gris intermédiaires (`--gris-clair`, `--gris-moyen`)
  sont définis localement sur `#contact` pour le texte secondaire sur
  fond sombre : `--doux` et `--tenu` n'y passeraient pas le contraste.
- **Qualification en amont** : l'étape 1 est une question unique en
  tuiles larges ; l'étape 2 affiche des questions conditionnelles selon
  les prestations cochées (`data-cle` sur la case → `data-si` sur le
  bloc). Un bloc masqué garde ses réponses mais ne les envoie pas. Pour
  ajouter une question, il suffit d'écrire le HTML : la construction du
  payload est générique, il n'y a pas de liste de champs à maintenir.
- **Direction de design actée le 15/08/2026** : variante B (titres Jost
  gras en casse normale, filets, angles vifs, header collant, bande de
  faits) + option 3 pour les prestations (cartes plates à filets
  partagés). Pas de coins arrondis, pas d'ombres, pas d'icônes —
  l'essai de pastilles arrondies sur les boutons d'appel a été annulé
  le 15/08, elles cassaient la cohérence avec le reste de la page.
  Le bouton WhatsApp garde le vert de marque `#25d366`, avec du texte
  en `--encre` et non en blanc : du blanc sur ce vert ne donne que
  2:1, l'encre donne 7,6:1.
- **Zone d'intervention** : les 8 départements d'Île-de-France
  (75, 92, 93, 94, 77, 95, 91, 78). Le positionnement de titre reste
  « Paris et petite couronne » — c'est le cœur d'activité ; la zone
  élargie est indiquée dans la section dédiée et dans areaServed.
- **Positionnement élargi** : ne jamais présenter l'activité comme
  limitée à la remise en état après sinistre. Six domaines : remise en
  état après dégât des eaux, peinture et enduits, revêtement de sol
  (parquet, vinyle, carrelage, moquette), cloisons et placo, terrasses
  bois, conseils. Le texte « je vous garantis une installation
  impeccable » fourni pour les sols a été refusé : promesse de résultat
  interdite par le brief.
- La bande de faits ne contient que du vérifiable — jamais de chiffres
  inventés (« 15 ans », « +400 chantiers », « 4,9/5 » des sites
  concurrents sont l'exemple à ne pas suivre).
- **Palette validée le 15/08/2026** : les sept variables du bloc `:root`
  (papier chaud `#f8f6f1`, encre espresso `#292524`, accent terre cuite
  `#9c4221`…). Les propositions de design portent sur la typo, la mise
  en page, la densité — pas sur les couleurs.
- Positionnement : « Rénovation et finitions intérieures », jamais
  « peintre ». Aucune énumération de prestations dans un titre ou une
  meta description.
- Nom commercial « Borsci Rénovation » (accent obligatoire), nom légal
  Vitalii Borsci visible en en-tête et mentions légales.
- Prestation phare : remise en état après dégât des eaux — intervention
  après assèchement uniquement, jamais de promesse d'assurance, jamais
  « expert d'assuré », aucun délai chiffré (règles en commentaire HTML
  au-dessus du bloc).
- Interdits éditoriaux (brief) : « architecte », « maître d'œuvre »,
  « nous », superlatifs, garanties, tarifs chiffrés, toute mention
  RGE / rénovation énergétique.
- Jamais de faux contenu : ni avis inventés (section commentée en
  attente des vrais avis Google), ni photos de chantiers d'autrui.
- Grille chantiers : deux chantiers, présentés en **avant / après côte
  à côte** (chaque volet en portrait 4/5, proche du cadrage d'origine).
  Pas sous le curseur de comparaison : les deux prises de vue d'une
  même paire n'ont pas le même cadrage, le curseur exige des photos
  superposables. Nombre pair, et l'écart entre deux chantiers doit
  rester nettement plus grand que l'écart entre les deux volets d'une
  paire — sinon quatre photos se lisent comme une seule bande.
- **Navigation de la barre, actée le 15/08/2026** : Prestations,
  Méthode, Votre projet, Chantiers réalisés, Zone d'intervention. Le
  formulaire s'appelle « Votre projet » dans le menu, pas « Contact » —
  c'est ce que le visiteur vient y faire. Elle défile horizontalement
  plutôt que de se replier dans un menu : pas de panneau à ouvrir, pas
  de piège au clavier, rien à maintenir. Sous 60em elle prend la place
  du numéro, qui reste accessible dans la barre d'appel fixe du bas.
  Un dégradé sur le bord droit signale qu'il reste des entrées.
- Fontes hébergées en local (`assets/fonts/`), aucune requête tierce.
  `jost.woff2` est **variable** (axe wght 100→900) et doit rester
  déclarée `font-weight: 100 900`. Déclarée en poids fixes, comme elle
  l'était jusqu'au 15/08/2026, le navigateur figeait l'axe : les titres
  demandaient 560 et s'affichaient à 400. DM Mono n'existe qu'en 400 —
  ne rien lui demander de plus gras, ce serait du gras synthétique.

## Réception des demandes

Le formulaire poste un `FormData` vers une application web Google Apps
Script (`apps-script/Code.gs`, déploiement décrit dans
`apps-script/DEPLOIEMENT.md`). Elle ajoute une ligne dans une feuille de
calcul et envoie un email à contact.borsci@gmail.com. Le tout vit dans
le compte Google de l'artisan, pas ailleurs.

**Branché le 15/08/2026** — mais jamais exercé de bout en bout depuis
ici : l'environnement de développement bloque tous les domaines Google,
la requête réelle n'a donc pas pu être émise. Les tests couvrent tout
le reste avec `fetch` remplacé. Le seul point resté à vérifier depuis un
vrai navigateur est le CORS d'Apps Script. En cas d'échec, le secours
WhatsApp prend le relais et aucune demande n'est perdue.

- **Ajouter une question ne demande de modification nulle part
  ailleurs** : le payload est construit en parcourant le formulaire, et
  le script crée la colonne manquante au premier envoi.
- Les **photos ne passent pas par le formulaire** — décision du
  15/08/2026. Elles partent sur WhatsApp depuis l'écran de
  confirmation, avec un message pré-rempli portant le nom et la commune
  pour qu'elles arrivent identifiées. Motifs : l'hébergement de
  fichiers est payant chez tous les services de formulaire, WhatsApp
  atteint un artisan en chantier là où un email ne l'atteint pas, et
  c'est un geste que tout le monde sait faire au téléphone.
- Si l'envoi échoue, la demande **n'est jamais perdue en silence** :
  elle est résumée et proposée sur WhatsApp en un geste. Ne pas retirer
  ce filet.
- Champ piège `site-web` contre les robots — le script ignore en
  silence toute demande qui l'a rempli. Il remplace le filtrage que
  faisait le service de formulaire précédent.
- La requête doit rester « simple » au sens CORS : **aucun en-tête
  personnalisé**. Sinon le navigateur déclenche un pré-vol qu'Apps
  Script ne sait pas traiter.
- **Le corps doit être en `URLSearchParams`, jamais en `FormData`.**
  Apps Script ne remplit `e.parameters` que pour de l'urlencodé ; un
  corps multipart arrive mais laisse `e.parameters` vide — le script
  croit recevoir une demande vide, ne l'enregistre pas, et répond quand
  même 200. C'est le défaut qui a fait passer le premier essai réel du
  15/08/2026 pour un succès sans qu'aucune ligne n'apparaisse.
- **Un 200 ne vaut pas succès.** Le script répond
  `{"ok":true}` ou `{"ok":false,"raison":…}` ; c'est ce verdict que le
  site doit lire. Si le corps est illisible, se rabattre sur le statut
  plutôt que de faire échouer un envoi peut-être abouti.

## Vérifications attendues avant tout push

Rendu contrôlé sous Chromium (émulation mobile 390px) : pas de
débordement horizontal, cibles tactiles ≥ 44px, contrastes AA,
formulaire testé de bout en bout. Zéro occurrence de « peintre ».
