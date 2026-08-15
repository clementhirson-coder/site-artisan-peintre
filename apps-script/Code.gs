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

/**
 * Accusé de réception envoyé au client.
 * Mettre à false pour ne plus l'envoyer.
 */
var ACCUSE_RECEPTION = true;

/**
 * Nombre maximum d'accusés de réception par jour.
 *
 * L'accusé part vers une adresse saisie par un inconnu, sur une URL
 * publique : sans plafond, quelqu'un pourrait s'en servir pour expédier
 * des messages signés Borsci Rénovation à des tiers. Au-delà de ce
 * seuil, les demandes continuent d'être enregistrées et notifiées —
 * seul l'accusé au client est suspendu, et le fait est journalisé.
 */
var ACCUSES_PAR_JOUR = 30;

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

    /* Les emails viennent après : une panne d'envoi ne doit pas faire
       perdre la demande, déjà enregistrée. Chacun dans son propre
       try/catch — un accusé de réception qui échoue, parce que le client
       a mal saisi son adresse, ne doit pas empêcher la notification. */
    try {
      notifier(champs);
    } catch (err) {
      console.error('Notification impossible : ' + err);
    }

    if (ACCUSE_RECEPTION && champs.email) {
      try {
        if (plafondAtteint()) {
          console.warn('Plafond de ' + ACCUSES_PAR_JOUR + ' accusés par jour atteint. '
                     + 'La demande est enregistrée et notifiée, mais le client n\'a pas '
                     + "reçu d'accusé. Envoi anormal ou pic d'activité ?");
        } else {
          accuserReception(champs);
        }
      } catch (err) {
        console.error('Accusé de réception impossible : ' + err);
      }
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

/* ====================================================================
   ACCUSÉ DE RÉCEPTION AU CLIENT

   Contraintes propres à l'email, qui expliquent le style du code :
   - les clients de messagerie suppriment les feuilles de style ; tout
     est donc en attribut `style` sur chaque balise ;
   - la mise en page passe par des tableaux imbriqués, seule technique
     que Outlook et Gmail rendent de la même façon ;
   - aucune image : le logo est reconstruit en HTML. Une image distante
     serait bloquée par défaut chez la plupart des destinataires, et une
     image jointe alourdirait le message pour le même résultat ;
   - aucune police web : elles ne se chargent pas en messagerie. La pile
     système donne une linéale proche du logo réel.

   RÈGLES DE RÉDACTION — reprendre celles du site : pas de « nous », pas
   de superlatif, aucune promesse de prix ni de date d'intervention. Le
   rappel sous 24 h est déjà annoncé sur le site, il peut être répété.
   ==================================================================== */

var COULEURS = {
  papier: '#f8f6f1', panneau: '#efeae1', encre: '#292524',
  doux: '#55504b', tenu: '#6b655e', filet: '#ddd6ca', terre: '#9c4221'
};

var PILE = "Helvetica Neue, Helvetica, Arial, sans-serif";

/** Échappe le texte saisi par le client avant de l'insérer dans le HTML. */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Numéro français en format international, pour les liens wa.me. */
function versInternational(numero) {
  var chiffres = String(numero || '').replace(/\D/g, '');
  if (chiffres.length === 10 && chiffres.charAt(0) === '0') return '33' + chiffres.substring(1);
  return chiffres;
}

/**
 * Compte les accusés du jour et dit si le plafond est franchi.
 * Le compteur repart de zéro à chaque changement de date.
 */
function plafondAtteint() {
  var reglages = PropertiesService.getScriptProperties();
  var aujourdhui = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd');
  var jour = reglages.getProperty('accuses_jour');
  var nombre = jour === aujourdhui ? parseInt(reglages.getProperty('accuses_nombre'), 10) || 0 : 0;

  if (nombre >= ACCUSES_PAR_JOUR) return true;

  reglages.setProperties({ accuses_jour: aujourdhui, accuses_nombre: String(nombre + 1) });
  return false;
}

function accuserReception(champs) {
  var prenom = String(champs.nom || '').trim().split(/\s+/)[0];
  var sujet = 'Votre demande est bien arrivée — Borsci Rénovation';

  MailApp.sendEmail({
    to: champs.email,
    subject: sujet,
    body: accuseTexte(champs, prenom),
    htmlBody: accuseHtml(champs, prenom),
    name: 'Borsci Rénovation'
  });
}

/* --- Version texte, pour les clients qui n'affichent pas le HTML --- */
function accuseTexte(champs, prenom) {
  var l = [];
  l.push('Bonjour' + (prenom ? ' ' + prenom : '') + ',');
  l.push('');
  l.push('Votre demande est bien arrivée. Vitalii Borsci vous rappelle sous 24 h');
  l.push('au numéro que vous avez indiqué.');
  l.push('');
  l.push('CE QUE VOUS AVEZ INDIQUÉ');
  recapitulatif(champs).forEach(function (ligne) {
    l.push('- ' + ligne.intitule + ' : ' + ligne.valeur);
  });
  l.push('');
  l.push('DES PHOTOS ?');
  l.push('Elles permettent une première estimation sans déplacement.');
  l.push('Les envoyer sur WhatsApp : ' + lienPhotos(champs));
  l.push('');
  l.push('Pour joindre directement : 06 14 49 58 37');
  l.push('');
  l.push('---');
  l.push('Ce message confirme la demande envoyée depuis borsci-renovation.fr.');
  l.push('Vos informations servent uniquement à y répondre. Pour y accéder,');
  l.push('les corriger ou les faire supprimer : ' + DESTINATAIRE);
  return l.join('\n');
}

/** Les réponses à réafficher, dans l'ordre, sans les coordonnées. */
function recapitulatif(champs) {
  var exclus = ['nom', 'telephone', 'email', 'consentement', 'date', PIEGE];
  var vues = exclus.slice();
  var lignes = [];
  ORDRE.concat(Object.keys(champs)).forEach(function (cle) {
    if (vues.indexOf(cle) !== -1) return;
    vues.push(cle);
    if (champs[cle]) lignes.push({ intitule: etiquette(cle), valeur: champs[cle] });
  });
  return lignes;
}

function lienPhotos(champs) {
  var identite = (champs.nom || '') + (champs.commune ? ' — ' + champs.commune : '');
  var texte = "Bonjour, je viens d'envoyer une demande depuis le site.\n"
            + identite + '\nVoici les photos.';
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texte);
}

