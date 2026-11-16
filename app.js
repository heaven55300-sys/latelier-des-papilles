const $ = s => document.querySelector(s);
let recettes = JSON.parse(localStorage.getItem('recettes') || '[]');
const save = () => localStorage.setItem('recettes', JSON.stringify(recettes));

// Navigation
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(x => x.classList.remove('on'));
  $('#' + b.dataset.p).classList.add('active');
  b.classList.add('on');
});

// Calculateur de quantités
function frac(s){ if(s.includes('/')){const [a,b]=s.split('/');return a/b;} return parseFloat(s.replace(',','.')); }
function mise(ligne, ratio){
  const m = ligne.trim().match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if(!m) return ligne;
  const q = Math.round(frac(m[1]) * ratio * 100) / 100;
  return q + ' ' + m[2];
}

function afficher(){
  const L = $('#liste');
  if(!recettes.length){ L.innerHTML = '<p class="info">Aucune recette. Va dans « Créer ».</p>'; return; }
  L.innerHTML = recettes.map(r => `
    <div class="card" data-id="${r.id}">
      <h3>${r.titre}</h3>
      <span class="tag">${r.mode}</span>
      <div class="calc">Pour <input type="number" min="1" value="${r.portions}" class="np"> personnes</div>
      <ul class="ing"></ul>
      <p>${(r.etapes||'').replace(/\n/g,'<br>')}</p>
      ${r.source ? `<a href="${r.source}" target="_blank" style="color:#00e5ff">Source</a>` : ''}
      <br><button class="del">Supprimer</button>
    </div>`).join('');
  document.querySelectorAll('.card').forEach(c => {
    const r = recettes.find(x => x.id == c.dataset.id);
    const maj = () => {
      const ratio = (c.querySelector('.np').value || r.portions) / r.portions;
      c.querySelector('.ing').innerHTML = r.ingredients.map(i => `<li>${mise(i, ratio)}</li>`).join('');
    };
    c.querySelector('.np').oninput = maj; maj();
    c.querySelector('.del').onclick = () => { recettes = recettes.filter(x => x.id != r.id); save(); afficher(); };
  });
}

$('#form').onsubmit = e => {
  e.preventDefault();
  recettes.push({
    id: Date.now(), titre: $('#titre').value, portions: +$('#portions').value, mode: $('#mode').value,
    ingredients: $('#ingredients').value.split('\n').filter(x => x.trim()),
    etapes: $('#etapes').value, source: $('#source').value
  });
  save(); e.target.reset(); afficher();
  document.querySelector('nav button[data-p=recettes]').click();
};

// Caméra
let stream;
$('#startCam').onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    $('#video').srcObject = stream;
  } catch (e) { alert('Caméra indisponible : ' + e.message); }
};
$('#snap').onclick = () => {
  const v = $('#video'), c = $('#canvas');
  if(!v.videoWidth) return alert("Active d'abord la caméra");
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  $('#photo').src = c.toDataURL('image/jpeg', .8);
};

$('#importBtn').onclick = () => {
  $('#source').value = $('#importTxt').value.startsWith('http') ? $('#importTxt').value : '';
  document.querySelector('nav button[data-p=creer]').click();
};

if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
afficher();
