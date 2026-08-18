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
  02 Méthode → 03 Décrire votre projet → 04 Travaux livrés → bande de
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
- **Zone d'intervention, arbitrée le 17/08/2026** : **Paris (75),
  Essonne (91), Seine-Saint-Denis (93), Val-de-Marne (94)** — et rien
  d'autre. Le 92, le 77, le 95 et le 78 ont été retirés ; l'absence du
  92 est délibérée, ce n'est pas un oubli. « Paris et petite couronne »
  ne se dit plus nulle part : la formule inclut le 92 et exclut le 91,
  elle est donc doublement fausse ici. Cinq endroits doivent rester
  synchronisés — le `<title>` et la meta description, l'`og:title` et
  l'`og:description`, `areaServed` dans le JSON-LD, la ligne d'identité
  de l'en-tête (`.zone`), la bande de faits, et la liste du pied de page
  (`#zone`, où les départements portent leur numéro : c'est là que le
  visiteur relie « 91 » à « Essonne »). Ordre numérique partout.
- **Bloc Conseils, refondu le 17/08/2026 — et c'est une offre
  commerciale, pas seulement du texte.** Trois étages séparés par un
  filet : l'accroche « Vous ne savez pas par où commencer ?
  Appelez-moi. », trois situations dans lesquelles le visiteur se
  reconnaît (devis, matériaux, chantier), puis l'offre nommée **« la
  visite conseil »** avec son livrable — un compte rendu écrit — et ses
  deux actions. Trois règles tiennent ce bloc :
  1. **C'est le seul endroit où l'artisan dit « je ».** Partout ailleurs
     la page est impersonnelle ; les seuls autres « je » sont ceux du
     visiteur dans le formulaire. Ne pas étendre cette voix au reste de
     la page sans décision explicite.
  2. **Conseil, jamais coordination.** « Le suivi de vos artisans » a
     été retiré : coordonner d'autres entreprises relève de la maîtrise
     d'œuvre — mot interdit par le brief — et la décennale de Vitalii ne
     couvre que ses propres ouvrages. La tuile « Conseil » du
     formulaire a été alignée dans le même mouvement.
  3. **Aucun montant.** Les tarifs chiffrés restent interdits : le bloc
     dit « facturée à part, déduite du devis si vous me confiez les
     travaux » sans jamais donner de prix. Cette déduction est un
     engagement commercial — il doit être tenu à chaque fois.

- **Positionnement élargi** : ne jamais présenter l'activité comme
  limitée à la remise en état après sinistre. Six domaines : remise en
  état après dégât des eaux, peinture et enduits, revêtement de sol
  (parquet, vinyle, carrelage, moquette), cloisons et placo, terrasses
  bois, conseils. Le texte « je vous garantis une installation
  impeccable » fourni pour les sols a été refusé : promesse de résultat
  interdite par le brief.
- **Bande de faits, révisée le 17/08/2026.** Quatre cases, chacune un
  intitulé sur une ligne et une légende sur une ligne : **20 ans
  d'expérience** / sinistres & rénovations — **1 seul interlocuteur** /
  du devis au chantier — **Devis sous 24 h** / après visite ou photos —
  **Paris · 91 · 93 · 94** / zone d'intervention. La case
  « Décennale / chantiers assurés » a été retirée à la demande du
  client ; la garantie ne se lit plus que dans les mentions légales du
  pied de page. Rien n'y est inventé : **« 20 ans d'expérience » est un
  chiffre fourni par le client** le 17/08/2026, pas une estimation —
  s'il devait bouger, il bougerait ici et nulle part ailleurs, la page
  n'en donne aucun autre. (« 15 ans », « +400 chantiers », « 4,9/5 »
  des sites concurrents restent l'exemple à ne pas suivre.)
