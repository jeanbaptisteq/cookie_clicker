// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const BUILDINGS = [
  { id: 0, name: 'Patte de velours',   icon: '🐾', baseCost: 15,           baseCps: 0.1,
    desc: 'Une douce patte qui bat délicatement les croquettes vers vous.' },
  { id: 1, name: 'Chaton curieux',     icon: '😸', baseCost: 100,          baseCps: 0.5,
    desc: 'Un adorable chaton qui chasse les croquettes partout dans la maison.' },
  { id: 2, name: 'Champ de cataire',   icon: '🌿', baseCost: 1100,         baseCps: 4,
    desc: 'Un luxuriant champ de catnip qui attire les croquettes par magie herbale.' },
  { id: 3, name: 'Griffoir magique',   icon: '🪵', baseCost: 12000,        baseCps: 10,
    desc: 'Les chats griffent sans relâche pour déterrer des croquettes enfouies.' },
  { id: 4, name: 'Tour à chats',       icon: '🏰', baseCost: 130000,       baseCps: 40,
    desc: 'Une imposante tour multi-niveaux où des dizaines de chats produisent des croquettes.' },
  { id: 5, name: 'Café des Matous',    icon: '☕', baseCost: 1400000,      baseCps: 100,
    desc: 'Un café parisien tenu par des chats en tablier, servant des croquettes à la pelle.' },
  { id: 6, name: 'Temple Félin',       icon: '⛩️', baseCost: 20000000,     baseCps: 260,
    desc: 'D\'antiques chats prêtres vénèrent la déesse Croquette et récoltent ses offrandes.' },
  { id: 7, name: 'Chat Sorcier',       icon: '🧙', baseCost: 330000000,    baseCps: 1600,
    desc: 'Un mystérieux chat en cape qui invoque des croquettes depuis les dimensions parallèles.' },
  { id: 8, name: 'Chat de l\'Espace',  icon: '🚀', baseCost: 5100000000,   baseCps: 8888,
    desc: 'Des chats astronautes qui récoltent des croquettes cosmiques dans les étoiles.' },
  { id: 9, name: 'Chaton Quantique',   icon: '⚛️', baseCost: 75000000000,  baseCps: 47777,
    desc: 'Un chaton qui existe simultanément dans tous les états de croquette possibles.' },
];

// Cat evolution visuals:
// The game keeps the highest unlocked visual (based on owned building qty >= 1).
const CAT_BASE_IMAGE = 'assets/images/cat-base.png';
const CAT_EVOLUTIONS = [
  { buildingId: 1, image: 'assets/images/chaton-curieux.png' },
  { buildingId: 2, image: 'assets/images/champ-de-cataire.png' },
  { buildingId: 3, image: 'assets/images/griffoir-magique.png' },
  { buildingId: 4, image: 'assets/images/tour-a-chats.png' },
  { buildingId: 5, image: 'assets/images/cafe-des-matous.png' },
];

let lastValidCatImage = CAT_BASE_IMAGE;
let pawClickCarry = 0;
let pawOrbitCount = -1;

function setupCatImageFallback() {
  const catBtn = document.getElementById('cat-btn');
  if (!catBtn) return;
  lastValidCatImage = catBtn.getAttribute('src') || CAT_BASE_IMAGE;

  catBtn.addEventListener('load', () => {
    lastValidCatImage = catBtn.getAttribute('src') || lastValidCatImage;
  });

  catBtn.addEventListener('error', () => {
    // Keep the latest working version if one configured image is missing.
    if (catBtn.getAttribute('src') !== lastValidCatImage) {
      catBtn.src = lastValidCatImage;
    }
  });
}

function getBestCatEvolutionImage() {
  let best = CAT_BASE_IMAGE;
  CAT_EVOLUTIONS.forEach((evo) => {
    if ((G.bld[evo.buildingId]?.qty || 0) >= 1) best = evo.image;
  });
  return best;
}

function renderCatEvolution() {
  const catBtn = document.getElementById('cat-btn');
  if (!catBtn) return;
  const target = getBestCatEvolutionImage();
  if (catBtn.getAttribute('src') === target) return;
  catBtn.src = target;
}

function getPawOrbitCount() {
  const qty = G.bld[0]?.qty || 0;
  if (qty <= 0) return 0;
  return Math.min(qty, 120);
}

