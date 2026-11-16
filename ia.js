(function(){
const Q=s=>document.querySelector(s);
if(typeof R==='undefined'||typeof openRecipe==='undefined'||!Q('#mine')||Q('#iaCfg'))return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const K1='atelier_ia_url',K2='atelier_ia_code';

async function call(path,body){
  const u=(localStorage.getItem(K1)||'').replace(/\/+$/,''),c=localStorage.getItem(K2)||'';
  if(!u||!c)throw new Error('Configurez d\'abord l\'assistant IA : onglet Mes recettes, en bas.');
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),60000);
  try{
    const r=await fetch(u+path,{method:'POST',headers:{'Content-Type':'application/json','X-Access-Code':c},body:JSON.stringify(body),signal:ctl.signal});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.error)throw new Error(j.error||('Erreur '+r.status));
    return j;
  }catch(e){
    if(e&&e.name==='AbortError')throw new Error('Délai dépassé, réessayez.');
    if(e instanceof TypeError)throw new Error('Service injoignable : vérifiez l\'adresse et la connexion.');
    throw e;
  }finally{clearTimeout(to)}
}
const arr=a=>(Array.isArray(a)?a:[]).map(x=>String(x).trim()).filter(Boolean);
function clean(x){
  x=x||{};
  return{titre:String(x.titre||'').trim().slice(0,100),
    portions:Math.max(1,Math.min(99,parseInt(x.portions,10)||4)),
    temps:Math.max(0,Math.min(2000,parseInt(x.temps,10)||0)),
    diff:['Facile','Moyen','Difficile'].indexOf(x.diff)>=0?x.diff:'Moyen',
    mode:String(x.mode||'Plaque de cuisson').slice(0,60),
    ing:arr(x.ing).slice(0,60).map(s=>s.slice(0,120)),
    etapes:arr(x.etapes).slice(0,40).map(s=>s.slice(0,400))};
}

/* ---------- carte de configuration ---------- */
const cfg=document.createElement('div');cfg.id='iaCfg';cfg.className='syncbox';
cfg.innerHTML='<h3>Assistant IA</h3><p>Adresse du service et code d\'accès, enregistrés seulement sur cet appareil.</p><label for="iaUrl">Adresse du service</label><input id="iaUrl" placeholder="https://papilles-ia.xxx.workers.dev" autocomplete="off" autocapitalize="off"><label for="iaCode">Code d\'accès</label><input id="iaCode" type="password" autocomplete="off"><div class="row"><button class="pill sm" id="iaSave" type="button">Enregistrer</button><button class="pill sm alt" id="iaTest" type="button">Tester</button></div><p id="iaMsg"></p>';
Q('#mine').appendChild(cfg);
Q('#iaUrl').value=localStorage.getItem(K1)||'';
Q('#iaCode').value=localStorage.getItem(K2)||'';
const msg=t=>{Q('#iaMsg').textContent=t};
Q('#iaSave').onclick=()=>{
  const u=Q('#iaUrl').value.trim().replace(/\/+$/,''),c=Q('#iaCode').value.trim();
  if(!/^https:\/\/[^\s]+$/.test(u)){msg('L\'adresse doit commencer par https://');return}
  if(c.length<8){msg('Code trop court.');return}
  localStorage.setItem(K1,u);localStorage.setItem(K2,c);msg('Enregistré.');
};
Q('#iaTest').onclick=async()=>{
  msg('Test en cours…');
  try{await call('/ping',{});msg('Connexion réussie.')}catch(e){msg('Échec : '+e.message)}
};

/* ---------- remplir une recette à partir d'un texte ---------- */
function ask(r){
  const generic=/^(Voir la vidéo source\.|Suivez votre recette\.)$/;
  const pre=(r.etapes||[]).filter(x=>!generic.test(x)).join('\n').trim();
  const ov=document.createElement('div');ov.id='iaSheet';
  ov.innerHTML='<div class="sh"><small>Assistant IA</small><h2>Remplir la recette</h2><p class="nt">Collez la description ou la légende de la vidéo. Si la recette n\'est que dans la vidéo, l\'IA ne peut pas la lire.</p><textarea id="iaTxt" rows="8" placeholder="Collez le texte ici"></textarea>'+(r.source?'<label class="iack"><input type="checkbox" id="iaPage" checked> Essayer aussi de lire la page du lien</label>':'')+'<button class="pill" id="iaGo" type="button">Analyser avec l\'IA</button><p id="iaErr" class="iaerr"></p><button class="linkbtn" id="iaX" type="button">Fermer</button></div>';
  document.body.appendChild(ov);
  Q('#iaTxt').value=pre;
  Q('#iaX').onclick=()=>ov.remove();
  Q('#iaGo').onclick=async()=>{
    const b=Q('#iaGo'),text=Q('#iaTxt').value.trim(),url=(Q('#iaPage')&&Q('#iaPage').checked)?r.source:'';
    Q('#iaErr').textContent='';
    if(!text&&!url){Q('#iaErr').textContent='Collez un texte ou gardez le lien.';return}
    b.disabled=true;b.textContent='Analyse en cours…';
    try{
      const j=await call('/recipe',{text:text,url:url||''});
      const c=clean(j.recette);
      if(!c.ing.length||!c.etapes.length)throw new Error('Réponse incomplète, réessayez avec plus de texte.');
      if(r.ing&&r.ing.length&&!confirm('Remplacer les ingrédients et les étapes actuels ?')){b.disabled=false;b.textContent='Analyser avec l\'IA';return}
      r.ing=c.ing;r.etapes=c.etapes;r.portions=c.portions;r.diff=c.diff;
      if(c.temps)r.temps=c.temps;
      if(!r.mode||r.mode==='À définir')r.mode=c.mode;
      if(/^Recette /.test(r.titre||'')&&c.titre)r.titre=c.titre;
      save();ov.remove();openRecipe(r.id);
    }catch(e){Q('#iaErr').textContent=e.message;b.disabled=false;b.textContent='Analyser avec l\'IA'}
  };
}
const oo=openRecipe;
openRecipe=function(id){
  oo(id);
  const d=Q('#delBtn'),r=(typeof cur!=='undefined')?cur:null;
  if(!d||!r)return;
  const b=document.createElement('button');b.type='button';b.id='iaBtn';b.className='pill';
  b.textContent=(r.ing&&r.ing.length)?'Refaire avec l\'IA':'Remplir avec l\'IA';
  (Q('#editBtn')||d).before(b);
  b.onclick=()=>ask(r);
};