/* --- Version HTML --- */
function accuseHtml(champs, prenom) {
  var C = COULEURS;
  var h = [];

  var cellule = 'font-family:' + PILE + ';';

  h.push('<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:' + C.papier + ';">');
  h.push('<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'
       + 'Rappel sous 24 h au numéro indiqué. Vos photos peuvent être envoyées sur WhatsApp.'
       + '</div>');
  h.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.papier + ';">');
  h.push('<tr><td align="center" style="padding:32px 16px 48px;">');
  h.push('<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">');

  /* Logo — reconstruit en tableau, aucune image à charger. */
  h.push('<tr><td style="padding-bottom:30px;">');
  h.push('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>');
  h.push('<td bgcolor="' + C.terre + '" style="' + cellule + 'background:' + C.terre + ';padding:11px 13px;'
       + 'font-size:18px;font-weight:bold;line-height:1;color:' + C.papier + ';letter-spacing:1px;">BR</td>');
  h.push('<td style="' + cellule + 'padding-left:13px;">');
  h.push('<div style="' + cellule + 'font-size:19px;font-weight:bold;line-height:1;color:' + C.encre + ';">BORSCI</div>');
  h.push('<div style="' + cellule + 'font-size:10px;line-height:1;color:' + C.terre + ';letter-spacing:4px;padding-top:6px;">RÉNOVATION</div>');
  h.push('</td></tr></table>');
  h.push('</td></tr>');

  /* Message principal */
  h.push('<tr><td style="' + cellule + 'font-size:26px;line-height:1.25;font-weight:bold;color:' + C.encre + ';padding-bottom:14px;">'
       + 'Votre demande est bien arrivée</td></tr>');
  h.push('<tr><td style="' + cellule + 'font-size:16px;line-height:1.6;color:' + C.doux + ';padding-bottom:8px;">'
       + 'Bonjour' + (prenom ? ' ' + echapper(prenom) : '') + ',</td></tr>');
  h.push('<tr><td style="' + cellule + 'font-size:16px;line-height:1.6;color:' + C.doux + ';padding-bottom:30px;">'
       + 'Vitalii Borsci vous rappelle sous 24 h au numéro que vous avez indiqué. '
       + 'Vous pouvez aussi le joindre directement au '
       + '<a href="tel:+33614495837" style="color:' + C.terre + ';font-weight:bold;text-decoration:none;">06 14 49 58 37</a>.'
       + '</td></tr>');

  /* Récapitulatif */
  var lignes = recapitulatif(champs);
  if (lignes.length) {
    h.push('<tr><td style="padding-bottom:30px;">');
    h.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
         + 'style="border:1px solid ' + C.filet + ';background:#fffdfa;">');
    h.push('<tr><td colspan="2" style="' + cellule + 'font-size:11px;letter-spacing:2px;text-transform:uppercase;'
         + 'color:' + C.tenu + ';padding:14px 18px 4px;">Ce que vous avez indiqué</td></tr>');
    lignes.forEach(function (ligne, i) {
      var bord = i === lignes.length - 1 ? '' : 'border-bottom:1px solid ' + C.filet + ';';
      h.push('<tr>'
        + '<td width="38%" style="' + cellule + 'font-size:14px;line-height:1.5;color:' + C.tenu + ';padding:11px 8px 11px 18px;vertical-align:top;' + bord + '">'
        + echapper(ligne.intitule) + '</td>'
        + '<td style="' + cellule + 'font-size:14px;line-height:1.5;color:' + C.encre + ';padding:11px 18px 11px 8px;vertical-align:top;' + bord + '">'
        + echapper(ligne.valeur) + '</td></tr>');
    });
    h.push('</table></td></tr>');
  }

  /* Relance photos */
  h.push('<tr><td style="padding-bottom:30px;">');
  h.push('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.panneau + ';">');
  h.push('<tr><td style="padding:22px 18px;">');
  h.push('<div style="' + cellule + 'font-size:17px;font-weight:bold;line-height:1.35;color:' + C.encre + ';padding-bottom:8px;">'
       + 'Il reste une chose : les photos</div>');
  h.push('<div style="' + cellule + 'font-size:15px;line-height:1.6;color:' + C.doux + ';padding-bottom:18px;">'
       + 'Quelques photos permettent une première estimation sans déplacement. '
       + 'Le message est déjà écrit : il ne reste qu\'à les joindre.</div>');
  h.push('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
       + '<td bgcolor="#25d366" style="background:#25d366;">'
       + '<a href="' + lienPhotos(champs) + '" style="' + cellule
       + 'display:inline-block;padding:13px 22px;font-size:13px;font-weight:bold;letter-spacing:1px;'
       + 'color:' + C.encre + ';text-decoration:none;">WhatsApp — envoyer mes photos</a>'
       + '</td></tr></table>');
  h.push('</td></tr></table></td></tr>');

  /* Pied */
  h.push('<tr><td style="border-top:1px solid ' + C.filet + ';padding-top:20px;">'
       + '<div style="' + cellule + 'font-size:12px;line-height:1.65;color:' + C.tenu + ';">'
       + 'Ce message confirme la demande envoyée depuis borsci-renovation.fr. '
       + 'Vos informations servent uniquement à y répondre. Pour y accéder, les corriger '
       + 'ou les faire supprimer : <a href="mailto:' + DESTINATAIRE + '" style="color:' + C.tenu + ';">'
       + DESTINATAIRE + '</a>.'
       + '</div></td></tr>');

  h.push('</table></td></tr></table></body></html>');
  return h.join('');
}

