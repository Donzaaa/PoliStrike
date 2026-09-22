import { getBet, addBet, clearBet, commitBet, setGameActive, getGameActive } from './shared.js';
import { updateGlobalUI } from '../ui.js';
import { getState, addHand, recordGameWin, updateBalance } from '../state.js';
import { CONFIG } from '../config.js';

export const rwNums = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
export const rwColors = {};
[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].forEach(n => rwColors[n] = 'red');
for (let i = 0; i <= 36; i++) {
  if (!rwColors[i]) rwColors[i] = i === 0 ? 'green' : 'black';
}

let rwBet = null;
let rwAngle = 0;

export function initRoulette() {
  window.rwAddBet = (n) => addBet(n);
  window.rwClearBet = () => clearBet();
  window.rwSpin = rwSpin;
  window.rwSpecial = rwSpecial;
  window.rwSetNumBet = rwSetNumBet;
}

function drawWheel(ctx, angle) {
  const cx = 170, cy = 170, r = 160, seg = Math.PI * 2 / 37;
  ctx.clearRect(0, 0, 340, 340);
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle * Math.PI / 180);
  ctx.translate(-cx, -cy);

  const rimGrad = ctx.createRadialGradient(cx, cy, r - 12, cx, cy, r + 5);
  rimGrad.addColorStop(0, '#3e2723');
  rimGrad.addColorStop(1, '#FFD700');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = rimGrad; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke();
  
  rwNums.forEach((n, i) => {
    const s = i * seg - Math.PI / 2, e = s + seg;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r - 8, s, e); ctx.closePath();
    const col = rwColors[n];
    
    const slotGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r);
    if (col === 'red') {
      slotGrad.addColorStop(0, '#8e0000'); slotGrad.addColorStop(1, '#ff3333');
    } else if (col === 'black') {
      slotGrad.addColorStop(0, '#000'); slotGrad.addColorStop(1, '#222');
    } else {
      slotGrad.addColorStop(0, '#004d00'); slotGrad.addColorStop(1, '#00b300');
    }
    
    ctx.fillStyle = slotGrad; ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s + seg / 2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Barlow Condensed'; ctx.textAlign = 'center'; 
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText(n, r - 24, 4);
    ctx.restore();
  });
  
  ctx.restore();
  
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
  centerGrad.addColorStop(0, '#FFF9C4');
  centerGrad.addColorStop(0.5, '#FBC02D');
  centerGrad.addColorStop(1, '#827717');
  
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fillStyle = centerGrad; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
}

export function buildRWWheel() {
  const cv = document.getElementById('rwCanvas');
  if (!cv) return;
  drawWheel(cv.getContext('2d'), 0);
}

export function buildNumGrid() {
  const g = document.getElementById('num-grid');
  if (!g) return;
  g.innerHTML = '';
  for (let i = 0; i <= 36; i++) {
    const col = rwColors[i];
    const cls = col === 'red' ? 'nc-red' : col === 'black' ? 'nc-black' : 'nc-green';
    const d = document.createElement('div');
    d.className = 'num-cell ' + cls;
    
    if (i === 0) {
      d.style.gridRow = '1 / span 3';
      d.style.gridColumn = '1';
    } else {
      d.style.gridRow = (i % 3 === 0) ? 1 : (i % 3 === 2) ? 2 : 3;
      d.style.gridColumn = Math.ceil(i / 3) + 1;
    }
    
    d.textContent = i;
    d.onclick = () => window.rwSetNumBet(d, i);
    g.appendChild(d);
  }
}

function rwSetNumBet(el, val) {
  if (getGameActive()) return;
  document.querySelectorAll('.num-cell').forEach(e => e.classList.remove('selected'));
  document.querySelectorAll('.spec-btn').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  rwBet = { type: 'num', val };
}

function rwSpecial(el, type) {
  if (getGameActive()) return;
  document.querySelectorAll('.num-cell').forEach(e => e.classList.remove('selected'));
  document.querySelectorAll('.spec-btn').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  rwBet = { type, val: null };
}

function rwSpin() {
  if (getGameActive()) return;
  const msgEl = document.getElementById('rw-msg');
  if (!rwBet) { msgEl.textContent = 'Scegliete prima una puntata!'; return; }
  if (getBet() <= 0) { msgEl.textContent = 'Piazzate una puntata!'; return; }
  if (getState().balance < getBet()) { msgEl.textContent = 'Fondi insufficienti!'; return; }
  
  if (!commitBet()) return;
  setGameActive(true);
  document.getElementById('btn-spin').disabled = true;
  
  const result = Math.floor(Math.random() * 37);
  const idx = rwNums.indexOf(result);
  const seg = 360 / 37;
  const target = rwAngle + 1440 + (360 - idx * seg - seg / 2 - rwAngle % 360);
  const start = performance.now(), from = rwAngle, dur = 4500;
  
  const cv = document.getElementById('rwCanvas');
  const ctx = cv.getContext('2d');
  
  function anim(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    rwAngle = from + (target - from) * ease;
    
    drawWheel(ctx, rwAngle);
    
    if (p < 1) requestAnimationFrame(anim);
    else {
      setGameActive(false);
      document.getElementById('btn-spin').disabled = false;
      rwResult(result);
    }
  }
  msgEl.textContent = 'La ruota gira...';
  requestAnimationFrame(anim);
}

// Pure function for payouts
export function checkRouletteWin(result, betObj) {
  const col = rwColors[result];
  if (betObj.type === 'num' && betObj.val === result) return 36;
  if (betObj.type === 'red' && col === 'red') return 2;
  if (betObj.type === 'black' && col === 'black') return 2;
  if (betObj.type === 'even' && result > 0 && result % 2 === 0) return 2;
  if (betObj.type === 'odd' && result % 2 === 1) return 2;
  if (betObj.type === 'low' && result >= 1 && result <= 18) return 2;
  if (betObj.type === 'high' && result >= 19 && result <= 36) return 2;
  return 0;
}

function rwResult(res) {
  const col = rwColors[res];
  const mult = checkRouletteWin(res, rwBet);
  const win = mult > 0;
  
  const colLabel = col === 'red' ? '🔴' : col === 'black' ? '⚫' : '🟢';
  const el = document.getElementById('rw-msg');
  
  const state = getState();
  const bet = getBet();
  
  if (win) {
    const gain = bet * mult;
    updateBalance(gain, true);
    el.textContent = `${colLabel} ${res} — VINTO! +${CONFIG.currencySymbol}${gain}`;
    el.className = 'game-status win';
    recordGameWin('rw', gain);
  } else {
    el.textContent = `${colLabel} ${res} — Ritenta all'appello successivo.`;
    el.className = 'game-status lose';
  }
  
  addHand('rw');
  updateGlobalUI();
}
