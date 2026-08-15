# Me former sur ce qu'on a construit

> **Comment se servir de ce fichier.** Le donner à Claude et lui demander
> de m'enseigner ce qu'il contient. Il tient lieu à la fois de programme
> et de matière : tout ce qui suit a été appliqué pour de vrai sur un
> site en production, il n'y a aucun exemple inventé.

---

## Consignes au formateur

**Qui apprend.** Quelqu'un qui n'est pas développeur mais qui lit du
code sans paniquer, et qui vient de construire — avec l'aide de Claude
Code, en une soirée — un site vitrine complet avec réception
automatisée des demandes. Le projet est réel, en ligne, et sert à un
artisan qui compte dessus.

**Ce qui est déjà acquis, par la pratique.** Le montage a été fait,
débogué et mis en service. Deux pannes ont été traversées. Ce qui
manque, ce n'est pas l'expérience, c'est **la carte** : savoir comment
s'appellent les choses, où ce montage se situe dans le paysage, et à
partir de quand il ne convient plus.

**Comment enseigner.**

- Partir du cas réel décrit plus bas, jamais d'un exemple jouet. La
  personne a le vrai code sous les yeux.
- Vérifier la compréhension en posant des questions, pas en récitant.
  Les questions de contrôle sont en fin de fichier.
- Être franc sur les limites. Ce montage a de vrais défauts, ils sont
  listés — ne pas les enjoliver.
- Ne pas flatter. Si une réponse est fausse ou approximative, le dire
  et corriger.
- Répondre en français.
- Quand un chiffre est donné (quotas, tarifs), préciser qu'il faut le
  vérifier : ces valeurs bougent.

**Ordre suggéré.** Le socle, puis l'architecture réelle, puis les cinq
disciplines, puis les deux pièges, puis les exercices. Les exercices
comptent au moins autant que le reste.

---

## 1. Le socle

### Le nom de la famille : serverless

Du code qui tourne sur le serveur de quelqu'un d'autre, sans qu'on ait
de serveur. Pas de machine à louer, à mettre à jour, à surveiller. On
écrit une fonction, le fournisseur l'exécute quand elle est appelée.

### Ce qu'est Google Apps Script

Du JavaScript qui s'exécute **chez Google**, avec un accès direct aux
données du compte : Sheets, Gmail, Drive, Agenda, Contacts.

On écrit `MailApp.sendEmail(...)` et l'email part depuis la boîte du
propriétaire du script — sans configuration SMTP, sans clé d'API, sans
mot de passe à stocker. Google sait déjà qui c'est, puisque le script
vit dans son compte.

**C'est le déploiement en application web qui débloque tout** : il
transforme le script en une adresse HTTP publique. À partir de là,
n'importe quoi peut lui envoyer des données — un site, un formulaire,
un autre programme. C'est exactement la forme d'une API.

### Pourquoi il en fallait une

Un site statique ne sait rien faire tout seul. Il affiche des pages,
point. Il ne peut ni envoyer d'email, ni retenir quoi que ce soit. Pour
ça il doit **parler à quelque chose d'autre**.

D'habitude ce « quelque chose » est un service payant : Formspree,
Typeform, un back-office. Ici, c'est le compte Google de l'artisan.
Gratuit, et surtout **il possède ses données** : pas d'abonnement à
résilier, pas d'export à récupérer si le service ferme.

### Le tableur comme base de données

Ce n'est pas « un Excel dans Drive ». C'est un entrepôt de données qui
a une propriété rare : **une interface que tout le monde sait déjà
utiliser.**

Pour quelques centaines de lignes par an, c'est meilleur qu'une vraie
base de données — précisément parce que l'artisan peut l'ouvrir, trier,
filtrer, ajouter une colonne « relancé le… », surligner un devis en
attente. Une vraie base exigerait de lui construire une interface. Le
tableur en a une, gratuite, sur son téléphone.

---

## 2. Ce qu'on a construit

```
Navigateur du visiteur
   │  formulaire en 3 étapes, questions conditionnelles
   │  POST  application/x-www-form-urlencoded
   ▼
Application web Apps Script  (adresse en /exec, publique)
   │
   ├─ 1. écrit une ligne dans la feuille de calcul
   ├─ 2. envoie un email de notification à l'artisan
   └─ 3. envoie un accusé de réception au client
   │
   └─ répond {"ok": true} ou {"ok": false, "raison": …}
```