function getPawOrbitLayout(count, orbitSize) {
  if (count <= 0) return [];

  const ringOneRadius = orbitSize * 0.33;
  const ringTwoRadius = orbitSize * 0.46;
  const ringOneCount = count <= 60 ? count : 60;
  const ringTwoCount = count > 60 ? count - 60 : 0;
  const ringOneSize = count <= 24 ? 28 : count <= 60 ? 24 : 21;
  const ringTwoSize = 18;
  const result = [];

  for (let i = 0; i < ringOneCount; i++) {
    result.push({
      ring: 1,
      idx: i,
      ringCount: ringOneCount,
      radius: ringOneRadius,
      size: ringOneSize,
    });
  }

  for (let i = 0; i < ringTwoCount; i++) {
    result.push({
      ring: 2,
      idx: i,
      ringCount: ringTwoCount,
      radius: ringTwoRadius,
      size: ringTwoSize,
    });
  }

  return result;
}

function renderPawOrbit() {
  const orbit = document.getElementById('paws-orbit');
  if (!orbit) return;
  const count = getPawOrbitCount();
  if (count === pawOrbitCount) return;

  pawOrbitCount = count;
  orbit.innerHTML = '';
  if (count <= 0) return;

  const orbitSize = orbit.getBoundingClientRect().width || 300;
  const pawLayout = getPawOrbitLayout(count, orbitSize);
  pawLayout.forEach((cfg) => {
    const paw = document.createElement('div');
    paw.className = 'paw-cursor';
    paw.dataset.ring = String(cfg.ring);
    paw.style.setProperty('--ang', `${(360 / cfg.ringCount) * cfg.idx}deg`);
    paw.style.setProperty('--rad', `${cfg.radius}px`);
    paw.style.setProperty('--size', `${cfg.size}px`);
    paw.style.setProperty('--inner-tilt', `${cfg.ring === 1 ? 0 : 8}deg`);
    paw.style.setProperty('--tap-shift', `${cfg.ring === 1 ? 9 : 7}px`);
    paw.style.setProperty('--tap-scale', `${cfg.ring === 1 ? 1.16 : 1.13}`);
    orbit.appendChild(paw);
  });
}

function triggerPawAutoClickAnimation() {
  const orbit = document.getElementById('paws-orbit');
  if (!orbit) return;
  const paws = orbit.querySelectorAll('.paw-cursor');
  if (paws.length === 0) return;

  const target = paws[Math.floor(Math.random() * paws.length)];
  target.classList.remove('paw-click');
  void target.offsetWidth;
  target.classList.add('paw-click');
  setTimeout(() => target.classList.remove('paw-click'), 220);

  triggerCatAnim('cat-hit', 200);
}

function performAutoPawClick() {
  const power = computeClickPower();
  G.cookies += power;
  G.total += power;

  const catBtn = document.getElementById('cat-btn');
  if (catBtn) {
    const r = catBtn.getBoundingClientRect();
    spawnParticle(r.left + r.width * (0.45 + Math.random() * 0.1), r.top + r.height * (0.38 + Math.random() * 0.16));
  }
  triggerPawAutoClickAnimation();
}

// Per-building upgrade names (4 tiers each)
const BLD_UPG_NAMES = [
  ['Coussinets moelleux',    'Patte véloce',         'Griffe de velours',    'Patte bénie des dieux'],
  ['Chaton espiègle',        'Ronronnement amplifié','Pelage lustré',         'Chaton prodige'],
  ['Cataire Bio',            'Terreau fertile',      'Rosée de catnip',       'Cataire arcane'],
  ['Griffes acérées',        'Bois enchanté',        'Griffoir doré',         'Griffoir ancestral'],
  ['Étage supplémentaire',   'Hamac en soie',        'Tour renforcée',        'Tour légendaire'],
  ['Café spécial',           'Barista expert',       'Menu gourmet',          'Café étoilé Michelin'],
  ['Prières intenses',       'Offrandes dorées',     'Rituel sacré',          'Bénédiction divine'],
  ['Grimoire de base',       'Baguette en os',       'Sort amplifié',         'Magie ancestrale'],
  ['Fusée améliorée',        'Combinaison spatiale', 'Warp drive félin',      'Hypervitesse ronron'],
  ['Superposition féline',   'Intrication de poils', 'Tunnel quantique',      'Chat de Schrödinger²'],
];
const BLD_UPG_REQS        = [1,   5,   25,   50];   // min qty required
const BLD_UPG_COST_MULT   = [1,   5,   50,  500];   // × building base cost

