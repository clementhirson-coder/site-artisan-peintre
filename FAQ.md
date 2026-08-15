# En cas de problème

Classé par **ce que vous voyez**, pas par composant. Chaque entrée donne
la cause la plus fréquente d'abord.

Deux réflexes qui résolvent la moitié des cas :

- **Recharger de force** la page du site : `Ctrl+Shift+R`
  (`Cmd+Shift+R` sur Mac). Un simple `F5` sert souvent l'ancienne copie.
- **Ouvrir l'onglet Exécutions** dans l'éditeur Apps Script, colonne de
  gauche. Il liste chaque appel reçu ; cliquer sur une ligne déplie son
  journal, et c'est là que se trouve le message d'erreur.

---

## Le formulaire

### « Formulaire pas encore activé. Appeler directement… »

Le site tourne sur une version dont l'adresse d'envoi n'est pas
renseignée.

1. Recharger de force. Si le message disparaît, c'était le cache.
2. Sinon, afficher la source de la page (`Ctrl+U`) et chercher
   `formspree` : si on le trouve, la page en ligne date d'avant le
   branchement — republier sur Cloudflare.

### « L'envoi a échoué » + bouton WhatsApp

Le site n'a pas pu joindre Google. **La demande n'est pas perdue** : le
bouton l'envoie sur WhatsApp, résumée. Causes, par fréquence :

1. **L'autorisation Google a expiré** — elle est révoquée après une
   longue inactivité ou un changement de mot de passe. Rouvrir
   l'éditeur, lancer `verifierFeuille`, réautoriser, puis redéployer en
   *Nouvelle version*.
2. **Le déploiement a été supprimé.** Vérifier dans *Déployer › Gérer
   les déploiements* qu'il en existe un, actif.
3. **Panne réseau du visiteur.** Rien à faire, il réessaiera.

### Le client voit la confirmation, mais rien n'arrive

Le site a bien joint Google, et Google a refusé la demande.

Ouvrir **Exécutions**. Une ligne `doPost` doit apparaître à l'heure de
l'essai — cliquer dessus pour lire le journal, qui nomme la cause.

Si aucune ligne `doPost` n'apparaît, la requête n'atteint pas Google :
l'adresse `/exec` du site ne correspond plus au déploiement.

### J'ai modifié le script et rien ne change

**C'est le piège le plus fréquent.** L'éditeur exécute la dernière
version *enregistrée* ; le formulaire, lui, appelle la version
*déployée*.

*Déployer › Gérer les déploiements* → crayon → **Nouvelle version** →
Déployer. Passer par « Nouveau déploiement » créerait une autre adresse,
qu'il faudrait reporter dans le site.

---

## La feuille de calcul

### Aucune ligne n'apparaît, mais les exécutions sont « Terminée »

Le script n'écrit pas là où vous regardez. Lancer **`verifierFeuille`**
depuis l'éditeur : le journal indique le nom et l'adresse du classeur
réellement utilisé, ou dit qu'il n'en trouve aucun.

S'il n'en trouve aucun, c'est que le script a été créé depuis
`script.google.com` et non depuis la feuille. Renseigner `FEUILLE_ID`
en tête du script — l'identifiant se lit dans l'adresse de la feuille,
entre `/d/` et `/edit` — puis redéployer.

### Comment supprimer une ligne d'essai

Cliquer sur le **numéro** de la ligne à gauche, clic droit → *Supprimer
la ligne*. Plusieurs d'un coup : cliquer le premier numéro,
`Maj`+clic sur le dernier.

**Ne pas vider les cellules** : une ligne vidée reste comptée comme
occupée, et les demandes suivantes s'ajouteraient en dessous en laissant
des trous. **Ne pas toucher à la ligne 1**, celle des en-têtes.

### Puis-je ajouter mes propres colonnes ?

Oui. Le script associe chaque réponse à sa colonne **par le nom de
l'en-tête**, pas par sa position : on peut insérer, déplacer ou
renommer des colonnes sans rien casser. Une colonne ajoutée à la main
(« relancé le », « devis envoyé ») restera simplement vide au
remplissage.

Renommer le fichier ou le déplacer dans Drive est sans effet. Le
**supprimer** casse tout.