Deux choix latéraux qui comptent :

- **Les photos ne passent pas par le formulaire.** Elles partent sur
  WhatsApp depuis l'écran de confirmation, avec un message pré-rempli
  portant le nom et la commune. Motif : l'hébergement de fichiers est
  payant chez tous les services de formulaire, et un artisan en
  chantier lit WhatsApp, pas ses mails.
- **Si l'envoi échoue**, la demande est résumée et proposée sur
  WhatsApp en un geste. Rien ne se perd en silence.

---

## 3. Les cinq disciplines

**C'est la partie qui a le plus de valeur, et celle que tous les
tutoriels sautent.** Envoyer un email depuis Apps Script tient en dix
lignes ; n'importe qui le montre. Ce qui sépare une démonstration d'un
outil sur lequel quelqu'un fonde son activité, c'est ceci :

1. **La ligne est écrite avant l'email, jamais l'inverse.** Si l'envoi
   échoue — quota, panne — la demande est déjà enregistrée. L'ordre des
   opérations est une décision de conception, pas un détail.

2. **Chaque envoi a son propre filet.** Un accusé de réception qui
   échoue, parce que le client a mal saisi son adresse, ne doit pas
   faire tomber la notification à l'artisan. Trois `try/catch`
   indépendants, pas un seul autour de tout.

3. **Jamais de succès silencieux.** Apps Script répond `200` même quand
   il refuse la demande. Se fier au statut HTTP, c'est afficher
   « merci, c'est envoyé » alors que rien n'est enregistré. C'est
   exactement ce qui a coûté deux heures. Le script renvoie donc un
   verdict dans le corps, et c'est lui qui fait foi.

4. **Un canal de secours.** Quand la chaîne casse, l'utilisateur doit
   avoir une autre porte, et sans retaper sa demande.

5. **Un plafond sur ce qui part vers des tiers.** L'accusé de réception
   écrit à une adresse saisie par un inconnu, sur une adresse publique.
   Sans limite, ça devient un relais pour expédier du courrier signé du
   nom de l'artisan à n'importe qui.

---

## 4. Les deux pièges traversés

Aucun des deux n'est documenté là où on le chercherait. Les comprendre
vaut mieux que les mémoriser.

### Le corps multipart qui arrive vide

**Symptôme** : le site affiche la confirmation, aucune ligne
n'apparaît, et l'exécution s'affiche « Terminée ».

**Cause** : envoyer un `FormData` en JavaScript produit un corps
`multipart/form-data`. Apps Script **ne remplit `e.parameters` que pour
de l'`application/x-www-form-urlencoded`**. Le corps multipart arrive
bien — il est dans `e.postData.contents` — mais `e.parameters` reste
vide. Le script croit recevoir une demande sans aucun champ.

**Correction** : envoyer un `URLSearchParams` plutôt qu'un `FormData`.

**Ce qu'il faut en retenir**, au-delà du cas : les trois types de
contenu qu'un navigateur peut envoyer sans déclencher de requête
préalable (*preflight* CORS) sont `application/x-www-form-urlencoded`,
`multipart/form-data` et `text/plain`. Choisir parmi ces trois-là n'est
donc pas qu'une question de goût — c'est ce qui permet à une page
statique de parler à Apps Script sans configuration particulière. Il se
trouve que le seul des trois qu'Apps Script sait découper est le
premier.

### Le script qui n'est rattaché à aucune feuille

**Symptôme** : même en lançant la fonction de test depuis l'éditeur,
rien ne s'écrit, et l'exécution s'affiche « Terminée ».

**Cause** : `SpreadsheetApp.getActiveSpreadsheet()` ne renvoie quelque
chose que si le script a été créé **depuis la feuille**
(Extensions › Apps Script). Créé séparément depuis `script.google.com`,
il n'a pas de feuille « active » — la fonction renvoie `null`, la ligne
suivante échoue, et le `try/catch` avale l'erreur.

