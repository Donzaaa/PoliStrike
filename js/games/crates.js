import { getState, updateBalance, addHand, recordGameWin } from '../state.js';
import { updateGlobalUI } from '../ui.js';
import { CONFIG } from '../config.js';

export const CASES = [
  { id: 'freshman', name: {it: 'Cassa Matricola', en: 'Freshman Crate'}, emoji: '🎒', color: '#4FC3F7', price: 10,
    weights: [
      { key: 'base', label: {it: 'Base', en: 'Base'}, cls: 'r-base', w: 65 },
      { key: 'mil', label: {it: 'Comune', en: 'Common'}, cls: 'r-mil', w: 22 },
      { key: 'restricted', label: {it: 'Non Comune', en: 'Uncommon'}, cls: 'r-restricted', w: 10 },
      { key: 'classified', label: {it: 'Raro', en: 'Rare'}, cls: 'r-classified', w: 2.5 },
      { key: 'covert', label: {it: 'Epico', en: 'Epic'}, cls: 'r-covert', w: 0.4 },
      { key: 'rare', label: {it: '⭐ Leggendario', en: '⭐ Legendary'}, cls: 'r-rare', w: 0.1 },
    ]
  },
  { id: 'session', name: {it: 'Cassa Sessione Estiva', en: 'Summer Session Crate'}, emoji: '🥵', color: '#FF8F00', price: 25,
    weights: [
      { key: 'base', label: {it: 'Base', en: 'Base'}, cls: 'r-base', w: 55 },
      { key: 'mil', label: {it: 'Comune', en: 'Common'}, cls: 'r-mil', w: 25 },
      { key: 'restricted', label: {it: 'Non Comune', en: 'Uncommon'}, cls: 'r-restricted', w: 14 },
      { key: 'classified', label: {it: 'Raro', en: 'Rare'}, cls: 'r-classified', w: 4.5 },
      { key: 'covert', label: {it: 'Epico', en: 'Epic'}, cls: 'r-covert', w: 1.2 },
      { key: 'rare', label: {it: '⭐ Leggendario', en: '⭐ Legendary'}, cls: 'r-rare', w: 0.3 },
    ]
  },
  { id: 'nerd', name: {it: 'Cassa Secchione', en: 'Nerd Crate'}, emoji: '🤓', color: '#EF5350', price: 50,
    weights: [
      { key: 'base', label: {it: 'Base', en: 'Base'}, cls: 'r-base', w: 45 },
      { key: 'mil', label: {it: 'Comune', en: 'Common'}, cls: 'r-mil', w: 28 },
      { key: 'restricted', label: {it: 'Non Comune', en: 'Uncommon'}, cls: 'r-restricted', w: 18 },
      { key: 'classified', label: {it: 'Raro', en: 'Rare'}, cls: 'r-classified', w: 7.0 },
      { key: 'covert', label: {it: 'Epico', en: 'Epic'}, cls: 'r-covert', w: 1.7 },
      { key: 'rare', label: {it: '⭐ Leggendario', en: '⭐ Legendary'}, cls: 'r-rare', w: 0.3 },
    ]
  },
  { id: 'night', name: {it: 'Cassa Nottata', en: 'All-Nighter Crate'}, emoji: '🦉', color: '#9575CD', price: 100,
    weights: [
      { key: 'base', label: {it: 'Base', en: 'Base'}, cls: 'r-base', w: 35 },
      { key: 'mil', label: {it: 'Comune', en: 'Common'}, cls: 'r-mil', w: 30 },
      { key: 'restricted', label: {it: 'Non Comune', en: 'Uncommon'}, cls: 'r-restricted', w: 24 },
      { key: 'classified', label: {it: 'Raro', en: 'Rare'}, cls: 'r-classified', w: 8.5 },
      { key: 'covert', label: {it: 'Epico', en: 'Epic'}, cls: 'r-covert', w: 2.2 },
      { key: 'rare', label: {it: '⭐ Leggendario', en: '⭐ Legendary'}, cls: 'r-rare', w: 0.3 },
    ]
  },
  { id: 'grad', name: {it: 'Cassa Laurea', en: 'Graduation Crate'}, emoji: '🎓', color: '#FFD700', price: 250,
    weights: [
      { key: 'base', label: {it: 'Base', en: 'Base'}, cls: 'r-base', w: 20 },
      { key: 'mil', label: {it: 'Comune', en: 'Common'}, cls: 'r-mil', w: 35 },
      { key: 'restricted', label: {it: 'Non Comune', en: 'Uncommon'}, cls: 'r-restricted', w: 30 },
      { key: 'classified', label: {it: 'Raro', en: 'Rare'}, cls: 'r-classified', w: 12 },
      { key: 'covert', label: {it: 'Epico', en: 'Epic'}, cls: 'r-covert', w: 2.5 },
      { key: 'rare', label: {it: '⭐ Leggendario', en: '⭐ Legendary'}, cls: 'r-rare', w: 0.5 },
    ]
  },
  { id: 'fuoricorso', name: {it: 'Cassa Fuoricorso', en: 'Super Senior Crate'}, emoji: '👴', color: '#E040FB', price: 500,
    weights: [
      { key: 'base', label: {it: 'Base', en: 'Base'}, cls: 'r-base', w: 10 },
      { key: 'mil', label: {it: 'Comune', en: 'Common'}, cls: 'r-mil', w: 35 },
      { key: 'restricted', label: {it: 'Non Comune', en: 'Uncommon'}, cls: 'r-restricted', w: 35 },
      { key: 'classified', label: {it: 'Raro', en: 'Rare'}, cls: 'r-classified', w: 15 },
      { key: 'covert', label: {it: 'Epico', en: 'Epic'}, cls: 'r-covert', w: 4.25 },
      { key: 'rare', label: {it: '⭐ Leggendario', en: '⭐ Legendary'}, cls: 'r-rare', w: 0.75 },
    ]
  },
];

