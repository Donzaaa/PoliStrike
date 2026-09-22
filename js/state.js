const STATE_KEY = 'poliStrike_state_v1';
const SECRET_SALT = 'PoliStrike_Unbreakable_Salt_2026';

// Default state structure
const DEFAULT_STATE = {
  secret_id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + Math.floor(Math.random()*1000),
  balance: 1000,
  pl: 0,
  hands: 0,
  debts: 0,
  lang: 'it',
  lastDailyBonus: 0,
  dailyStreak: 0,
  lastLoan: 0,
  stats: {
    maxWin: 0,
    favoriteGame: null,
    gamesPlayed: {
      bj: 0,
      rw: 0,
      sl: 0,
      cs: 0
    }
  },
  profile: {
    nickname: null,
    course: null,
    instagram: null
  },
  isGuest: false
};

let state = { ...DEFAULT_STATE };

function generateSignature(dataObj) {
  // Semplice hash sincrono per scoraggiare modifiche manuali da DevTools
  const str = JSON.stringify(dataObj) + SECRET_SALT;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Initialize state from local storage
export function initState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      let dataToLoad = parsed;
      
      // Controllo Anti-Cheat (Firma Digitale)
      if (parsed.data && parsed.sig) {
        const expectedSig = generateSignature(parsed.data);
        if (expectedSig !== parsed.sig) {
          console.error("🚨 MANOMISSIONE RILEVATA: La firma del salvataggio non corrisponde! Resetto l'account a zero.");
          alert("🚨 SEI STATO BECCATO!\nHai tentato di modificare illegalmente i tuoi CFU. Il tuo account è stato azzerato per punizione.");
          state = { ...DEFAULT_STATE, secret_id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() };
          saveState();
          return;
        }
        dataToLoad = parsed.data;
      }
      
      // Merge with default state to ensure all fields exist
      state = { ...DEFAULT_STATE, ...dataToLoad, stats: { ...DEFAULT_STATE.stats, ...(dataToLoad.stats || {}) }, profile: { ...DEFAULT_STATE.profile, ...(dataToLoad.profile || {}) } };
      
      // Migration logic if needed in the future
      if (!state.stats.gamesPlayed) {
        state.stats.gamesPlayed = { bj: 0, rw: 0, sl: 0, cs: 0 };
      }
      if (!state.secret_id) {
        state.secret_id = crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now();
      }
    }
  } catch (e) {
    console.warn("Failed to read state from localStorage, starting fresh.", e);
    state = { ...DEFAULT_STATE };
  }
  saveState();
}

export function getState() {
  return state;
}

export function saveState() {
  try {
    // Creiamo il pacchetto firmato
    const dataToSave = { ...state };
    const sig = generateSignature(dataToSave);
    const payload = { data: dataToSave, sig: sig };
    localStorage.setItem(STATE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to save state to localStorage.", e);
  }
}

export function updateBalance(amount, isWin = true) {
  state.balance += amount;
  if (isWin) {
    state.pl += amount;
  } else {
    state.pl -= Math.abs(amount);
  }
  saveState();
}

export function recordGameWin(gameId, winAmount) {
  if (winAmount > state.stats.maxWin) {
    state.stats.maxWin = winAmount;
  }
}

export function addHand(gameId) {
  state.hands++;
  if (state.stats.gamesPlayed[gameId] !== undefined) {
    state.stats.gamesPlayed[gameId]++;
  }
  
  // Update favorite game
  let max = 0;
  let fav = null;
  for (const [game, count] of Object.entries(state.stats.gamesPlayed)) {
    if (count > max) {
      max = count;
      fav = game;
    }
  }
  state.stats.favoriteGame = fav;
  
  saveState();
}

export function setProfile(nickname, course, instagram = '') {
  state.profile.nickname = nickname;
  state.profile.course = course;
  state.profile.instagram = instagram;
  saveState();
}

export function resetGameCompletely() {
  state = { ...DEFAULT_STATE };
  saveState();
  window.location.reload();
}

export function setGuestMode(isGuest) {
  state.isGuest = isGuest;
  saveState();
}