**Correction** : ouvrir la feuille par son identifiant explicite,
`SpreadsheetApp.openById(...)`.

**Ce qu'il faut en retenir** : un `try/catch` qui attrape sans rien
signaler transforme une panne en silence. Toute erreur avalée doit au
minimum être journalisée, et de préférence remonter à l'appelant.

### Le piège de fonctionnement, qui n'est pas un bug

L'éditeur exécute la **dernière version enregistrée**. Le formulaire
appelle la **version déployée**. Modifier et enregistrer ne change rien
au site tant qu'on n'a pas fait *Déployer › Gérer les déploiements →
Nouvelle version*.

---

## 5. Ce qui se transpose, ce qui ne se transpose pas

### Réutilisable presque tel quel

Le script est générique à 90 %. Ce qui est propre à ce client tient en
quatre endroits : l'adresse de notification, le numéro WhatsApp,
l'ordre des colonnes, et la table des intitulés lisibles. Le reste —
création automatique des colonnes, verrou d'écriture concurrente,
plafond d'envoi, isolation des erreurs — marcherait pour un cabinet
d'avocats ou un traiteur sans y toucher une ligne.

**La pièce la plus discrète est la plus importante** : côté site, la
construction du corps de la requête est générique. Elle parcourt le
formulaire au lieu de lister les champs un par un. Côté script, les
colonnes se créent d'après ce qui arrive. Résultat : **ajouter une
question, c'est écrire du HTML, rien d'autre.** Pas de liste à tenir à
jour des deux côtés.

C'est ce couple-là qui rend l'ensemble transposable — davantage que le
mécanisme d'envoi lui-même.

### Non transposable

- **Le choix de WhatsApp pour les photos** tenait à deux
  particularités : le coût de l'hébergement de fichiers, et le fait que
  cet artisan-là lit WhatsApp mais pas ses mails. Pour un client de
  bureau, ce serait un mauvais choix.
- **Les questions conditionnelles, les interdits rédactionnels, la
  structure du récapitulatif** : tout ça se rejoue à chaque métier.
  C'est là qu'est le vrai travail, et il n'est pas automatisable.

---

## 6. Les limites, et quand changer de solution

- **Quotas** — de l'ordre de 100 emails par jour depuis un compte
  Gmail gratuit, 6 minutes par exécution. Suffisant ici, bloquant pour
  un site à fort trafic. *À revérifier, ces valeurs changent.*
- **L'autorisation peut expirer** après une longue inactivité ou un
  changement de mot de passe.
- **Les erreurs sont muettes** par nature : pas d'alerte, pas de
  supervision. C'est à nous de les rendre visibles.
- **Tout tient sur un compte Google personnel.** Parfait pour une
  personne seule. À revoir dès qu'il faut plusieurs utilisateurs, des
  droits d'accès différenciés, ou une garantie de service.
- **Au-delà de quelques milliers de lignes**, le tableur n'est plus le
  bon outil.

### Le paysage autour

- **Cloudflare Workers** — même idée, plus puissant, pas de quota
  d'emails puisqu'il n'en envoie pas nativement. Mais c'est du vrai
  code à maintenir, et l'envoi d'email demande un service tiers.
- **Make / Zapier** — même idée sans écrire de code, payant dès qu'on
  dépasse le jouet.
- **AWS Lambda, Google Cloud Functions** — la version industrielle.
  Aucun rapport en termes d'effort de mise en place.

---

## 7. Exercices

L'ordre compte : reproduire, puis casser, puis étendre. **Casser
volontairement est la partie qui apprend le plus** — c'est ce qui
transforme une recette en compréhension.

### A. Reproduire le minimum

Sur un compte Google personnel, refaire la chaîne la plus courte
possible : une feuille, un script créé **depuis** cette feuille, une
fonction `doPost` qui écrit une ligne, un déploiement en application
web, et une page HTML locale d'un seul champ qui poste dessus.

Objectif : voir apparaître une ligne. Rien d'autre.

### B. Casser, exprès

1. Remplacer `URLSearchParams` par `FormData` dans la page.
   → Observer : la requête part, l'exécution s'affiche « Terminée »,
   aucune ligne. Aller lire `e.postData.contents` dans le journal pour
   constater que les données sont bien arrivées, ailleurs.
