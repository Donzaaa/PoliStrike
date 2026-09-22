import { getBet, addBet, clearBet, commitBet, setGameActive, getGameActive } from './shared.js';
import { updateGlobalUI } from '../ui.js';
import { getState, addHand, recordGameWin, updateBalance } from '../state.js';
import { CONFIG } from '../config.js';

export const slSyms = ['☕','📐','🧮','📚','💡','7️⃣','🎓'];
export const slPay = {
  '🎓🎓🎓': 100,
  '7️⃣7️⃣7️⃣': 75,
  '💡💡💡': 40,
  '🧮🧮🧮': 25,
  '📚📚📚': 15,
  '📐📐📐': 10,
  '☕☕☕': 10
};

export function initSlots() {
  window.slAddBet = (n) => addBet(n);
  window.slClearBet = () => clearBet();
  window.slSpin = slSpin;
}

// Pure function for payouts
export function checkSlotsWin(results) {
  const key = results.join('');
  if (slPay[key]) return slPay[key];
  const coffeeCount = results.filter(s => s === '☕').length;
  if (coffeeCount === 2) return 3;
  return 0;
}

function slSpin() {
  if (getGameActive()) return;
  const msgEl = document.getElementById('sl-msg');
  if (getBet() <= 0) { msgEl.textContent = 'Piazzate una puntata!'; return; }
  if (getState().balance < getBet()) { msgEl.textContent = 'Fondi insufficienti!'; return; }
  
  if (!commitBet()) return;
  setGameActive(true);
  document.getElementById('btn-slots').disabled = true;
  
  msgEl.className = 'game-status';
  msgEl.textContent = '...';
  
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('wf' + i);
    if (el) el.className = 'win-flash';
  });
  
  const results = [0, 1, 2].map(() => slSyms[Math.floor(Math.random() * slSyms.length)]);
  
  [0, 1, 2].forEach((i) => {
    const wf = document.getElementById('wf' + i);
    const col = wf ? wf.parentElement : null;
    if (col) col.classList.add('spinning');
    
    const stop = 500 + i * 400;
    const iv = setInterval(() => {
      const reel = document.getElementById('reel' + i);
      if (reel) reel.textContent = slSyms[Math.floor(Math.random() * slSyms.length)];
    }, 80);
    setTimeout(() => {
      clearInterval(iv);
      if (col) col.classList.remove('spinning');
      const reel = document.getElementById('reel' + i);
      if (reel) reel.textContent = results[i];
    }, stop);
  });
  
  setTimeout(() => {
    const mult = checkSlotsWin(results);
    const state = getState();
    const bet = getBet();
    
    if (mult > 0) {
      const gain = Math.floor(bet * mult);
      updateBalance(gain, true);
      
      let winText = `🎉 VINCITA ×${mult} — +${CONFIG.currencySymbol}${gain}`;
      if (results.join('') === '🎓🎓🎓') {
        winText = `🎓 30 E LODE JACKPOT! +${CONFIG.currencySymbol}${gain}`;
      }
      
      msgEl.textContent = winText;
      msgEl.className = 'game-status win';
      
      [0, 1, 2].forEach(i => {
        const wf = document.getElementById('wf' + i);
        if (wf) wf.className = 'win-flash on';
      });
      recordGameWin('sl', gain);
    } else {
      msgEl.textContent = 'Ritenta, andrà meglio al prossimo appello!';
      msgEl.className = 'game-status lose';
    }
    
    addHand('sl');
    updateGlobalUI();
    setGameActive(false);
    document.getElementById('btn-slots').disabled = false;
  }, 1700);
}
