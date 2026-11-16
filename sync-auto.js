/* SYNC AUTO : recettes et liste de courses entre appareils */
(function(){
const Q=s=>document.querySelector(s);
if(typeof R==='undefined'||typeof go==='undefined'||!Q('#mine')||window.__autosync)return;
window.__autosync=1;
const K1='atelier_ia_url',K2='atelier_ia_code',KM='atelier_sync_meta',KR='atelier_recettes',KC='atelier_courses';
const SCR=['home','mine','favs','courses','fridge','credits'];
let applying=false,busy=false,again=false,timer=null;
const rd=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h.toString(36)+'.'+s.length};
const strip=r=>{const c=Object.assign({},r);if(typeof c.photo==='string'&&c.photo.indexOf('data:')===0)c.photo='';return c};
const hr=r=>hash(JSON.stringify(strip(r)));
const conf=()=>!!(localStorage.getItem(K1)&&localStorage.getItem(K2));

/* detecter toute ecriture des recettes ou des courses */
const osi=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){osi.call(this,k,v);if(!applying&&(k===KR||k===KC))schedule()};
const put=(k,v)=>{applying=true;try{localStorage.setItem(k,v)}finally{applying=false}};
function schedule(){if(!conf())return;clearTimeout(timer);timer=setTimeout(()=>sync(),4000)}

/* carte dans Mes recettes */
const box=document.createElement('div');box.id='autoSync';box.className='syncbox';
box.innerHTML='<h3>Synchronisation automatique</h3><p>Vos recettes et votre liste de courses se synchronisent entre vos appareils par votre service Cloudflare. Les photos prises avec l\'appareil ne sont pas synchronisées.</p><div class="row"><button class="pill sm" id="asNow" type="button">Synchroniser maintenant</button></div><p id="asMsg"></p>';
Q('#mine').appendChild(box);
const msg=t=>{const e=Q('#asMsg');if(e)e.textContent=t};

/* document local envoye au service */
function build(m){
  const now=Date.now(),rec={};
  R.forEach(r=>{
    const id=String(r.id),h=hr(r),e=m.r[id];
    if(!e)m.r[id]={h:h,t:m.init?now:0};
    else if(e.del||e.h!==h)m.r[id]={h:h,t:now};
    rec[id]={t:m.r[id].t,r:strip(r)};
  });
  Object.keys(m.r).forEach(id=>{
    if(rec[id])return;
    if(m.r[id].del&&now-m.r[id].t>180*86400000){delete m.r[id];return}
    if(!m.r[id].del)m.r[id]={h:'',t:now,del:1};
    rec[id]={t:m.r[id].t,del:1};
  });
  const items=rd(KC,[]),ch=hash(JSON.stringify(items));
  if(!m.c)m.c={h:ch,t:m.init?now:0};
  else if(m.c.h!==ch)m.c={h:ch,t:now};
  return{recettes:rec,courses:{t:m.c.t,items:items}};
}

/* appliquer le document fusionne */
function canUI(){const a=document.activeElement;return SCR.indexOf(document.body.dataset.screen)>=0&&!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))}
function apply(d,m){
  const res={n:0,reload:false};
  if(!canUI())return res;
  const seen={},keep=[],add=[];let n=0;
  R.forEach(r=>{
    const id=String(r.id);seen[id]=1;
    const e=d.recettes[id],mine=m.r[id];
    if(!e){keep.push(r);return}
    if(mine&&!mine.del&&hr(r)!==mine.h){keep.push(r);return}
    if(e.del){m.r[id]={h:'',t:e.t,del:1};n++;return}
    const sh=hr(e.r);
    if(mine&&mine.h===sh){mine.t=e.t;keep.push(r);return}
    const nr=Object.assign({},e.r);
    if(!nr.photo&&r.photo)nr.photo=r.photo;
    m.r[id]={h:sh,t:e.t};keep.push(nr);n++;
  });
  Object.keys(d.recettes).forEach(id=>{
    if(seen[id])return;
    const e=d.recettes[id],mine=m.r[id];
    if(e.del){m.r[id]={h:'',t:e.t,del:1};return}
    if(mine&&!mine.del)return;
    if(!e.r||e.r.id==null)return;
    add.push(Object.assign({},e.r));m.r[id]={h:hr(e.r),t:e.t};n++;
  });
  add.sort((a,b)=>(+b.id||0)-(+a.id||0));
  if(n){
    applying=true;
    try{R=add.concat(keep);save()}finally{applying=false}
    const s=document.body.dataset.screen;
    if(s==='home'&&typeof drawHome==='function')drawHome();
    else if(s==='mine')go('mine');
  }
  const rc=d.courses;
  if(rc&&Array.isArray(rc.items)){
    const lh=hash(JSON.stringify(rc.items)),lc=m.c||{h:'',t:0};
    const nowh=hash(JSON.stringify(rd(KC,[])));
    if(lh!==lc.h&&nowh===lc.h){put(KC,JSON.stringify(rc.items));m.c={h:lh,t:rc.t};res.reload=true}
    else if(lh===lc.h)m.c={h:lh,t:rc.t};
  }
  res.n=n;return res;
}
function reloadOnce(){const t=+sessionStorage.getItem('as_rl')||0;if(Date.now()-t<60000)return;sessionStorage.setItem('as_rl',String(Date.now()));location.reload()}

async function sync(){
  clearTimeout(timer);
  if(!conf()){msg('Non configuré : renseignez l\'adresse et le code dans « Assistant IA » ci-dessous.');return}
  if(busy){again=true;return}
  busy=true;msg('Synchronisation en cours…');
  const m=rd(KM,null)||{r:{},c:null,init:0};
  try{
    const doc=build(m);
    localStorage.setItem(KM,JSON.stringify(m));
    const body=JSON.stringify({doc:doc});
    if(body.length>2500000)throw new Error('Données trop volumineuses : supprimez des recettes.');
    const u=(localStorage.getItem(K1)||'').replace(/\/+$/,''),c=localStorage.getItem(K2)||'';
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),30000);
    let r;
    try{r=await fetch(u+'/sync',{method:'POST',headers:{'Content-Type':'application/json','X-Access-Code':c},body:body,signal:ctl.signal})}
    finally{clearTimeout(to)}
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.error)throw new Error(j.error||('Erreur '+r.status));
    if(!j.doc||!j.doc.recettes)throw new Error('Réponse illisible');
    const res=apply(j.doc,m);
    m.init=1;
    localStorage.setItem(KM,JSON.stringify(m));
    msg('Synchronisé à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+(res.n?' · '+res.n+' recette(s) mise(s) à jour':'')+'.');
    if(res.reload)reloadOnce();
  }catch(e){
    if(e&&e.name==='AbortError')msg('Délai dépassé, nouvel essai plus tard.');
    else if(e instanceof TypeError)msg('Service injoignable (hors ligne ?).');
    else msg('Échec : '+(e&&e.message||e));
  }finally{busy=false;if(again){again=false;schedule()}}
}
Q('#asNow').onclick=()=>sync();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync()});
window.addEventListener('online',()=>sync());
setInterval(()=>{if(document.visibilityState==='visible'&&document.body.dataset.screen!=='cook')sync()},120000);
setTimeout(()=>sync(),1500);
})();