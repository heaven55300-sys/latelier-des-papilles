(function(){
const Q=s=>document.querySelector(s),QA=s=>[...document.querySelectorAll(s)];
if(typeof R==='undefined')return;
const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
const I={
home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
plus:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
heart:'<path d="M12 20s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.1-8 11-8 11z"/>',
pencil:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
pot:'<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h2M20 10h2"/><path d="M9 6c0-1.5 1-1.5 1-3M14 6c0-1.5 1-1.5 1-3"/>',
bolt:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
dice:'<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/>',
leaf:'<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l8-8"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const DISH=[[/mijot|daube|b.uf/i,'boeuf.jpg'],[/p.tes|spaghetti/i,'pates.jpg'],[/cr.pe/i,'crepes.jpg']];
const IDEA=[[/asperge/i,'asperges.jpg'],[/fraise/i,'fraises.jpg'],[/.pinard/i,'epinards.jpg'],[/omelette/i,'omelette.jpg'],[/carotte/i,'carottes.jpg'],
[/gaspacho/i,'gaspacho.jpg'],[/courgette/i,'courgettes.jpg'],[/p.che/i,'peches.jpg'],[/compos/i,'salade.jpg'],[/pizza/i,'pizza.jpg'],
[/potiron/i,'potiron.jpg'],[/champignon/i,'champignons.jpg'],[/tatin/i,'tatin.jpg'],[/ch.taigne/i,'chataignes.jpg'],[/daube/i,'daube.jpg'],
[/tartiflette/i,'tartiflette.jpg'],[/pot-au-feu/i,'potaufeu.jpg'],[/citron/i,'citron.jpg'],[/dauphinois/i,'gratin.jpg'],[/chocolat/i,'fondant.jpg']];
const pic=(l,t)=>{for(const x of l)if(x[0].test(t))return 'photos/'+x[1];return ''};

/* photos des recettes sans photo */
R.forEach(r=>{if(!r.photo){const p=pic(DISH,r.titre||'');if(p)r.photo=p}});

/* icônes fixes */
const nav={home:'home',create:'plus',fridge:'cam',import:'link',favs:'heart'};
QA('nav button').forEach(b=>{const s=b.querySelector('span');if(s&&nav[b.dataset.s])s.innerHTML=svg(I[nav[b.dataset.s]])});
const qk={fridge:'cam',import:'link',create:'pencil',robot:'pot'};
QA('.quick button').forEach(b=>{const s=b.querySelector('span');if(s&&qk[b.dataset.go])s.innerHTML=svg(I[qk[b.dataset.go]])});
const be=Q('.b-express .ico');if(be)be.innerHTML=svg(I.bolt);
const br=Q('.b-robot .ico');if(br)br.innerHTML=svg(I.pot);
const rnd=Q('#rnd');if(rnd)rnd.innerHTML=svg(I.dice)+' Surprends-moi';

/* éléments recréés dynamiquement */
function fixAll(){
  QA('#saison button span').forEach(s=>{if(!s.querySelector('svg'))s.innerHTML=svg(I.leaf)});
  QA('#ideas .idea').forEach(b=>{
    if(b.classList.contains('pic'))return;
    const p=pic(IDEA,b.dataset.n||'');
    if(p){b.classList.add('pic');b.style.backgroundImage='linear-gradient(to top,rgba(15,30,54,.88),rgba(15,30,54,.05) 75%),url("'+p+'")'}
  });
  QA('.badge,.badges2 span').forEach(b=>{
    const t=b.textContent;
    if(t.charAt(0)==='\u23F1'){
      const rest=t.replace(/^[\u23F1\uFE0F\s]+/,'');
      b.textContent='';b.insertAdjacentHTML('afterbegin',svg(I.clock));b.appendChild(document.createTextNode(rest));
    }
  });
  const tip=Q('#tip');
  if(tip&&/^\u{1F4A1}/u.test(tip.textContent))tip.textContent=tip.textContent.replace(/^\u{1F4A1}\s*/u,'');
}
let busy=false;
new MutationObserver(()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{fixAll();busy=false})}).observe(document.body,{childList:true,subtree:true});

if(typeof drawHome==='function')drawHome();
fixAll();
})();
