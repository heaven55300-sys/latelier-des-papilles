(function(){
const Q=s=>document.querySelector(s);
if(typeof go==='undefined'||typeof openRecipe==='undefined'||!Q('nav'))return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
const CART='<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 11h10.6l2-8H6.5"/>';
const KEY='atelier_courses';
let L=[];try{L=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
if(!Array.isArray(L))L=[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}};

/* ---------- Ecran courses ---------- */
const sc=document.createElement('section');sc.id='courses';sc.className='screen';
sc.innerHTML='<h1 class="pt">Liste de courses</h1>'+
'<form id="cform" class="cadd"><input id="cin" placeholder="Ajouter un article, ex. 2 citrons" autocomplete="off"><button class="pill sm" type="submit">Ajouter</button></form>'+
'<div id="clist" class="clist"></div>'+
'<div class="row"><button class="pill sm alt" id="cshare" type="button">Partager / copier</button><button class="pill sm alt" id="cdone" type="button">Retirer les cochés</button></div>'+
'<button class="linkbtn" id="call" type="button">Tout vider</button>';
document.body.insertBefore(sc,Q('nav'));

function draw(){
  const el=Q('#clist');
  if(!L.length){el.className='clist';el.innerHTML='<p class="empty">Votre liste est vide. Ouvrez une recette et touchez « Ajouter à la liste de courses ».</p>';return}
  el.className='clist full';
  el.innerHTML='<ul>'+L.map((x,i)=>'<li><label class="ck"><input type="checkbox" data-i="'+i+'" '+(x.done?'checked':'')+'><span class="box"></span><span class="tx">'+E(x.t)+(x.r?'<small>'+E(x.r)+'</small>':'')+'</span></label><button class="rm" type="button" data-rm="'+i+'" aria-label="Supprimer">✕</button></li>').join('')+'</ul>';
}
function add(items,r){
  let n=0;
  items.forEach(t=>{
    t=String(t).trim();if(!t)return;
    if(L.some(x=>!x.done&&x.t.toLowerCase()===t.toLowerCase()))return;
    L.push({t:t,r:r||'',done:false});n++;
  });
  save();draw();return n;
}
Q('#cform').onsubmit=e=>{e.preventDefault();const v=Q('#cin').value.trim();if(!v)return;add([v],'');Q('#cin').value=''};
Q('#clist').onchange=e=>{const i=e.target.dataset.i;if(i!=null){L[+i].done=e.target.checked;save();draw()}};
Q('#clist').onclick=e=>{const b=e.target.closest('[data-rm]');if(b){L.splice(+b.dataset.rm,1);save();draw()}};
Q('#cdone').onclick=()=>{L=L.filter(x=>!x.done);save();draw()};
Q('#call').onclick=()=>{if(L.length&&confirm('Vider toute la liste ?')){L=[];save();draw()}};
Q('#cshare').onclick=async()=>{
  const t=L.filter(x=>!x.done).map(x=>'• '+x.t).join('\n');
  if(!t){alert('Rien à partager.');return}
  if(navigator.share){try{await navigator.share({title:'Liste de courses',text:t});return}catch(e){if(e&&e.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(t);alert('Liste copiée.')}catch(e){prompt('Copiez la liste :',t)}
};

/* ---------- Onglet Courses dans la barre ---------- */
const nb=Q('nav button[data-s=import]');
if(nb){nb.dataset.s='courses';nb.innerHTML='<span>'+svg(CART)+'</span>Courses'}

/* ---------- Bouton dans la fiche recette ---------- */
const oo=openRecipe;
openRecipe=function(id){
  oo(id);
  const d=Q('#delBtn');
  if(!d||typeof cur==='undefined'||!cur)return;
  const b=document.createElement('button');
  b.type='button';b.id='addCart';b.className='pill alt';b.textContent='Ajouter à la liste de courses';
  d.before(b);
  b.onclick=()=>{
    const k=pers/cur.portions;
    const items=cur.ing.filter((_,n)=>!checked.has(n)).map(i=>scale(i,k));
    const n=add(items,cur.titre);
    b.textContent=n?('✓ '+n+' article'+(n>1?'s ajoutés':' ajouté')):'Déjà dans la liste';
  };
};

/* ---------- Crédits photos ---------- */
const cs=document.createElement('section');cs.id='credits';cs.className='screen';
cs.innerHTML='<h1 class="pt">Crédits photos</h1><p class="muted">Les photos de plats viennent de Wikimedia Commons et sont publiées sous licence libre. Merci à leurs auteurs.</p><div id="credList"></div><button class="pill alt" id="credBack" type="button">← Retour</button>';
document.body.insertBefore(cs,Q('nav'));
Q('#credBack').onclick=()=>go('home');
let credDone=false;
async function drawCred(){
  if(credDone)return;
  const el=Q('#credList');
  el.innerHTML='<p class="muted">Chargement…</p>';
  try{
    const r=await fetch('photos/credits.txt',{cache:'no-cache'});
    if(!r.ok)throw new Error('introuvable');
    const t=(await r.text()).replace(/^\uFEFF/,'');
    const rows=t.split(/\r?\n/).map(l=>l.split(' | ')).filter(p=>p.length>=5);
    if(!rows.length)throw new Error('vide');
    el.innerHTML=rows.map(p=>{
      const f=p[0].trim(),url=p[p.length-1].trim(),lic=p[p.length-2].trim(),au=p.slice(2,p.length-2).join(' | ').trim();
      const ti=p[1].replace(/^File:/i,'').replace(/\.[a-z]+$/i,'').replace(/_/g,' ');
      const img=/^[\w.-]+$/.test(f)?'<img loading="lazy" alt="" src="photos/'+E(f)+'">':'';
      const lk=url.indexOf('https://commons.wikimedia.org/')===0?'<a href="'+E(url)+'" target="_blank" rel="noopener noreferrer">Voir la source ↗</a>':'';
      return '<div class="cr">'+img+'<div><b>'+E(ti)+'</b><span>Auteur : '+E(au||'non indiqué')+'</span><span>Licence : '+E(lic||'non indiquée')+'</span>'+lk+'</div></div>';
    }).join('');
    credDone=true;
  }catch(e){
    el.innerHTML='<p class="muted">Liste indisponible. Elle s\'affiche une fois l\'application en ligne.</p>';
  }
}
const hm=Q('#home');
if(hm){
  const f=document.createElement('p');f.className='legal';
  f.innerHTML='<button type="button" class="linkbtn" id="credBtn">Crédits photos</button>';
  hm.appendChild(f);
  Q('#credBtn').onclick=()=>go('credits');
}

/* ---------- Navigation ---------- */
const og=go;
go=function(n){og(n);if(n==='courses')draw();if(n==='credits')drawCred()};
draw();
})();
