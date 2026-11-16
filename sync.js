(function(){
const Q=s=>document.querySelector(s);
const fv=Q('#favs');if(!fv||Q('#sx'))return;
const rd=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const box=document.createElement('div');box.className='syncbox';
box.innerHTML='<h3>Sauvegarde et transfert</h3><p>Exportez vos recettes et votre liste de courses dans un fichier, puis importez-le sur un autre appareil. L\'import ajoute sans rien effacer.</p><div class="row"><button class="pill sm" id="sx" type="button">Exporter</button><button class="pill sm alt" id="si" type="button">Importer</button></div><input id="sf" type="file" accept=".json,application/json" hidden><p id="sm"></p>';
fv.appendChild(box);
const msg=t=>{Q('#sm').textContent=t};

Q('#sx').onclick=async()=>{
  const data={app:'atelier-des-papilles',version:1,date:new Date().toISOString(),
    recettes:rd('atelier_recettes')||[],courses:rd('atelier_courses')||[],robot:localStorage.getItem('atelier_robot')||''};
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const name='papilles-'+new Date().toISOString().slice(0,10)+'.json';
  try{
    const file=new File([blob],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Mes recettes'});msg('Fichier partagé.');return}
  }catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  msg('Fichier téléchargé : '+name);
};

Q('#si').onclick=()=>Q('#sf').click();
Q('#sf').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  try{
    const d=JSON.parse((await f.text()).replace(/^\uFEFF/,''));
    if(!d||d.app!=='atelier-des-papilles'||!Array.isArray(d.recettes))throw new Error('format');
    const cur=rd('atelier_recettes');const rec=Array.isArray(cur)?cur:[];
    const ids=new Set(rec.map(r=>String(r.id)));
    let nr=0;
    d.recettes.forEach(r=>{
      if(!r||typeof r.titre!=='string'||!Array.isArray(r.ing)||ids.has(String(r.id)))return;
      r.ing=r.ing.map(String);
      r.etapes=Array.isArray(r.etapes)&&r.etapes.length?r.etapes.map(String):['Suivez votre recette.'];
      r.portions=Math.max(1,+r.portions||1);r.temps=+r.temps||0;
      r.diff=r.diff||'Facile';r.mode=r.mode||'Plaque de cuisson';r.photo=r.photo||'';r.source=r.source||'';r.fav=!!r.fav;
      rec.push(r);ids.add(String(r.id));nr++;
    });
    const cc=rd('atelier_courses');const cs=Array.isArray(cc)?cc:[];
    let nc=0;
    (Array.isArray(d.courses)?d.courses:[]).forEach(x=>{
      if(!x||typeof x.t!=='string')return;
      if(cs.some(y=>y.t.toLowerCase()===x.t.toLowerCase()))return;
      cs.push({t:x.t,r:x.r||'',done:!!x.done});nc++;
    });
    localStorage.setItem('atelier_recettes',JSON.stringify(rec));
    localStorage.setItem('atelier_courses',JSON.stringify(cs));
    if(d.robot&&!localStorage.getItem('atelier_robot'))localStorage.setItem('atelier_robot',String(d.robot));
    alert('Import terminé : '+nr+' recette(s) et '+nc+' article(s) ajoutés.');
    location.reload();
  }catch(err){
    msg(err&&err.name==='QuotaExceededError'?'Stockage plein : supprimez des photos ou des recettes.':'Fichier non reconnu : utilisez un fichier exporté par cette application.');
  }
};
})();
