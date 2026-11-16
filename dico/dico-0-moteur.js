/* DICO moteur : réécrit ce que vous dites vers les commandes que voice.js comprend */
(function(){
const D=window.DICO=window.DICO||{};
D.rules=D.rules||[];D.qa=D.qa||[];
const norm=s=>String(s==null?'':s).toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae')
 .replace(/(\d),(\d)/g,'$1.$2').replace(/(\d)\.(\d)/g,'$1_$2')
 .replace(/[’'`]/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[^a-z0-9_ ]/g,' ').replace(/(\d)_(\d)/g,'$1.$2').replace(/_/g,' ').replace(/\s+/g,' ').trim();
D.norm=norm;
D.NB='(?:[0-9]+|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante)';
D.NBU='(?:(?:'+D.NB+'(?: '+D.NB+')?) (?:minutes?|min|mn|secondes?|sec|heures?|h)(?: et demie?| et quart)?|demi heure|une demi heure|quart d heure|un quart d heure|trois quarts d heure)';
const PRE='^(?:(?:ok|okay|bon|alors|allez|euh|hop|donc|bah|et|hein|voila|eh bien)\\s+)*(?:';
const POST=')(?:\\s+(?:s il (?:te|vous) plait|stp|svp|merci|chef|maintenant|tout de suite|la|vite|please))*$';
D.add=function(list,only){let n=0;list.forEach(r=>{try{D.rules.push([new RegExp(PRE+r[0]+POST),r[1],r[2]||only||null]);n++}catch(e){console.warn('DICO : règle ignorée',r[0])}});return n};
D.alts=function(canon,arr,only){return D.add([['(?:'+arr.join('|')+')',canon]],only)};
D.qaAdd=function(list){list.forEach(r=>{try{D.qa.push([new RegExp(r[0]),r[1],r[2]])}catch(e){console.warn('DICO : réponse ignorée',r[0])}})};
D.fix=function(raw){
  const t=norm(raw);if(!t)return raw;
  const t2=t.replace(/\b(\d+) (?:heures?|h) (\d+)\b(?! (?:minutes?|min|mn))/g,'$1 heures $2 minutes');
  const sc=(document.body&&document.body.dataset.screen)||'';
  for(let i=0;i<D.rules.length;i++){const r=D.rules[i];if(r[2]&&r[2].indexOf(sc)<0)continue;if(r[0].test(t))return t.replace(r[0],r[1]).trim()}
  return t2!==t?t2:raw;
};
D.answer=function(raw,say){
  const t=norm(raw);if(!t)return null;
  for(let i=0;i<D.qa.length;i++){const q=D.qa[i],m=t.match(q[0]);if(!m)continue;
    let a=null;try{a=typeof q[1]==='function'?q[1](m,t):q[1]}catch(e){}
    if(a){say(a);return 'Réponse : '+(q[2]||'info')}}
  return null;
};
D.wakefix=function(t){return String(t).replace(/^\s*((?:ok|okay|hey|dis|salut|eh|oh)[\s,]+)?(?:chief|shef|sheff|cheff|chaif|chèf|chèfe|chefe|shèf)\b/i,'$1chef')};
D.test=s=>D.fix(s);
setTimeout(()=>console.info('DICO : '+D.rules.length+' règles, '+D.qa.length+' réponses'),500);
})();
