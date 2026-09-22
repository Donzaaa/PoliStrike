import { getState } from './state.js';
import { CONFIG } from './config.js';

let currentGame = null;

export function updateGlobalUI() {
  const state = getState();
  
  const balEl = document.getElementById('bal-disp');
  if (balEl) {
    balEl.textContent = `${CONFIG.currencySymbol} ${state.balance.toLocaleString('it-IT')}`;
  }
  
  const plEl = document.getElementById('pl-disp');
  if (plEl) {
    plEl.textContent = (state.pl >= 0 ? `${CONFIG.currencySymbol} +` : `${CONFIG.currencySymbol} `) + state.pl.toLocaleString('it-IT');
    plEl.style.color = state.pl > 0 ? 'var(--volt)' : state.pl < 0 ? 'var(--hot)' : 'var(--cyan)';
  }
  
  const handsEl = document.getElementById('hands-disp');
  if (handsEl) {
    handsEl.textContent = state.hands;
  }
}

export function openModal(id) {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('open'));
  const modal = document.getElementById('modal-' + id);
  if (modal) {
    modal.classList.add('open');
  }
}

export function closeModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (modal) {
    modal.classList.remove('open');
    modal.classList.remove('closing');
  }
}

export function setCurrentGame(g) {
  currentGame = g;
}

export function getCurrentGame() {
  return currentGame;
}


export function initTicker() {
  const msgs = [
    `${CONFIG.texts.brandName.toUpperCase()}`,
    'GIOCA RESPONSABILMENTE',
    `SALDO INIZIALE ${CONFIG.currencySymbol}1.000`,
    'BLACKJACK PAGA 3:2',
    'NUMERO FORTUNATO 17',
    'ZERO VERDE PAGA 36:1',
    'TRIPLO DIAMANTE PAGA 50:1',
    'SOLO PER DIVERTIMENTO'
  ];
  const t = document.getElementById('ticker-inner');
  if (t) {
    const full = [...msgs, ...msgs].map(m => `<span>${m}</span>`).join('');
    // using innerHTML is safe here because msgs are hardcoded in config
    t.innerHTML = full + full;
  }
}

export function setupModals() {
  document.querySelectorAll('.overlay').forEach(o => {
    o.addEventListener('click', e => {
      if (e.target === o) {
        // Find the close button inside to trigger any specific close logic
        const closeBtn = o.querySelector('.modal-close');
        if (closeBtn) {
          closeBtn.click();
        } else {
          o.classList.remove('open');
        }
      }
    });
  });
}