2. Faire échouer volontairement l'écriture (identifiant de feuille
   faux) et vérifier ce que voit l'utilisateur.
3. Retirer le `try/catch` autour de l'envoi d'email et provoquer une
   erreur : constater que la ligne n'est plus enregistrée. Puis
   remettre l'ordre correct.
4. Modifier le script, enregistrer, **ne pas redéployer**, et tester
   depuis la page. Comprendre pourquoi rien ne change.

### C. Étendre

1. Ajouter une question au formulaire **sans toucher au script**, et
   vérifier que la colonne se crée toute seule.
2. Écrire un accusé de réception en HTML. Contraintes réelles : les
   messageries suppriment les feuilles de style, Gmail retire le
   `<head>`, les images distantes sont bloquées par défaut. Donc :
   tableaux imbriqués, styles en ligne, pas d'image, pas de police web.
3. Ajouter un déclencheur horaire (*trigger*) qui envoie chaque lundi
   un récapitulatif des demandes de la semaine.
4. Ajouter un plafond d'envoi quotidien avec `PropertiesService`.

### D. Prendre du recul

Reprendre les cinq disciplines et, pour chacune, écrire **le scénario
précis de panne qu'elle évite**. Si on ne sait pas nommer la panne, on
n'a pas compris la règle.

---

## 8. Questions de contrôle

À poser, sans donner les réponses tout de suite.

1. Pourquoi un site statique ne peut-il pas envoyer un email lui-même ?
2. Qu'est-ce qui, concrètement, transforme un script Google en API ?
3. Une requête revient avec un statut `200`. La demande est-elle
   enregistrée ? Justifier.
4. Pourquoi écrire la ligne avant d'envoyer l'email, et pas l'inverse ?
5. Un `FormData` et un `URLSearchParams` transportent les mêmes
   données. Pourquoi l'un marche-t-il et pas l'autre ?
6. Le script fonctionne quand on le lance depuis l'éditeur, mais pas
   depuis le site. Que vérifier en premier ?
7. Pourquoi plafonner le nombre d'accusés de réception par jour ? Quel
   est le scénario d'abus exact ?
8. À partir de quel moment ce montage cesse-t-il d'être le bon choix ?
   Donner trois seuils différents.
9. Le tableur est-il une bonne base de données ? Argumenter dans les
   deux sens.
10. Qu'est-ce qui, dans ce projet, se réutilise tel quel pour un autre
    métier — et qu'est-ce qui est à refaire entièrement ?

---

## 9. Vocabulaire à connaître

Pour pouvoir chercher seul, et pour comprendre les réponses trouvées.

| Terme | Ce que c'est |
|---|---|
| *serverless* | Du code exécuté par un fournisseur, sans serveur à gérer |
| *endpoint* | L'adresse à laquelle on envoie une requête |
| *webhook* | Un endpoint qui attend d'être appelé par un autre programme |
| *CORS* | Les règles qui décident si une page peut appeler un autre domaine |
| *preflight* | Requête préalable envoyée par le navigateur dans certains cas — l'éviter simplifie tout |
| *payload* | Le contenu envoyé dans la requête |
| *urlencoded* | Un format de corps : `nom=Dupont&ville=Paris` |
| *multipart* | Un autre format, nécessaire pour les fichiers |
| *quota* | La limite d'usage imposée par le fournisseur |
| *trigger* | Un déclencheur : à l'heure, à l'ouverture, à la modification |
| *idempotence* | Propriété d'une opération qu'on peut refaire sans doublon — à creuser, ce montage ne l'a pas |

---

## 10. Le code réel

Le projet complet est sur GitHub. Le formateur peut s'y référer :

- `apps-script/Code.gs` — le script commenté, avec les deux pièges
  décrits en commentaire à l'endroit exact où ils se posent
- `index.html` — la construction générique du corps de la requête est
  dans le dernier bloc `<script>`
- `CLAUDE.md` — les décisions actées et leur justification
- `FAQ.md` — les pannes classées par symptôme
- `git log` — les messages expliquent le *pourquoi* de chaque
  changement, pas seulement le quoi
