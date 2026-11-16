(function(){
const Q=s=>document.querySelector(s);
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const TTS='speechSynthesis' in window;
const MIC='<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>';
const NUM={un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,douze:12};
const norm=s=>String(s||'').toLowerCase().replace(/\u0153/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const inCook=()=>document.body.dataset.screen==='cook';
const inRecipe=()=>document.body.dataset.screen==='recipe';

/* bouton et bulle */
const btn=document.createElement('button');
btn.id='mic';btn.type='button';btn.setAttribute('aria-label','Commande vocale');
btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+MIC+'</svg>';
document.body.appendChild(btn);
const toastEl=document.createElement('div');toastEl.id='vtoast';toastEl.hidden=true;document.body.appendChild(toastEl);
let tt=null;
function toast(m){toastEl.textContent=m;toastEl.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{toastEl.hidden=true},4500)}

/* voix de l'application */
let speaking=false,lastEnd=0,on=false,rec=null,doneSaid=false;
function say(t){
  if(!TTS)return;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';
    const v=speechSynthesis.getVoices().find(x=>/^fr/i.test(x.lang));if(v)u.voice=v;
    speaking=true;
    u.onend=u.onerror=()=>{speaking=false;lastEnd=Date.now()};
    speechSynthesis.speak(u);
  }catch(e){speaking=false}
}
const click=s=>{const e=Q(s);if(e&&!e.disabled){e.click();return true}return false};

/* lecture automatique des étapes */
if(typeof drawCook==='function'){
  const od=drawCook;
  drawCook=function(){
    od();
    if(on&&inCook()){
      const s=Q('.cstep');
      if(s){
        let t='Étape '+(ci+1)+'. '+s.textContent;
        if(typeof base!=='undefined'&&base>0)t+=' Un minuteur de '+Math.round(base/60)+' minutes est prêt. Dites lance pour le démarrer.';
        say(t);
      }
    }
  };
}
setInterval(()=>{
  const t=Q('#tt');
  if(t&&t.classList.contains('done')){if(!doneSaid&&on){say('Le minuteur est terminé.')}doneSaid=true}
  else doneSaid=false;
},1000);

/* commandes */
function cmd(raw){
  const low=raw.toLowerCase().replace(/[\u2019']/g,"'").trim();
  const t=norm(raw);
  let m;

  if(inCook()){
    if(/ingredient/.test(t)){
      const d=Q('#cdr');if(d&&d.hidden)click('[data-a=ing]');
      const items=[...document.querySelectorAll('#cdr li')].map(x=>x.textContent);
      say('Ingrédients pour '+pers+' personnes : '+items.join(', '));return 'Ingrédients'}
    if(/\b(suivant|suivante|continue|prochaine)\b/.test(t)){click('#cook [data-a=next]');return 'Étape suivante'}
    if(/\b(precedent|precedente|reviens|arriere)\b/.test(t)){click('#cook [data-a=prev]');return 'Étape précédente'}
    if(/\b(repete|repeter|relis|relire|lis)\b/.test(t)){const s=Q('.cstep');if(s)say(s.textContent);return 'Je répète'}
    if(/(ajoute|plus|rajoute) (une|1) minute/.test(t)){click('#cook [data-a=plus]');return '+1 minute'}
    if(/(enleve|retire|moins) (une|1) minute/.test(t)){click('#cook [data-a=minus]');return '−1 minute'}
    if(/(combien|temps restant|il reste)/.test(t)){
      const p=(Q('#tt')||{textContent:'00:00'}).textContent.split(':');
      say('Il reste '+(+p[0])+' minutes et '+(+p[1])+' secondes.');return 'Temps restant'}
    if(/(remets|reinitialise|recommence)/.test(t)){click('#cook [data-a=reset]');return 'Minuteur remis à zéro'}
    if(/\b(pause|stop|arrete|arreter)\b/.test(t)){const g=Q('#tgo');if(g&&g.textContent==='Pause')g.click();return 'Pause'}
    if(/\b(lance|demarre|demarrer|reprends|reprendre|start)\b/.test(t)){const g=Q('#tgo');if(g&&g.textContent!=='Pause')g.click();return 'Minuteur lancé'}
    if(/\b(quitte|quitter|ferme|termine|terminer)\b/.test(t)){click('#cook [data-a=close]');return 'Mode cuisine fermé'}
  }

  if(inRecipe()){
    if(/(mode cuisine|cuisinons|commence la recette|demarre la recette)/.test(t)){click('#startCook');return 'Mode cuisine'}
    if(m=t.match(/\b(\d+|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|douze)\s+(?:personnes?|convives?|parts?)\b/)){
      const n=NUM[m[1]]||parseInt(m[1],10);
      if(n>=1&&n<=99){pers=n;drawBody();say('D\'accord, pour '+n+' personne'+(n>1?'s':''));return 'Pour '+n+' personnes'}
    }
    if(/(ajoute|mets|envoie).*(recette|ingredients|tout).*(liste|courses)/.test(t)){if(click('#addCart')){say('Ingrédients ajoutés à la liste de courses.');return 'Ajouté aux courses'}}
    if(/(mets|ajoute|enleve|retire).*favori/.test(t)){click('#favBtn');return 'Favori modifié'}
    if(/\bingredients\b/.test(t)){click('.seg button[data-t=ing]');return 'Ingrédients'}
    if(/\b(preparation|etapes)\b/.test(t)){click('.seg button[data-t=prep]');return 'Préparation'}
  }

  if(m=low.match(/^(?:ajoute|ajouter|rajoute|mets|mettre)\s+(.+?)\s+(?:à|a|sur|dans)\s+(?:ma |la |mes |les |notre )?(?:liste|courses)/)){
    let it=m[1].replace(/^(?:du |de la |de l'|des |de |d')/,'').trim();
    const f=Q('#cform');
    if(it&&f){Q('#cin').value=it;f.dispatchEvent(new Event('submit',{cancelable:true}));say('J\'ai ajouté '+it+' à la liste de courses.');return 'Ajouté : '+it}
  }
  if(/(lis|lire|dis|quoi).*(liste|courses)/.test(t)){
    const items=[...document.querySelectorAll('#clist li')].filter(li=>!li.querySelector('input').checked).map(li=>{const x=li.querySelector('.tx');return x&&x.childNodes[0]?x.childNodes[0].textContent:''}).filter(Boolean);
    say(items.length?'Sur votre liste : '+items.join(', '):'Votre liste de courses est vide.');return 'Liste de courses'}
  if(m=t.match(/^(?:cherche|recherche|trouve|trouver)\s+(?:moi\s+)?(?:une\s+|un\s+|des\s+)?(?:recette\s+)?(?:de\s+|du\s+|d\s+)?(.+)$/)){
    go('home');const q=Q('#q');q.value=m[1];if(typeof filt!=='undefined')filt='all';q.dispatchEvent(new Event('input'));
    say('Je cherche '+m[1]);return 'Recherche : '+m[1]}
  if(/\b(accueil|decouvrir)\b/.test(t)){go('home');return 'Accueil'}
  if(/\b(courses|liste)\b/.test(t)){go('courses');return 'Liste de courses'}
  if(/\bfavoris\b/.test(t)){go('favs');return 'Favoris'}
  if(/\b(frigo|scanner)\b/.test(t)){go('fridge');return 'Frigo'}
  if(/\b(creer|nouvelle recette)\b/.test(t)){go('create');return 'Créer'}
  if(/(surprends|hasard)/.test(t)){click('#rnd')||go('home');return 'Surprise'}
  if(m=t.match(/^(?:ouvre|ouvrir|affiche|montre|montrer)\s+(.+)$/)){
    const w=m[1].split(' ').filter(x=>x.length>2&&!/^(les|des|moi|recette|du|une|pour)$/.test(x));
    const r=w.length&&R.find(x=>{const n=norm(x.titre);return w.every(k=>n.includes(k))});
    if(r){openRecipe(r.id);say('Voici '+r.titre);return r.titre}
    say('Je ne trouve pas cette recette.');return 'Recette introuvable'
  }
  if(/\b(aide|commandes)\b/.test(t)){
    say('Vous pouvez dire : suivant, précédent, répète, lance, pause, ingrédients, ajoute du lait à ma liste de courses, cherche poulet, ou ouvre une recette.');
    return 'Aide'}
  return null;
}
function handle(raw){
  let r=null;
  try{r=cmd(raw)}catch(e){r=null}
  toast(r?('« '+raw+' » → '+r):('Non compris : « '+raw+' »'));
}

/* reconnaissance */
function ui(){btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on?'true':'false')}
function start(){
  rec=new SR();rec.lang='fr-FR';rec.continuous=true;rec.interimResults=false;rec.maxAlternatives=1;
  rec.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(!e.results[i].isFinal)continue;
      const t=e.results[i][0].transcript.trim();
      if(!t||speaking||Date.now()-lastEnd<700)continue;
      handle(t);
    }
  };
  rec.onerror=e=>{
    if(e.error==='not-allowed'||e.error==='service-not-allowed'){on=false;ui();toast('Micro refusé : autorisez-le dans les réglages du navigateur.')}
  };
  rec.onend=()=>{if(on)setTimeout(()=>{try{rec.start()}catch(e){}},350)};
  try{rec.start()}catch(e){}
}
btn.onclick=()=>{
  if(!SR){alert('La reconnaissance vocale n\'est pas disponible dans ce navigateur. Utilisez Chrome sur Android, ou Safari sur iPhone.');return}
  if(on){on=false;ui();try{rec.stop()}catch(e){}if(TTS)speechSynthesis.cancel();toast('Micro coupé');return}
  on=true;ui();start();
  toast('Je vous écoute. Dites « aide » pour les commandes.');
  say('Je vous écoute.');
};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&on){on=false;ui();try{rec.stop()}catch(e){}}});
})();
