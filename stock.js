/* STOCK v2 : recalcul de la recette selon ce que j'ai */
(function(){
const Q=s=>document.querySelector(s);
if(typeof R==='undefined'||typeof scale==='undefined'||typeof drawBody==='undefined'||typeof openRecipe==='undefined'||typeof drawCook==='undefined'||typeof save==='undefined')return;
if(window.__stock2)return;window.__stock2=1;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf2=n=>String(Math.round(n*100)/100).replace('.',',');
const r1=n=>Math.round(n*10)/10;
const NUM='(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?)';
const MASS={kg:1000,kilo:1000,kilos:1000,g:1,gramme:1,grammes:1,mg:0.001};
const VOL={l:1000,litre:1000,litres:1000,dl:100,cl:10,ml:1};
const RU=/^(kg|kilos?|grammes?|g|mg|litres?|l|dl|cl|ml)(?![a-z\u00e0-\u00ff])\s*(.*)$/i;
const SU=/^(c\.?\s*\u00e0\s*(?:soupe|caf\u00e9)|cuill?[e\u00e8]res?\s+\u00e0\s+(?:soupe|caf\u00e9)|pinc\u00e9es?|gousses?|tranches?|verres?|bo\u00eetes?|sachets?|brins?|feuilles?|bouquets?|noix|pots?)(?=\s|$)\s*(.*)$/i;
const keyU=s=>s.toLowerCase().replace(/\s+/g,' ').replace(/^cuill?[e\u00e8]res? \u00e0 /,'c. \u00e0 ').replace(/s$/,'').trim();
const num=s=>{s=s.trim();if(s.indexOf('/')>=0){const p=s.split(/\s+/),f=p.pop().split('/');return (p[0]?+p[0]:0)+f[0]/f[1]}return parseFloat(s.replace(',','.'))};

function parse(line){
  const m=String(line).trim().match(new RegExp('^'+NUM+'\\s*(.*)$'));
  if(!m)return null;
  const v=num(m[1]);if(!isFinite(v)||v<=0)return null;
  const rest=m[2];let u=rest.match(RU);
  if(u){const k=u[1].toLowerCase();
    if(k in MASS)return{v:v,kind:'m',base:v*MASS[k],u:k,ut:u[1],label:u[2].trim()};
    return{v:v,kind:'v',base:v*VOL[k],u:k,ut:u[1],label:u[2].trim()}}
  u=rest.match(SU);
  if(u)return{v:v,kind:'c',base:v,u:keyU(u[1]),ut:u[1],label:u[2].trim()};
  return{v:v,kind:'c',base:v,u:'',ut:'',label:rest.trim()};
}
const hint=p=>p.kind==='m'?'545 g':p.kind==='v'?'20 cl':'2';
function interp(p,txt){
  const h=parse(txt);
  if(!h)return{err:'Valeur illisible (exemple : '+hint(p)+')'};
  const bare=h.kind==='c'&&!h.u&&!h.label;
  if(p.kind==='m'){if(h.kind==='m')return{b:h.base};if(bare)return{b:h.v};return{err:'Unit\u00e9 incompatible (attendu : g ou kg)'}}
  if(p.kind==='v'){if(h.kind==='v')return{b:h.base};if(bare)return{b:h.v*VOL[p.u]};return{err:'Unit\u00e9 incompatible (attendu : cl, l ou ml)'}}
  if(h.kind==='c'&&(!h.u||h.u===p.u))return{b:h.v};
  return{err:'Unit\u00e9 incompatible (attendu : un nombre)'};
}
function fmt(p,b){
  let q;
  if(p.kind==='m'){q=b>=1000?nf2(b/1000)+' kg':b>=10?Math.round(b)+' g':nf2(r1(b))+' g'}
  else if(p.kind==='v'){q=b>=1000?nf2(b/1000)+' l':(b>=50&&p.u!=='ml')?nf2(r1(b/10))+' cl':Math.round(b)+' ml'}
  else{let x=Math.round(b*4)/4;if(x<0.25)x=0.25;q=nf2(x)+(p.ut?' '+p.ut:'')}
  return (q+' '+p.label).trim();
}

/* mise a l'echelle des lignes d'ingredients (remplace scale d'app.js) */
const os=scale;
scale=function(l,k){const p=parse(l);if(!p)return os(l,k);if(k===1)return String(l).trim();return fmt(p,p.base*k)};

/* quantites citees dans le texte des etapes (poids et volumes seulement, jamais les durees) */
const TX=/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|dl|l)(?![a-z\u00e0-\u00ff])/gi;
function scaleText(t,k){
  if(Math.abs(k-1)<0.001)return t;
  return String(t).replace(TX,(a,n,u)=>{
    const x=u.toLowerCase(),v=num(n);if(!isFinite(v))return a;
    const m=x in MASS;
    return fmt({kind:m?'m':'v',u:x,label:''},v*(m?MASS[x]:VOL[x])*k);
  });
}
function withSteps(fn){
  const k=(typeof cur!=='undefined'&&cur)?pers/cur.portions:1;
  const orig=(typeof cur!=='undefined'&&cur)?cur.etapes:null;
  if(orig)cur.etapes=orig.map(t=>scaleText(t,k));
  try{fn()}finally{if(orig)cur.etapes=orig}
  return k;
}

/* ce que j'ai */
let errs={};
function limit(){
  const d=cur.dispo||{};let f=null,w=-1;
  Object.keys(d).forEach(n=>{
    const p=parse(cur.ing[n]);if(!p)return;
    const h=interp(p,d[n]);if(h.err)return;
    const r=h.b/p.base;if(f===null||r<f){f=r;w=+n}
  });
  return f===null?null:{f:f,n:w};
}
function target(){const l=limit();return(l&&l.f>0)?Math.max(0.1,Math.round(cur.portions*l.f*100)/100):cur.portions}
function apply(){pers=target()}
function numKeys(){const d=cur.dispo||{};return Object.keys(d).filter(n=>{const p=parse(cur.ing[n]);return p&&!interp(p,d[n]).err})}
function onHave(n,txt){
  txt=String(txt).trim();
  const d=cur.dispo=cur.dispo||{};
  errs={};
  if(!txt)delete d[n];
  else{
    const p=parse(cur.ing[n]),h=p?interp(p,txt):{err:'Cet ingr\u00e9dient n\'a pas de quantit\u00e9'};
    if(h.err)errs[n]={m:h.err,t:txt};else d[n]=txt;
  }
  apply();save();drawBody();errs={};
}
function onFlag(n,v){
  const d=cur.dispo=cur.dispo||{};
  if(d[n]===v)delete d[n];else d[n]=v;
  save();drawBody();
}

const od=drawBody;
drawBody=function(){
  const k=withSteps(od);
  const pe=Q('#pers');if(pe)pe.textContent=nf2(pers);
  if(typeof cur==='undefined'||!cur)return;
  const off=Math.abs(k-1)>=0.15;
  if(typeof tab!=='undefined'&&tab==='prep'){
    const ol=Q('#rbody .steps');
    if(ol&&off){const n=document.createElement('p');n.className='durnote';n.textContent='Quantit\u00e9s adapt\u00e9es \u00e0 '+nf2(pers)+' portions. Les dur\u00e9es de cuisson ne changent pas : surveillez la cuisson.';ol.before(n)}
    return;
  }
  if(typeof tab==='undefined'||tab!=='ing')return;
  const ul=Q('#rbody .ings');if(!ul)return;
  const d=cur.dispo||{},has=numKeys().length>0;
  const bar=document.createElement('div');bar.className='stockbar';
  if(has){
    const lim=limit(),wl=lim?parse(cur.ing[lim.n]):null;
    let h='Quantit\u00e9s pour <b>'+nf2(pers)+'</b> portions (<b>'+Math.round(k*100)+' %</b> de la recette), compar\u00e9es \u00e0 ce que vous avez.';
    if(wl)h+=' Ingr\u00e9dient qui fixe la quantit\u00e9 : <b>'+E(wl.label||cur.ing[lim.n])+'</b>.';
    if(Math.abs(pers-target())>0.01)h+='<button type="button" id="stockFit">Revenir au maximum avec mon stock ('+nf2(target())+' portions)</button>';
    h+='<button type="button" id="stockReset">Tout remettre \u00e0 la base</button>';
    bar.innerHTML=h;
  }else{
    bar.textContent='Indiquez sous un ingr\u00e9dient ce que vous avez : toute la recette est recalcul\u00e9e.';
  }
  ul.before(bar);
  const rb=Q('#stockReset');
  if(rb)rb.onclick=()=>{cur.dispo={};errs={};pers=cur.portions;save();drawBody()};
  const fb=Q('#stockFit');
  if(fb)fb.onclick=()=>{apply();drawBody()};
  [...ul.children].forEach((li,n)=>{
    const p=parse(cur.ing[n]);
    const div=document.createElement('div');div.className='have';
    if(!p){
      const v=d[n];
      div.innerHTML='<button type="button" data-v="oui" class="'+(v==='oui'?'on':'')+'">J\'en ai</button><button type="button" data-v="non" class="'+(v==='non'?'on no':'')+'">Il m\'en manque</button>';
      div.addEventListener('click',e=>{const b=e.target.closest('button');if(b){e.preventDefault();e.stopPropagation();onFlag(n,b.dataset.v)}});
      li.appendChild(div);return;
    }
    let st='',val=d[n]||'';
    if(errs[n]){st='<small class="ko">'+E(errs[n].m)+'</small>';val=errs[n].t}
    else if(d[n]!==undefined){
      const h=interp(p,d[n]),need=p.base*k;
      if(!h.err){st=h.b>=need*0.99?'<small class="ok">\u2713 suffisant</small>':'<small class="ko">Il manque '+E(fmt(p,need-h.b))+'</small>'}
    }
    const bs=Math.abs(k-1)>0.001?'<small class="base">Recette d\'origine : '+E(String(cur.ing[n]).trim())+'</small>':'';
    div.innerHTML='<input type="text" inputmode="decimal" autocomplete="off" placeholder="J\'ai (ex. '+hint(p)+')" value="'+E(val)+'" aria-label="Quantit\u00e9 que j\'ai">'+st+bs;
    const inp=div.querySelector('input');
    inp.addEventListener('change',e=>{e.stopPropagation();onHave(n,inp.value)});
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();inp.blur()}});
    li.appendChild(div);
  });
};

