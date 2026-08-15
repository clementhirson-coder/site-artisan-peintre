# Borsci Rénovation — site vitrine

Site une page, statique, sans build ni dépendance. Tout est dans
`index.html` ; déploiement par glisser-déposer (Cloudflare Pages),
prévisualisation sur GitHub Pages. Doit tourner 3 ans sans maintenance.

## ⚠ Visuels temporaires en place (15/08/2026)

Les images de `assets/chantiers/` et `assets/artisan/` **ne sont pas des
photos de chantiers de Borsci Rénovation**. Ce sont des visuels de
substitution, destinés uniquement à présenter la maquette au client.

- la page porte un `<meta name="robots" content="noindex, nofollow">`
  tant qu'elles sont en place ; le retirer en même temps qu'elles
- un avertissement figure en commentaire au sommet d'`index.html`
- les remplacer par de vraies photos avant toute publication : les
  légender comme des chantiers réalisés serait une pratique commerciale
  trompeuse (art. L121-2 code de la consommation)
- fiche de prise de vue rédigée pour l'artisan : 4 photos suffisent

## Décisions actées — ne pas revenir dessus sans accord explicite

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
- Grille chantiers : 4 vignettes (2×2), nombre pair.
- Fontes hébergées en local (`assets/fonts/`), aucune requête tierce.

## Vérifications attendues avant tout push

Rendu contrôlé sous Chromium (émulation mobile 390px) : pas de
débordement horizontal, cibles tactiles ≥ 44px, contrastes AA,
formulaire testé de bout en bout. Zéro occurrence de « peintre ».