// Build all upgrade definitions
const ALL_UPGRADES = (() => {
  const list = [];

  // Click upgrades
  list.push({
    id: 'c0', name: 'Griffes aiguisées', icon: '🐾',
    desc: 'Vos griffes s\'affûtent sur le parquet. +1 croquette par clic.',
    cost: 100,
    condition: s => s.bld[0].qty >= 1,
    effect:    s => { s.clickBonus += 1; },
  });
  list.push({
    id: 'c1', name: 'Pattes expertes', icon: '✋',
    desc: 'Vos pattes habiles récoltent 1 % des croquettes/sec à chaque clic.',
    cost: 2000,
    condition: s => s.bld[0].qty >= 10,
    effect:    s => { s.clickCpsPct += 0.01; },
  });
  list.push({
    id: 'c2', name: 'Coup de patte légendaire', icon: '⚡',
    desc: 'Un coup phénoménal ! +5 % des croquettes/sec s\'ajoute à chaque clic.',
    cost: 50000,
    condition: s => s.bld[0].qty >= 25,
    effect:    s => { s.clickCpsPct += 0.05; },
  });

  // Building upgrades
  BUILDINGS.forEach((b, bi) => {
    BLD_UPG_REQS.forEach((req, tier) => {
      list.push({
        id: `b${bi}_t${tier}`,
        name: BLD_UPG_NAMES[bi][tier],
        icon: b.icon,
        desc: `Améliore "${b.name}" (niv. ${tier + 1}). Production ×2 pour ce bâtiment.`,
        cost: Math.floor(b.baseCost * BLD_UPG_COST_MULT[tier]),
        condition: s => s.bld[bi].qty >= req,
        effect:    s => { s.bld[bi].mult *= 2; },
        bldId: bi,
        tier,
      });
    });
  });

  return list;
})();

// Short display names for empire cards
const BLD_SHORT = ['Patte', 'Chaton', 'Cataire', 'Griffoir', 'Tour', 'Café', 'Temple', 'Sorcier', 'Spatial', 'Quantique'];

// News headlines
const NEWS = [
  'Un chat a mangé 3 000 croquettes en une journée. Son propriétaire est en état de choc.',
  'Les scientifiques découvrent que le ronronnement des chats produit de l\'énergie croquette.',
  'Un chaton de 6 semaines brise le record mondial de production de croquettes. Mignon ET efficace.',
  'La bourse des croquettes atteint un niveau historique. Les chats exultent en silence.',
  'Étude : 94 % des chats préfèrent les croquettes aux caresses. Les 6 % restants mentent.',
  'Un chat sorcier aperçu dans le quartier. Les croquettes ont mystérieusement triplé.',
  'La Gazette rapporte : les croquettes quantiques existent dans deux dimensions à la fois.',
  'Message du Chat de l\'Espace : "Il y a des croquettes sur Mars. Envoyez plus de chats."',
  'Alerte météo : tempête de croquettes prévue ce soir. Les chats conseillent de rester à l\'intérieur.',
  'Le temple félin célèbre ses 10 000 ans de production. Les prêtres ronronnent de satisfaction.',
  'Le café des Matous étoilé au Michelin pour la 3e année. Le secret ? Des croquettes premium.',
  'Découverte archéologique : des croquettes vieilles de 5 000 ans retrouvées intactes. Les chats les ont mangées.',
  'Un chaton quantique a été observé manger et ne pas manger une croquette simultanément. Les physiciens sont déconcertés.',
  'Le Chat Sorcier refuse de révéler sa formule secrète. "Les croquettes, c\'est magique", répond-il.',
  'Nouveau record : 1 million de croquettes produites en une seconde. Les humains sont jaloux.',
];

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

let G = {
  cookies:     0,
  total:       0,
  clickBonus:  0,  // flat bonus per click
  clickCpsPct: 0,  // fraction of CPS added per click
  bld: BUILDINGS.map(() => ({ qty: 0, mult: 1 })),
  upg: ALL_UPGRADES.map(u => ({ id: u.id, bought: false })),
  fx: null,      // 'cps_boost' | 'frenzy' | null
  fxEnd: 0,
  nextFish: 0,
  newsIdx: 0,
  milestoneIdx: 0,
};

// ═══════════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════════

function computePassiveCps() {
  let cps = 0;
  BUILDINGS.forEach((b, i) => {
    if (i === 0) return; // Patte de velours is represented as auto-clickers around the cat
    cps += b.baseCps * G.bld[i].qty * G.bld[i].mult;
  });
  if (G.fx === 'cps_boost' && Date.now() < G.fxEnd) cps *= 7;
  return cps;
}

