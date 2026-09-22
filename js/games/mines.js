import { getState, updateBalance } from '../state.js';
import { updateGlobalUI } from '../ui.js';
import { t } from '../i18n.js';

let betAmount = 0;
let bombsCount = 3;
let isPlaying = false;
let grid = []; // 25 elements: true (bomb) or false (gem)
let revealed = [];
let gemsFound = 0;
let currentMultiplier = 1.00;

export function initMines() {
  window.mnAddBet = (amt) => {
    if (isPlaying) return;
    const state = getState();
    if (state.balance >= betAmount + amt) {
      betAmount += amt;
      updateUI();
    }
  };
  
  window.mnClearBet = () => {
    if (isPlaying) return;
    betAmount = 0;
    updateUI();
  };
  
  window.mnSetBombs = (b) => {
    if (isPlaying) return;
    bombsCount = b;
    document.getElementById('mn-bombs').value = b;
  };
  
  window.mnUpdateBombs = (val) => {
    if (isPlaying) return;
    let b = parseInt(val);
    if (isNaN(b) || b < 1) b = 1;
    if (b > 23) b = 23;
    bombsCount = b;
    document.getElementById('mn-bombs').value = b;
  };
  
  window.mnAction = () => {
    if (isPlaying) {
      cashOut();
    } else {
      startGame();
    }
  };
  
  buildGridUI();
}

function updateUI() {
  document.getElementById('mn-bet').textContent = betAmount.toLocaleString('it-IT');
}

function buildGridUI() {
  const container = document.getElementById('mn-grid');
  container.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const tile = document.createElement('div');
    tile.className = 'mine-tile disabled';
    tile.id = `mn-tile-${i}`;
    tile.onclick = () => revealTile(i);
    container.appendChild(tile);
  }
}

function resetGridUI() {
  for (let i = 0; i < 25; i++) {
    const tile = document.getElementById(`mn-tile-${i}`);
    tile.className = 'mine-tile';
    tile.innerHTML = '';
    tile.removeAttribute('style');
  }
}

function calculateMultiplier(found) {
  // Combinatorics logic for fair multiplier
  // M = (25 nCr found) / ((25-bombs) nCr found) * (1 - HouseEdge)
  if (found === 0) return 1.00;
  
  let m = 1.0;
  for (let i = 0; i < found; i++) {
    m *= (25 - i) / (25 - bombsCount - i);
  }
  
  // 3% house edge
  m = m * 0.97;
  return Math.max(1.00, Math.floor(m * 100) / 100);
}

function updateMultiplierDisplay() {
  const nextMult = calculateMultiplier(gemsFound + 1);
  document.getElementById('mn-next').textContent = nextMult.toFixed(2) + '×';
}

function startGame() {
  if (betAmount <= 0) {
    document.getElementById('mn-msg').textContent = t('msg_invalid_bet');
    return;
  }
  const state = getState();
  if (state.balance < betAmount) {
    document.getElementById('mn-msg').textContent = t('msg_no_credit');
    return;
  }
  
  updateBalance(-betAmount);
  updateGlobalUI();
  isPlaying = true;
  gemsFound = 0;
  currentMultiplier = 1.00;
  revealed = new Array(25).fill(false);
  
  // Generate bombs
  grid = new Array(25).fill(false);
  let placed = 0;
  while (placed < bombsCount) {
    const r = Math.floor(Math.random() * 25);
    if (!grid[r]) {
      grid[r] = true;
      placed++;
    }
  }
  
  resetGridUI();
  
  const btn = document.getElementById('mn-btn-action');
  btn.textContent = t('mn_cashout_btn', { mult: '1.00' });
  document.getElementById('mn-msg').textContent = t('mn_choose_cell');
  
  updateMultiplierDisplay();
  if (window.trackEvent) window.trackEvent('mines_play', { bet: betAmount, bombs: bombsCount });
}

function revealTile(index) {
  if (!isPlaying || revealed[index]) return;
  
  revealed[index] = true;
  const tile = document.getElementById(`mn-tile-${index}`);
  tile.classList.add('revealed');
  
  if (grid[index]) {
    // Bomb!
    tile.classList.add('bomb');
    tile.innerHTML = '💣';
    gameOver(false);
  } else {
    // Gem!
    tile.classList.add('gem');
    tile.innerHTML = '💎';
    gemsFound++;
    currentMultiplier = calculateMultiplier(gemsFound);
    
    const btn = document.getElementById('mn-btn-action');
    btn.textContent = t('mn_cashout_btn', { mult: currentMultiplier.toFixed(2) });
    
    if (gemsFound === 25 - bombsCount) {
      // Won everything
      gameOver(true);
    } else {
      updateMultiplierDisplay();
    }
  }
}

function cashOut() {
  if (!isPlaying) return;
  gameOver(true);
}

function gameOver(win) {
  isPlaying = false;
  
  // Reveal remaining board
  for (let i = 0; i < 25; i++) {
    const tile = document.getElementById(`mn-tile-${i}`);
    tile.classList.add('disabled');
    if (!revealed[i]) {
      tile.classList.add('revealed');
      tile.style.opacity = '0.5';
      if (grid[i]) {
        tile.innerHTML = '💣';
      } else {
        tile.innerHTML = '💎';
        tile.style.color = '#fff'; // Gray out unrevealed gems
        tile.style.textShadow = 'none';
      }
    }
  }
  
  const btn = document.getElementById('mn-btn-action');
  btn.textContent = "GIOCA";
  
  if (win) {
    const totalWin = Math.floor(betAmount * currentMultiplier);
    updateBalance(totalWin);
    updateGlobalUI();
    document.getElementById('mn-msg').textContent = t('mn_win', { win: totalWin.toLocaleString('it-IT') });
    if (window.trackEvent) window.trackEvent('mines_win', { bet: betAmount, win: totalWin, mult: currentMultiplier });
  } else {
    document.getElementById('mn-msg').textContent = t('mn_lose');
  }
}