### Une colonne est apparue toute seule

C'est prévu : une question ajoutée au formulaire crée sa colonne au
premier envoi qui la contient. Elle se place à la fin.

---

## Les emails

### La ligne est enregistrée mais aucun email n'arrive

L'ordre est volontaire — la ligne est écrite **avant** l'email, pour
qu'une panne d'envoi ne fasse jamais perdre une demande.

1. Regarder les **spams**.
2. Un compte Gmail gratuit envoie environ **100 emails par jour** depuis
   un script. Au-delà, les lignes continuent d'être enregistrées, seuls
   les emails manquent. Le compteur repart le lendemain.

### Le client ne reçoit pas l'accusé de réception

1. **Il a mal saisi son adresse.** Elle est visible dans la feuille et
   dans l'email de notification.
2. **Le plafond de 30 accusés par jour est atteint** — voir le journal
   des Exécutions. Ce plafond existe pour empêcher qu'on se serve du
   formulaire pour expédier du courrier signé Borsci Rénovation à des
   tiers. Il se règle par `ACCUSES_PAR_JOUR` en tête du script.
3. Ses spams.

Pour désactiver complètement l'accusé : `ACCUSE_RECEPTION = false` en
tête du script, puis redéployer.

### Les demandes se perdent dans la boîte

Créer un filtre Gmail : recherche → **Créer un filtre** → *Objet
contient* `Demande —` → cocher **Appliquer le libellé** (« Demandes »),
**Ne jamais envoyer aux spams**, **Marquer comme important**.

Sur téléphone, on peut ensuite n'activer les notifications que pour ce
libellé.

---

## Le site

### J'ai modifié un texte, je ne le vois pas en ligne

1. La modification a-t-elle été **republiée** sur Cloudflare ? Modifier
   le fichier ne suffit pas.
2. Recharger de force.

### Une photo ne s'affiche plus

Le nom du fichier ne correspond plus à celui écrit dans `index.html`.
**La casse compte** : `Chantier.jpg` et `chantier.jpg` sont deux
fichiers différents en ligne, alors que Windows et macOS les
confondent. Reprendre exactement le nom d'origine.

### Le site est cassé après une modification

Ne rien supprimer. Sur Cloudflare, onglet **Déploiements** → choisir le
déploiement précédent → *Rollback*. Le site revient à l'état d'avant en
quelques secondes.

### Google ne trouve pas le site

Normal et voulu tant que les visuels de substitution sont en place : la
page porte `<meta name="robots" content="noindex, nofollow">`. Le
retirer en même temps que ces visuels — voir `README.md`.

### Du texte apparaît surligné en terre cuite, entre crochets

Ce sont les informations qui restent à fournir : SIRET, adresse
déclarée, assureur, communes des chantiers. La liste complète est dans
`README.md`. Le surlignage disparaît une fois le texte remplacé.

---

## Sécurité et données

### N'importe qui peut-il écrire dans la feuille ?

L'adresse `/exec` est nécessairement publique — c'est le site qui
l'appelle depuis le navigateur du visiteur. Quelqu'un qui la trouverait
pourrait donc ajouter des lignes. Trois garde-fous :

- un **champ piège** invisible que seuls les robots remplissent ; les
  demandes concernées sont ignorées en silence ;
- le **plafond de 30 accusés par jour**, qui empêche de se servir du
  formulaire comme relais d'envoi ;
- la feuille elle-même **n'est pas partagée** : personne ne peut la
  lire, seulement y ajouter par le formulaire.

**Ne jamais partager la feuille en « toute personne disposant du
lien ».** C'est le seul geste qui rendrait les données lisibles par des
tiers.

### Un client demande la suppression de ses données

Supprimer sa ligne dans la feuille, et l'email de notification
correspondant dans la boîte. C'est tout — les données ne sont nulle
part ailleurs. L'adresse de contact figure dans les mentions légales du
site.

---

## Si rien de tout cela ne correspond

Les messages de commit expliquent le pourquoi de chaque décision :

```bash
git log --oneline
git log --grep=formulaire
git log -p -- apps-script/Code.gs
```

Et `CLAUDE.md` recense les décisions actées et les pièges déjà
rencontrés.
