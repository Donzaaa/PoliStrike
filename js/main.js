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
import { initResponsibleGaming } from './responsible.js';

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
  closeMobileMenu();
};

window.toggleMobileMenu = () => {
  const nav = document.getElementById('main-nav');
  const overlay = document.getElementById('mobile-menu-overlay');
  if (nav) nav.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
};

function closeMobileMenu() {
  const nav = document.getElementById('main-nav');
  const overlay = document.getElementById('mobile-menu-overlay');
  if (nav) nav.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

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

window.openSettings = () => {
  openModal('settings');
  closeMobileMenu();
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

document.addEventListener('DOMContentLoaded', () => {
  initState();
  

  // Apply Config texts
  document.getElementById('brand-title-line1').textContent = CONFIG.texts.heroTitleLine1;
  document.getElementById('brand-title-line2').textContent = CONFIG.texts.heroTitleLine2;
  document.getElementById('hero-sub-text').textContent = CONFIG.texts.heroSub;
  document.querySelectorAll('.brand-name').forEach(el => el.textContent = CONFIG.texts.brandName);
  
  // Load Theme
  const savedTheme = localStorage.getItem('ps_theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  

  updateGlobalUI();

  initTicker();
  setupModals();
  
  // Init i18n
  import('./i18n.js').then(m => {
    m.applyTranslations();
    m.updateLangButton();
  });
  
  // Init Modules
  import('./analytics.js').then(m => m.initAnalytics()).catch(e => console.warn("Analytics blocked"));
  initResponsibleGaming();
  
  // Init Games
  initBlackjack();
  initRoulette();
  initSlots();
  initCrates();
  initCrash();
  initMines();
});
