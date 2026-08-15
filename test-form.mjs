// Parcours de bout en bout du formulaire multi-etapes.
//
// Trois phases :
//   1. le fichier reel, endpoint encore en placeholder — parcours,
//      validations, blocs conditionnels ;
//   2. une copie temporaire ou le placeholder est remplace par une URL
//      factice, pour exercer le chemin d'envoi et l'ecran de
//      confirmation (FORM_ENDPOINT est un `const` de portee script :
//      il n'est pas surchargeable depuis la page) ;
//   3. la meme copie, avec un fetch qui echoue, pour verifier le
//      secours WhatsApp.
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const SITE = '/home/user/site-artisan-peintre';
const COPIE = SITE + '/.essai-envoi.html';

const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise(res => {
  const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params }));
});
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
  return r.result?.result?.value;
};
const attendre = ms => new Promise(r => setTimeout(r, ms));

const resultats = [];
const cas = (nom, valeur) => resultats.push((valeur ? 'OK ' : 'ECHEC ') + nom + (valeur === true || valeur === false ? '' : ' → ' + valeur));

const cocher = sel => ev(`(() => { const c = document.querySelector('${sel}');
  c.checked = true; c.dispatchEvent(new Event('input', {bubbles:true})); })()`);
const decocher = sel => ev(`(() => { const c = document.querySelector('${sel}');
  c.checked = false; c.dispatchEvent(new Event('input', {bubbles:true})); })()`);
const saisir = (id, v) => ev(`(() => { const c = document.getElementById('${id}');
  c.value = ${JSON.stringify(v)}; c.dispatchEvent(new Event('input', {bubbles:true})); })()`);
const etat = cle => ev(`document.querySelector('[data-si="${cle}"]').hidden ? 'masque' : 'visible'`);

/* Remplit les deux premieres etapes et s'arrete sur les coordonnees. */
const remplirJusquAuxCoordonnees = async () => {
  await cocher('input[data-cle="degat"]');
  await ev(`document.getElementById('suivant').click()`);
  await cocher('input[name="assechement"][value="terminé"]');
  await cocher('input[name="surfaces"][value="plafond"]');
  await cocher('input[name="surfaces"][value="murs"]');
  await saisir('commune', 'Montreuil');
  await saisir('code-postal', '93100');
  await cocher('input[data-cle="appartement"]');
  await saisir('etage', '3');
  await cocher('input[name="ascenseur"][value="oui"]');
  await cocher('input[name="delai"][value="urgent"]');
  await saisir('description', 'Plafond du séjour taché.');
  await saisir('pieces', '42');   // bloc reste masque : ne doit pas partir
  await ev(`document.getElementById('suivant').click()`);
  await ev(`(() => {
    document.getElementById('nom').value = 'Test Client';
    document.getElementById('telephone').value = '06 12 34 56 78';
    document.getElementById('email').value = 'client@exemple.fr';
    const cc = document.getElementById('consentement'); cc.checked = true;
    cc.dispatchEvent(new Event('input', {bubbles:true}));
  })()`);
};

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.enable');

/* ======================= PHASE 1 — fichier reel ======================= */
await send('Page.navigate', { url: 'file://' + SITE + '/index.html' });
await attendre(1500);

cas('trois etapes', await ev(`document.querySelectorAll('fieldset[data-etape]').length === 3`));
cas('etape 1 affichee', await ev(`document.querySelector('[data-etape="1"]').hidden === false && document.querySelector('[data-etape="2"]').hidden === true`));
cas('jauge a un tiers', await ev(`document.getElementById('jauge').style.width.indexOf('33.3') === 0`));
cas('progression annoncee sur 3', await ev(`document.getElementById('progression').textContent === 'Étape 1 sur 3'`));
cas('precedent cache, suivant visible, envoyer cache', await ev(`document.getElementById('precedent').hidden && !document.getElementById('suivant').hidden && document.getElementById('envoyer').hidden`));
cas('tous les blocs conditionnels masques au depart', await ev(`[...document.querySelectorAll('[data-si]')].every(b => b.hidden)`));
cas('champ piege present, decoupe et hors tabulation', await ev(`(() => {
  const p = document.getElementById('site-web'); if (!p || p.tabIndex !== -1) return false;
  const boite = p.closest('.piege').getBoundingClientRect();
  const cs = getComputedStyle(p.closest('.piege'));
  return boite.width <= 1 && boite.height <= 1 && cs.clipPath !== 'none'; })()`));
cas('confirmation et secours masques au depart', await ev(`document.getElementById('confirmation').hidden && document.getElementById('secours').hidden`));

await ev(`document.getElementById('suivant').click()`);
cas('erreur prestation affichee', await ev(`document.querySelector('[data-erreur-pour="prestation"]').textContent.length > 0`));
cas('reste sur etape 1', await ev(`!document.querySelector('[data-etape="1"]').hidden`));

await cocher('input[data-cle="degat"]');
cas('erreur prestation effacee apres saisie', await ev(`document.querySelector('[data-erreur-pour="prestation"]').textContent === ''`));
cas('bloc degat affiche', (await etat('degat')) === 'visible');
cas('bloc peinture toujours masque', (await etat('peinture')) === 'masque');
await cocher('input[data-cle="peinture"]');
cas('deux blocs affiches', (await etat('degat')) === 'visible' && (await etat('peinture')) === 'visible');
await decocher('input[data-cle="degat"]');
cas('bloc degat retire quand la case est decochee', (await etat('degat')) === 'masque');
await cocher('input[data-cle="degat"]');

