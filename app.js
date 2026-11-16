const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='atelier_recettes';
const ROBOTS=['Thermomix','Monsieur Cuisine','Cookeo','Companion','Autre robot'];
const GRAD='linear-gradient(135deg,#0F1E36 0%,#1d3557 55%,#C87D55 140%)';

const DEMO=[
{id:1,titre:"Bœuf mijoté en cocotte",portions:4,temps:150,diff:"Moyen",mode:"Plaque + Four",photo:"",fav:true,source:"",
 ing:["800 g paleron de bœuf","2 oignons","3 carottes","20 cl vin rouge","50 cl bouillon de bœuf","2 gousses d'ail","2 c. à soupe huile d'olive","1 bouquet garni"],
 etapes:["Coupez le bœuf en cubes et séchez-les. Émincez les oignons et hachez l'ail.","Faites dorer la viande dans la cocotte avec l'huile, 10 min à feu vif.","Ajoutez les oignons, les carottes en rondelles et l'ail. Faites revenir 5 min.","Déglacez avec le vin rouge, ajoutez le bouillon et le bouquet garni.","Couvrez et laissez mijoter 2 h à feu doux, ou au four à 150 °C.","Rectifiez l'assaisonnement et servez bien chaud."]},
{id:2,titre:"Pâtes express citron-parmesan",portions:2,temps:15,diff:"Facile",mode:"Plaque de cuisson",photo:"",fav:false,source:"",
 ing:["200 g spaghetti","1 citron","50 g parmesan","2 c. à soupe huile d'olive","1 gousse d'ail","1/2 c. à café poivre"],
 etapes:["Portez une grande casserole d'eau salée à ébullition.","Cuisez les pâtes 10 min.","Pendant ce temps, zestez le citron et râpez le parmesan.","Égouttez en gardant un peu d'eau. Mélangez avec l'huile, l'ail, le zeste, le jus et le parmesan.","Poivrez et servez aussitôt."]},
{id:3,titre:"Crêpes moelleuses",portions:4,temps:40,diff:"Facile",mode:"Plaque de cuisson",photo:"",fav:false,source:"",
 ing:["250 g farine","3 oeufs","50 cl lait","30 g beurre fondu","1 c. à soupe sucre","1 pincée sel"],
 etapes:["Mélangez la farine, le sucre et le sel. Creusez un puits et ajoutez les oeufs.","Versez le lait petit à petit en fouettant, puis le beurre fondu.","Laissez reposer la pâte 30 min.","Cuisez chaque crêpe 1 min par face dans une poêle chaude beurrée."]}
];

let R=null;try{R=JSON.parse(localStorage.getItem(KEY))}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(R))}catch(e){alert('Stockage plein : supprimez une recette ou une photo.')}}
if(!Array.isArray(R)){R=DEMO;save()}R.forEach(r=>{if(r.photo==="hero.jpg")r.photo=""});save();

let filt='all',cur=null,pers=4,tab='ing',checked=new Set();

/* ---------- Outils ---------- */
const fmtT=m=>m>=60?Math.floor(m/60)+' h'+(m%60?' '+String(m%60).padStart(2,'0'):''):m+' min';
const nf=n=>String(Math.round(n*100)/100).replace('.',',');
function scale(l,k){
  const m=l.trim().match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if(!m)return l;
  let s=m[1],v;
  if(s.includes('/')){const p=s.split(/\s+/),f=p.pop().split('/');v=(p[0]?+p[0]:0)+f[0]/f[1]}
  else v=parseFloat(s.replace(',','.'));
  return nf(v*k)+' '+m[2];
}
const lines=t=>t.split('\n').map(x=>x.trim()).filter(Boolean);
function paint(){
  $$('.ph[data-rid]').forEach(el=>{
    const r=R.find(x=>x.id==el.dataset.rid);
    if(r&&r.photo)el.style.backgroundImage='url("'+r.photo+'"),'+GRAD;
  });
}
const resize=f=>new Promise(res=>{
  const im=new Image(),u=URL.createObjectURL(f);
  im.onload=()=>{const k=Math.min(1,900/im.width),c=document.createElement('canvas');
    c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.7))};
  im.onerror=()=>res('');im.src=u;
});

