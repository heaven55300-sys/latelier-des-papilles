(function(){
const Q=s=>document.querySelector(s);
const home=Q('#home'),hero=Q('#hero'),top=Q('#home .top');
if(!home||!hero||!top||typeof R==='undefined')return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const EMO=[[/bœuf|boeuf|viande|mijot|ragoût|daube/i,'🥘'],[/pâte|pate|spaghetti|lasagne|tagliatelle/i,'🍝'],[/crêpe|crepe|pancake|gaufre/i,'🥞'],[/poulet|volaille|dinde/i,'🍗'],[/soupe|velouté|potage/i,'🍲'],[/gâteau|gateau|tarte|dessert|chocolat|cookie|cake|brownie/i,'🍰'],[/salade/i,'🥗'],[/poisson|saumon|thon|cabillaud/i,'🐟'],[/pizza/i,'🍕'],[/burger/i,'🍔'],[/riz|risotto|curry/i,'🍚'],[/œuf|oeuf|omelette/i,'🍳']];
const emo=t=>{for(const x of EMO)if(x[0].test(t))return x[1];return '🍽️'};

const TIPS=[
"Sortez la viande du frigo 20 minutes avant de la cuire.",
"Salez l'eau des pâtes quand elle bout.",
"Laissez reposer la viande quelques minutes avant de la couper.",
"Ajoutez le zeste du citron en fin de cuisson pour plus de parfum.",
"Goûtez toujours avant de rectifier l'assaisonnement.",
"Préparez tous vos ingrédients avant d'allumer le feu.",
"Gardez un peu d'eau de cuisson des pâtes pour lier la sauce."
];
const IDEAS={
printemps:[['🥗',"Salade d'asperges"],['🍓','Tarte aux fraises'],['🥬',"Quiche aux épinards"],['🍳','Omelette aux herbes'],['🥕','Velouté de carottes']],
ete:[['🍅','Gaspacho'],['🥒','Tian de courgettes'],['🍑','Tarte aux pêches'],['🥗','Salade composée'],['🍕','Pizza maison']],
automne:[['🎃','Soupe de potiron'],['🍄','Risotto aux champignons'],['🍎','Tarte tatin'],['🌰','Velouté de châtaignes'],['🥘','Daube de bœuf']],
hiver:[['🧀','Tartiflette'],['🍲','Pot-au-feu'],['🍋','Tarte au citron'],['🥔','Gratin dauphinois'],['🍫','Fondant au chocolat']]
};
const LAB={printemps:'du printemps',ete:"de l'été",automne:"de l'automne",hiver:"de l'hiver"};
const season=()=>{try{return saison()}catch(e){return 'hiver'}};

/* --- blocs ajoutés --- */
const dash=document.createElement('div');dash.id='dash';
dash.innerHTML='<div class="surprise"><div><small id="dtag"></small><h2>Que cuisiner ?</h2><p id="dsub"></p></div><button id="rnd" class="pill sm" type="button">🎲 Surprends-moi</button></div>'+
'<div class="quick">'+
'<button type="button" data-go="fridge"><span>📷</span>Scanner frigo</button>'+
'<button type="button" data-go="import"><span>🔗</span>Importer</button>'+
'<button type="button" data-go="create"><span>✍️</span>Créer</button>'+
'<button type="button" data-go="robot"><span>🤖</span>Robot</button></div>'+
'<p id="tip"></p>';
top.after(dash);
const ideas=document.createElement('section');ideas.id='ideas';
hero.after(ideas);

function refresh(){
  const h=new Date().getHours();
  Q('#dtag').textContent=h<11?'Bon début de journée':h<15?'Idée pour le déjeuner':h<18?'Une envie gourmande ?':'Idée pour le dîner';
  const f=R.filter(r=>r.fav).length;
  Q('#dsub').textContent=R.length+' recette'+(R.length>1?'s':'')+' · '+f+' favori'+(f>1?'s':'');
  const s=season();
  ideas.innerHTML='<h2>Idées '+LAB[s]+'</h2><div class="rail">'+IDEAS[s].map(i=>'<button type="button" class="idea" data-n="'+E(i[1])+'"><span>'+i[0]+'</span>'+E(i[1])+'<small>Chercher sur le web</small></button>').join('')+'</div>';
}

dash.querySelector('.quick').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  const g=b.dataset.go;
  if(g==='robot'){const r=Q('.b-robot');if(r)r.click()}else go(g);
};
Q('#rnd').onclick=()=>{
  if(!R.length){go('create');return}
  openRecipe(R[Math.floor(Math.random()*R.length)].id);
};
ideas.onclick=e=>{
  const b=e.target.closest('.idea');if(!b)return;
  Q('#q').value=b.dataset.n;filt='all';
  Q('#q').dispatchEvent(new Event('input'));
  setTimeout(()=>{const w=Q('#webbox');if(w&&!w.hidden)w.scrollIntoView({behavior:'smooth',block:'center'})},150);
};

/* --- astuce qui change --- */
const tip=Q('#tip');let ti=Math.floor(Math.random()*TIPS.length);
tip.textContent='💡 '+TIPS[ti++%TIPS.length];
setInterval(()=>{
  if(document.body.dataset.screen!=='home')return;
  tip.style.opacity=0;
  setTimeout(()=>{tip.textContent='💡 '+TIPS[ti++%TIPS.length];tip.style.opacity=1},350);
},7000);

/* --- emojis sur la carte vedette et les cartes --- */
function deco(){
  const h=Q('#hero');
  if(h&&h.dataset.rid&&h.classList.contains('hero')){
    const r=R.find(x=>x.id==h.dataset.rid);
    const inn=h.querySelector('.in');
    if(inn&&!inn.querySelector('.goh')){const b=document.createElement('span');b.className='goh';b.textContent='Voir la recette →';inn.appendChild(b)}
    if(r&&!r.photo&&!h.querySelector('.emo')){const s=document.createElement('span');s.className='emo';s.textContent=emo(r.titre);h.appendChild(s)}
  }
  document.querySelectorAll('#grid .ph[data-rid],#favList .ph[data-rid]').forEach(el=>{
    if(el.querySelector('.emo'))return;
    const r=R.find(x=>x.id==el.dataset.rid);
    if(r&&!r.photo){const s=document.createElement('span');s.className='emo';s.textContent=emo(r.titre);el.appendChild(s)}
  });
}
const mo=new MutationObserver(deco);
['#hero','#grid','#favList'].forEach(s=>{const el=Q(s);if(el)mo.observe(el,{childList:true})});

/* --- masquer le bandeau pendant une recherche --- */
function sync(){
  const f=typeof filt!=='undefined'?filt:'all';
  home.classList.toggle('searching',!!Q('#q').value.trim()||f!=='all');
}
Q('#q').addEventListener('input',sync);
document.addEventListener('click',()=>setTimeout(sync,60));

/* --- rafraîchir en revenant à l'accueil --- */
const og=go;
go=function(n){og(n);if(n==='home'){refresh();sync();deco()}};

refresh();sync();deco();
})();