/* ---------- analyse du frigo ---------- */
const fr=Q('#fridge'),ph=Q('#photo');
if(fr&&ph){
  const box=document.createElement('div');box.id='iaFridge';
  box.innerHTML='<label for="iaFile">Ou choisir une photo</label><input id="iaFile" type="file" accept="image/*"><label for="iaPref">Cuisson souhaitée</label><select id="iaPref"><option value="">Peu importe</option><option value="plaque">Plaque de cuisson</option><option value="four">Four</option><option value="robot">Mon robot</option></select><button class="pill" id="iaAnalyse" type="button">Analyser avec l\'IA</button><p id="iaFMsg" class="muted"></p><div id="iaOut"></div>';
  ph.after(box);
  const fm=t=>{Q('#iaFMsg').textContent=t};
  const shrink=src=>new Promise((res,rej)=>{
    const im=new Image();
    im.onload=()=>{const k=Math.min(1,1024/Math.max(im.width,im.height)),c=document.createElement('canvas');
      c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      res(c.toDataURL('image/jpeg',.75))};
    im.onerror=()=>rej(new Error('Photo illisible'));im.src=src;
  });
  Q('#iaFile').onchange=async e=>{
    const f=e.target.files[0];e.target.value='';if(!f)return;
    try{const d=(typeof resize==='function')?await resize(f):'';if(d){ph.src=d;fm('Photo chargée. Touchez Analyser.')}else fm('Photo illisible.')}catch(x){fm('Photo illisible.')}
  };
  let last=[];
  Q('#iaAnalyse').onclick=async()=>{
    const src=ph.getAttribute('src')||'';
    if(src.indexOf('data:image')!==0){fm('Prenez d\'abord une photo ou choisissez-en une.');return}
    const b=Q('#iaAnalyse');b.disabled=true;b.textContent='Analyse en cours…';fm('');Q('#iaOut').innerHTML='';
    try{
      let pref=Q('#iaPref').value;
      if(pref==='robot')pref='avec mon robot de cuisine : '+(localStorage.getItem('atelier_robot')||'robot');
      else if(pref==='four')pref='au four';else if(pref==='plaque')pref='sur plaque de cuisson';
      const img=await shrink(src);
      const j=await call('/fridge',{image:img,pref:pref});
      const ings=arr(j.ingredients).slice(0,40);
      last=(Array.isArray(j.recettes)?j.recettes:[]).map(clean).filter(x=>x.titre&&x.ing.length&&x.etapes.length).slice(0,3);
      if(!ings.length&&!last.length)throw new Error('Rien d\'exploitable, essayez une photo plus nette.');
      Q('#iaOut').innerHTML='<h3>Aliments repérés</h3><p class="muted">Vérifiez cette liste : l\'IA peut se tromper.</p><div class="iachips">'+ings.map(i=>'<span>'+E(i)+'</span>').join('')+'</div>'+
        (last.length?'<h3>Idées de recettes</h3>':'')+
        last.map((r,i)=>'<div class="iacard"><h4>'+E(r.titre)+'</h4><p>'+(r.temps?E(fmtT(r.temps))+' · ':'')+E(r.diff)+' · '+E(r.mode)+'</p><p>'+E(r.ing.slice(0,6).join(', '))+(r.ing.length>6?'…':'')+'</p><button class="pill sm" type="button" data-i="'+i+'">Enregistrer et ouvrir</button></div>').join('');
    }catch(e){fm(e.message)}
    b.disabled=false;b.textContent='Analyser avec l\'IA';
  };
  Q('#iaOut').onclick=e=>{
    const b=e.target.closest('button[data-i]');if(!b)return;
    const x=last[+b.dataset.i];if(!x)return;
    const r={id:Date.now(),titre:x.titre,portions:x.portions,temps:x.temps,diff:x.diff,mode:x.mode,ing:x.ing,etapes:x.etapes,source:'',photo:'',fav:false};
    R.unshift(r);save();openRecipe(r.id);
  };
}
})();
