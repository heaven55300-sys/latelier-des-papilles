(function(){
const Q=s=>document.querySelector(s),QA=s=>[...document.querySelectorAll(s)];
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const TTS='speechSynthesis' in window;
const MIC='<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>';

/* ---------- outils de texte ---------- */
const W={zero:0,un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,onze:11,douze:12,treize:13,quatorze:14,quinze:15,seize:16,vingt:20,trente:30,quarante:40,cinquante:50,soixante:60,quatrevingt:80};
const plain=s=>String(s||'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').replace(/,/g,' et ').replace(/[’'`]/g,' ').replace(/[^a-z0-9àâäçéèêëîïôöùûüÿ ]/g,' ').replace(/\s+/g,' ').trim();
const deacc=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const norm=s=>deacc(plain(s));
function numify(s){
  s=s.replace(/quatre vingts?/g,'quatrevingt');
  const tk=s.split(' '),out=[];let i=0;
  while(i<tk.length){
    if(W[tk[i]]!==undefined){
      let sum=0,j=i;
      while(j<tk.length){
        if(W[tk[j]]!==undefined){sum+=W[tk[j]];j++}
        else if(tk[j]==='et'&&j>i&&W[tk[j-1]]>=20&&(tk[j+1]==='un'||tk[j+1]==='une'||tk[j+1]==='onze')){j++}
        else break;
      }
      out.push(String(sum));i=j;
    }else{out.push(tk[i]);i++}
  }
  return out.join(' ')
    .replace(/\b(\d+) cents? (\d+)\b/g,(a,n,m)=>String(n*100+ +m))
    .replace(/\b(\d+) cents?\b/g,(a,n)=>String(n*100));
}
function strip(s){
  let o=s.replace(/\b(?:s il (?:te|vous) pla[iî]t|stp|svp|please)\b/g,' ');
  for(let i=0;i<3;i++){
    o=o.replace(/^(?:(?:ok|okay|hey|dis|salut|eh|oh|allo|dites|ecoute|écoute)\s+)*(?:chef|papilles|atelier|assistant|cuistot|cuisto)\s+/,'')
       .replace(/^(?:est ce que |est ce qu )?(?:tu|vous) (?:peux|peut|pouvez|pourrais|pourriez|veux bien|voudrais)\s+/,'')
       .replace(/^(?:peux tu|peut tu|pouvez vous|pourrais tu|pourriez vous|je voudrais|je veux|j aimerais|j aimerai|je souhaite|je te demande de|maintenant|alors|bon|bah|euh|donc|ok|okay|dis moi|dites moi|dis|dites|va)\s+/,'');
  }
  return o.replace(/\s+/g,' ').trim();
}
const stem=w=>w.length>3?w.replace(/[sx]$/,''):w;
const STOPW=/^(?:les|des|une|pour|dans|sur|avec|mon|mes|ton|tes|moi|nous|recette|recettes|plat|plats|deja|pris|tout|toute|tous|que|qui|est|ce|cet|cette|ces|aux|par|liste|courses)$/;
const kws=s=>norm(s).split(' ').filter(x=>x.length>2&&!STOPW.test(x)).map(stem);
const articleStrip=s=>s.replace(/^(?:(?:du|de la|de l|des|de|d|le|la|les|l)\s+)+/,'').trim();
function dur(t){
  t=t.replace(/(\d+)\s*h\s*(\d+)/g,'$1 heures $2 minutes');
  let s=0,m;
  const re=/(\d+(?:[.,]\d+)?)\s*(heures?|h|minutes?|min|mn|secondes?|sec)\b/g;
  while((m=re.exec(t))){const n=parseFloat(m[1].replace(',','.')),u=m[2];s+=/^h/.test(u)?n*3600:/^m/.test(u)?n*60:n}
  if(/\d+ heures? et demie?\b/.test(t))s+=1800;
  if(/\d+ heures? et quart\b/.test(t))s+=900;
  if(m=t.match(/(\d+) quarts? d heure/))s+=m[1]*900;
  if(/\bdemi heure\b/.test(t))s+=1800;
  return Math.round(s);
}
function fmtDur(s){
  s=Math.round(s);if(s<=0)return 'zéro seconde';
  const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,o=[];
  if(h)o.push(h+' heure'+(h>1?'s':''));if(m)o.push(m+' minute'+(m>1?'s':''));if(x)o.push(x+' seconde'+(x>1?'s':''));
  return o.join(' ');
}
const scr=()=>document.body.dataset.screen;
const inCook=()=>scr()==='cook',inRecipe=()=>scr()==='recipe';
const click=s=>{const e=Q(s);if(e&&!e.disabled){e.click();return true}return false};

/* ---------- bouton, bulle, aide ---------- */
const btn=document.createElement('button');
btn.id='mic';btn.type='button';btn.setAttribute('aria-label','Commande vocale');
btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+MIC+'</svg>';
document.body.appendChild(btn);
const hq=document.createElement('button');
hq.id='vq';hq.type='button';hq.textContent='?';hq.setAttribute('aria-label','Liste des commandes vocales');
document.body.appendChild(hq);
const toastEl=document.createElement('div');toastEl.id='vtoast';toastEl.hidden=true;document.body.appendChild(toastEl);
let tt=null;
function toast(m,ms){toastEl.textContent=m;toastEl.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{toastEl.hidden=true},ms||4500)}

const HELP=[
['Cuisine pas à pas',['suivant · étape suivante · c\'est fait · j\'ai fini · on continue','précédent · retour · reviens','répète · relis · quoi · pardon','étape 3 · première étape · dernière étape · on en est où','lis toutes les étapes','lance · démarre · go · c\'est parti','pause · stop · attends','mets un minuteur de 10 minutes · une heure et demie','ajoute 2 minutes · enlève 1 minute · remets à zéro','il reste combien de temps','ingrédients · combien de farine','quelle température · quelle durée','quitte · ferme · on arrête']],
['Fiche recette',['mode cuisine · on y va','pour 6 personnes · on est 5 · une personne de plus','double · moitié','ingrédients · préparation','lis les ingrédients · lis la recette','coche la farine · j\'ai les œufs · décoche le lait','ajoute la recette à ma liste de courses','mets en favori · enlève des favoris','combien de temps · difficulté · mode de cuisson','retour']],
['Liste de courses',['ajoute du lait à ma liste · note du beurre et des œufs','il me manque du sel · j\'ai plus de lait','lis ma liste · combien d\'articles','coche le lait · j\'ai pris le lait','enlève le lait de la liste','retire les articles cochés','partage ma liste']],
['Recherche et navigation',['cherche poulet curry · j\'ai envie de pâtes','cherche pizza sur YouTube','ouvre bœuf mijoté · montre les crêpes','recettes express · four · plaque · robot','thermomix TM6 · cookeo','surprends-moi · on mange quoi','accueil · favoris · courses · frigo · créer · crédits','efface la recherche','active la caméra · prends la photo']],
['Minuteur et petits services',['minuteur de 15 minutes · préviens-moi dans 10 minutes','annule le minuteur · il reste combien','quelle heure est-il · quel jour on est','thermostat 6 · 180 degrés en thermostat','cuillère à soupe · cuillère à café · un verre']],
['La voix',['parle plus lentement · plus vite','tais-toi · silence','coupe le micro · au revoir','aide · que peux-tu faire']]
];
const hp=document.createElement('div');hp.id='vhelp';hp.hidden=true;
hp.innerHTML='<div class="vh"><button type="button" id="vhx" aria-label="Fermer">✕</button><h2>Commandes vocales</h2><p>Touchez le micro, puis parlez naturellement. Vous pouvez commencer par « chef » ou ajouter « s\'il te plaît ».</p>'+
  HELP.map(g=>'<h3>'+g[0]+'</h3><ul>'+g[1].map(x=>'<li>'+x+'</li>').join('')+'</ul>').join('')+'</div>';
document.body.appendChild(hp);
const showHelp=()=>{hp.hidden=false};
hq.onclick=showHelp;
hp.addEventListener('click',e=>{if(e.target===hp||e.target.id==='vhx')hp.hidden=true});

/* ---------- voix de l'application ---------- */
let speaking=false,lastEnd=0,on=false,rec=null,doneSaid=false,rate=1,sid=0,sg=null;
function chunks(t){
  const out=[];let c='';
  (t.match(/[^.!?\n]+[.!?]*/g)||[t]).forEach(s=>{if((c+s).length>180&&c){out.push(c);c=s}else c+=s});
  if(c.trim())out.push(c);return out;
}
function say(t){
  if(!TTS)return;
  try{
    speechSynthesis.cancel();
    const id=++sid,parts=chunks(String(t));
    const v=speechSynthesis.getVoices().find(x=>/^fr/i.test(x.lang));
    speaking=true;
    clearTimeout(sg);sg=setTimeout(()=>{speaking=false;lastEnd=Date.now()},Math.min(180000,String(t).length*110+2500));
    parts.forEach((p,i)=>{
      const u=new SpeechSynthesisUtterance(p);u.lang='fr-FR';u.rate=rate;if(v)u.voice=v;
      if(i===parts.length-1)u.onend=u.onerror=()=>{if(id===sid){clearTimeout(sg);speaking=false;lastEnd=Date.now()}};
      speechSynthesis.speak(u);
    });
  }catch(e){speaking=false}
}
function vbeep(){
  try{const A=window.AudioContext||window.webkitAudioContext,c=new A();
    [0,.4,.8].forEach(d=>{const o=c.createOscillator(),g=c.createGain(),s=c.currentTime+d;
      o.frequency.value=880;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.25,s);o.start(s);o.stop(s+.2)})}catch(e){}
}

/* ---------- minuteur indépendant ---------- */
let vt=null;
function vtStop(){if(vt){clearInterval(vt.iv);vt=null}}
function vtStart(sec){
  vtStop();
  const fin=Date.now()+sec*1000;
  vt={fin:fin,sec:sec,iv:setInterval(()=>{
    if(Date.now()>=fin){const s=vt.sec;vtStop();const m='Votre minuteur de '+fmtDur(s)+' est terminé.';toast(m,15000);say(m);if(navigator.vibrate)navigator.vibrate([400,200,400,200,400]);vbeep()}
  },500)};
}

/* ---------- lecture des étapes ---------- */
if(typeof drawCook==='function'){
  const od=drawCook;
  drawCook=function(){
    od();
    if(on&&inCook()){
      const s=Q('.cstep');
      if(s){
        let t='Étape '+(ci+1)+'. '+s.textContent;
        if(typeof base!=='undefined'&&base>0)t+=' Un minuteur de '+fmtDur(base)+' est prêt. Dites lance pour le démarrer.';
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

/* ---------- aides pour les commandes ---------- */
function findRecipe(q){
  const w=kws(q);if(!w.length)return null;
  let best=null,bs=0;
  R.forEach(r=>{const n=norm(r.titre);const s=w.filter(x=>n.includes(x)).length;if(s>bs){bs=s;best=r}});
  return best;
}
function recList(){return cur?cur.ing.map(i=>scale(i,pers/cur.portions)):[]}
function quant(kw){
  const w=kws(kw);if(!w.length)return false;
  const hits=recList().filter(i=>{const n=norm(i);return w.every(x=>n.includes(x))});
  say(hits.length?hits.join(', '):'Je ne vois pas '+kw+' dans cette recette.');return true;
}
function setPers(n){n=Math.max(1,Math.min(99,Math.round(n)));pers=n;drawBody();say('D\'accord, pour '+n+' personne'+(n>1?'s':''));return 'Pour '+n+' personnes'}
function checkIng(kw,state){
  const w=kws(kw);if(!w.length)return false;
  if(typeof tab!=='undefined'&&tab!=='ing')click('.seg button[data-t=ing]');
  const it=QA('#rbody .ck').find(x=>{const n=norm(x.textContent);return w.every(k=>n.includes(k))});
  if(!it)return false;
  const inp=it.querySelector('input');if(inp.checked!==state)inp.click();
  say(state?'C\'est coché.':'C\'est décoché.');return true;
}
const lis=()=>QA('#clist li');
const liText=li=>{const x=li.querySelector('.tx');return x&&x.childNodes[0]?x.childNodes[0].textContent:''};
function findLi(kw){const w=kws(kw);if(!w.length)return null;return lis().find(li=>{const n=norm(liText(li));return w.every(x=>n.includes(x))})||null}
function addItems(list){
  const f=Q('#cform'),inp=Q('#cin');if(!f)return [];
  const done=[];
  list.forEach(it=>{it=articleStrip(it.trim());if(!it||/^(?:quoi|combien|ca|cela|tout|ce|rien)$/.test(it))return;inp.value=it;f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));done.push(it)});
  return done;
}
function setChip(f){go('home');const b=Q('#chips button[data-f="'+f+'"]');if(b)b.click()}
function setRobot(name){
  const sel=Q('#robotSel');if(!sel)return;
  const w=norm(name).split(' ').filter(x=>x.length>1);if(!w.length)return;
  const o=[...sel.options].find(x=>w.every(k=>norm(x.value).includes(k)));
  if(o&&!/autre/i.test(o.value)){sel.value=o.value;sel.dispatchEvent(new Event('change'))}
}
function micOff(m){on=false;ui();try{rec.stop()}catch(e){}if(TTS)speechSynthesis.cancel();toast(m||'Micro coupé')}
const TH={1:30,2:60,3:90,4:120,5:150,6:180,7:210,8:240,9:270,10:300};

/* ---------- commandes ---------- */
function cmd(raw){
  const r0=plain(raw);
  if(/^(?:merci|super|parfait|genial|bravo|top|cool|nickel|excellent|bien joue)(?: beaucoup| chef)?$/.test(deacc(r0))){say('Avec plaisir !');return 'Avec plaisir'}
  const p=strip(r0);if(!p)return null;
  const lw=numify(p),t=deacc(lw);
  let m;

  /* --- voix et micro --- */
  if(/(?:coupe|arrete|desactive|eteins|ferme|stoppe)\s+(?:le |la |l |ton |mon )?(?:micro|ecoute|ecouter|reconnaissance)|ne (?:m )?ecoute plus|^(?:au revoir|a plus tard|a bientot|bonne nuit|bonne soiree|bonne journee|c est tout|ca sera tout)$/.test(t)){micOff('Micro coupé. A bientôt !');return 'Micro coupé'}
  if(/\b(?:tais toi|tais vous|silence|chut|ca suffit|ne parle plus|arrete de parler|stop la voix)\b/.test(t)){if(TTS)speechSynthesis.cancel();speaking=false;return 'Silence'}
  if(/(?:plus lentement|moins vite|ralentis|ralentir|plus doucement)/.test(t)){rate=Math.max(.6,rate-.15);say('Je parle plus lentement.');return 'Voix plus lente'}
  if(/(?:plus vite|accelere|accelerer)/.test(t)&&!/(?:recette|express)/.test(t)){rate=Math.min(1.6,rate+.15);say('Je parle plus vite.');return 'Voix plus rapide'}
  if(/(?:vitesse normale|parle normalement)/.test(t)){rate=1;say('Vitesse normale.');return 'Voix normale'}

  /* --- cuisine pas à pas --- */
  if(inCook()){
    const stepTxt=()=>{const s=Q('.cstep');return s?s.textContent:''};
    const tg=Q('#tgo'),running=tg&&tg.textContent==='Pause';
    const nSteps=cur.etapes.length;
    if(/(?:quitte|quitter|sors|sortir|ferme|fermer|arrete la recette|termine la recette|fin du mode|fin de la recette|stoppe la recette|on arrete|j ai fini la recette|retour a la recette|retourne a la recette)\b/.test(t)){click('#cook [data-a=close]');return 'Mode cuisine fermé'}
    if(/\bingredients?\b|il me faut quoi|il faut quoi|de quoi (?:ai je|j ai) besoin|qu est ce qu il faut/.test(t)&&!/(liste de courses|courses)/.test(t)){
      const d=Q('#cdr');if(d&&d.hidden)click('[data-a=ing]');
      say('Ingrédients pour '+pers+' personne'+(pers>1?'s':'')+' : '+recList().join(', '));return 'Ingrédients'}
    if((m=t.match(/^(?:combien|quelle quantite|quelles quantites|quelle dose)\s+(?:de |d |du |des )?(.+)$/))&&!/(?:temps|minute|heure|etape|personne|reste|degre|temperature)/.test(m[1])){quant(m[1]);return 'Quantité'}
    if(!/\b(?:liste|courses|caddie|favoris?)\b/.test(t)){
      if(/(?:temperature|degres|chaleur|thermostat)/.test(t)&&!/thermostat \d/.test(t)){
        const x=stepTxt().match(/(\d{2,3})\s*°/);
        say(x?'Température : '+x[1]+' degrés.':'Aucune température n\'est indiquée dans cette étape.');return 'Température'}
      if(/(?:duree de l etape|quelle duree|combien de temps (?:de cuisson|pour cette etape|dure)|ca dure combien|cuire combien)/.test(t)){
        const x=mins(stepTxt());say(x?'Cette étape dure '+fmtDur(x*60)+'.':'Aucune durée n\'est indiquée dans cette étape.');return 'Durée de l\'étape'}
      if((m=t.match(/(?:etape|numero)\s*(\d+)/))&&!/(?:suivante|precedente)/.test(t)){ci=Math.max(0,Math.min(nSteps-1,+m[1]-1));drawCook();return 'Étape '+(ci+1)}
      if(/(?:premiere etape|depuis le debut|au debut|reprends au debut|recommence la recette|retour au debut)/.test(t)){ci=0;drawCook();return 'Première étape'}
      if(/(?:derniere etape|va a la fin|a la fin)/.test(t)){ci=nSteps-1;drawCook();return 'Dernière étape'}
      if(/(?:on en est ou|quelle etape|a quelle etape|je suis ou)/.test(t)){say('Vous êtes à l\'étape '+(ci+1)+' sur '+nSteps+'.');return 'Position'}
      if(/(?:toute la recette|toutes les etapes|toutes les instructions|la preparation complete)/.test(t)){say(cur.etapes.map((e,i)=>'Étape '+(i+1)+'. '+e).join(' '));return 'Lecture complète'}
      const d=dur(t);
      if(d>0&&!/(?:minuteur|timer|chrono)/.test(t)&&/\b(?:ajoute|rajoute|rallonge|prolonge|encore|plus)\b/.test(t)){adjCook(d);return '+'+fmtDur(d)}
      if(d>0&&!/(?:minuteur|timer|chrono)/.test(t)&&/\b(?:enleve|retire|moins|raccourcis|diminue)\b/.test(t)){adjCook(-d);return '−'+fmtDur(d)}
      if(d>0&&/(?:minuteur|timer|chrono|compte a rebours|lance|demarre|mets|met|regle|programme|dans|previens|rappelle)/.test(t)){setCookTimer(d,true);say('Minuteur de '+fmtDur(d)+' lancé.');return 'Minuteur '+fmtDur(d)}
      if(/(?:combien|temps restant|il reste|reste t il|ou en est le minuteur|combien de temps reste)/.test(t)&&/(?:temps|reste|minuteur|minute)/.test(t)){
        const q=(Q('#tt')||{textContent:'00:00'}).textContent.split(':'),s=(+q[0])*60+(+q[1]);
        say(s>0?'Il reste '+fmtDur(s)+'.':'Aucun minuteur en cours.');return 'Temps restant'}
      if(/(?:remets|remettre|reinitialise|recommence le minuteur|reset|a zero|annule|annuler|supprime le minuteur|efface le minuteur)/.test(t)){click('#cook [data-a=reset]');return 'Minuteur remis à zéro'}
      if(/\b(?:pause|stop|stoppe|arrete|arreter|attends|attendez|suspends|suspendre|une seconde|hold)\b/.test(t)){if(running&&tg)tg.click();return 'Pause'}
      if(/\b(?:lance|lancer|demarre|demarrer|reprends|reprendre|start|go|c est parti|on y va|allons y|vas y)\b/.test(t)){if(!running&&tg)tg.click();return 'Minuteur lancé'}
      if(/\b(?:suivant|suivante|suite|next|continue|continuer|on continue|avance|avancer|passe|passer|apres|ensuite|prochaine|c est fait|c est bon|j ai fini|j ai termine|fini|termine|ca y est)\b/.test(t)){click('#cook [data-a=next]');return 'Étape suivante'}
      if(/\b(?:precedent|precedente|recule|reculer|reviens|revenir|retour|arriere|back|avant|en arriere)\b/.test(t)){click('#cook [data-a=prev]');return 'Étape précédente'}
      if(/\b(?:repete|repeter|repetez|relis|relire|lis|lire|redis|redire|encore|pardon|comment|quoi|hein|une autre fois|que dois je faire|qu est ce que je dois faire|c est quoi l etape|j ai pas compris|je n ai pas compris)\b/.test(t)){say(stepTxt());return 'Je répète'}
    }
  }

  /* --- fiche recette --- */
  if(inRecipe()&&cur){
    if(/(?:mode cuisine|cuisinons|on cuisine|commence la recette|demarre la recette|lance la recette|lance la cuisine|on y va|c est parti|allons y)/.test(t)){click('#startCook');return 'Mode cuisine'}
    if(/(?:lis|lire|relis|dicte|dis)\b.*\bingredients?\b/.test(t)||/\bingredients? (?:a voix haute|en vocal)\b/.test(t)){say('Ingrédients pour '+pers+' personne'+(pers>1?'s':'')+' : '+recList().join(', '));return 'Lecture des ingrédients'}
    if(/(?:lis|lire|relis|dicte)\b.*(?:recette|etapes|preparation|instructions)/.test(t)){say(cur.etapes.map((e,i)=>'Étape '+(i+1)+'. '+e).join(' '));return 'Lecture de la recette'}
    if((m=t.match(/^(?:combien|quelle quantite|quelles quantites|quelle dose)\s+(?:de |d |du |des )?(.+)$/))&&!/(?:temps|minute|heure|etape|personne|reste)/.test(m[1])){quant(m[1]);return 'Quantité'}
    if(/(?:ajoute|rajoute|mets|met|envoie|ajouter)\b.*(?:recette|ingredients|tout|necessaire|ce qu il faut|ce qui manque|ce qu il me faut).*(?:liste|courses|caddie)|(?:liste|courses)\b.*(?:recette|ingredients)/.test(t)){if(click('#addCart')){say('Ingrédients ajoutés à la liste de courses.');return 'Ajouté aux courses'}}
    if(/(?:enleve|retire|supprime|vire)\b.*favoris?|plus en favoris?/.test(t)){const b=Q('#favBtn');if(b&&b.classList.contains('on'))b.click();say('Retiré des favoris.');return 'Retiré des favoris'}
    if(/(?:mets|met|ajoute|ajouter|garde|sauvegarde|enregistre)\b.*favoris?|favoris? pour cette recette|j adore cette recette|j aime cette recette|(?:je )?la garde/.test(t)){const b=Q('#favBtn');if(b&&!b.classList.contains('on'))b.click();say('Ajouté aux favoris.');return 'Ajouté aux favoris'}
    if(/\b(?:coche|cocher|j ai tout|on a tout)\b.*\btout\b|^j ai tout$|^on a tout$/.test(t)){QA('#rbody .ck input').forEach(i=>{if(!i.checked)i.click()});say('Tout est coché.');return 'Tout coché'}
    if((m=t.match(/^(?:decoche|decocher|enleve la coche de|retire la coche de)\s+(.+)$/))&&checkIng(m[1],false))return 'Décoché';
    if((m=t.match(/^(?:coche|cocher|raye|rayer|j ai deja|j ai|on a deja|on a|il y a deja|il y a|je possede|c est bon pour)\s+(.+)$/))&&checkIng(m[1],true))return 'Coché';
    if(/(?:combien de personnes|pour combien|nombre de personnes)/.test(t)){say('Cette recette est calculée pour '+pers+' personne'+(pers>1?'s':'')+'.');return 'Personnes'}
    if(/(?:combien de temps|duree|temps de (?:cuisson|preparation|recette)|ca prend combien|ca dure combien)/.test(t)&&!/(?:reste|restant|minuteur)/.test(t)){say('Cette recette prend '+fmtT(cur.temps)+'.');return 'Durée'}
    if(/(?:difficile|difficulte|niveau)/.test(t)){say('Difficulté : '+cur.diff+'.');return 'Difficulté'}
    if(/(?:mode de cuisson|cuit comment|comment ca se cuit|quel appareil|quel robot|four ou plaque|on cuit comment)/.test(t)){say('Mode de cuisson : '+cur.mode+'.');return 'Mode de cuisson'}
    if((m=t.match(/(\d+)\s*(?:personnes?|convives?|parts?|couverts?|invites?|portions?)\s*(?:de |en )?(plus|moins|supplementaires?)/))){return setPers(pers+(m[2]==='moins'?-1:1)*(+m[1]))}
    if((m=t.match(/^(ajoute|rajoute|enleve|retire)\s+(\d+)\s*(?:personnes?|convives?|parts?)$/))){return setPers(pers+(/^(?:ajoute|rajoute)/.test(m[1])?1:-1)*(+m[2]))}
    if(/(?:double|doubler|deux fois plus)/.test(t)){return setPers(pers*2)}
    if(/\btriple\b|trois fois plus/.test(t)){return setPers(pers*3)}
    if(/(?:moitie|divise par 2|reduis de moitie|deux fois moins|2 fois moins|coupe en deux)/.test(t)){return setPers(Math.max(1,pers/2))}
    if((m=t.match(/(\d+)\s*(?:personnes?|convives?|parts?|couverts?|invites?|gourmands?|portions?)\b/))||(m=t.match(/\b(?:on est|nous sommes|ils sont|pour|passe a|passer a|mets|met|mettre|change pour)\s+(\d+)\b/))){
      const n=+m[1];if(n>=1&&n<=99)return setPers(n)}
    if(/\bingredients?\b/.test(t)){click('.seg button[data-t=ing]');return 'Ingrédients'}
    if(/\b(?:preparation|etapes|instructions|deroule)\b/.test(t)){click('.seg button[data-t=prep]');return 'Préparation'}
    if(/^(?:retour|reviens|revenir|ferme|fermer|quitte|quitter|precedent|page precedente|retourne)(?: a l accueil| aux recettes| en arriere)?$/.test(t)){click('#back');return 'Retour'}
  }

  /* --- petits services --- */
  if(/(?:quelle heure|il est quelle heure|l heure)/.test(t)){const d=new Date(),mm=d.getMinutes();say('Il est '+d.getHours()+' heures'+(mm?' '+mm:'')+'.');return 'Heure'}
  if(/(?:quel jour|quelle date|on est quel jour|on est le combien|quel est la date)/.test(t)){say('Nous sommes le '+new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'.');return 'Date'}
  if((m=t.match(/(?:thermostat|\bth)\s*(\d{1,2})\b/))&&TH[+m[1]]){say('Le thermostat '+m[1]+' correspond à environ '+TH[+m[1]]+' degrés.');return 'Thermostat'}
  if((m=t.match(/(\d{2,3}) degres?\b.*thermostat/))){const th=Math.round(+m[1]/30);say(th>=1&&th<=10?m[1]+' degrés, c\'est environ le thermostat '+th+'.':'Je ne sais pas convertir cette valeur.');return 'Thermostat'}
  if(/(?:equivaut|equivalent|combien|vaut|c est quoi|ca fait|ml|grammes?)/.test(t)){
    if(/cuilleres? a soupe/.test(t)){say('Une cuillère à soupe, c\'est environ 15 millilitres.');return 'Cuillère à soupe'}
    if(/cuilleres? a cafe/.test(t)){say('Une cuillère à café, c\'est environ 5 millilitres.');return 'Cuillère à café'}
    if(/\bverre\b/.test(t)){say('Un verre fait environ 200 millilitres.');return 'Verre'}
    if(/\btasse\b/.test(t)){say('Une tasse fait environ 250 millilitres.');return 'Tasse'}
    if(/\bbol\b/.test(t)){say('Un bol fait environ 350 millilitres.');return 'Bol'}
  }
  if(/^(?:bonjour|salut|coucou|hello|bonsoir|hey|yo)(?: chef)?$/.test(t)){say('Bonjour ! Que voulez-vous cuisiner ?');return 'Bonjour'}
  if(/\bca va\b/.test(t)&&t.split(' ').length<=4){say('Très bien, prêt à cuisiner !');return 'Discussion'}
  if(/(?:qui es tu|tu es qui|comment tu t appelles|ton nom)/.test(t)){say('Je suis l\'assistant vocal de L\'Atelier des Papilles. Je vous aide à cuisiner, mains libres.');return 'Présentation'}
  if(/(?:tu m entends|tu es la|tu m ecoutes|vous m entendez)/.test(t)){say('Oui, je vous écoute.');return 'Je vous écoute'}

  /* --- minuteur indépendant --- */
  const d2=dur(t);
  if(/(?:annule|supprime|arrete|stoppe|efface|coupe)\s+(?:le |mon |ce )?(?:minuteur|timer|chrono)/.test(t)){const was=!!vt;vtStop();say(was?'Minuteur annulé.':'Aucun minuteur en cours.');return 'Minuteur annulé'}
  if(d2>0&&/(?:minuteur|timer|chrono|compte a rebours|previens|prevenir|rappelle|reveille|alarme|sonne)/.test(t)){vtStart(d2);say('Minuteur de '+fmtDur(d2)+' lancé.');return 'Minuteur '+fmtDur(d2)}
  if(/(?:combien|reste|restant)/.test(t)&&/(?:minuteur|timer|chrono|temps restant|il reste)/.test(t)){
    if(vt){say('Il reste '+fmtDur((vt.fin-Date.now())/1000)+'.');return 'Temps restant'}
    say('Aucun minuteur en cours.');return 'Aucun minuteur'}

  /* --- liste de courses --- */
  let it;
  if((m=lw.match(/^(?:ajoute|ajouter|rajoute|rajouter|mets|mettre|met|note|noter|inscris|inscrire|prends|prendre|achete|acheter|marque)\s+(.+?)\s+(?:a|à|sur|dans|en|aux|au)\s+(?:ma |la |mes |les |notre |mon |le )?(?:liste|courses|caddie|panier)\b/))
   ||(m=lw.match(/^(?:note|noter|achete|acheter|il me faut|il me manque|il nous faut|il nous manque|j ai plus de|j ai plus d|je n ai plus de|je n ai plus d|il n y a plus de|il n y a plus d|il faut acheter|n oublie pas d acheter|n oublie pas de prendre|rappelle moi d acheter|rappelle moi de prendre)\s+(.+)$/))){
    it=addItems(m[1].split(/ et /));
    if(it.length){say('J\'ai ajouté '+it.join(', ')+' à la liste de courses.');return 'Ajouté : '+it.join(', ')}
  }
  if(/(?:vide|vider|efface|supprime|supprimer|reinitialise)\b.*(?:toute|tout|entiere)?.*\b(?:liste|courses)\b/.test(t)&&!/coche/.test(t)){go('courses');say('Pour éviter une erreur, touchez le bouton Tout vider.');return 'Tout vider'}
  if(/(?:retire|enleve|supprime|efface|nettoie|vide)\b.*(?:coche|barre|raye|pris|achete)/.test(t)){go('courses');click('#cdone');say('Articles cochés retirés.');return 'Cochés retirés'}
  if(/(?:partage|partager|envoie|envoyer|copie|copier|exporte)\b.*(?:liste|courses)/.test(t)){go('courses');click('#cshare');return 'Partage de la liste'}
  if(/(?:lis|lire|relis|dicte|dis|quelle est|quoi|c est quoi|qu est ce qu il y a dans|qu y a t il dans|que contient|contenu de)\b.*\b(?:liste|courses|caddie)\b|(?:qu est ce que je dois acheter|quoi acheter|que dois je acheter|je dois acheter quoi|il me manque quoi)/.test(t)){
    const items=lis().filter(li=>!li.querySelector('input').checked).map(liText).filter(Boolean);
    go('courses');say(items.length?'Sur votre liste : '+items.join(', ')+'.':'Votre liste de courses est vide.');return 'Liste de courses'}
  if(/combien d(?: articles| elements| produits)/.test(t)){const n=lis().filter(li=>!li.querySelector('input').checked).length;say('Il y a '+n+' article'+(n>1?'s':'')+' à acheter.');return 'Nombre d\'articles'}
  if((m=t.match(/^(?:decoche|decocher)\s+(.+)$/))&&(scr()==='courses'||/liste|courses/.test(t))){const li=findLi(m[1]);if(li){const i=li.querySelector('input');if(i.checked)i.click();say('Décoché.');return 'Décoché'}}
  if((m=t.match(/^(?:coche|cocher|raye|rayer|barre|barrer|j ai pris|j ai achete|je l ai pris|pris)\s+(.+?)(?:\s+(?:dans|sur|de|a)\s+(?:la |ma |mes )?(?:liste|courses))?$/))&&(scr()==='courses'||/liste|courses|achete|pris/.test(t))){
    const li=findLi(m[1]);if(li){const i=li.querySelector('input');if(!i.checked)i.click();say('C\'est coché.');return 'Coché'}}
  if((m=t.match(/^(?:enleve|enlever|retire|retirer|supprime|supprimer|efface|effacer|vire)\s+(.+?)(?:\s+(?:de|dans|sur|a)\s+(?:la |ma |mes |les )?(?:liste|courses))?$/))&&(scr()==='courses'||/(?:liste|courses)/.test(t))){
    const li=findLi(m[1]);if(li){const b=li.querySelector('[data-rm]');if(b)b.click();say('J\'ai retiré '+m[1]+' de la liste.');return 'Retiré : '+m[1]}}

  /* --- caméra du frigo --- */
  if(/(?:active|allume|demarre|lance|ouvre)\b.*\b(?:camera|appareil photo)\b/.test(t)){go('fridge');setTimeout(()=>click('#startCam'),150);return 'Caméra'}
  if(scr()==='fridge'&&/(?:prends|prend|prendre|fais|fait|capture|clique|photographie|photo|cheese)\b/.test(t)){click('#snap');return 'Photo'}

  /* --- navigation --- */
  if(/(?:efface|vide|supprime|enleve|annule|reinitialise|remets? a zero)\b.*(?:recherche|filtres?)|^(?:tout afficher|affiche tout|montre tout|toutes les recettes|reset)$/.test(t)){go('home');if(!click('#clr')){setChip('all')}return 'Recherche effacée'}
  if(/\b(?:credits?)\b/.test(t)){go('credits');return 'Crédits photos'}
  if(/\b(?:accueil|decouvrir|page principale|menu principal|maison|home)\b/.test(t)){go('home');return 'Accueil'}
  if(/\b(?:courses|liste|caddie|panier|achats)\b/.test(t)){go('courses');return 'Liste de courses'}
  if(/\b(?:favoris|favori|preferees|preferes|coups? de coeur)\b/.test(t)){go('favs');return 'Favoris'}
  if(/\b(?:frigo|frigidaire|refrigerateur|scanner|scan)\b/.test(t)){go('fridge');return 'Frigo'}
  if(/\b(?:creer|nouvelle recette|ajouter une recette|ecrire une recette|ma recette)\b/.test(t)){go('create');return 'Créer'}
  if(/^(?:surprends moi|surprise|au hasard|hasard|une idee|idee|inspire moi|n importe quoi|on mange quoi|quoi manger|quoi cuisiner|quoi faire|que manger|que cuisiner|que faire|qu est ce qu on mange|qu est ce qu on cuisine|je sais pas quoi (?:cuisiner|manger|faire)|je ne sais pas quoi (?:cuisiner|manger|faire)|recette au hasard|une recette au hasard|une recette)$/.test(t)){
    go('home');if(!click('#rnd')&&R.length)openRecipe(R[Math.floor(Math.random()*R.length)].id);return 'Surprise'}

  /* --- recherche web --- */
  if((m=p.match(/^(?:cherche|cherches|chercher|recherche|rechercher|trouve|trouver|propose|proposer|je cherche|j ai envie de|envie de|on mange|manger|cuisiner|preparer|prepare|idees? de|idees?)\s+(.+)$/))){
    let q=m[1],site='';
    const sm=q.match(/\b(?:sur|avec|dans)\s+(youtube|tiktok|tik tok|instagram|facebook|pinterest|marmiton|google)\b/);
    if(sm){site=sm[1].replace(' ','');q=q.replace(sm[0],'').trim()}
    for(let i=0;i<3;i++)q=q.replace(/^(?:moi |nous |me )?(?:une |un |des |de la |du |de l |de |d |a base de |avec |sur )?(?:recettes? |idees? |plats? )?(?:de |d |du |des |a base de |avec )?/,'').trim();
    if(q){
      go('home');const qi=Q('#q');qi.value=q;if(typeof filt!=='undefined')filt='all';qi.dispatchEvent(new Event('input'));
      setTimeout(()=>{const w=Q('#webbox');if(w&&!w.hidden)w.scrollIntoView({behavior:'smooth',block:'center'})},200);
      say(site?'Je cherche '+q+'. Touchez le bouton '+site+' pour ouvrir la recherche.':'Je cherche '+q+'.');
      return 'Recherche : '+q+(site?' ('+site+')':'');
    }
  }

  /* --- filtres et robots --- */
  if(/(?:thermomix|monsieur cuisine|cookeo|companion|magimix|kenwood|cookit|krups|prep ?cook|ninja|instant pot|airfryer|air fryer)/.test(t)||/^(?:mode robot|robot|au robot|recettes? (?:au )?robot|avec le robot|mon robot)$/.test(t)){
    setChip('robot');
    const rm=t.match(/(?:thermomix(?: tm ?\d)?|monsieur cuisine(?: \w+)?|cookeo(?: \w+)?|companion(?: \w+)?|magimix|kenwood|cookit|krups|ninja|instant pot|airfryer)/);
    if(rm)setRobot(rm[0].replace(/tm (\d)/,'tm$1'));
    say('Mode robot.');return 'Robot'}
  if(/\b(?:express|rapides?|vite fait|presse)\b|moins de (?:20|vingt) minutes/.test(t)){setChip('express');say('Recettes express.');return 'Express'}
  if(/\b(?:four|au four|enfourner)\b/.test(t)&&!/\b(?:ouvre|affiche)\b.*\w{6,}/.test(t)){setChip('four');say('Recettes au four.');return 'Four'}
  if(/\b(?:plaque|plaques|poele|casserole|sur le feu)\b/.test(t)){setChip('plaque');say('Recettes sur plaque.');return 'Plaque'}

  /* --- ouvrir une recette --- */
  let wasOpen=false;
  if((m=t.match(/^(?:ouvre|ouvrir|affiche|afficher|montre|montrer|voir|va sur|vas sur|lance|lancer|passe a|je veux voir|la recette (?:de |du |des |d )?|recette (?:de |du |des |d )?|prepare|preparer|cuisine|on fait|on cuisine|fais|fait|je veux faire)\s*(.*)$/))){
    wasOpen=true;
    const r=m[1]&&findRecipe(m[1]);
    if(r){openRecipe(r.id);say('Voici '+r.titre+'. '+fmtT(r.temps)+', difficulté '+r.diff+'.');return r.titre}
  }
  if(t.split(' ').length<=4&&(scr()==='home'||scr()==='favs')){
    const r=findRecipe(t);if(r){openRecipe(r.id);say('Voici '+r.titre+'.');return r.titre}
  }
  if(/\b(?:aide|aide moi|commandes|help)\b|que peux tu faire|comment ca marche/.test(t)){
    showHelp();
    say(inCook()?'Vous pouvez dire : suivant, précédent, répète, lance, pause, un minuteur de dix minutes, ou ingrédients.':
        'Vous pouvez dire : cherche poulet, ouvre une recette, ajoute du lait à ma liste, ou un minuteur de dix minutes. La liste complète est affichée.');
    return 'Aide'}
  if(wasOpen){say('Je ne trouve pas cette recette.');return 'Recette introuvable'}
  return null;
}

/* minuteur de la cuisine pas à pas */
function setCookTimer(sec,go_){
  stopT();left=sec;base=sec;
  const x=Q('#tt');if(x){x.textContent=mmss(left);x.classList.remove('done')}
  const g=Q('#tgo');if(g)g.textContent='Lancer';
  if(go_&&g)g.click();
}
function adjCook(d){
  const x=Q('#tt');
  if(tm){end+=d*1000;const r=Math.max(0,Math.round((end-Date.now())/1000));left=r;if(x)x.textContent=mmss(r)}
  else{left=Math.max(0,left+d);base=left;if(x)x.textContent=mmss(left)}
}

function handle(raw){
  let r=null;
  try{r=cmd(window.DICO&&DICO.fix?DICO.fix(raw):raw);if(!r&&window.DICO&&DICO.answer)r=DICO.answer(raw,say)}catch(e){r=null}
  toast(r?('« '+raw+' » → '+r):('Non compris : « '+raw+' ». Dites « aide » pour les commandes.'),r?4500:6000);
}

/* MODE EVEIL */
let wakeMode=localStorage.getItem('atelier_wake')!=='0',awakeUntil=0,wlk=null,wlT=0;
const WIN=9000;
const ws=document.createElement('button');ws.id='wstat';ws.type='button';
document.body.appendChild(ws);
ws.onclick=()=>btn.click();
const isAwake=()=>Date.now()<awakeUntil;
function wake(t){if(window.DICO&&DICO.wakefix)t=DICO.wakefix(t);
  if(!wakeMode){handle(t);return}
  const m=t.match(/^\s*(?:(?:ok|okay|hey|dis|salut|eh|oh)[\s,]+)?chef(?:fe)?s?\b[\s,.!?:;-]*([\s\S]*)$/i);
  if(m){
    awakeUntil=Date.now()+WIN;
    const rest=m[1].trim();
    if(rest){handle(rest)}else{toast('Oui ? Je vous écoute.',3000);say('Oui ?')}
    return;
  }
  if(isAwake()){awakeUntil=Date.now()+WIN;handle(t)}
}
let lastCls='',lastTxt='';
setInterval(()=>{
  if(speaking&&isAwake())awakeUntil=Math.max(awakeUntil,Date.now()+5000);
  let txt,cls;
  if(!on){txt='Micro éteint · touchez ici';cls='off'}
  else if(!wakeMode){txt='Micro actif · parlez';cls='live'}
  else if(isAwake()){txt='Je vous écoute…';cls='awake'}
  else{txt='Dites « Chef »';cls='sleep'}
  if(cls!==lastCls||txt!==lastTxt){ws.className=cls;ws.innerHTML='<i></i><span>'+txt+'</span>';lastCls=cls;lastTxt=txt}
  if(cls==='awake')ws.style.setProperty('--p',Math.max(0,(awakeUntil-Date.now())/WIN*100)+'%');
  if(on&&!wlk&&Date.now()-wlT>5000&&'wakeLock' in navigator&&!document.hidden){
    wlT=Date.now();
    navigator.wakeLock.request('screen').then(l=>{wlk=l;l.addEventListener('release',()=>{wlk=null})}).catch(()=>{});
  }
  if(!on&&wlk){wlk.release().catch(()=>{});wlk=null}
},200);
const hv=hp.querySelector('.vh'),p0=hv?hv.querySelector('p'):null;
if(p0){
  p0.innerHTML='Touchez le micro une fois, puis dites « <b>Chef</b> » suivi de votre demande, par exemple « Chef, suivant ». Après une commande, vous avez 9 secondes pour en donner une autre sans redire « Chef ».';
  const sw=document.createElement('button');sw.type='button';sw.id='wsw';
  const swTxt=()=>{sw.textContent='Mode éveil « Chef » : '+(wakeMode?'activé':'désactivé')};
  sw.onclick=()=>{wakeMode=!wakeMode;localStorage.setItem('atelier_wake',wakeMode?'1':'0');awakeUntil=0;swTxt()};
  swTxt();p0.after(sw);
}

/* ---------- reconnaissance ---------- */
function ui(){btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on?'true':'false')}
function start(){
  rec=new SR();rec.lang='fr-FR';rec.continuous=true;rec.interimResults=false;rec.maxAlternatives=1;
  rec.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(!e.results[i].isFinal)continue;
      const t=e.results[i][0].transcript.trim();
      if(!t||speaking||Date.now()-lastEnd<700)continue;
      wake(t);
    }
  };
  rec.onerror=e=>{
    if(e.error==='not-allowed'||e.error==='service-not-allowed'){on=false;ui();toast('Micro refusé : autorisez-le dans les réglages du navigateur.')}
    else if(e.error==='network'){toast('Pas de connexion : la reconnaissance vocale a besoin d\'internet.')}
  };
  rec.onend=()=>{if(on)setTimeout(()=>{try{rec.start()}catch(e){}},350)};
  try{rec.start()}catch(e){}
}
btn.onclick=()=>{
  if(!SR){alert('La reconnaissance vocale n\'est pas disponible dans ce navigateur. Utilisez Chrome ou Edge sur Android et PC, ou Safari sur iPhone.');return}
  if(on){micOff('Micro coupé');return}
  on=true;ui();start();
  toast(wakeMode?'Mode éveil : dites « Chef » puis votre demande.':'Je vous écoute. Touchez ? pour voir les commandes.');
  say(wakeMode?'Dites chef pour me parler.':'Je vous écoute.');
};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&on){on=false;ui();try{rec.stop()}catch(e){}}});
})();