- **La bande se lit comme un tableau, et cela tient à sa gouttière.**
  Chaque case portait `--pad` (jusqu'à 56 px) de chaque côté, soit
  112 px prélevés sur une colonne qui n'en fait que 256 à 1024 px : les
  intitulés repassaient sur deux lignes, chacun à une largeur
  différente, et la bande paraissait bâclée. Les cases intérieures ont
  désormais une gouttière fixe de 1,4 rem ; seuls les deux bords
  extérieurs gardent `--pad`, pour rester alignés sur la marge des
  sections. Le passage en 2×2 a été remonté de 46em à **60em** pour la
  même raison. Mesuré uniforme de 480 px à 1600 px. **Avant de rallonger
  un intitulé ou une légende, re-mesurer** : les légendes ont été
  raccourcies exprès (« du devis au chantier », pas « du devis à la fin
  du chantier ») pour tenir sur une ligne à 1024 px.
- **Trois voies d'entrée dans l'en-tête, actées le 17/08/2026** après
  comparaison de quatre maquettes. Grille : « Décrire votre projet » en
  pleine largeur au-dessus, puis téléphone et WhatsApp à parts égales
  dessous, le tout dans 34rem — une action principale, deux voies
  directes. Une seule colonne sous 34em, où deux ne laisseraient plus
  tenir le numéro sur une ligne.
  **Une couleur = une action, sur toute la page** : terre cuite pour le
  téléphone, encre pour le formulaire (le même traitement que
  « Remplir le formulaire » de la bande de rappel, à l'autre bout de la
  page), vert de marque pour WhatsApp. C'est la raison d'être du choix,
  pas un effet de style — ne pas repasser le bouton du formulaire en
  terre cuite sans casser cette lecture.
  Le libellé WhatsApp de l'en-tête est raccourci en « WhatsApp — vos
  photos » pour tenir sur une ligne dans une demi-colonne. Le libellé
  du bouton formulaire est identique au titre de la section 03 et à
  l'entrée du menu : qui clique doit retrouver le mot à l'arrivée.
  Même libellé sur l'appel à l'action du bloc dégât des eaux —
  « Décrire le sinistre » y a été abandonné le 17/08/2026. **Réserve
  connue** : cet appel à l'action-là est resté en terre cuite alors
  qu'il mène lui aussi au formulaire ; c'est la seule entorse à la
  règle « une couleur = une action », en attente d'arbitrage.
- **Appel à l'action du bloc dégât des eaux, acté le 17/08/2026** :
  rectangle plein en terre cuite (`--accent`), texte en `--fond`,
  deux niveaux — l'action (`Décrire le sinistre →`) puis la raison de
  cliquer (`Première estimation possible à partir de photos`). C'était
  un lien souligné en mono 11 px : posé au milieu d'un paragraphe de la
  même couleur, il ne se voyait pas. **Ce n'est pas une couleur
  nouvelle** — c'est le traitement du bouton téléphone, la palette
  reste gelée. Ne pas passer le texte en blanc pur ni le griser : sur
  `--accent`, `--fond` donne 6,1:1, tout le reste tombe sous AA.
- **Le vide dans la carte dégât des eaux est un réglage à deux
  branches.** `align-items: center` centrait une colonne de texte de
  251 px contre une photo de 394 px : les 143 px d'écart se reversaient
  en 71 px de vide au-dessus du chapeau et 71 px sous l'appel à
  l'action. Corrigé le 17/08/2026 par quatre réglages solidaires —
  `align-items: stretch`, colonne de texte en flex avec le bouton en
  `margin-top: auto`, colonnes passées de `1fr 1.1fr` à `1.2fr 1fr`, et
  comparateur ramené de 16/10 à 16/9. **Modifier l'un sans les autres
  fait revenir le vide** : l'écart restant a été mesuré à 40 px à
  1440 px et 18 px à 1280 px. En dessous de 46em les colonnes
  s'empilent, `margin-top: auto` retombe à zéro et une marge explicite
  prend le relais.
- Piège CSS de la bande : la légende se sélectionne en `.fait > span`,
  **jamais `.fait span`**. Le titre contient lui aussi un `span` — le
  « sous 24 h » en accent — et le sélecteur descendant le faisait
  basculer en mono 10 px capitales grises, c'est-à-dire exactement
  l'inverse de la mise en évidence demandée.
- **Délai du devis, arbitré le 17/08/2026 : 24 h.** C'est le seul
  engagement chiffré de la page hors « 20 ans », et il est mis en
  évidence à quatre endroits — bande de faits, titre de l'étape 03 de
  la Méthode, points de réassurance du formulaire, bande de rappel de
  fin de page. On dit **« Devis sous 24 h »**, pas « devis écrit » :
  l'adjectif a été retiré le 17/08/2026 à la demande du client, le
  détail du contenu du devis reste dans le corps de l'étape 03. La
  classe `.delai` le passe en couleur d'accent sur fond clair ; **ne pas
  l'employer dans `#contact`**, l'accent terre cuite ne passe pas le
  contraste sur le fond encre — là, c'est le `<strong>` des `.argus` qui
  porte l'emphase. Le délai court **après la visite ou la réception des
  photos**, pas après le premier contact : c'est écrit ainsi dans
  l'étape 03 et dans les `.argus`, ne pas le raccourcir en promesse
  sèche. À distinguer du **rappel sous 24 h**, qui est un engagement
  différent (le coup de téléphone) et qui figure aussi dans l'accusé de
  réception. Aucun de ces deux délais ne concerne l'*intervention* après
  dégât des eaux, qui doit rester sans délai chiffré (règle du brief).
- **Palette validée le 15/08/2026** : les sept variables du bloc `:root`
  (papier chaud `#f8f6f1`, encre espresso `#292524`, accent terre cuite
  `#9c4221`…). Les propositions de design portent sur la typo, la mise
  en page, la densité — pas sur les couleurs.
- Positionnement : « Rénovation et finitions intérieures », jamais
  « peintre ». Aucune énumération de prestations dans un titre ou une
  meta description.
- **Titre de la section Prestations, acté le 17/08/2026** : **« Six
  domaines d'intervention »**, à la place de « Ce qui est fait » — un
  passif sans agent, et une formule trop proche de « Travaux livrés »
  (section 04). Le nouveau titre dit l'étendue avant même la lecture
  des cartes, ce qui sert le positionnement élargi. **Le chiffre
  engage** : il doit rester égal au nombre de blocs 01 à 06, conseils
  compris. Ajouter ou retirer un domaine oblige à corriger ce titre —
  un rappel figure en commentaire HTML juste au-dessus.
- **Pied de page : quatre colonnes au-delà de 75em, largeurs
  inégales.** Acté le 17/08/2026 après mesure. Trois défauts se
  cumulaient : 110px de marge haute et basse, un `gap` de grille de
  56px auquel s'ajoutait la marge de 40px de chaque `.bloc-pied` (96px
  entre deux rangées au lieu de 56), et deux rangées dont la seconde
  décrochait. Le pied est passé de 708px à 409px de haut à 1440px.
  Les colonnes ne sont **pas** égales (`.9fr .9fr 1fr 1.5fr`) :
  « Hébergement et données » porte quatre fois plus de texte
  qu'« Entreprise » et, à colonnes égales, descendait 171px plus bas
  que ses voisines avec son intitulé sur deux lignes. Cette répartition
  a été retenue après comparaison de quatre ratios à quatre largeurs.
  **La marge de `.bloc-pied` sert uniquement à l'empilement sous 46em**
  et est neutralisée dans la grille — ne pas la rétablir là.