/* ouverture d'une fiche */
const oo=openRecipe;
openRecipe=function(id){
  oo(id);errs={};
  if(!cur)return;
  /* boutons - et + : nombres entiers */
  const mn=Q('#mn'),pl=Q('#pl');
  if(mn)mn.onclick=()=>{if(pers>1){pers=Math.max(1,Math.ceil(pers-0.0001)-1);drawBody()}};
  if(pl)pl.onclick=()=>{if(pers<99){pers=Math.min(99,Math.floor(pers+0.0001)+1);drawBody()}};
  if(cur.dispo&&numKeys().length){apply();drawBody()}
  /* liste de courses : ignorer ce que j'ai en quantite suffisante */
  const b=Q('#addCart');
  if(b&&b.onclick){
    const old=b.onclick;
    b.onclick=function(e){
      const extra=[],d=cur.dispo||{},k=pers/cur.portions;
      Object.keys(d).forEach(key=>{
        const n=+key;if(checked.has(n))return;
        const p=parse(cur.ing[n]);
        if(!p){if(d[key]==='oui'){checked.add(n);extra.push(n)}return}
        const h=interp(p,d[key]);
        if(!h.err&&h.b>=p.base*k*0.99){checked.add(n);extra.push(n)}
      });
      try{return old.call(b,e)}finally{extra.forEach(n=>checked.delete(n))}
    };
  }
};

/* mode cuisine */
const odc=drawCook;
drawCook=function(){
  const k=withSteps(odc);
  const b=Q('#cdr b');
  if(b&&cur&&Math.abs(pers-Math.round(pers))>0.001)b.textContent='Pour '+nf2(pers)+' portions (selon vos quantit\u00e9s)';
  if(cur&&Math.abs(k-1)>=0.15){
    const s=Q('.cstep');
    if(s){const n=document.createElement('p');n.className='durnote';n.textContent='Dur\u00e9es inchang\u00e9es : surveillez la cuisson.';s.after(n)}
  }
};
})();