/* ============================================================
   REGLAGES — LES DEUX SEULES LIGNES A MODIFIER
   ============================================================ */

/** Adresse qui reçoit les notifications. */
var DESTINATAIRE = 'contact.borsci@gmail.com';

/**
 * Identifiant de la feuille de calcul.
 *
 * Le laisser vide si ce script a été créé DEPUIS la feuille
 * (Extensions › Apps Script) : il la trouve tout seul.
 *
 * Le remplir si ce script a été créé séparément, depuis
 * script.google.com. Sinon getActiveSpreadsheet() ne renvoie rien,
 * l'écriture échoue, et l'exécution s'affiche quand même « Terminée »
 * sans qu'aucune ligne n'apparaisse.
 *
 * L'identifiant se lit dans l'adresse de la feuille, entre /d/ et /edit :
 *   docs.google.com/spreadsheets/d/ 1AbC…XyZ /edit
 *                                   ^^^^^^^^^
 */
var FEUILLE_ID = '';

/* ============================================================
   Au-dessous, plus rien à modifier.
   ============================================================ */

/**
 * Borsci Rénovation — réception des demandes du site.
 *
 * Ce script est attaché à une feuille de calcul Google. À chaque demande
 * envoyée depuis le formulaire du site, il :
 *   1. ajoute une ligne dans la feuille (le registre des demandes) ;
 *   2. envoie un email de notification.
 *
 * La ligne est écrite AVANT l'email : si l'envoi du mail échoue, la
 * demande n'est jamais perdue.
 *
 * Déploiement : voir DEPLOIEMENT.md, dans le même dossier.
 *
 * ---------------------------------------------------------------------
 * AJOUTER UNE QUESTION AU FORMULAIRE ne demande AUCUNE modification ici.
 * Le script lit ce qu'il reçoit et crée la colonne manquante au premier
 * envoi. La liste ORDRE ci-dessous ne sert qu'à fixer l'ordre des
 * colonnes connues ; tout le reste est ajouté à la suite.
 * ---------------------------------------------------------------------
 */

/** Numéro WhatsApp de l'artisan, au format international sans le +. */
var WHATSAPP = '33614495837';

/**
 * Nom du champ piège. Il est invisible sur le site : un humain ne peut
 * pas le remplir. S'il arrive rempli, c'est un robot — la demande est
 * ignorée en silence.
 */
var PIEGE = 'site-web';

/** Ordre des colonnes connues. Les champs inconnus sont ajoutés après. */
var ORDRE = [
  'date',
  'nom', 'telephone', 'email',
  'commune', 'code-postal', 'bien', 'etage', 'ascenseur',
  'prestation', 'delai', 'budget', 'surface', 'occupation',
  'description',
  'assechement', 'fuite', 'surfaces',
  'pieces', 'plafonds', 'supports',
  'sol-actuel', 'depose',
  'cloisons-nb', 'isolation',
  'terrasse-surface', 'terrasse-support',
  'stade',
  'consentement'
];

/* ==================================================================== */

function doPost(e) {
  try {
    var champs = lireChamps(e);

    /* Requête vide : quelqu'un a ouvert l'URL, ou un robot tâtonne. */
    if (!champs || !Object.keys(champs).length) {
      return reponse({ ok: false, raison: 'aucun champ reçu — corps mal encodé ?' });
    }
    if (!champs.telephone) {
      return reponse({ ok: false, raison: 'téléphone manquant' });
    }

    /* Champ piège rempli : on répond ok pour que le robot n'insiste
       pas, mais rien n'est enregistré. */
    if (champs[PIEGE]) {
      return reponse({ ok: true });
    }
    delete champs[PIEGE];

    /* Un verrou évite que deux demandes simultanées écrivent sur la
       même ligne. */
    var verrou = LockService.getScriptLock();
    verrou.waitLock(20000);
    try {
      enregistrer(champs);
    } finally {
      verrou.releaseLock();
    }

    /* L'email vient après : une panne d'envoi ne doit pas faire perdre
       la demande, déjà enregistrée. */
    try {
      notifier(champs);
    } catch (err) {
      console.error('Notification impossible : ' + err);
    }

    return reponse({ ok: true });

  } catch (err) {
    console.error(err);
    return reponse({ ok: false, raison: String(err) });
  }
}

/**
 * Ouvrir l'URL /exec dans un navigateur tombe ici. On répond quelque
 * chose de lisible plutôt qu'une erreur.
 */