function computePawAutoCps() {
  let cps = BUILDINGS[0].baseCps * G.bld[0].qty * G.bld[0].mult;
  if (G.fx === 'cps_boost' && Date.now() < G.fxEnd) cps *= 7;
  return cps;
}

function computeCps() {
  return computePassiveCps() + computePawAutoCps();
}

function computeClickPower() {
  const cps = computeCps();
  return 1 + G.clickBonus + cps * G.clickCpsPct;
}

function isBuildingUnlocked(id) {
  if (id === 0) return true;
  return (G.bld[id - 1]?.qty || 0) >= 1 || (G.bld[id]?.qty || 0) > 0;
}

function bldCost(id) {
  return Math.ceil(BUILDINGS[id].baseCost * Math.pow(1.15, G.bld[id].qty));
}

// ═══════════════════════════════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════════════════════════════

function fmt(n) {
  n = Math.floor(n);
  if (n < 1000)   return n.toLocaleString('fr');
  if (n < 1e6)    return (n / 1e3).toFixed(1)  + '\u202fK';
  if (n < 1e9)    return (n / 1e6).toFixed(2)  + '\u202fM';
  if (n < 1e12)   return (n / 1e9).toFixed(2)  + '\u202fMrd';
  if (n < 1e15)   return (n / 1e12).toFixed(2) + '\u202fBio';
  return              (n / 1e15).toFixed(2) + '\u202fQua';
}

function fmtDec(n) {
  if (n < 1000) return n.toFixed(1);
  return fmt(n);
}

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════

function renderStats() {
  const cps   = computeCps();
  const click = computeClickPower();
  const now   = Date.now();

  // Mini stats in left panel
  document.getElementById('stat-mini-cookies').textContent = fmt(G.cookies) + ' croquettes';
  document.getElementById('stat-mini-total').textContent   = 'Total : ' + fmt(G.total);
  document.getElementById('stat-mini-cps').textContent     = fmtDec(cps) + ' / sec';
  document.getElementById('stat-mini-click').textContent   = fmtDec(click) + ' par clic';

  document.getElementById('stat-current').textContent   = fmt(G.cookies);
  document.getElementById('stat-total').textContent     = fmt(G.total);
  document.getElementById('stat-cps').textContent       = fmtDec(cps);
  document.getElementById('stat-click').textContent     = fmtDec(click);
  document.getElementById('stat-upgrades').textContent  = G.upg.filter(u => u.bought).length;
  document.getElementById('stat-buildings').textContent = G.bld.reduce((s, b) => s + b.qty, 0);

  document.title = '🐱 ' + fmt(G.cookies) + ' croquettes – Ronron Clicker';

  // Effect bar
  const bar = document.getElementById('effect-bar');
  if (G.fx && now < G.fxEnd) {
    bar.style.display = 'block';
    const secs = Math.ceil((G.fxEnd - now) / 1000);
    if (G.fx === 'cps_boost')
      bar.textContent = '🐟 Poisson Doré actif ! Production ×7 — ' + secs + ' s restantes';
    else
      bar.textContent = '🌟 Tempête de Croquettes ! — ' + secs + ' s restantes';
  } else {
    bar.style.display = 'none';
    if (G.fx && now >= G.fxEnd) G.fx = null;
  }
}