- **Registre des titres de section : écrit, jamais parlé.** Le
  17/08/2026, « Comment ça se passe » a été remplacé par **« Du premier
  échange au chantier »** — la tournure interrogative et le « ça »
  relevaient du français oral et juraient avec « Ce qui est fait » ou
  « Travaux livrés ». Le nouveau titre reprend mot pour mot le nom de
  la première étape et celui de la dernière : il annonce le trajet que
  les quatre étapes décrivent. Une **espace insécable** soude « au
  chantier », sinon la coupure mobile tombe après « premier ».
  `text-wrap: balance` a été essayé sur les `h2` et **retiré** : il
  produisait « Du premier / échange au chantier », soit l'inverse de
  l'effet recherché. La même correction de registre reste à faire sur
  la section Avis, en commentaire : « Ce qu'ils en disent ».
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

**Branché et vérifié de bout en bout le 15/08/2026** : envoi depuis le
site → ligne dans la feuille → email reçu. Le CORS d'Apps Script passe.
La vérification a dû être faite par l'utilisateur : l'environnement de
développement bloque tous les domaines Google, aucun test d'ici ne peut
joindre l'endpoint. Les tests automatiques remplacent donc `fetch`.

**Le script déployé diverge volontairement du dépôt sur une ligne.**
Il a été créé depuis `script.google.com` et non depuis la feuille, donc
`getActiveSpreadsheet()` n'y renvoie rien. Le déploiement porte un
`FEUILLE_ID` renseigné ; le dépôt le laisse vide, l'identifiant de la
feuille client n'ayant pas à figurer dans un dépôt public. Toute reprise
du script doit reporter cet identifiant — il se lit dans l'adresse de la
feuille, entre `/d/` et `/edit`.