/* ---------- Navigation ---------- */
function go(n){
  stopCam();
  $$('.screen').forEach(s=>s.classList.toggle('active',s.id===n));
  $$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.s===n));
  document.body.dataset.screen=n;
  window.scrollTo(0,0);
  if(n==='home')drawHome();
  if(n==='favs')drawFavs();
}
$$('nav button').forEach(b=>b.onclick=()=>go(b.dataset.s));

/* ---------- Accueil ---------- */
const CH=[['all','Tout'],['express','Express'],['plaque','Plaque'],['four','Four'],['robot','Robot'],['fav','Favoris ♥']];
const SAIS={
 printemps:[['🌱','asperge'],['🥬','épinard'],['🍓','fraise'],['🥕','carotte']],
 ete:[['🍅','tomate'],['🥒','courgette'],['🍑','pêche'],['🌽','maïs']],
 automne:[['🎃','courge'],['🍄','champignon'],['🍎','pomme'],['🥕','carotte']],
 hiver:[['🥬','poireau'],['🍊','orange'],['🥔','pomme de terre'],['🍋','citron']]
};
function saison(){const m=new Date().getMonth();return m>=2&&m<=4?'printemps':m<=7&&m>=5?'ete':m<=10&&m>=8?'automne':'hiver'}
function list(){
  const q=$('#q').value.toLowerCase().trim();
  return R.filter(r=>{
    const okq=!q||(r.titre+' '+r.ing.join(' ')).toLowerCase().includes(q);
    const okf=filt==='all'||(filt==='express'&&r.temps<=20)||(filt==='plaque'&&/plaque/i.test(r.mode))||(filt==='four'&&/four/i.test(r.mode))||(filt==='robot'&&ROBOTS.includes(r.mode))||(filt==='fav'&&r.fav);
    return okq&&okf;
  });
}
const card=r=>`<article class="card" data-open="${r.id}"><div class="ph" data-rid="${r.id}"><span class="badge">⏱ ${fmtT(r.temps)}</span>${r.fav?'<span class="heart">♥</span>':''}</div><div class="body"><h3>${esc(r.titre)}</h3><p>${esc(r.mode)}</p></div></article>`;
function drawHome(){
  const h=new Date().getHours();
  $('#hello').textContent=(h<18?'Bonjour':'Bonsoir')+', prêt à cuisiner ?';
  $('#chips').innerHTML=CH.map(([k,l])=>`<button data-f="${k}" class="${filt===k?'on':''}">${l}</button>`).join('');
  $('#saison').innerHTML=SAIS[saison()].map(([e,n])=>`<button data-q="${n}"><span>${e}</span>${n}</button>`).join('');
  const L=list(),hero=$('#hero'),g=$('#grid');
  if(!L.length){hero.className='';hero.innerHTML='';hero.onclick=null;g.innerHTML='<p class="empty">Aucune recette trouvée.</p>';return}
  const r=L[0];
  hero.className='hero ph';hero.dataset.rid=r.id;
  hero.innerHTML=`<div class="badges"><span class="badge">⏱ ${fmtT(r.temps)}</span><span class="badge">${esc(r.diff)}</span></div><div class="in"><small>À la une</small><h2>${esc(r.titre)}</h2></div>`;
  hero.onclick=()=>openRecipe(r.id);
  g.innerHTML=L.slice(1).map(card).join('');
  paint();
}
function drawFavs(){
  const L=R.filter(r=>r.fav);
  $('#favList').innerHTML=L.length?L.map(card).join(''):'<p class="empty">Aucun favori. Ouvrez une recette et touchez ♥.</p>';
  paint();
}
$('#q').oninput=drawHome;
$('#chips').onclick=e=>{const b=e.target.closest('button');if(b){filt=b.dataset.f;drawHome()}};
$('#saison').onclick=e=>{const b=e.target.closest('button');if(b){$('#q').value=b.dataset.q;filt='all';drawHome();$('#grid').scrollIntoView({behavior:'smooth'})}};
$$('.bento .b[data-f]').forEach(b=>b.onclick=()=>{filt=b.dataset.f;$('#q').value='';drawHome();$('#grid').scrollIntoView({behavior:'smooth'})});
const openFromCard=e=>{const c=e.target.closest('[data-open]');if(c)openRecipe(c.dataset.open)};
$('#grid').onclick=openFromCard;$('#favList').onclick=openFromCard;

