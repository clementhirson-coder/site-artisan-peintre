# Brancher le formulaire — mode d'emploi

À faire une seule fois, dans le compte Google **contact.borsci@gmail.com**.
Compter dix minutes. Aucune connaissance technique nécessaire : il s'agit
de copier un texte et de cliquer sur quelques boutons.

À la fin, chaque demande envoyée depuis le site ajoutera une ligne dans
une feuille de calcul **et** enverra un email.

---

## 1. Créer la feuille de calcul

1. Se connecter à Google avec **contact.borsci@gmail.com**.
2. Ouvrir <https://sheets.new> — une feuille vide apparaît.
3. En haut à gauche, remplacer « Feuille de calcul sans titre » par
   **Demandes — Borsci Rénovation**.

Ne rien écrire dans la feuille : le script créera les colonnes lui-même
à la première demande.

## 2. Coller le script

1. Dans le menu, **Extensions › Apps Script**. Un nouvel onglet s'ouvre.
2. La fenêtre de code contient déjà quelques lignes (`function myFunction`…).
   **Tout sélectionner et tout supprimer.**
3. Ouvrir le fichier `Code.gs` (à côté de ce mode d'emploi), en copier
   tout le contenu, et le coller dans la fenêtre vide.
4. Cliquer sur l'icône de disquette (**Enregistrer le projet**).

## 3. Publier

1. En haut à droite, bouton bleu **Déployer › Nouveau déploiement**.
2. Cliquer sur la roue dentée à gauche de « Sélectionnez le type » et
   choisir **Application Web**.
3. Renseigner :
   - Description : `Formulaire du site`
   - Exécuter en tant que : **Moi** (contact.borsci@gmail.com)
   - Qui a accès : **Tout le monde**

   Ce dernier réglage est obligatoire : c'est le site public qui envoie
   les demandes. Personne ne peut lire la feuille pour autant — l'URL
   ne sait que recevoir.
4. Cliquer sur **Déployer**.

## 4. Autoriser

Google demande une autorisation la première fois. Le parcours est un peu
intimidant, il est normal :

1. **Autoriser l'accès** → choisir le compte contact.borsci@gmail.com.
2. Un écran « Google n'a pas validé cette application » apparaît.
   Cliquer sur **Paramètres avancés**, en bas à gauche.
3. Cliquer sur **Accéder à Demandes — Borsci Rénovation (non sécurisé)**.

   Cet avertissement s'affiche pour tout script personnel non publié sur
   la place de marché Google. Le script est celui que vous venez de
   coller, rien d'autre.
4. Cliquer sur **Autoriser**.

## 5. Récupérer l'adresse

Une fenêtre affiche **URL de l'application Web**. Elle ressemble à :

```
https://script.google.com/macros/s/AKfycbx…longue suite de caractères…/exec
```

**Copier cette adresse et la transmettre.** Elle sera collée dans le
site, à un seul endroit. Tant qu'elle n'y est pas, le formulaire affiche
« Formulaire pas encore activé » plutôt que de perdre une demande.

## 6. Vérifier (facultatif mais recommandé)

Dans l'éditeur Apps Script, choisir la fonction **essai** dans la liste
déroulante en haut, puis cliquer sur **Exécuter**. Une ligne d'essai
apparaît dans la feuille et un email arrive sur la boîte. Supprimer
ensuite la ligne d'essai.

---

## Ensuite

**Recevoir les demandes ailleurs qu'en email.** Dans la feuille de
calcul : *Outils › Règles de notification* permet d'être prévenu à
chaque nouvelle ligne, immédiatement ou en résumé quotidien.

**Modifier le script plus tard.** Après toute modification :
*Déployer › Gérer les déploiements*, cliquer sur le crayon, choisir
**Nouvelle version** dans la liste, puis **Déployer**. L'URL ne change
pas. Si l'on passe par « Nouveau déploiement », une nouvelle URL est
créée et il faut la reporter dans le site.

**Changer l'adresse de notification.** Ligne `var DESTINATAIRE = …` en
haut de `Code.gs`, puis redéployer comme ci-dessus.

**Ajouter une question au formulaire.** Rien à faire ici : le script
crée la colonne manquante tout seul au premier envoi.

## Si ça ne marche plus

Le formulaire affiche « L'envoi a échoué » et propose WhatsApp en
secours — aucune demande n'est perdue en silence. Causes possibles, dans
l'ordre de fréquence :

1. **L'autorisation a expiré.** Google la révoque parfois après une
   longue inactivité ou un changement de mot de passe. Refaire les
   étapes 3 et 4, en choisissant *Nouvelle version*.
2. **Le quota d'emails est atteint.** Un compte Gmail gratuit peut
   envoyer environ 100 emails par jour depuis un script. La ligne est
   quand même enregistrée dans la feuille — seul l'email manque.
3. **La feuille a été renommée ou déplacée.** Sans importance : le
   script travaille sur la feuille à laquelle il est attaché. En
   revanche, la **supprimer** casse tout.

## Où sont les données

La feuille de calcul contient des noms, téléphones, emails et communes
de clients. Elle est hébergée par Google. C'est indiqué dans les
mentions légales du site, à côté de Cloudflare — si l'hébergement
change, cette mention doit changer aussi.

Ne pas partager la feuille en lecture publique.
