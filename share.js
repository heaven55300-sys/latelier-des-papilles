(function(){
const p=new URLSearchParams(location.search);
const t=(p.get('title')||'').trim(),x=(p.get('text')||'').trim(),u=(p.get('url')||'').trim();
if(!t&&!x&&!u)return;
const Q=s=>document.querySelector(s);
const find=s=>{const m=String(s).match(/https?:\/\/[^\s]+/);return m?m[0]:''};
const link=/^https?:\/\//.test(u)?u:(find(x)||find(t));
const clean=s=>s.replace(/https?:\/\/[^\s]+/g,'').replace(/\s+/g,' ').trim();
if(typeof go==='function')go('create');
const src=Q('#source'),ti=Q('#titre'),et=Q('#etapes'),form=Q('#form');
if(src&&link)src.value=link;
const tt=clean(t),xx=clean(x);
if(ti&&tt&&!ti.value)ti.value=tt.slice(0,80);
if(et&&xx&&!et.value)et.value=xx;
if(form&&!Q('#shareNote')){
  const n=document.createElement('p');n.id='shareNote';n.className='muted';
  n.textContent='Recette reçue par le partage. Complétez les ingrédients et enregistrez.';
  form.before(n);
}
try{history.replaceState(null,'',location.pathname)}catch(e){}
})();