/* ---------- Fiche recette ---------- */
function openRecipe(id){
  cur=R.find(r=>r.id==id);if(!cur)return;
  if(!cur.etapes||!cur.etapes.length)cur.etapes=['Suivez votre recette.'];
  pers=cur.portions;tab='ing';checked=new Set();
  const r=cur;
  $('#recipe').innerHTML=`
  <div class="rhead ph" data-rid="${r.id}">
    <button class="round" id="back" aria-label="Retour">‹</button>
    <button class="round ${r.fav?'on':''}" id="favBtn" aria-label="Favori">♥</button>
  </div>
  <div class="sheet">
    <h2>${esc(r.titre)}</h2>
    <div class="badges2"><span>⏱ ${fmtT(r.temps)}</span><span>${esc(r.diff)}</span><span>${esc(r.mode)}</span></div>
    <div class="stepper"><span>Nombre de personnes</span><div><button id="mn">−</button><b id="pers"></b><button id="pl">+</button></div></div>
    <div class="seg"><button data-t="ing" class="on">Ingrédients</button><button data-t="prep">Préparation</button></div>
    <div id="rbody"></div>
    ${/^https?:\/\//.test(r.source||'')?`<a class="src" href="${esc(r.source)}" target="_blank" rel="noopener">Voir la source ↗</a>`:''}
    <button class="del" id="delBtn">Supprimer cette recette</button>
  </div>
  <div class="cta"><button class="pill" id="startCook">Démarrer le mode cuisine</button></div>`;
  $('#back').onclick=()=>go('home');
  $('#favBtn').onclick=e=>{r.fav=!r.fav;save();e.currentTarget.classList.toggle('on',r.fav)};
  $('#mn').onclick=()=>{if(pers>1){pers--;drawBody()}};
  $('#pl').onclick=()=>{if(pers<99){pers++;drawBody()}};
  $$('.seg button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;$$('.seg button').forEach(x=>x.classList.toggle('on',x===b));drawBody()});
  $('#rbody').onchange=e=>{const k=+e.target.dataset.k;e.target.checked?checked.add(k):checked.delete(k)};
  $('#delBtn').onclick=()=>{if(confirm('Supprimer cette recette ?')){R=R.filter(x=>x.id!==r.id);save();go('home')}};
  $('#startCook').onclick=startCook;
  drawBody();go('recipe');paint();
}
function drawBody(){
  const r=cur,k=pers/r.portions;
  $('#pers').textContent=pers;
  $('#rbody').innerHTML=tab==='ing'
   ?'<ul class="ings">'+r.ing.map((i,n)=>`<li><label class="ck"><input type="checkbox" data-k="${n}" ${checked.has(n)?'checked':''}><span class="box"></span><span class="tx">${esc(scale(i,k))}</span></label></li>`).join('')+'</ul>'
   :'<ol class="steps">'+r.etapes.map(e=>`<li>${esc(e)}</li>`).join('')+'</ol>';
}

/* ---------- Mode cuisine ---------- */
let ci=0,tm=null,left=0,base=0,end=0,wl=null,AC=null;
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function mins(t){const h=t.match(/(\d+)\s?h(?:eures?)?\b/i),m=t.match(/(\d+)\s?min/i);return(h?+h[1]*60:0)+(m?+m[1]:0)}
function beep(){
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    [0,.35,.7].forEach(d=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+d;
      o.frequency.value=880;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.25,t);o.start(t);o.stop(t+.2)})}catch(e){}
  if(navigator.vibrate)navigator.vibrate([300,150,300]);
}
function stopT(){clearInterval(tm);tm=null}
async function wake(){try{if('wakeLock' in navigator)wl=await navigator.wakeLock.request('screen')}catch(e){}}
function startCook(){ci=0;go('cook');drawCook();wake()}
function endCook(){stopT();if(wl){wl.release().catch(()=>{});wl=null}go('recipe')}
function drawCook(){
  stopT();
  const r=cur,e=r.etapes[ci],last=ci===r.etapes.length-1,k=pers/r.portions;
  base=left=mins(e)*60;
  $('#cook').innerHTML=`
  <div class="chead"><button class="gl2" data-a="close">✕ Quitter</button><span>Étape ${ci+1} / ${r.etapes.length}</span><button class="gl2" data-a="ing">Ingrédients</button></div>
  <div class="bar"><i style="width:${(ci+1)/r.etapes.length*100}%"></i></div>
  <div class="cbody">
    <p class="cstep">${esc(e)}</p>
    <div class="timer"><div id="tt">${mmss(left)}</div>
      <div class="trow"><button class="ghost" data-a="minus">−1 min</button><button class="pill" id="tgo" data-a="go">Lancer</button><button class="ghost" data-a="plus">+1 min</button><button class="ghost" data-a="reset">↺</button></div>
    </div>
  </div>
  <div id="cdr" class="drawer" hidden><b>Pour ${pers} personne${pers>1?'s':''}</b><ul>${r.ing.map(i=>`<li>${esc(scale(i,k))}</li>`).join('')}</ul></div>
  <div class="cnav"><button class="ghost" data-a="prev" ${ci===0?'disabled':''}>Précédent</button><button class="pill" data-a="next">${last?'Terminer':'Suivant'}</button></div>`;
}
function toggleT(){
  if(tm){stopT();$('#tgo').textContent='Reprendre';return}
  if(left<=0)return;
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}
  end=Date.now()+left*1000;$('#tgo').textContent='Pause';$('#tt').classList.remove('done');
  tm=setInterval(()=>{
    left=Math.max(0,Math.round((end-Date.now())/1000));$('#tt').textContent=mmss(left);
    if(left<=0){stopT();$('#tgo').textContent='Lancer';$('#tt').classList.add('done');beep()}
  },250);
}
$('#cook').onclick=e=>{
  const a=e.target.closest('[data-a]');if(!a)return;const x=a.dataset.a;
  if(x==='close')endCook();
  else if(x==='ing')$('#cdr').hidden=!$('#cdr').hidden;
  else if(x==='prev'&&ci>0){ci--;drawCook()}
  else if(x==='next'){if(ci<cur.etapes.length-1){ci++;drawCook()}else endCook()}
  else if(x==='go')toggleT();
  else if(x==='reset'){stopT();left=base;$('#tt').textContent=mmss(left);$('#tt').classList.remove('done');$('#tgo').textContent='Lancer'}
  else if(x==='plus'||x==='minus'){if(tm)return;left=Math.max(0,left+(x==='plus'?60:-60));base=left;$('#tt').textContent=mmss(left)}
};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&document.body.dataset.screen==='cook')wake()});