export const SKINS = {
  base: [
    { name: {it: 'Penne Bic (Vuote)', en: 'Empty Bic Pens'}, emoji: '🖊️', mult: 0 },
    { name: {it: 'Matita Spezzata', en: 'Broken Pencil'}, emoji: '✏️', mult: 0 },
    { name: {it: 'Gomma Usurata', en: 'Worn Eraser'}, emoji: '🧽', mult: 0 },
    { name: {it: 'Evidenziatore Secco', en: 'Dry Highlighter'}, emoji: '🖍️', mult: 0.1 },
    { name: {it: 'Fogli di Brutta', en: 'Draft Papers'}, emoji: '📄', mult: 0.1 },
  ],
  mil: [
    { name: {it: 'Appunti Illeggibili', en: 'Illegible Notes'}, emoji: '📝', mult: 0.1 },
    { name: {it: 'Caffè della Macchinetta', en: 'Vending Machine Coffee'}, emoji: '☕', mult: 0.2 },
    { name: {it: 'Tramezzino Avanzato', en: 'Leftover Sandwich'}, emoji: '🥪', mult: 0.3 },
    { name: {it: 'Quaderno ad Anelli', en: 'Ring Binder'}, emoji: '📓', mult: 0.5 },
  ],
  restricted: [
    { name: {it: 'Libro Fotocopiato', en: 'Photocopied Book'}, emoji: '📖', mult: 0.5 },
    { name: {it: 'Borraccia d\'Ateneo', en: 'University Flask'}, emoji: '🚰', mult: 0.8 },
    { name: {it: 'Dispense del Prof', en: 'Professor\'s Handouts'}, emoji: '📚', mult: 1.0 },
    { name: {it: 'Bigliettini', en: 'Cheat Sheets'}, emoji: '🧾', mult: 1.5 },
  ],
  classified: [
    { name: {it: 'Calcolatrice Scientifica', en: 'Scientific Calculator'}, emoji: '🖩', mult: 2.0 },
    { name: {it: 'Felpa Ufficiale', en: 'Official Hoodie'}, emoji: '🧥', mult: 2.5 },
    { name: {it: 'Posto Fisso in Aula Studio', en: 'Fixed Seat in Study Room'}, emoji: '🪑', mult: 3.0 },
  ],
  covert: [
    { name: {it: 'Tablet per Appunti', en: 'Tablet for Notes'}, emoji: '📱', mult: 5.0 },
    { name: {it: 'PC Portatile Gaming', en: 'Gaming Laptop'}, emoji: '💻', mult: 8.0 },
    { name: {it: 'Tesi Pronta', en: 'Finished Thesis'}, emoji: '📜', mult: 10.0 },
  ],
  rare: [
    { name: {it: '★ Voto Alzato dal Prof', en: '★ Grade Bumped by Prof'}, emoji: '📈', mult: 15.0 },
    { name: {it: '★ Salto Appello Diretto', en: '★ Skip Exam Directly'}, emoji: '🚀', mult: 20.0 },
    { name: {it: '★ Borsa di Studio', en: '★ Scholarship'}, emoji: '💰', mult: 30.0 },
    { name: {it: '★ 110 e LODE', en: '★ 110 Cum Laude'}, emoji: '👑', mult: 50.0 },
  ]
};

