import { getBet, addBet, clearBet, commitBet, setGameActive, getGameActive } from './shared.js';
import { updateGlobalUI } from '../ui.js';
import { updateBalance, recordGameWin, addHand, getState } from '../state.js';

const suits = ['♠','♥','♦','♣'];
const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck = [], pHand = [], dHand = [], dhidden = true;

function buildDeck() {
  deck = [];
  for (let s of suits) for (let v of vals) deck.push({s,v});
  
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardNum(c) {
  if (['J','Q','K'].includes(c.v)) return 10;
  if (c.v === 'A') return 11;
  return parseInt(c.v);
}

// Pure function for testing
export function scoreHand(hand, skipLast = false) {
  let h = skipLast ? [hand[0]] : hand;
  let s = 0, a = 0;
  for (let c of h) {
    s += cardNum(c);
    if (c.v === 'A') a++;
  }
  while (s > 21 && a > 0) {
    s -= 10;
    a--;
  }
  return s;
}

function cardHTML(c, hidden = false) {
  if (hidden) return `<div class="playing-card hidden"></div>`;
  const red = ['♥','♦'].includes(c.s);
  const cl = red ? 'red-c' : 'black-c';
  // Note: Using safe HTML construction conceptually, but here we just return string.
  // When inserting to DOM we should use safer methods if possible, but these are static constants.
  return `<div class="playing-card ${cl}"><div class="card-top"><span>${c.v}</span><small>${c.s}</small></div><div class="card-bot"><span>${c.v}</span><small>${c.s}</small></div></div>`;
}

function renderBJ() {
  // Use innerHTML only for trusted static symbols
  document.getElementById('p-hand').innerHTML = pHand.map(c => cardHTML(c)).join('');
  document.getElementById('d-hand').innerHTML = dHand.map((c, i) => cardHTML(c, dhidden && i === 1)).join('');
  document.getElementById('p-score').textContent = scoreHand(pHand);
  document.getElementById('d-score').textContent = dhidden ? scoreHand(dHand, true) : scoreHand(dHand);
}

function bjMsg(t, cls = '') {
  const el = document.getElementById('bj-msg');
  if (!el) return;
  el.textContent = t;
  el.className = 'game-status ' + cls;
}

function setBJBtns(active) {
  const btnDeal = document.getElementById('btn-deal');
  const btnHit = document.getElementById('btn-hit');
  const btnStand = document.getElementById('btn-stand');
  const btnDbl = document.getElementById('btn-dbl');
  
  if (btnDeal) btnDeal.disabled = active;
  if (btnHit) btnHit.disabled = !active;
  if (btnStand) btnStand.disabled = !active;
  if (btnDbl) btnDbl.disabled = !active || pHand.length !== 2;
}

export function initBlackjack() {
  window.bjAddBet = (n) => addBet(n);
  window.bjClearBet = () => clearBet();
  window.bjDeal = bjDeal;
  window.bjHit = bjHit;
  window.bjStand = bjStand;
  window.bjDouble = bjDouble;
}

function bjDeal() {
  if (getGameActive()) return;
  if (getBet() <= 0) { bjMsg('Piazzate una puntata!'); return; }
  
  const state = getState();
  if (state.balance < getBet()) { bjMsg('Fondi insufficienti!'); return; }
  
  if (!commitBet()) return;
  
  buildDeck();
  pHand = [deck.pop(), deck.pop()];
  dHand = [deck.pop(), deck.pop()];
  dhidden = true;
  setGameActive(true);
  
  renderBJ();
  setBJBtns(true);
  
  if (scoreHand(pHand) === 21) {
    bjMsg('⚡ BLACKJACK! ⚡', 'win');
    bjEnd();
    return;
  }
  bjMsg('Carta o state?');
}

function bjHit() {
  if (!getGameActive()) return;
  pHand.push(deck.pop());
  renderBJ();
  
  const s = scoreHand(pHand);
  if (s > 21) {
    bjMsg('Sballi l\'esame!', 'lose'); // Themed text
    bjEnd();
  } else if (s === 21) {
    bjMsg('21!', 'win');
    bjStand();
  }
  const btnDbl = document.getElementById('btn-dbl');
  if (btnDbl) btnDbl.disabled = true;
}

function bjStand() {
  if (!getGameActive()) return;
  bjEnd();
}

function bjDouble() {
  if (!getGameActive()) return;
  const state = getState();
  const currentBet = getBet();
  
  if (state.balance < currentBet) {
    bjMsg('Fondi insufficienti per raddoppiare!');
    return;
  }
  
  updateBalance(-currentBet, false); // Deduct double bet
  window.bjAddBet(currentBet); // Visual update
  
  pHand.push(deck.pop());
  renderBJ();
  
  if (scoreHand(pHand) > 21) {
    bjMsg('Sballato dopo raddoppio!', 'lose');
    bjEnd();
  } else {
    bjEnd();
  }
}

function bjEnd() {
  dhidden = false;
  while (scoreHand(dHand) < 17) dHand.push(deck.pop());
  renderBJ();
  setBJBtns(false);
  setGameActive(false);
  
  const ps = scoreHand(pHand);
  const ds = scoreHand(dHand);
  const bet = getBet();
  
  let msg = '', cls = '', gain = 0;
  
  if (ps > 21) {
    msg = 'Sballato. Il professore vince.';
    cls = 'lose';
  } else if (ds > 21) {
    msg = 'Il professore sballa! Vinto!';
    cls = 'win';
    gain = bet * 2;
  } else if (ps > ds) {
    msg = 'Esame superato!';
    cls = 'win';
    gain = bet * 2;
  } else if (ps === ds) {
    msg = 'Rimandato — Puntata restituita.';
    cls = 'push';
    gain = bet;
  } else {
    msg = 'Bocciato. Il professore vince.';
    cls = 'lose';
  }
  
  if (ps === 21 && pHand.length === 2) {
    if (ds === 21 && dHand.length === 2) {
      msg = 'Doppio 30 e Lode! — Pareggio.';
      cls = 'push';
      gain = bet;
    } else {
      msg = '⚡ 30 E LODE! Paga 3:2 ⚡';
      cls = 'win';
      gain = Math.floor(bet * 2.5);
    }
  }
  
  if (gain > 0) {
    updateBalance(gain, true);
  }
  if (cls === 'win') {
    recordGameWin('bj', gain);
  }
  
  addHand('bj');
  bjMsg(msg, cls);
  updateGlobalUI();
}
