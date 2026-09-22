import { getState, saveState } from './state.js';

const DAILY_BASE = 500;
const STREAK_BONUS = 100;
const MAX_STREAK = 7;
const LOAN_AMOUNT = 100;
const LOAN_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

export function checkDailyBonus() {
  const state = getState();
  const now = Date.now();
  const lastBonus = state.lastDailyBonus;
  
  if (!lastBonus) return { available: true };
  
  const msInDay = 24 * 60 * 60 * 1000;
  const daysSince = (now - lastBonus) / msInDay;
  
  if (daysSince >= 1) {
    if (daysSince >= 2) {
      // Streak broken
      return { available: true, streakBroken: true };
    }
    // Streak continues
    return { available: true, streakBroken: false };
  }
  
  const timeRemainingMs = msInDay - (now - lastBonus);
  return { available: false, timeRemainingMs };
}

export function claimDailyBonus() {
  const state = getState();
  const check = checkDailyBonus();
  
  if (!check.available) return { success: false, reason: 'too_early' };
  
  if (check.streakBroken) {
    state.dailyStreak = 0;
  }
  
  state.dailyStreak = Math.min(state.dailyStreak + 1, MAX_STREAK);
  
  const amount = DAILY_BASE + ((state.dailyStreak - 1) * STREAK_BONUS);
  
  state.balance += amount;
  state.lastDailyBonus = Date.now();
  saveState();
  
  return { success: true, amount, streak: state.dailyStreak };
}

export function checkLoan() {
  const state = getState();
  const now = Date.now();
  
  // Can only take loan if balance is below 10 (minimum bet for most things)
  if (state.balance >= 10) {
    return { available: false, reason: 'balance_too_high' };
  }
  
  if (!state.lastLoan) return { available: true };
  
  const timeSinceLoan = now - state.lastLoan;
  if (timeSinceLoan >= LOAN_COOLDOWN_MS) {
    return { available: true };
  }
  
  return { available: false, reason: 'cooldown', timeRemainingMs: LOAN_COOLDOWN_MS - timeSinceLoan };
}

export function takeLoan() {
  const state = getState();
  const check = checkLoan();
  
  if (!check.available) return { success: false, reason: check.reason };
  
  state.balance += LOAN_AMOUNT;
  state.debts += LOAN_AMOUNT;
  state.lastLoan = Date.now();
  saveState();
  
  return { success: true, amount: LOAN_AMOUNT };
}

export function getNetWorth() {
  const state = getState();
  return state.balance - state.debts;
}
