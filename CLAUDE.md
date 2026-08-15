# Borsci Rénovation — site vitrine

Site une page, statique, sans build ni dépendance. Tout est dans
`index.html` ; déploiement par glisser-déposer (Cloudflare Pages),
prévisualisation sur GitHub Pages. Doit tourner 3 ans sans maintenance.

## Décisions actées — ne pas revenir dessus sans accord explicite

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