function doGet() {
  return ContentService
    .createTextOutput('Point de réception du formulaire de borsci-renovation.fr.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ==================================================================== */

/**
 * Aplatit les paramètres reçus. Les cases à cocher arrivent en plusieurs
 * exemplaires sous le même nom (prestation, surfaces…) : on les réunit
 * en une seule cellule.
 *
 * PIEGE A CONNAITRE — Apps Script ne remplit e.parameters que pour un
 * corps `application/x-www-form-urlencoded`. Un corps `multipart/
 * form-data`, celui qu'envoie un FormData, arrive bien mais laisse
 * e.parameters VIDE : le script croit recevoir une demande vide et ne
 * l'enregistre pas, tout en répondant 200. Le site envoie donc de
 * l'urlencodé. Le repli ci-dessous rattrape le cas où quelqu'un
 * changerait ça, et accepte aussi un corps JSON.
 */
function lireChamps(e) {
  if (!e) return null;
  var champs = {};

  if (e.parameters) {
    Object.keys(e.parameters).forEach(function (cle) {
      var valeurs = e.parameters[cle].filter(function (v) { return String(v).trim(); });
      if (valeurs.length) champs[cle] = valeurs.join(' · ');
    });
  }
  if (Object.keys(champs).length) return champs;

  /* Repli : corps brut. */
  var brut = e.postData && e.postData.contents;
  if (!brut) return champs;

  var type = (e.postData.type || '').toLowerCase();

  if (type.indexOf('json') !== -1) {
    try {
      var objet = JSON.parse(brut);
      Object.keys(objet).forEach(function (cle) {
        var v = objet[cle];
        champs[cle] = Array.isArray(v) ? v.join(' · ') : String(v);
      });
    } catch (err) {
      console.error('Corps JSON illisible : ' + err);
    }
    return champs;
  }

  if (type.indexOf('multipart') !== -1) {
    console.error('Corps multipart reçu : Apps Script ne sait pas le découper. '
                + 'Le site doit envoyer de l\'urlencodé (URLSearchParams).');
  }
  return champs;
}

/**
 * Renvoie la feuille où écrire, ou lève une erreur explicite.
 * Un message clair vaut mieux qu'un « Terminée » trompeur.
 */
function feuilleCible() {
  var classeur = null;

  if (FEUILLE_ID) {
    try {
      classeur = SpreadsheetApp.openById(FEUILLE_ID);
    } catch (err) {
      throw new Error(
        "FEUILLE_ID ne correspond à aucune feuille accessible : « " + FEUILLE_ID + " ». "
      + "Il se lit dans l'adresse de la feuille, entre /d/ et /edit — sans les barres "
      + "obliques, sans /edit, et sans ce qui suit le #. (" + err + ")");
    }
  } else {
    classeur = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!classeur) {
    throw new Error(
      "Aucune feuille de calcul rattachée. Ce script a probablement été créé "
    + "depuis script.google.com plutôt que depuis la feuille (Extensions › "
    + "Apps Script). Renseigner FEUILLE_ID en haut du fichier, puis "
    + "redéployer en Nouvelle version.");
  }

  var feuille = classeur.getSheets()[0];
  if (!feuille) throw new Error('Le classeur « ' + classeur.getName() + ' » ne contient aucun onglet.');
  return feuille;
}

/** Ajoute une ligne, en créant au besoin les colonnes manquantes. */
function enregistrer(champs) {
  var feuille = feuilleCible();
  var cles = Object.keys(champs);

  var entetes = feuille.getLastColumn() > 0
    ? feuille.getRange(1, 1, 1, feuille.getLastColumn()).getValues()[0]
        .filter(function (v) { return String(v).trim(); })
    : [];

  var neuf = !entetes.length;
  if (neuf) entetes = ORDRE.slice();

  var ajout = false;
  cles.forEach(function (c) {
    if (entetes.indexOf(c) === -1) { entetes.push(c); ajout = true; }
  });

  if (neuf || ajout) {
    feuille.getRange(1, 1, 1, entetes.length).setValues([entetes]);
    if (neuf) {
      feuille.getRange(1, 1, 1, entetes.length).setFontWeight('bold');
      feuille.setFrozenRows(1);
    }
  }

  champs.date = Utilities.formatDate(new Date(), 'Europe/Paris', 'dd/MM/yyyy HH:mm');

  feuille.appendRow(entetes.map(function (c) {
    return champs[c] !== undefined ? champs[c] : '';
  }));
}

/** Notification par email, avec réponse directe au client. */
function notifier(champs) {
  var titre = 'Demande — ' + (champs.commune || 'commune non précisée')
            + (champs.prestation ? ' — ' + champs.prestation : '');

  var lignes = [];
  lignes.push(champs.nom || '');
  lignes.push(champs.telephone || '');
  if (champs.email) lignes.push(champs.email);
  lignes.push('');

  /* Le reste des champs, dans l'ordre des colonnes, sans répéter
     l'identité déjà en tête. */
  var deja = ['nom', 'telephone', 'email', 'consentement', 'date'];
  ORDRE.concat(Object.keys(champs)).forEach(function (cle) {
    if (deja.indexOf(cle) !== -1) return;
    deja.push(cle);
    if (champs[cle]) lignes.push(etiquette(cle) + ' : ' + champs[cle]);
  });

  var tel = champs.telephone ? champs.telephone.replace(/\D/g, '') : '';
  if (tel.length === 10 && tel.charAt(0) === '0') tel = '33' + tel.substring(1);
  if (tel) {
    lignes.push('');
    lignes.push('Écrire sur WhatsApp : https://wa.me/' + tel);
  }

  lignes.push('');
  lignes.push('Reçu le ' + champs.date + '. La demande est aussi enregistrée dans la feuille de calcul.');

  MailApp.sendEmail({
    to: DESTINATAIRE,
    replyTo: champs.email || DESTINATAIRE,
    subject: titre,
    body: lignes.join('\n')
  });
}

/** Nom de champ → intitulé lisible dans l'email. */
function etiquette(cle) {
  var noms = {
    'code-postal': 'Code postal', 'bien': 'Type de bien', 'etage': 'Étage',
    'ascenseur': 'Ascenseur', 'prestation': 'Travaux', 'delai': 'Délai',
    'budget': 'Budget', 'surface': 'Surface', 'occupation': 'Logement',
    'description': 'Description', 'assechement': 'Assèchement',
    'fuite': 'Fuite réparée', 'surfaces': 'Surfaces touchées',
    'pieces': 'Nombre de pièces', 'plafonds': 'Plafonds compris',
    'supports': 'État des supports', 'sol-actuel': 'Revêtement actuel',
    'depose': 'Dépose de l\'ancien sol', 'cloisons-nb': 'Nombre de cloisons',
    'isolation': 'Isolation', 'terrasse-surface': 'Surface de terrasse',
    'terrasse-support': 'Support de terrasse', 'stade': 'Stade du projet',
    'commune': 'Commune'
  };
  return noms[cle] || (cle.charAt(0).toUpperCase() + cle.slice(1));
}

function reponse(objet) {
  return ContentService
    .createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ==================================================================== */

/**
 * Diagnostic. À lancer depuis l'éditeur quand rien n'apparaît dans la
 * feuille : le journal d'exécution dira sur quel classeur le script
 * travaille réellement, ou pourquoi il n'en trouve aucun.
 */
function verifierFeuille() {
  var feuille = feuilleCible();
  var classeur = feuille.getParent();
  console.log('Classeur : ' + classeur.getName());
  console.log('Adresse  : ' + classeur.getUrl());
  console.log('Onglet   : ' + feuille.getName() + ' — ' + feuille.getLastRow() + ' ligne(s)');
  console.log('Notifications envoyées à : ' + DESTINATAIRE);
}

/**
 * Test manuel. Dans l'éditeur Apps Script, choisir « essai » dans la
 * liste des fonctions et cliquer sur Exécuter : une ligne d'essai est
 * ajoutée et un email est envoyé. À supprimer de la feuille ensuite.
 *
 * Toute erreur est renvoyée telle quelle pour apparaître dans le
 * journal : sans ça, doPost l'attrape et l'exécution passe pour
 * « Terminée ».
 */
function essai() {
  var sortie = doPost({
    parameters: {
      nom: ['Essai — à supprimer'],
      telephone: ['06 00 00 00 00'],
      email: ['essai@exemple.fr'],
      commune: ['Montreuil'],
      'code-postal': ['93100'],
      bien: ['appartement'],
      etage: ['3'],
      ascenseur: ['oui'],
      prestation: ['Après une fuite ou un dégât des eaux'],
      assechement: ['terminé'],
      surfaces: ['plafond', 'murs'],
      delai: ['urgent'],
      consentement: ['oui']
    }
  });
  var verdict = JSON.parse(sortie.getContent());
  console.log('Réponse du script : ' + sortie.getContent());
  if (!verdict.ok) throw new Error('Le script a refusé la demande : ' + verdict.raison);
  console.log('Ligne ajoutée. Ne pas oublier de la supprimer de la feuille.');
}
