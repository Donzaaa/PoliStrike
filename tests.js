import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreHand } from './js/games/blackjack.js';
import { checkRouletteWin } from './js/games/roulette.js';
import { checkSlotsWin } from './js/games/slots.js';

test('Blackjack scoreHand', (t) => {
  assert.equal(scoreHand([{v:'10'}, {v:'5'}]), 15);
  assert.equal(scoreHand([{v:'A'}, {v:'K'}]), 21);
  assert.equal(scoreHand([{v:'A'}, {v:'5'}, {v:'6'}]), 12);
  assert.equal(scoreHand([{v:'A'}, {v:'A'}, {v:'A'}]), 13);
});

test('Roulette checkWin', (t) => {
  assert.equal(checkRouletteWin(10, {type: 'num', val: 10}), 36);
  assert.equal(checkRouletteWin(10, {type: 'black', val: null}), 2);
  assert.equal(checkRouletteWin(10, {type: 'red', val: null}), 0);
  assert.equal(checkRouletteWin(10, {type: 'even', val: null}), 2);
});

test('Slots checkWin', (t) => {
  assert.equal(checkSlotsWin(['🎓', '🎓', '🎓']), 50);
  assert.equal(checkSlotsWin(['7️⃣', '7️⃣', '7️⃣']), 25);
  assert.equal(checkSlotsWin(['☕', '☕', '🎓']), 1.5); // Any two coffees
  assert.equal(checkSlotsWin(['☕', '📐', '🎓']), 0);
});
