import { checkSession, loginWithGoogle, loginAsGuest } from './auth.js';
import { initState, updateBalance, getState, resetGameCompletely } from './state.js';
import { checkDailyBonus, claimDailyBonus, checkLoan, takeLoan, getNetWorth } from './economy.js';
import { updateGlobalUI, initTicker, setupModals, openModal, closeModal, setCurrentGame } from './ui.js';
import { initBlackjack } from './games/blackjack.js';
import { initRoulette, buildRWWheel, buildNumGrid } from './games/roulette.js';
import { initSlots } from './games/slots.js';
import { initCrates, buildCasesUI } from './games/crates.js';
import { initCrash } from './games/crash.js';
import { initMines } from './games/mines.js';
import { CONFIG } from './config.js';
import { initAnalytics } from './analytics.js';
import { initResponsibleGaming } from './responsible.js';

// Setup auth global functions
window.appLoginGoogle = () => loginWithGoogle();
window.appLoginGuest = () => loginAsGuest(() => {
  const modalAuth = document.getElementById('modal-auth');
  if(modalAuth) modalAuth.style.display = 'none';
  hideFeaturesForGuest();
});

function hideFeaturesForGuest() {
  const lbBtn = document.getElementById('nav-leaderboard');
  const profBtn = document.getElementById('nav-profile');
  const dangerZone = document.querySelector('.settings-danger-zone');
  
  if (lbBtn) lbBtn.style.display = 'none';
  if (profBtn) profBtn.style.display = 'none';
  if (dangerZone) dangerZone.style.display = 'none';
}

// Setup global functions for UI calls
window.openGame = (g) => {
  openModal(g);
  setCurrentGame(g);
  if (g === 'rw') {
    buildRWWheel();
    buildNumGrid();
  }
  if (g === 'cs') {
    buildCasesUI();
    window.csSetCasePrice(10);
  }
};

window.closeModal = closeModal;

window.toggleLang = async () => {
  const i18n = await import('./i18n.js');
  i18n.toggleLanguage();
};

window.closeGame = (g) => {
  // Prevent closing if a game is actively rolling? Not strictly required by UI now, 
  // but we can just call closeModal. The clearBet is now handled more safely.
  closeModal(g);
  // Optional: clear bet when closing only if not active
  import('./games/shared.js').then(module => {
    module.clearBet();
  });
};

window.claimBonus = () => {
  const result = claimDailyBonus();
  if (result.success) {
    alert(`🎉 Bonus Giornaliero Riscattato!\n+${CONFIG.currencySymbol}${result.amount}\nStreak attuale: ${result.streak} giorni`);
    updateGlobalUI();
  } else {
    alert(`Torna più tardi per il prossimo bonus.`);
  }
};

window.takeStudentLoan = () => {
  const result = takeLoan();
  if (result.success) {
    alert(`💸 Hai ricevuto un prestito di ${CONFIG.currencySymbol}${result.amount}!\nAttenzione: i debiti abbassano il tuo punteggio in classifica.`);
    updateGlobalUI();
  } else {
    if (result.reason === 'balance_too_high') {
      alert(`Non puoi chiedere un prestito finché hai ${CONFIG.currencySymbol}10 o più.`);
    } else {
      alert(`Prestito non disponibile. Attendi la fine del cooldown.`);
    }
  }
};

window.resetEverything = () => {
  if (confirm("Sei sicuro di voler ricominciare da zero? Perderai tutti i tuoi " + CONFIG.currencySymbol + ", i debiti e le statistiche. Questa azione non può essere annullata.")) {
    resetGameCompletely();
  }
};

window.openProfile = () => {
  openModal('profile');
  const state = getState();
  if (state.profile.nickname) {
    document.getElementById('prof-nickname').value = state.profile.nickname;
  }
  if (state.profile.course) {
    document.getElementById('prof-course').value = state.profile.course;
  }
  if (state.profile.instagram) {
    document.getElementById('prof-ig').value = state.profile.instagram;
  }
  document.getElementById('prof-msg').textContent = '';
};