/* ---------- Création ---------- */
$('#form').onsubmit=async e=>{
  e.preventDefault();
  const f=$('#photoIn').files[0],photo=f?await resize(f):'';
  const et=lines($('#etapes').value);
  R.unshift({id:Date.now(),titre:$('#titre').value.trim(),portions:Math.max(1,+$('#portions').value||1),temps:+$('#temps').value||0,
    diff:$('#diff').value,mode:$('#mode').value,ing:lines($('#ingredients').value),etapes:et.length?et:['Suivez votre recette.'],
    source:$('#source').value.trim(),photo,fav:false});
  save();e.target.reset();openRecipe(R[0].id);
};

/* ---------- Caméra frigo ---------- */
let stream=null;
function stopCam(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;$('#video').srcObject=null}}
$('#startCam').onclick=async()=>{
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});$('#video').srcObject=stream}
  catch(e){alert('Caméra indisponible : '+e.message)}
};
$('#snap').onclick=()=>{
  const v=$('#video'),c=$('#canvas');
  if(!v.videoWidth)return alert("Activez d'abord la caméra");
  c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);
  $('#photo').src=c.toDataURL('image/jpeg',.8);
};

/* ---------- Import ---------- */
$('#importBtn').onclick=()=>{
  const t=$('#importTxt').value.trim();if(!t)return;
  if(/^https?:\/\//.test(t))$('#source').value=t;else $('#etapes').value=t;
  go('create');
};

if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
drawHome();

