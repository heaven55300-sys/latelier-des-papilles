/* DICO 6 : priorités, réponses ciblées, rattrapage des quasi-erreurs, journal */
(function(){
const D=window.DICO;if(!D||!D.alts){console.warn('dico-6 : moteur absent');return}
const RC=['recipe'];

D.first=function(fn){const n=D.rules.length;fn();const a=D.rules.splice(n);D.rules.unshift.apply(D.rules,a)};
D.first(function(){
 D.alts('ajoute la recette a ma liste de courses',['ajoute les ingredients a ma liste','ajoute les ingredients aux courses','ajoute les ingredients a ma liste de courses','mets les ingredients dans ma liste','mets tout dans ma liste','ajoute tout a ma liste','ajoute tout aux courses','envoie les ingredients dans ma liste','ajoute ca a ma liste','ajoute ca a ma liste de courses','ajoute ca aux courses','ajoute ce qui manque a ma liste','mets ce qui manque dans mes courses','ajoute les ingredients manquants','il me manque des ingredients','il me manque des trucs','il me manque des choses','j ai pas tout','je n ai pas tout','on a pas tout','on n a pas tout'],RC);
});

D.qa=D.qa.filter(function(q){return ['bœuf','noix de beurre','pincée','bouquet garni'].indexOf(q[2])<0});
D.qaAdd([
['(?:cuisson|temperature|combien de degres|cuire|cuit).*(?:steak|boeuf|viande rouge|entrecote|cote de boeuf)|(?:steak|boeuf|viande).*(?:saignant|a point|bien cuit)',"Bœuf à cœur, approximativement : saignant 50 à 52 degrés, à point 54 à 57, bien cuit 65 et plus. Viande hachée : 70 degrés.",'bœuf'],
['(?:c est quoi|qu est ce qu|combien|quelle quantite|ca fait combien).*noix de beurre',"Une noix de beurre, c'est environ 10 à 20 grammes.",'noix de beurre'],
['(?:c est quoi|qu est ce qu|combien|quelle quantite|ca fait combien).*pincee',"Une pincée, c'est ce que l'on prend entre le pouce et l'index, moins d'un gramme.",'pincée'],
['(?:c est quoi|qu est ce qu|de quoi|il y a quoi dans).*bouquet garni',"Un bouquet garni, c'est du thym, du laurier et du persil.",'bouquet garni']
]);
D.answerFirst=function(raw,say){
  const t=D.norm(raw).replace(/^(?:(?:ok|okay|hey|dis|salut|eh|oh) )*(?:chef )?/,'');
  if(/^(?:ajoute|rajoute|note|coche|decoche|ouvre|cherche|recherche|enleve|retire|supprime|efface|mets|met|achete|inscris|lance|demarre|affiche|montre)\b/.test(t))return null;
  return D.answer(raw,say);
};

const CANON={
 cook:['suivant','precedent','repete','pause','lance','ingredients','premiere etape','derniere etape'],
 recipe:['mode cuisine','ingredients','preparation','double','moitie'],
 other:['accueil','favoris','courses','frigo','creer','surprends moi','aide']
};
const HOMO={'pose':'pause','poze':'pause','pauze':'pause','pos':'pause','sui van':'suivant','suis vent':'suivant','suit vent':'suivant','sui vent':'suivant','suivent':'suivant','repeter':'repete','repetes':'repete','repaite':'repete','pre cedent':'precedent','lence':'lance','acceuil':'accueil','a cueil':'accueil','frigot':'frigo'};
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[];for(let j=0;j<=n;j++)p[j]=j;for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
const sim=(a,b)=>1-lev(a,b)/Math.max(a.length,b.length);
D.rescue=function(raw){
  const t=D.norm(raw);
  if(t.length<3||t.split(' ').length>3)return null;
  if(HOMO[t])return HOMO[t];
  const sc=(document.body&&document.body.dataset.screen)||'';
  const list=(CANON[sc]||[]).concat(sc==='cook'?[]:CANON.other);
  let best=null,bs=0;
  list.forEach(function(c){[t,t.replace(/ /g,'')].forEach(function(x){const s=sim(x,c);if(s>bs){bs=s;best=c}})});
  return bs>=0.84?best:null;
};

const LK='atelier_dico_log';
const getL=()=>{try{return JSON.parse(localStorage.getItem(LK)||'[]')}catch(e){return []}};
D.log=function(raw){
  try{
    const L=getL(),t=String(raw).trim().slice(0,120),sc=(document.body.dataset.screen)||'';
    if(!t)return;
    const e=L.find(function(x){return x.t===t&&x.s===sc});
    if(e)e.n++;else L.push({t:t,s:sc,n:1});
    localStorage.setItem(LK,JSON.stringify(L.slice(-200)));
  }catch(e){}
};
D.logText=function(){return getL().map(function(x){return x.s+' | '+x.t+' | x'+x.n}).join('\n')};
const vh=document.querySelector('#vhelp .vh');
if(vh&&!document.getElementById('vlog')){
  const b=document.createElement('button');b.id='vlog';b.type='button';
  const c=document.createElement('button');c.id='vlogx';c.type='button';c.textContent='Effacer le journal';
  const upd=function(){b.textContent='Copier les phrases non comprises ('+getL().length+')'};
  b.onclick=async function(){
    const t=D.logText();
    if(!t){alert('Aucune phrase non comprise pour le moment.');return}
    try{await navigator.clipboard.writeText(t);alert('Copié. Collez-le dans la conversation.')}catch(e){prompt('Copiez ce texte :',t)}
  };
  c.onclick=function(){if(confirm('Effacer le journal ?')){localStorage.removeItem(LK);upd()}};
  vh.appendChild(b);vh.appendChild(c);upd();
  const q=document.getElementById('vq');if(q)q.addEventListener('click',upd);
}
setTimeout(function(){console.info('DICO 6 : '+D.rules.length+' règles, '+D.qa.length+' réponses')},600);
})();
