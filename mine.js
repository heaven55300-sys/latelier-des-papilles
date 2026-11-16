(function(){
const Q=s=>document.querySelector(s);
if(typeof R==='undefined'||typeof go==='undefined'||typeof openRecipe==='undefined'||!Q('nav')||Q('#mine'))return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
const BOOK='<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>';
const FIL=[['all','Toutes'],['fav','Favoris ♥'],['imp','Importées'],['todo','À compléter'],['own','Créées']];
let mf='all',editId=null;

function plat(l){
  let h='';try{h=new URL(l).hostname.toLowerCase()}catch(e){}
  if(/tiktok/.test(h))return 'TikTok';
  if(/instagram/.test(h))return 'Instagram';
  if(/youtube|youtu\.be/.test(h))return 'YouTube';
  if(/facebook|fb\.watch|fb\.com/.test(h))return 'Facebook';
  if(/pinterest|pin\.it/.test(h))return 'Pinterest';
  if(/marmiton/.test(h))return 'Marmiton';
  return h.replace(/^www\./,'')||'Lien';
}

/* écran */
const sc=document.createElement('section');sc.id='mine';sc.className='screen';
sc.innerHTML='<h1 class="pt">Mes recettes</h1><div class="search"><input id="mq" type="search" placeholder="Rechercher dans mes recettes"></div><div id="mchips" class="chips"></div><p id="mcount" class="muted"></p><div id="mineList" class="grid"></div>';
document.body.insertBefore(sc,Q('nav'));
const sb=Q('.syncbox');if(sb)sc.appendChild(sb);

function draw(){
  Q('#mchips').innerHTML=FIL.map(f=>'<button type="button" data-f="'+f[0]+'" class="'+(mf===f[0]?'on':'')+'">'+f[1]+'</button>').join('');
  const q=(Q('#mq').value||'').toLowerCase().trim();
  const L=R.filter(r=>{
    const todo=!(r.ing&&r.ing.length);
    const okf=mf==='all'||(mf==='fav'&&r.fav)||(mf==='imp'&&r.source)||(mf==='todo'&&todo)||(mf==='own'&&!r.source);
    const okq=!q||((r.titre||'')+' '+(r.ing||[]).join(' ')).toLowerCase().includes(q);
    return okf&&okq;
  });
  Q('#mcount').textContent=L.length+' recette'+(L.length>1?'s':'');
  Q('#mineList').innerHTML=L.length?L.map(r=>{
    const todo=!(r.ing&&r.ing.length),p=r.source?plat(r.source):'';
    const badge=r.temps?('⏱ '+fmtT(r.temps)):(p||'Recette');
    const sub=(p?p+' · ':'')+(todo?'À compléter':E(r.mode));
    return '<article class="card" data-open="'+r.id+'"><div class="ph" data-rid="'+r.id+'"><span class="badge">'+E(badge)+'</span>'+(r.fav?'<span class="heart">♥</span>':'')+'</div><div class="body"><h3>'+E(r.titre)+'</h3><p>'+sub+'</p></div></article>';
  }).join(''):'<p class="empty">Aucune recette ici. Partagez un lien vers l\'application ou touchez Créer.</p>';
  if(typeof paint==='function')paint();
}
Q('#mchips').onclick=e=>{const b=e.target.closest('button');if(b){mf=b.dataset.f;draw()}};
Q('#mq').oninput=draw;
Q('#mineList').onclick=e=>{const c=e.target.closest('[data-open]');if(c)openRecipe(c.dataset.open)};

/* onglet de la barre */
const nb=Q('nav button[data-s=favs]');
if(nb){nb.dataset.s='mine';nb.innerHTML='<span>'+svg(BOOK)+'</span>Mes recettes'}

/* modification d'une recette */
const form=Q('#form');
function endEdit(){
  editId=null;
  if(form)form.reset();
  const s=form&&form.querySelector('button[type=submit]');if(s)s.textContent='Enregistrer la recette';
  const n=Q('#editNote');if(n)n.remove();
}
function startEdit(r){
  editId=r.id;
  go('create');
  const set=(s,v)=>{const e=Q(s);if(e)e.value=v};
  set('#titre',r.titre||'');set('#portions',r.portions||4);set('#temps',r.temps||0);set('#diff',r.diff||'Facile');
  const m=Q('#mode');if(m&&[...m.options].some(o=>o.value===r.mode))m.value=r.mode;
  set('#ingredients',(r.ing||[]).join('\n'));
  set('#etapes',(r.etapes||[]).join('\n'));
  set('#source',r.source||'');
  const s=form.querySelector('button[type=submit]');if(s)s.textContent='Enregistrer les modifications';
  if(!Q('#editNote')){const n=document.createElement('p');n.id='editNote';n.className='muted';n.textContent='Modification de « '+r.titre+' ». La photo actuelle est conservée si vous n\'en choisissez pas une autre.';form.before(n)}
}
if(form&&form.onsubmit){
  const old=form.onsubmit;
  form.onsubmit=async function(e){
    const id=editId;
    await old.call(form,e);
    if(!id)return;
    const prev=R.find(x=>x.id==id),nw=R[0];
    if(prev&&nw&&nw!==prev){nw.fav=prev.fav;if(!nw.photo)nw.photo=prev.photo||'';R=R.filter(x=>x!==prev);save()}
  };
}

/* navigation */
const og=go;
go=function(n){
  if(n==='favs'){mf='fav';n='mine'}
  if(n!=='create'&&editId)endEdit();
  og(n);
  if(n==='mine')draw();
};

/* fiche : retour et bouton Modifier */
const oo=openRecipe;
openRecipe=function(id){
  const from=document.body.dataset.screen;
  oo(id);
  const d=Q('#delBtn'),r=(typeof cur!=='undefined')?cur:null;
  if(!d||!r)return;
  if(from==='mine'){const b=Q('#back');if(b)b.onclick=()=>go('mine')}
  const e=document.createElement('button');e.type='button';e.id='editBtn';e.className='pill alt';e.textContent='Modifier cette recette';
  d.before(e);
  e.onclick=()=>startEdit(r);
};
})();