**Modifier le script ne suffit pas** : l'éditeur exécute la dernière
version enregistrée, le formulaire appelle la version *déployée*. Sans
« Gérer les déploiements › Nouvelle version », le site continue
d'appeler l'ancien code.

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
- **Accusé de réception au client** (`accuserReception`, ajouté le
  15/08/2026) : HTML en tableaux avec styles en ligne, aucune image et
  aucune police web — les feuilles de style sont supprimées par les
  messageries, les images distantes bloquées par défaut. Le logo est
  reconstruit en HTML. Il porte un rappel des réponses et **relance sur
  les photos** : c'est la seconde chance pour qui a fermé l'onglet.
  Mêmes interdits rédactionnels que le site.
- **Plafond de 30 accusés par jour** (`ACCUSES_PAR_JOUR`) : l'accusé
  part vers une adresse saisie par un inconnu sur une URL publique.
  Sans plafond, l'endpoint sert de relais pour expédier du courrier
  signé Borsci Rénovation à des tiers. Au-delà, la demande est quand
  même enregistrée et notifiée. Ne pas retirer ce plafond.
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

- **Indicateurs de focus, audit du 17/08/2026.** Les trois familles de
  contrôles du formulaire portent leur contour sur le **parent**, pas
  sur la case : `.tuile:focus-within`, `.puce:focus-within` et
  désormais `.choix:focus-within`. La case de consentement, seule
  `.choix` de la page, n'en avait aucun — et elle est obligatoire pour
  envoyer. `input:focus { outline: none }` a été restreinte aux types
  texte : écrite pour tous les `input`, sa spécificité (0,1,1) battait
  `:focus-visible` (0,1,0) et supprimait le contour natif des cases.
  **Toute sonde qui juge le focus doit regarder l'élément ET son
  parent** : mesurer le seul élément focalisé fait passer les tuiles et
  les puces pour non signalées, ce qui a produit un faux diagnostic
  avant vérification.

## Vérifications attendues avant tout push

Rendu contrôlé sous Chromium : pas de débordement horizontal, cibles
tactiles ≥ 44px, contrastes AA, formulaire testé de bout en bout. Zéro
occurrence de « peintre ».

**Balayer les largeurs, pas seulement 390 et 1440.** Leçon du
17/08/2026 : le passage de la carte dégât des eaux en `align-items:
stretch` a créé un débordement horizontal allant jusqu'à 296px — mais
uniquement entre 768 et 1100px. Mesuré aux deux seules largeurs
habituelles, il était invisible, et il est parti en production.
Quinze largeurs de 320 à 1600px sont désormais contrôlées.

**Mesurer le débordement avant de révéler les blocs `[hidden]`.**
Les révéler tous d'un coup — étapes 2 et 3 du formulaire, écran de
confirmation et lien de secours affichés en même temps — fabrique un
état que la page n'atteint jamais, et signalait un faux débordement de
30px à 320px. Les cibles tactiles, elles, se mesurent bien blocs
révélés.

**Piège CSS à retenir : `aspect-ratio` sur un enfant de grille étiré.**
Quand la rangée impose la hauteur (`align-items: stretch`) et que la
largeur est `auto`, `aspect-ratio` recalcule la largeur à partir de la
hauteur, et l'élément sort de sa colonne. Tout élément à `aspect-ratio`
dans une grille étirée doit porter `width: 100%` et `min-width: 0`.
