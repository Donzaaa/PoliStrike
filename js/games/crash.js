import { getState, updateBalance } from '../state.js';
import { updateGlobalUI } from '../ui.js';
import { t } from '../i18n.js';

let betAmount = 0;
let isPlaying = false;
let targetMultiplier = 2.00;
let winChance = 47.50; // (100 / 2) * 0.95 = 47.5
const HOUSE_EDGE = 0.95; // 5% house edge

export function initCrash() {
  window.crAddBet = (amt) => {
    if (isPlaying) return;
    const state = getState();
    if (state.balance >= betAmount + amt) {
      betAmount += amt;
      updateUI();
    }
  };
  
  window.crClearBet = () => {
    if (isPlaying) return;
    betAmount = 0;
    updateUI();
  };
  
  window.upgSetTarget = (mult) => {
    if (isPlaying) return;
    document.getElementById('upg-target-input').value = mult.toFixed(2);
    window.upgUpdateTarget(mult);
  };
  
  window.upgUpdateTarget = (val) => {
    if (isPlaying) return;
    
    if (val === '' || val === '1.') {
      // Don't force values while user is typing intermediate states
      document.getElementById('cr-prob').textContent = "0.00%";
      return;
    }
    
    let m = parseFloat(val);
    if (isNaN(m)) return;
    
    // Blocco massimo visibile e logico a 1000x
    if (m > 1000) {
      m = 1000;
      document.getElementById('upg-target-input').value = "1000";
    }
    
    targetMultiplier = m;
    
    if (m < 1.01) {
      winChance = 95; // Cap al massimo consentito
    } else {
      winChance = (100 / targetMultiplier) * HOUSE_EDGE;
      if (winChance > 95) winChance = 95;
    }
    
    updateWheelUI();
  };
  
  window.crAction = () => {
    if (!isPlaying) {
      startGame();
    }
  };
  
  // Initialize wheel
  window.upgUpdateTarget(2.00);
}

function updateUI() {
  document.getElementById('cr-bet').textContent = betAmount.toLocaleString('it-IT');
}

function updateWheelUI() {
  document.getElementById('cr-prob').textContent = winChance.toFixed(2) + "%";
  
  // Calculate dasharray for circle (circumference is 2 * PI * r = 2 * 3.14159 * 45 = 282.74)
  const circumference = 282.74;
  const winLength = (winChance / 100) * circumference;
  
  const slice = document.getElementById('upg-win-slice');
  if (slice) {
    slice.style.strokeDasharray = `${winLength} ${circumference}`;
  }
}

function startGame() {
  // Ensure the target is up to date and clamped properly before starting
  let inputVal = parseFloat(document.getElementById('upg-target-input').value);
  if (isNaN(inputVal) || inputVal < 1.01) {
    inputVal = 1.01;
    document.getElementById('upg-target-input').value = "1.01";
  }
  if (inputVal > 1000) {
    inputVal = 1000;
    document.getElementById('upg-target-input').value = "1000";
  }
  window.upgUpdateTarget(inputVal.toString());

  if (betAmount <= 0) {
    document.getElementById('cr-msg').textContent = t('msg_invalid_bet');
    return;
  }
  const state = getState();
  if (state.balance < betAmount) {
    document.getElementById('cr-msg').textContent = t('msg_no_credit');
    return;
  }
  
  // Rimosso updateBalance qui. Lo facciamo alla fine dell'animazione per sincronizzare visivamente la vincita/perdita.
  isPlaying = true;
  
  const btn = document.getElementById('cr-btn-bet');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  document.getElementById('cr-msg').textContent = t('upg_progress');
  document.getElementById('cr-prob').style.color = "var(--text)";
  
  if (window.trackEvent) window.trackEvent('upgrade_play', { bet: betAmount, target: targetMultiplier });
  
  // Roll logic
  const roll = Math.random() * 100; // 0 to 99.99...
  const isWin = roll < winChance;
  
  // Animation logic
  const needle = document.getElementById('upg-needle-container');
  // Need to spin it multiple times then land on the result
  const spins = 4; // 4 full rotations
  
  // Calculate final angle
  // Win sector is from 0 to (winChance / 100) * 360 degrees
  let finalAngle = 0;
  const winAngle = (winChance / 100) * 360;
  
  if (isWin) {
    // Land in win sector (0 to winAngle), padded a bit to not land exactly on the edge
    const pad = Math.min(2, winAngle / 4);
    finalAngle = pad + (Math.random() * (winAngle - pad * 2));
  } else {
    // Land in lose sector (winAngle to 360)
    const loseAngleSize = 360 - winAngle;
    const pad = Math.min(2, loseAngleSize / 4);
    finalAngle = winAngle + pad + (Math.random() * (loseAngleSize - pad * 2));
  }
  
  const totalRotation = (spins * 360) + finalAngle;
  
  // Reset needle to 0 quickly (without animation)
  needle.style.transition = 'none';
  needle.style.transform = `rotate(0deg)`;
  
  // Trigger reflow
  void needle.offsetWidth;
  
  // Spin!
  needle.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
  needle.style.transform = `rotate(${totalRotation}deg)`;
  
  setTimeout(() => {
    endGame(isWin);
  }, 3000);
}

function endGame(isWin) {
  isPlaying = false;
  
  const btn = document.getElementById('cr-btn-bet');
  btn.disabled = false;
  btn.style.opacity = '1';
  
  if (isWin) {
    const win = Math.floor(betAmount * targetMultiplier);
    const netProfit = win - betAmount;
    updateBalance(netProfit, true);
    updateGlobalUI();
    document.getElementById('cr-msg').textContent = t('upg_success', { win: win.toLocaleString('it-IT') });
    document.getElementById('cr-prob').style.color = "#00E676";
    if (window.trackEvent) window.trackEvent('upgrade_win', { bet: betAmount, win: win, mult: targetMultiplier });
  } else {
    updateBalance(-betAmount, false);
    updateGlobalUI();
    document.getElementById('cr-msg').textContent = t('upg_fail', { bet: betAmount.toLocaleString('it-IT') });
    document.getElementById('cr-prob').style.color = "#E53935";
  }
}
