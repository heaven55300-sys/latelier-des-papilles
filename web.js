(function(){
const Q=s=>document.querySelector(s);
if(!Q('#robotbar')||!Q('#webbox'))return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='atelier_robot';
const GROUPS=[
['Thermomix (Vorwerk)',['Thermomix TM7','Thermomix TM6','Thermomix TM5','Thermomix TM31']],
['Monsieur Cuisine (Lidl)',['Monsieur Cuisine Connect','Monsieur Cuisine Smart','Monsieur Cuisine Trend','Monsieur Cuisine Edition Plus']],
['Moulinex / Seb',['Moulinex Companion XL','Moulinex i-Companion Touch XL','Moulinex Cookeo+','Moulinex Cookeo Touch']],
['Magimix',['Magimix Cook Expert']],
['Kenwood',['Kenwood Cooking Chef XL','Kenwood kCook Multi Smart']],
['Bosch',['Bosch Cookit']],
['Krups',['Krups Prep&Cook']],
['Multicuiseurs et friteuses',['Ninja Foodi','Instant Pot','Airfryer']],
['Autre',['Autre robot']]
];
const ALL=[].concat(...GROUPS.map(g=>g[1]));
if(typeof ROBOTS!=='undefined')ALL.forEach(m=>{if(!ROBOTS.includes(m))ROBOTS.push(m)});
const SITES=[
['YouTube','▶️',e=>'https://www.youtube.com/results?search_query='+e],
['TikTok','🎵',e=>'https://www.tiktok.com/search?q='+e],
['Instagram','📸',e=>'https://www.google.com/search?q=site%3Ainstagram.com+'+e],
['Facebook','👍',e=>'https://www.facebook.com/search/videos/?q='+e],
['Pinterest','📌',e=>'https://www.pinterest.com/search/pins/?q='+e],
['Marmiton','🍽️',e=>'https://www.marmiton.org/recettes/recherche.aspx?aqt='+e],
['Google','🔎',e=>'https://www.google.com/search?q='+e]
];
let robot=localStorage.getItem(KEY)||'Thermomix TM6';
const lab=m=>m==='Autre robot'?'Autre robot (je saisis le nom)':m;
const groupsHtml=()=>GROUPS.map(g=>'<optgroup label="'+E(g[0])+'">'+g[1].map(m=>'<option value="'+E(m)+'">'+E(lab(m))+'</option>').join('')+'</optgroup>').join('');

function fillSelect(){
  const sel=Q('#robotSel');
  let h=groupsHtml();
  if(!ALL.includes(robot))h='<optgroup label="Mon robot"><option value="'+E(robot)+'">'+E(robot)+'</option></optgroup>'+h;
  sel.innerHTML=h;sel.value=robot;
}
Q('#robotSel').onchange=()=>{
  let v=Q('#robotSel').value;
  if(v==='Autre robot'){const n=(prompt('Nom de votre robot (marque et modèle) :')||'').trim();v=n||robot}
  robot=v;localStorage.setItem(KEY,robot);fillSelect();update();
};

const md=Q('#mode');
if(md)md.innerHTML='<optgroup label="Sans robot"><option>Plaque de cuisson</option><option>Four</option><option>Plaque + Four</option></optgroup>'+groupsHtml();

function update(){
  const f=typeof filt!=='undefined'?filt:'all';
  const q=(Q('#q').value||'').trim();
  const wb=Q('#webbox');
  Q('#robotbar').hidden=f!=='robot';
  const modeOn=['robot','four','plaque'].includes(f);
  if(f==='fav'||(!q&&!modeOn)){wb.hidden=true;wb.innerHTML='';return}
  let suf='',lb='Aucun';
  if(f==='robot'){suf=robot;lb=robot}
  else if(f==='four'){suf='au four';lb='Four'}
  else if(f==='plaque'){suf='plaque de cuisson';lb='Plaque de cuisson'}
  if(!q){
    wb.innerHTML='<h3>Chercher sur le web</h3><p>Mode : <b>'+E(lb)+'</b>. Tapez un plat ou un ingrédient dans la barre de recherche pour trouver des vidéos et des recettes.</p>';
    wb.hidden=false;return;
  }
  const full=('recette '+q+' '+suf).trim(),e=encodeURIComponent(full);
  wb.innerHTML='<h3>Chercher sur le web</h3><p>« '+E(full)+' »</p><div class="wl">'+
    SITES.map(s=>'<a href="'+s[2](e)+'" target="_blank" rel="noopener noreferrer"><span>'+s[1]+'</span>'+s[0]+'</a>').join('')+'</div>';
  wb.hidden=false;
}
Q('#q').addEventListener('input',update);
['#chips','#saison'].forEach(s=>Q(s).addEventListener('click',()=>setTimeout(update,0)));
document.querySelectorAll('.bento .b[data-f]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{
  update();
  if(b.dataset.f==='robot')Q('#robotbar').scrollIntoView({behavior:'smooth',block:'center'});
},60)));
fillSelect();update();
})();