function renderUpgrades() {
  const wrap  = document.getElementById('upgrades-categories');
  const empty = document.getElementById('upgrades-empty');
  if (!wrap || !empty) return;
  wrap.innerHTML = '';

  const available = [];
  ALL_UPGRADES.forEach((upg, idx) => {
    if (G.upg[idx].bought) return;
    if (!upg.condition(G))  return;
    available.push({ upg, idx });
  });

  if (available.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  const categoryMap = new Map();
  const ensureCategory = (key, title) => {
    if (!categoryMap.has(key)) categoryMap.set(key, { title, items: [] });
    return categoryMap.get(key);
  };

  ensureCategory('click', 'Pouvoir du clic');
  BUILDINGS.forEach((b, i) => ensureCategory('bld_' + i, b.name));

  available.forEach(({ upg, idx }) => {
    const key = typeof upg.bldId === 'number' ? 'bld_' + upg.bldId : 'click';
    ensureCategory(key, upg.bldId != null ? BUILDINGS[upg.bldId].name : 'Pouvoir du clic').items.push({ upg, idx });
  });

  categoryMap.forEach((cat) => {
    if (cat.items.length === 0) return;
    const sec = document.createElement('section');
    sec.className = 'upg-category';

    const title = document.createElement('div');
    title.className = 'upg-title';
    title.textContent = cat.title;
    sec.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'upg-grid';

    cat.items.forEach(({ upg, idx }) => {
    const canAfford = G.cookies >= upg.cost;
    const btn = document.createElement('div');
    btn.className = 'upgrade-btn' + (canAfford ? '' : ' cant-afford');
    btn.dataset.idx = idx;
    btn.innerHTML = `
      <span>${upg.icon}</span>
      <div class="tip">
        <span class="tip-name">${upg.name}</span>
        ${upg.desc}
        <span class="tip-cost">Coût : ${fmt(upg.cost)} 🐾</span>
      </div>
    `;
    // Always attach — the handler checks affordability itself
    btn.addEventListener('click', () => {
      if (G.cookies >= ALL_UPGRADES[idx].cost && !G.upg[idx].bought) buyUpgrade(idx);
    });
    grid.appendChild(btn);
    });

    sec.appendChild(grid);
    wrap.appendChild(sec);
  });
}

function renderBuildings() {
  const list = document.getElementById('buildings-list');
  list.innerHTML = '';

  BUILDINGS.forEach((b, i) => {
    const qty    = G.bld[i].qty;
    const cost   = bldCost(i);
    const unlocked = isBuildingUnlocked(i);
    const afford = G.cookies >= cost;
    const cps    = b.baseCps * G.bld[i].mult;
    const totalC = cps * qty;

    const div = document.createElement('div');
    div.className = 'bld-item ' + (!unlocked ? 'bld-locked' : (afford ? 'bld-affordable' : 'bld-unaffordable'));
    div.dataset.bldId = i;

    div.innerHTML = `
      <div class="bld-icon">${b.icon}</div>
      <div class="bld-info">
        <div class="bld-name">${b.name}</div>
        <div class="bld-desc">${b.desc}</div>
        <div class="bld-stat">${qty > 0 ? fmtDec(totalC) + ' 🐾/sec total' : 'Aucun pour l\'instant'}</div>
      </div>
      <div class="bld-right">
        <div class="bld-qty">${qty}</div>
        <div class="bld-cost" style="color:${afford ? 'var(--accent)' : 'var(--disabled)'}">
          ${fmt(cost)} 🐾
        </div>
      </div>
      <div class="bld-tip">
        <div class="bld-tip-name">${b.name}</div>
        ${b.desc}<br>
        <span style="color:var(--highlight)">Produit : ${fmtDec(cps)} 🐾/sec chacun</span><br>
        <span style="color:var(--highlight)">Coût : ${fmt(cost)} 🐾</span>
      </div>
    `;

    // Always attach — the handler checks affordability itself
    div.addEventListener('click', () => {
      if (isBuildingUnlocked(i) && G.cookies >= bldCost(i)) buyBuilding(i);
    });
    list.appendChild(div);
  });
}

// Lightweight per-tick update — no DOM rebuilding, just class/text changes
function updateAffordability() {
  document.querySelectorAll('.bld-item[data-bld-id]').forEach(el => {
    const i    = parseInt(el.dataset.bldId);
    const cost = bldCost(i);
    const unlocked = isBuildingUnlocked(i);
    const can  = G.cookies >= cost;
    el.classList.toggle('bld-locked', !unlocked);
    el.classList.toggle('bld-affordable', unlocked && can);
    el.classList.toggle('bld-unaffordable', unlocked && !can);
    const costEl = el.querySelector('.bld-cost');
    if (costEl) {
      costEl.textContent  = fmt(cost) + ' 🐾';
      costEl.style.color  = unlocked ? (can ? 'var(--accent)' : 'var(--disabled)') : 'transparent';
    }
  });
  document.querySelectorAll('.upgrade-btn[data-idx]').forEach(el => {
    const can = G.cookies >= ALL_UPGRADES[parseInt(el.dataset.idx)].cost;
    el.classList.toggle('cant-afford', !can);
  });
}

function renderEmpire() {
  const grid  = document.getElementById('empire-grid');
  const empty = document.getElementById('empire-empty');
  if (!grid) return;

  grid.innerHTML = '';
  let anyOwned = false;

  BUILDINGS.forEach((b, i) => {
    const qty = G.bld[i].qty;
    if (qty === 0) return;
    anyOwned = true;

    const tier    = qty >= 50 ? 4 : qty >= 25 ? 3 : qty >= 5 ? 2 : 1;
    const cps     = b.baseCps * G.bld[i].mult * qty;
    const badge   = tier === 4 ? '👑' : tier === 3 ? '✨' : tier === 2 ? '⭐' : '';

    const card = document.createElement('div');
    card.className = `empire-card t${tier}`;
    card.title = `${b.name} — ${qty} possédé(s) — ${fmtDec(cps)} 🐾/sec`;
    card.innerHTML = `
      ${badge ? `<div class="empire-badge">${badge}</div>` : ''}
      <div class="empire-icon">${b.icon}</div>
      <div class="empire-qty">×${qty}</div>
      <div class="empire-name">${BLD_SHORT[i]}</div>
      <div class="empire-cps">${fmtDec(cps)}/s</div>
    `;
    grid.appendChild(card);
  });

  if (empty) empty.style.display = anyOwned ? 'none' : 'block';
}

function renderAll() {
  renderStats();
  renderCatEvolution();
  renderPawOrbit();
  renderUpgrades();
  renderBuildings();
  renderEmpire();
}

// ═══════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// SOUNDS (Web Audio API — no external files needed)
// ═══════════════════════════════════════════════════════════════

let _audioCtx = null;
function getACtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playTone(freq, type, vol, duration, startDelay = 0) {
  try {
    const ctx  = getACtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
    osc.start(ctx.currentTime + startDelay);
    osc.stop(ctx.currentTime + startDelay + duration + 0.01);
  } catch(e) {}
}

function sndClick()  { playTone(520, 'sine',     0.10, 0.08); playTone(380, 'sine', 0.05, 0.06, 0.05); }
function sndBuy()    { playTone(523, 'triangle', 0.16, 0.22); playTone(659, 'triangle', 0.14, 0.22, 0.14); }
function sndUpgrade(){ [523,659,784,1047].forEach((f,i) => playTone(f, 'sine', 0.13, 0.22, i*0.08)); }
function sndFish()   { [784,1047,1319,1568].forEach((f,i) => playTone(f, 'triangle', 0.14, 0.35, i*0.10)); }

// ═══════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════

function handleCatClick(evt) {
  const power = computeClickPower();
  G.cookies += power;
  G.total   += power;
  spawnParticle(evt.clientX, evt.clientY);
  sndClick();
  triggerCatAnim('cat-squish', 380);
}

function buyBuilding(id) {
  if (!isBuildingUnlocked(id)) return;
  const cost = bldCost(id);
  if (G.cookies < cost) return;
  G.cookies -= cost;
  G.bld[id].qty++;
  sndBuy();
  if (G.bld[id].qty === 1) toast('Premier(e) ' + BUILDINGS[id].name + ' acheté(e) ! 🐾');
  renderAll();
}

function buyUpgrade(idx) {
  const upg = ALL_UPGRADES[idx];
  if (G.cookies < upg.cost || G.upg[idx].bought) return;
  G.cookies -= upg.cost;
  G.upg[idx].bought = true;
  upg.effect(G);
  sndUpgrade();
  toast('Amélioration débloquée : ' + upg.name + ' ✨');
  renderAll();
}

// ═══════════════════════════════════════════════════════════════
// GOLDEN FISH
// ═══════════════════════════════════════════════════════════════

function scheduleFish() {
  // Random 3–8 minutes
  const delay = (Math.random() * 300 + 180) * 1000;
  G.nextFish = Date.now() + delay;
}

function checkFish() {
  if (G.nextFish > 0 && Date.now() >= G.nextFish) {
    G.nextFish = 0;
    spawnFish();
  }
}

function spawnFish() {
  const el = document.getElementById('golden-fish');
  const x  = Math.random() * (window.innerWidth  - 180) + 80;
  const y  = Math.random() * (window.innerHeight - 180) + 80;
  el.style.left    = x + 'px';
  el.style.top     = y + 'px';
  el.style.display = 'block';
  // Auto-despawn after 13 s
  setTimeout(() => {
    if (el.style.display !== 'none') {
      el.style.display = 'none';
      scheduleFish();
    }
  }, 13000);
}

function collectGoldenFish() {
  document.getElementById('golden-fish').style.display = 'none';
  const cps  = computeCps();
  const roll = Math.random();

  if (roll < 0.34) {
    const bonus = Math.max(cps * 777, 777);
    G.cookies += bonus;
    G.total   += bonus;
    toast('🐟 Poisson Doré ! +' + fmt(bonus) + ' croquettes !');
  } else if (roll < 0.67) {
    G.fx    = 'cps_boost';
    G.fxEnd = Date.now() + 77000;
    sndFish();
  toast('🐟 Poisson Doré ! Production ×7 pendant 77 secondes !');
  } else {
    const bonus = cps * 777 * 6;
    G.cookies += bonus;
    G.total   += bonus;
    G.fx      = 'frenzy';
    G.fxEnd   = Date.now() + 6000;
    toast('🌟 Tempête de Croquettes ! +' + fmt(bonus) + ' croquettes !');
  }

  scheduleFish();
  renderAll();
}

// ═══════════════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════════════

const PAWS = ['🐾', '✨', '⭐', '🐱'];
function spawnParticle(x, y) {
  const el = document.createElement('div');
  el.className   = 'particle';
  el.textContent = PAWS[Math.floor(Math.random() * PAWS.length)];
  el.style.left  = (x + (Math.random() - 0.5) * 40 - 9) + 'px';
  el.style.top   = (y - 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ═══════════════════════════════════════════════════════════════
// TOASTS & MILESTONES
// ═══════════════════════════════════════════════════════════════

function toast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.className   = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s';
    el.style.opacity    = '0';
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

// ── Cat animation helper ──────────────────────────────────────────
function triggerCatAnim(cls, duration) {
  const btn = document.getElementById('cat-btn');
  if (!btn) return;
  btn.classList.remove('cat-squish', 'cat-wobble', 'cat-twitch', 'cat-hit');
  // Force reflow so re-adding the same class restarts animation
  void btn.offsetWidth;
  btn.classList.add(cls);
  setTimeout(() => btn.classList.remove(cls), duration);
}

// Periodic random ear-twitch
(function scheduleTwitch() {
  setTimeout(() => {
    triggerCatAnim('cat-twitch', 450);
    scheduleTwitch();
  }, 7000 + Math.random() * 6000);
})();

const MILESTONES = [100, 1000, 10000, 100000, 1e6, 1e9, 1e12, 1e15];
function checkMilestones() {
  while (G.milestoneIdx < MILESTONES.length && G.total >= MILESTONES[G.milestoneIdx]) {
    toast('🎉 ' + fmt(MILESTONES[G.milestoneIdx]) + ' croquettes englouties ! Impressionnant !');
    triggerCatAnim('cat-wobble', 650);
    G.milestoneIdx++;
  }
}

// ═══════════════════════════════════════════════════════════════
// NEWS
// ═══════════════════════════════════════════════════════════════

function rotateNews() {
  const el = document.getElementById('news-text');
  el.style.transition = 'opacity 0.5s';
  el.style.opacity    = '0';
  setTimeout(() => {
    G.newsIdx  = (G.newsIdx + 1) % NEWS.length;
    el.textContent = NEWS[G.newsIdx];
    el.style.opacity = '1';
  }, 500);
}

// ═══════════════════════════════════════════════════════════════
// SAVE / LOAD / RESET
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = 'ronronclicker_v1';

function saveGame(silent) {
  const data = {
    cookies:      G.cookies,
    total:        G.total,
    clickBonus:   G.clickBonus,
    clickCpsPct:  G.clickCpsPct,
    bld:          G.bld,
    upg:          G.upg.map(u => ({ id: u.id, bought: u.bought })),
    milestoneIdx: G.milestoneIdx,
    newsIdx:      G.newsIdx,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  if (!silent) toast('💾 Sauvegarde effectuée ! Les chats sont rassurés.');
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    G.cookies     = s.cookies     || 0;
    G.total       = s.total       || 0;
    G.clickBonus  = s.clickBonus  || 0;
    G.clickCpsPct = s.clickCpsPct || 0;
    if (s.bld) s.bld.forEach((b, i) => {
      if (G.bld[i]) { G.bld[i].qty = b.qty || 0; G.bld[i].mult = b.mult || 1; }
    });
    if (s.upg) s.upg.forEach((u, i) => {
      if (G.upg[i]) G.upg[i].bought = u.bought || false;
    });
    G.milestoneIdx = s.milestoneIdx || 0;
    G.newsIdx      = s.newsIdx      || 0;
    document.getElementById('news-text').textContent = NEWS[G.newsIdx % NEWS.length];
  } catch(e) {
    console.error('Erreur de chargement :', e);
  }
}

function resetGame() {
  if (!confirm('Tout recommencer depuis zéro ?\nLes chats seront très déçus... 😿')) return;
  localStorage.removeItem(SAVE_KEY);
  G = {
    cookies: 0, total: 0, clickBonus: 0, clickCpsPct: 0,
    bld: BUILDINGS.map(() => ({ qty: 0, mult: 1 })),
    upg: ALL_UPGRADES.map(u => ({ id: u.id, bought: false })),
    fx: null, fxEnd: 0, nextFish: 0, newsIdx: 0, milestoneIdx: 0,
  };
  scheduleFish();
  renderAll();
  toast('🔄 Réinitialisé. Les chats recommencent à zéro, la queue haute. 😸');
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND MUSIC
// ═══════════════════════════════════════════════════════════════

const bgMusic = new Audio('assets/audio/cat_base_music.mp3');
bgMusic.loop   = true;
bgMusic.volume = 0.4;

// Browsers block autoplay until the user interacts — start on first click
let musicStarted = false;
function ensureMusic() {
  if (musicStarted) return;
  musicStarted = true;
  bgMusic.play().catch(() => {});
}
document.addEventListener('click', ensureMusic, { once: true });

function toggleMute() {
  bgMusic.muted = !bgMusic.muted;
  document.getElementById('mute-btn').textContent = bgMusic.muted ? '🔇 Musique' : '🔊 Musique';
}

// ═══════════════════════════════════════════════════════════════
// GAME LOOP
// ═══════════════════════════════════════════════════════════════

let lastTick = Date.now();

function tick(dt) {
  // Passive production from non-clicker buildings.
  const passiveGained = computePassiveCps() * dt;
  G.cookies += passiveGained;
  G.total   += passiveGained;

  // Patte de velours acts like cursor clickers around the cat.
  const pawCps = computePawAutoCps();
  if (pawCps > 0) {
    const clickPower = Math.max(computeClickPower(), 0.0001);
    pawClickCarry += (pawCps / clickPower) * dt;

    const maxClicksPerTick = 24;
    let clicks = Math.min(maxClicksPerTick, Math.floor(pawClickCarry));
    while (clicks > 0) {
      performAutoPawClick();
      pawClickCarry -= 1;
      clicks--;
    }
  } else {
    pawClickCarry = 0;
  }

  checkMilestones();
  checkFish();
  renderStats();
  updateAffordability();
}

function gameLoop() {
  const now = Date.now();
  const dt  = Math.min((now - lastTick) / 1000, 1); // cap at 1s
  lastTick  = now;
  tick(dt);
}

function renderGameToText() {
  const now = Date.now();
  const boughtUpgrades = ALL_UPGRADES
    .map((upg, idx) => ({ upg, idx }))
    .filter(({ idx }) => G.upg[idx]?.bought)
    .map(({ upg }) => upg.name);
  const visibleBuildings = BUILDINGS.map((b, id) => ({
    id: b.id,
    name: b.name,
    qty: G.bld[id]?.qty || 0,
    unlocked: isBuildingUnlocked(id),
    cost: bldCost(id),
    affordable: (G.cookies >= bldCost(id)) && isBuildingUnlocked(id),
  }));

  return JSON.stringify({
    coordinate_system: 'UI layout only (no canvas): left=chat panel, center=owned items, right=bonuses (top) + shop (bottom).',
    mode: 'running',
    resources: {
      cookies: Number(G.cookies.toFixed(3)),
      total: Number(G.total.toFixed(3)),
      cps: Number(computeCps().toFixed(3)),
      click_power: Number(computeClickPower().toFixed(3)),
    },
    effects: {
      active: G.fx,
      seconds_left: G.fx && G.fxEnd > now ? Number(((G.fxEnd - now) / 1000).toFixed(2)) : 0,
      next_fish_seconds: Number(Math.max(0, (G.nextFish - now) / 1000).toFixed(2)),
    },
    progression: {
      milestone_index: G.milestoneIdx,
      news_index: G.newsIdx,
      buildings: visibleBuildings,
      bought_upgrades: boughtUpgrades,
    },
  });
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i++) tick(1 / 60);
};

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════

setupCatImageFallback();
loadGame();
scheduleFish();
renderAll();

// Settings modal
function openSettings() {
  document.getElementById('settings-overlay').classList.add('open');
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
}
window.openSettings = openSettings;
window.closeSettings = closeSettings;

setInterval(gameLoop,   100);   // 10 ticks/sec
setInterval(saveGame,   30000, true); // auto-save silent
setInterval(rotateNews, 15000); // rotate headline
