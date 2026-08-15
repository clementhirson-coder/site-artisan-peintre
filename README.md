# Borsci Rénovation — site vitrine

Site une page pour Vitalii Borsci, artisan indépendant en rénovation et
finitions intérieures (Paris et Île-de-France).

**Statique, sans build, sans dépendance.** Tout le site tient dans
`index.html` : HTML, CSS et JavaScript dans un seul fichier. Aucune
commande à lancer, rien à installer. Ouvrir le fichier dans un
navigateur suffit à le voir tel qu'il sera en ligne.

Contrainte de conception : **tenir trois ans sans maintenance.**

---

## Où est quoi

| Chemin | Rôle |
|---|---|
| `index.html` | Le site entier |
| `assets/fonts/` | Jost et DM Mono en local — aucune requête tierce |
| `assets/chantiers/` | Photos des prestations et des chantiers |
| `assets/artisan/` | Portrait d'en-tête |
| `apps-script/Code.gs` | Script Google qui reçoit les demandes du formulaire |
| `apps-script/DEPLOIEMENT.md` | Comment le déployer, pas à pas |
| `sources-photos/` | Photos d'origine, non publiées — pour recadrer plus tard |
| `fiche-photos-vitalii.md` | Ce que l'artisan doit photographier, et comment |
| `CLAUDE.md` | **Les décisions actées et les pièges connus** |

## Comment ça marche

Le site est **statique** : il ne sait rien faire tout seul. Le formulaire
poste vers une **application web Google Apps Script**, hébergée dans le
compte de l'artisan, qui fait deux choses par demande :

1. ajoute une ligne dans la feuille de calcul « Demandes — Borsci
   Rénovation » ;
2. envoie un email de notification, puis un accusé de réception au
   client.

Les **photos de chantier ne passent pas par le formulaire** : elles
partent sur WhatsApp depuis l'écran de confirmation, avec un message
pré-rempli portant le nom et la commune. L'hébergement de fichiers est
payant chez tous les services de formulaire, et WhatsApp atteint un
artisan en chantier là où un email ne l'atteint pas.

**Si l'envoi échoue**, la demande est résumée et proposée sur WhatsApp
en un geste. Aucune demande ne peut se perdre en silence.

## Publier

Cloudflare Pages, par glisser-déposer : `dash.cloudflare.com` → le
projet → « Créer un déploiement ».

**Ne glisser que ce qui sert la page :** `index.html`, `assets/`,
`robots.txt`, `sitemap.xml`. Les dossiers `apps-script/` et
`sources-photos/`, comme les fichiers `.md`, n'ont rien à faire sur le
serveur — `sources-photos/` contient à lui seul 8 Mo de photos
d'origine.

En cas d'erreur, ne rien supprimer : revenir à la version précédente
depuis l'onglet « Déploiements » de Cloudflare.

## Ce qui reste à faire

**Avant toute publication.** La page porte volontairement
`<meta name="robots" content="noindex, nofollow">` — le retirer
seulement quand ces deux points sont réglés :

- [ ] **Remplacer les visuels de substitution.** Seules les quatre
      photos `chantier-a-*` et `chantier-b-*` sont de vrais chantiers.
      Le portrait, les quatre visuels de prestations et le comparateur
      avant/après ne le sont pas. Les légender comme des chantiers
      réalisés serait une pratique commerciale trompeuse
      (art. L121-2 code de la consommation).
- [ ] **Retirer l'avertissement** en tête d'`index.html` et la section
      correspondante de `CLAUDE.md`, en même temps que les visuels.

**Informations à obtenir de l'artisan.** Elles apparaissent surlignées
en terre cuite dans la page, entre crochets :

- [ ] adresse déclarée et SIRET (mentions légales — obligatoires)
- [ ] nom de l'assureur et référence du contrat décennale
- [ ] délai d'envoi du devis
- [ ] communes des deux chantiers de « Travaux livrés »

**Intendance.**

- [ ] passer le dépôt en privé
- [ ] le renommer — `site-artisan-peintre` contredit le positionnement
      tenu partout ailleurs : jamais « peintre »
- [ ] acheter et brancher `borsci-renovation.fr`

## Avant de modifier quoi que ce soit

**Lire `CLAUDE.md`.** Il contient les décisions actées — palette, ordre
de la page, positionnement éditorial, interdits du brief — et surtout
les **pièges déjà rencontrés**, qui coûteraient une soirée à qui les
redécouvrirait :

- le corps de la requête doit partir en `URLSearchParams`, jamais en
  `FormData` : Apps Script ne remplit `e.parameters` que pour de
  l'urlencodé, et répond 200 quand même ;
- un 200 d'Apps Script ne vaut pas succès, c'est le corps de la réponse
  qui fait foi ;
- enregistrer le script ne suffit pas, le formulaire appelle la version
  **déployée** ;
- `jost.woff2` est une fonte variable et doit rester déclarée
  `font-weight: 100 900`, sinon le navigateur fige l'axe de graisse.

## Retrouver une décision dans l'historique

Les messages de commit expliquent le *pourquoi*, pas seulement le quoi.
Quelques points d'entrée :

```bash
git log --oneline                      # la suite des changements
git log --grep=formulaire              # tout ce qui touche au formulaire
git log -p -- apps-script/Code.gs      # l'évolution du script, diff compris
git log -S "URLSearchParams"           # quand et pourquoi ce choix
git blame index.html -L 100,120        # d'où vient cette ligne
```

## Vérifications attendues avant tout push

Rendu contrôlé sous Chromium en émulation mobile (390 px) : aucun
débordement horizontal, cibles tactiles ≥ 44 px, contrastes AA,
formulaire testé de bout en bout. Zéro occurrence du mot « peintre ».

---

## Pour l'artisan — modifier le site soi-même

- **Changer un texte** — ouvrir `index.html` avec un éditeur de texte
  (Bloc-notes, TextEdit), chercher la phrase, la remplacer, enregistrer.
- **Remplacer une photo** — déposer la nouvelle image dans
  `assets/chantiers/` en gardant **exactement** le même nom de fichier
  que l'ancienne.
- **Ajouter un chantier** — copier un bloc `<li>…</li>` de la section
  « Travaux livrés », le coller juste en dessous, changer les photos et
  la légende. Garder un nombre pair.
- **Republier** — voir « Publier » ci-dessus.

Les passages surlignés en terre cuite à l'écran sont les informations
restant à fournir. Ils disparaissent une fois remplacés.