/**
 * Aperçu de l'accusé de réception, sans rien envoyer à personne : le
 * message part sur l'adresse de notification avec un jeu de réponses
 * fictives. À lancer depuis l'éditeur pour vérifier le rendu.
 */
function apercuAccuse() {
  var champs = {
    nom: 'Marie Dupont', telephone: '06 12 34 56 78', email: DESTINATAIRE,
    commune: 'Montreuil', 'code-postal': '93100', bien: 'appartement',
    etage: '3', ascenseur: 'oui',
    prestation: 'Après une fuite ou un dégât des eaux',
    assechement: 'terminé', fuite: 'oui', surfaces: 'plafond · murs',
    delai: '1 à 3 mois', budget: '2 000 à 5 000 €', surface: '34',
    occupation: 'occupé',
    description: 'Tache brune au plafond du séjour, apparue après la fuite du voisin.'
  };
  var prenom = champs.nom.split(/\s+/)[0];
  MailApp.sendEmail({
    to: DESTINATAIRE,
    subject: '[APERÇU] Votre demande est bien arrivée — Borsci Rénovation',
    body: accuseTexte(champs, prenom),
    htmlBody: accuseHtml(champs, prenom),
    name: 'Borsci Rénovation'
  });
  console.log('Aperçu envoyé à ' + DESTINATAIRE);
}