let selectedCase = null;
let caseOpen = false;

function updateCaseUI(caseObj) {
  const btn = document.getElementById('btn-open-case');
  const panel = document.querySelector('.rarity-panel');
  
  if (!caseObj) {
    if (btn) {
      btn.textContent = '📦 Seleziona una Cassa';
      btn.disabled = true;
    }
    if (panel) panel.innerHTML = '';
    return;
  }

  if (btn) {
    btn.textContent = `📦 Apri Cassa (${caseObj.price} CFU)`;
    btn.disabled = false;
  }
  
  if (panel) {
    panel.innerHTML = '';
    caseObj.weights.forEach(rw => {
      if (rw.w > 0) {
        const b = document.createElement('div');
        b.className = `rarity-badge ${rw.cls}`;
        b.innerHTML = `<span class="rb-pct">${rw.w}%</span> ${rw.label[getState().lang || "it"]}`;
        panel.appendChild(b);
      }
    });
  }
}

export function initCrates() {
  window.csSetCasePrice = () => {}; // Rimossa
  window.csStartCaseOpen = startCaseOpen;
  window.csOpenAgain = () => {
    document.getElementById('cs-win-screen').className = 'win-screen';
    document.getElementById('cs-roll-phase').style.display = 'block';
    document.getElementById('cs-msg').textContent = 'Pronto...';
    setTimeout(() => startCaseOpen(), 200);
  };
  window.csBackToSelect = () => {
    document.getElementById('cs-win-screen').className = 'win-screen';
    document.getElementById('cs-roll-phase').style.display = 'none';
    document.getElementById('cs-select-phase').style.display = 'block';
  };
}

export function buildCasesUI() {
  const row = document.getElementById('cases-row');
  if (!row) return;
  row.innerHTML = '';
  CASES.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'case-box';
    d.innerHTML = `<span class="case-emoji">${c.emoji}</span><div class="case-name">${c.name[getState().lang || "it"]}</div><div style="font-size:0.7rem; color:var(--muted); margin-top:4px;">${c.price} CFU</div>`;
    d.onclick = () => {
      document.querySelectorAll('.case-box').forEach(b => b.classList.remove('selected'));
      d.classList.add('selected');
      selectedCase = c;
      updateCaseUI(c);
    };
    row.appendChild(d);
  });
  updateCaseUI(selectedCase);
}

// Pure logic functions
export function pickRarity(caseObj) {
  const r = Math.random() * 100;
  let acc = 0;
  for (const rw of caseObj.weights) {
    acc += rw.w;
    if (r < acc) return rw;
  }
  return caseObj.weights[0];
}

