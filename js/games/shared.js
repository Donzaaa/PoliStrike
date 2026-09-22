import { updateGlobalUI } from '../ui.js';
import { getState, updateBalance } from '../state.js';

let currentBet = 0;
let isGameActive = false;

export function getBet() {
  return currentBet;
}

export function setBet(amount) {
  currentBet = amount;
  updateBetDisplays();
}

export function addBet(amount) {
  const state = getState();
  if (state.balance - currentBet - amount < 0) return false;
  currentBet += amount;
  updateBetDisplays();
  return true;
}

export function clearBet() {
  if (isGameActive) return false; // Prevent clearing bet while game is active
  currentBet = 0;
  updateBetDisplays();
  return true;
}

export function updateBetDisplays() {
  ['bet-disp', 'bet-disp-rw', 'bet-disp-sl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = currentBet;
  });
}

export function setGameActive(active) {
  isGameActive = active;
}

export function getGameActive() {
  return isGameActive;
}

// Deduct bet from balance when game starts
export function commitBet() {
  const state = getState();
  if (currentBet <= 0 || state.balance < currentBet) return false;
  updateBalance(-currentBet, false); // Not a win/loss yet, just deduction
  updateGlobalUI();
  return true;
}