await ev(`document.getElementById('suivant').click()`);
cas('etape 2 affichee', await ev(`!document.querySelector('[data-etape="2"]').hidden`));
await ev(`document.getElementById('suivant').click()`);
cas('erreur commune affichee', await ev(`document.querySelector('[data-erreur-pour="commune"]').textContent.length > 0`));
await saisir('commune', 'Montreuil');

cas('bloc appartement masque avant choix', (await etat('appartement')) === 'masque');
await cocher('input[name="bien"][value="maison"]');
cas('bloc appartement toujours masque pour une maison', (await etat('appartement')) === 'masque');
await cocher('input[data-cle="appartement"]');
cas('bloc appartement affiche', (await etat('appartement')) === 'visible');

await ev(`document.getElementById('suivant').click()`);
cas('etape 3 atteinte sans remplir les champs facultatifs', await ev(`!document.querySelector('[data-etape="3"]').hidden`));
cas('derniere etape : envoyer visible, suivant cache', await ev(`!document.getElementById('envoyer').hidden && document.getElementById('suivant').hidden`));

await ev(`(() => {
  document.getElementById('nom').value = 'Test Client';
  document.getElementById('telephone').value = '01 23';
  document.getElementById('email').value = 'pas-un-email';
})()`);
await ev(`document.getElementById('envoyer').click()`);
cas('erreurs telephone + email + consentement', await ev(`
  document.querySelector('[data-erreur-pour="telephone"]').textContent.length > 0 &&
  document.querySelector('[data-erreur-pour="email"]').textContent.length > 0 &&
  document.querySelector('[data-erreur-pour="consentement"]').textContent.length > 0`));

await ev(`(() => {
  document.getElementById('telephone').value = '06 12 34 56 78';
  document.getElementById('email').value = 'client@exemple.fr';
  const cc = document.getElementById('consentement'); cc.checked = true;
  cc.dispatchEvent(new Event('input', {bubbles:true}));
})()`);
await ev(`document.getElementById('envoyer').click()`);
cas('endpoint placeholder → message d activation', await ev(`document.querySelector('[data-erreur-pour="formulaire"]').textContent.indexOf('pas encore activé') !== -1`));

/* ================ PHASES 2 ET 3 — copie avec endpoint ================ */
const source = readFileSync(SITE + '/index.html', 'utf8');
writeFileSync(COPIE, source.replace('https://formspree.io/f/XXXXXXXX', 'https://exemple.test/f/abc'));
try {
  /* ---- Phase 2 : envoi qui aboutit ---- */
  await send('Page.navigate', { url: 'file://' + COPIE });
  await attendre(1500);
  await ev(`(() => {
    window.__envoye = null;
    window.fetch = (url, opts) => {
      window.__envoye = { url: url,
        paires: [...opts.body.entries()].map(p => p[0] + '=' + p[1]),
        entetes: opts.headers ? Object.keys(opts.headers) : [] };
      return Promise.resolve({ ok: true });
    };
  })()`);

  await remplirJusquAuxCoordonnees();
  await ev(`document.getElementById('envoyer').click()`);
  await attendre(500);

  cas('formulaire masque, confirmation visible', await ev(`document.getElementById('formulaire-projet').hidden && !document.getElementById('confirmation').hidden`));

  const envoye = JSON.parse(await ev(`JSON.stringify(window.__envoye)`) || '{"paires":[]}');
  const paires = envoye.paires;
  const a = cle => paires.some(p => p.startsWith(cle + '='));
  cas('aucun en-tete personnalise (requete CORS simple)', (envoye.entetes || []).length === 0);
  cas('champs conditionnels visibles envoyes', a('assechement') && a('surfaces') && a('etage') && a('ascenseur'));
  cas('champ d un bloc masque non envoye', !a('pieces'));
  cas('champ piege vide non envoye', !a('site-web'));
  cas('champs communs envoyes', a('prestation') && a('commune') && a('code-postal') && a('bien') && a('delai') && a('description') && a('nom') && a('telephone') && a('email') && a('consentement'));

  const lien = await ev(`decodeURIComponent(document.getElementById('lien-photos').search)`);
  cas('lien photos pre-rempli avec nom et commune',
    lien.indexOf('Test Client') !== -1 && lien.indexOf('Montreuil') !== -1);
  cas('message photos', lien.replace('?text=', '').replace(/\n/g, ' / '));

  /* ---- Phase 3 : envoi qui echoue ---- */
  await send('Page.navigate', { url: 'file://' + COPIE });
  await attendre(1500);
  await ev(`window.fetch = () => Promise.reject(new Error('reseau'))`);
  await remplirJusquAuxCoordonnees();
  await ev(`document.getElementById('envoyer').click()`);
  await attendre(500);

  cas('echec : formulaire toujours visible', await ev(`!document.getElementById('formulaire-projet').hidden && document.getElementById('confirmation').hidden`));
  cas('echec : bouton envoyer reactive', await ev(`!document.getElementById('envoyer').disabled && document.getElementById('envoyer').textContent === 'Envoyer'`));
  cas('echec : lien de secours affiche', await ev(`!document.getElementById('secours').hidden`));
  const sec = await ev(`decodeURIComponent(document.getElementById('secours').search)`);
  cas('secours : la demande est resumee dedans',
    sec.indexOf('Test Client') !== -1 && sec.indexOf('06 12 34 56 78') !== -1
    && sec.indexOf('Montreuil') !== -1 && sec.indexOf('urgent') !== -1);
  cas('message secours', sec.replace('?text=', '').replace(/\n/g, ' / '));
} finally {
  unlinkSync(COPIE);
}

console.log(resultats.join('\n'));
ws.close();
