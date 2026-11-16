(function(){
const p=new URLSearchParams(location.search);
const t=(p.get('title')||'').trim(),x=(p.get('text')||'').trim(),u=(p.get('url')||'').trim();
if(!t&&!x&&!u)return;
const Q=s=>document.querySelector(s);
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const find=s=>{const m=String(s).match(/https?:\/\/[^\s]+/);return m?m[0]:''};
const link=/^https?:\/\//.test(u)?u:(find(x)||find(t));
const clean=s=>s.replace(/https?:\/\/[^\s]+/g,'').replace(/\s+/g,' ').trim();
const tt=clean(t),xx=clean(x);
try{history.replaceState(null,'',location.pathname)}catch(e){}

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
const P=link?plat(link):'Texte';
const note=xx||tt;
const defName=(tt||(xx?xx.slice(0,60):'Recette '+P)).slice(0,80);

const ov=document.createElement('div');ov.id='shareSheet';
ov.innerHTML='<div class="sh"><small>Reçu depuis '+E(P)+'</small><h2>Lien reçu</h2>'+
 (link?'<p class="lk">'+E(link)+'</p>':'')+
 (note?'<p class="nt">'+E(note.slice(0,300))+'</p>':'')+
 '<label for="shName">Nom de la recette</label><input id="shName" value="'+E(defName)+'">'+
 '<button class="pill" id="shSave" type="button">Enregistrer dans mes recettes</button>'+
 (link?'<a class="pill alt" id="shOpen" href="'+E(link)+'" target="_blank" rel="noopener noreferrer">Ouvrir la vidéo</a>':'')+
 '<button class="pill alt" id="shEdit" type="button">Compléter maintenant</button>'+
 '<button class="linkbtn" id="shClose" type="button">Fermer</button></div>';
document.body.appendChild(ov);

const close=()=>ov.remove();
Q('#shClose').onclick=close;
Q('#shEdit').onclick=()=>{
  close();
  if(typeof go==='function')go('create');
  const src=Q('#source'),ti=Q('#titre'),et=Q('#etapes');
  if(src&&link)src.value=link;
  if(ti)ti.value=Q('#shName')?Q('#shName').value:defName;
  if(et&&note&&!et.value)et.value=note;
};
Q('#shSave').onclick=()=>{
  const name=(Q('#shName').value||'').trim()||defName;
  if(typeof R==='undefined'||typeof save!=='function'){alert('Application non prête, réessayez.');return}
  const ex=link&&R.find(r=>r.source===link);
  if(ex){close();openRecipe(ex.id);return}
  const r={id:Date.now(),titre:name,portions:4,temps:0,diff:'Facile',mode:'À définir',
    ing:[],etapes:[note||'Voir la vidéo source.'],source:link,photo:'',fav:false};
  R.unshift(r);save();close();openRecipe(r.id);
};
})();