export function pickSkin(rarityKey) {
  const pool = SKINS[rarityKey];
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildRollTrack(caseObj, finalRarity, finalSkin) {
  const track = document.getElementById('roll-track');
  track.innerHTML = '';
  const items = [];
  
  for (let i = 0; i < 60; i++) {
    const isLast = i === 52;
    const rw = isLast ? finalRarity : caseObj.weights[Math.floor(Math.random() * caseObj.weights.length)];
    // Fallback if the weight is 0 in the UI but it was still randomly picked:
    // It's technically possible, but Math.floor(random * length) can pick a 0% item for visual padding. That's actually fine for the fake roll.
    const sk = isLast ? finalSkin : pickSkin(rw.key);
    items.push({ rw, sk });
  }
  
  items.forEach(({ rw, sk }) => {
    const d = document.createElement('div');
    d.className = `roll-item ${rw.cls}`;
    // Using textContent for safe insertion (although sk.name[getState().lang || "it"] is from our dict)
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'roll-item-emoji';
    emojiDiv.textContent = sk.emoji;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'roll-item-name';
    nameDiv.textContent = sk.name[getState().lang || "it"];
    
    const rarityDiv = document.createElement('div');
    rarityDiv.className = 'roll-item-rarity';
    rarityDiv.textContent = rw.label[getState().lang || "it"];
    
    d.appendChild(emojiDiv);
    d.appendChild(nameDiv);
    d.appendChild(rarityDiv);
    
    track.appendChild(d);
  });
  return items;
}

function startCaseOpen() {
  if (caseOpen || !selectedCase) return;
  const state = getState();
  
  if (state.balance < selectedCase.price) {
    document.getElementById('cs-msg').textContent = 'Fondi insufficienti!';
    return;
  }
  
  // Deduct balance
  updateBalance(-selectedCase.price, false); // Deduction
  updateGlobalUI();
  caseOpen = true;

  document.getElementById('cs-select-phase').style.display = 'none';
  document.getElementById('cs-win-screen').className = 'win-screen';
  document.getElementById('cs-roll-phase').style.display = 'block';
  document.getElementById('cs-msg').textContent = 'La cassa si apre...';
  document.getElementById('cs-msg').className = 'game-status';

  const finalRarity = pickRarity(selectedCase);
  const finalSkin = pickSkin(finalRarity.key);
  
  buildRollTrack(selectedCase, finalRarity, finalSkin);

  const track = document.getElementById('roll-track');

  track.style.transition = 'none';
  track.style.transform = 'translateX(0)';

  // Fix: la riga .roll-track ha padding-left: calc(50% - 65px).
  // Di conseguenza l'item 0 è centrato a: vpCenter - 3
  // L'item 52 è centrato a: vpCenter - 3 + (52 * 130)
  // Per centrarlo al centro esatto (vpCenter), dobbiamo traslare di - (6760 - 3) = -6757
  const randOffset = (Math.random() - 0.5) * 110; // Random offset per non farlo fermare sempre al pixel esatto
  const targetX = -6757 + randOffset;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const duration = 6000;
      track.style.transition = `transform ${duration}ms cubic-bezier(0.05, 0.95, 0.3, 1)`;
      track.style.transform = `translateX(${targetX}px)`;
    });
  });

  setTimeout(() => {
    caseOpen = false;
    showWin(finalRarity, finalSkin, selectedCase.price);
  }, 6200);
}

function showWin(rw, sk, price) {
  document.getElementById('cs-roll-phase').style.display = 'none';
  const ws = document.getElementById('cs-win-screen');
  ws.className = 'win-screen show';

  const gain = Math.floor(price * sk.mult);
  
  updateBalance(gain, true);
  addHand('cs');
  
  updateGlobalUI();

  const box = document.getElementById('win-item-box');
  box.className = `win-item-big ${rw.cls}`;
  document.getElementById('win-emoji').textContent = sk.emoji;
  document.getElementById('win-name').textContent = sk.name[getState().lang || "it"];

  const badge = document.getElementById('win-rarity-badge');
  badge.className = `win-rarity-badge ${rw.cls}`;
  badge.textContent = rw.label[getState().lang || "it"].toUpperCase();

  document.getElementById('win-value').textContent = `+${CONFIG.currencySymbol}${gain}`;
  document.getElementById('win-sub').textContent = `${rw.label[getState().lang || "it"]} · Moltiplicatore ${sk.mult}×`;

  if (gain > 0) {
    recordGameWin('cs', gain);
  }

  if (['classified', 'covert', 'rare'].includes(rw.key)) launchConfetti(rw.key);
}

function launchConfetti(tier) {
  const wrap = document.getElementById('confetti-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const colors = {
    classified: ['#EF5350', '#FF8A80', '#fff'],
    covert: ['#FF8F00', '#FFD54F', '#fff'],
    rare: ['#FFD700', '#FFF176', '#E040FB', '#fff']
  };
  const cols = colors[tier] || colors.classified;
  const count = tier === 'rare' ? 80 : 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'conf-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = cols[Math.floor(Math.random() * cols.length)];
    p.style.width = (6 + Math.random() * 8) + 'px';
    p.style.height = (8 + Math.random() * 14) + 'px';
    p.style.animationDuration = (2 + Math.random() * 2) + 's';
    p.style.animationDelay = (Math.random() * .8) + 's';
    wrap.appendChild(p);
  }
  setTimeout(() => wrap.innerHTML = '', 5000);
}