window.saveProfile = async () => {
  const { registerProfile } = await import('./leaderboard.js');
  
  // Sanificazione base contro l'inserimento di tag HTML
  const sanitizeHTML = (str) => str.replace(/[^\w. @-]/gi, function (c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
  
  const nick = sanitizeHTML(document.getElementById('prof-nickname').value.trim());
  const course = document.getElementById('prof-course').value;
  const consentEl = document.getElementById('prof-consent');
  const consent = consentEl ? consentEl.checked : false;
  let ig = sanitizeHTML(document.getElementById('prof-ig').value.trim());
  
  // Remove @ if user added it
  if (ig.startsWith('@')) {
    ig = ig.substring(1);
  }
  
  const msgEl = document.getElementById('prof-msg');
  if (consentEl && !consent) {
    msgEl.style.color = 'var(--hot)';
    msgEl.textContent = "Devi accettare la privacy policy per continuare.";
    return;
  }
  
  const res = registerProfile(nick, course, ig);
  if (!res.success) {
    msgEl.style.color = 'var(--hot)';
    msgEl.textContent = res.reason;
  } else {
    msgEl.style.color = 'var(--volt)';
    msgEl.textContent = "Profilo salvato con successo!";
    setTimeout(() => closeModal('profile'), 1500);
  }
};

window.openLeaderboard = async () => {
  openModal('leaderboard');
  const { renderLeaderboardTab } = await import('./leaderboard.js');
  renderLeaderboardTab('global');
};

window.switchLeaderboardTab = async (tab) => {
  const { renderLeaderboardTab } = await import('./leaderboard.js');
  renderLeaderboardTab(tab);
};

window.openSettings = () => {
  openModal('settings');
};

window.openPrivacy = () => {
  openModal('privacy');
};

window.closeModal = (id) => {
  closeModal(id);
};

window.setTheme = (themeName) => {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('ps_theme', themeName);
};


window.deleteAccount = async () => {
  if (confirm("ATTENZIONE: Questa azione è irreversibile. Eliminerà fisicamente il tuo account da Supabase. Sei sicuro?")) {
    const { deleteAccount } = await import('./auth.js');
    await deleteAccount();
  }
};

window.syncScore = async () => {
  const state = getState();
  if (!state.profile.nickname || !state.profile.course) {
    window.openProfile();
    return;
  }
  
  const msgEl = document.getElementById('lb-msg');
  msgEl.textContent = "Sincronizzazione in corso...";
  msgEl.style.color = 'var(--text)';
  
  const { submitScore, renderLeaderboardTab } = await import('./leaderboard.js');
  const success = await submitScore();
  
  if (success) {
    msgEl.textContent = "Punteggio sincronizzato!";
    msgEl.style.color = 'var(--volt)';
    renderLeaderboardTab('global'); // Refresh
  } else {
    msgEl.textContent = "Errore durante la sincronizzazione.";
    msgEl.style.color = 'var(--hot)';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initState();
  
  // Auth Check
  checkSession(
    // onGuest
    () => { hideFeaturesForGuest(); },
    // onLogged
    (user) => { /* All features enabled */ },
    // onShowLogin
    () => {
      const modalAuth = document.getElementById('modal-auth');
      if (modalAuth) modalAuth.style.display = 'flex';
    }
  );
  
  // Apply Config texts
  document.getElementById('brand-title-line1').textContent = CONFIG.texts.heroTitleLine1;
  document.getElementById('brand-title-line2').textContent = CONFIG.texts.heroTitleLine2;
  document.getElementById('hero-sub-text').textContent = CONFIG.texts.heroSub;
  document.querySelectorAll('.brand-name').forEach(el => el.textContent = CONFIG.texts.brandName);
  
  // Load Theme
  const savedTheme = localStorage.getItem('ps_theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Populate course select
  const courseSelect = document.getElementById('prof-course');
  if (courseSelect) {
    courseSelect.innerHTML = '<option value="" disabled selected>Seleziona la tua facoltà/corso...</option>';
    CONFIG.courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      courseSelect.appendChild(opt);
    });
  }
  
  updateGlobalUI();

  initTicker();
  setupModals();
  
  // Init i18n
  import('./i18n.js').then(m => {
    m.applyTranslations();
    m.updateLangButton();
  });
  
  // Init Modules
  initAnalytics();
  initResponsibleGaming();
  
  // Init Games
  initBlackjack();
  initRoulette();
  initSlots();
  initCrates();
  initCrash();
  initMines();
});
