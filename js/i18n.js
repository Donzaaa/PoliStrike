import { getState, saveState } from './state.js';
import { buildCasesUI } from './games/crates.js';

const dictionary = {
  nav_blackjack: { it: "Blackjack", en: "Blackjack" },
  nav_roulette: { it: "Roulette", en: "Roulette" },
  nav_slots: { it: "Slot Machine", en: "Slots" },
  nav_crates: { it: "Casse", en: "Crates" },
  nav_settings: { it: "Impostazioni", en: "Settings" },
  nav_play: { it: "Gioca Ora", en: "Play Now" },
  
  set_theme: { it: "Tema e Aspetto", en: "Theme & Appearance" },
  set_theme_cy: { it: "Cyberpunk", en: "Cyberpunk" },
  set_theme_light: { it: "Light", en: "Light" },
  set_theme_mid: { it: "Midnight", en: "Midnight" },
  set_danger: { it: "Zona Pericolosa", en: "Danger Zone" },
  set_reset: { it: "Azzera Dati Locali (Ospite)", en: "Reset Local Data (Guest)" },
  set_theme_desc: { it: "Personalizza l'interfaccia visiva del casinò per la tua sessione.", en: "Customize the casino's visual interface for your session." },
  set_danger_desc: { it: "Azioni irreversibili per il tuo account e i tuoi dati locali.", en: "Irreversible actions for your account and local data." },
  set_reset_sub: { it: "Cancella subito crediti, debiti e statistiche di gioco", en: "Instantly clear credits, debts and game stats" },
  

  support_btn: { it: "Offrimi un Caffè ☕", en: "Buy me a Coffee ☕" },
  
  // Aggiunte di base per l'HUD
  hud_balance: { it: "SALDO", en: "BALANCE" },
  hud_debt: { it: "DEBITO", en: "DEBT" },
  hud_pl: { it: "PROFITTO", en: "PROFIT" },
  hud_hands: { it: "MANI", en: "HANDS" },
  
  menu_daily: { it: "Riscatta Bonus Giornaliero (500 CFU)", en: "Claim Daily Bonus (500 CFU)" },
  menu_loan: { it: "Chiedi Prestito (1000 CFU)", en: "Request Loan (1000 CFU)" },
  menu_reset: { it: "Azzera Account", en: "Reset Account" },

  brand_sub: { it: "Piattaforma Digitale", en: "Digital Platform" },
  hero_eyebrow: { it: "Il Tuo Hub Online", en: "Your Online Hub" },
  hero_sub: { it: "Blackjack · Roulette · Slot Machine · Casse Premi · Solo Per Divertimento", en: "Blackjack · Roulette · Slots · Crates · Just For Fun" },
  hero_btn_play: { it: "Inizia a Giocare", en: "Start Playing" },
  hero_btn_discover: { it: "Scopri i Giochi", en: "Discover Games" },
  stat_games: { it: "Giochi Disponibili", en: "Available Games" },
  stat_credit: { it: "Credito Iniziale", en: "Starting Balance" },
  stat_max_payout: { it: "Max Pagamento", en: "Max Payout" },
  section_tag: { it: "I Nostri Giochi", en: "Our Games" },
  section_title: { it: "SCEGLI IL <em>TUO GIOCO</em>", en: "CHOOSE YOUR <em>GAME</em>" },
  
  card_bj: { it: "Blackjack", en: "Blackjack" },
  card_rw: { it: "Roulette", en: "Roulette" },
  card_sl: { it: "Slot Machine", en: "Slots" },
  card_cs: { it: "Casse Premi", en: "Crates" },
  
  desc_bj: { it: "Il classico gioco da tavolo. Batti il banco senza sballare il 21. Blackjack naturale paga 3:2.", en: "The classic table game. Beat the dealer without busting 21. Natural blackjack pays 3:2." },
  tag_bj: { it: "Fino a 2.5×", en: "Up to 2.5×" },
  desc_rw: { it: "La regina dei giochi. Punta su numeri, colori o gruppi. La palla decide il tuo destino.", en: "The queen of games. Bet on numbers, colors or groups. The ball decides your fate." },
  tag_rw: { it: "Fino a 36×", en: "Up to 36×" },
  desc_sl: { it: "Tre rulli, sette simboli e jackpot esplosivi. Allinea i diamanti per la vincita del secolo.", en: "Three reels, seven symbols and explosive jackpots. Align the diamonds for the win of the century." },
  tag_sl: { it: "Fino a 50×", en: "Up to 50×" },
  desc_cs: { it: "Apri casse esclusive in stile CS:GO. Rullo animato, rarità leggendarie, skin ultra-rare. Ogni apertura è un'emozione.", en: "Open exclusive CS:GO style crates. Animated roll, legendary rarities, ultra-rare skins. Every unboxing is a thrill." },
  tag_cs: { it: "Fino a 250×", en: "Up to 250×" },
  card_cr: { it: "Upgrade", en: "Upgrade" },
  desc_cr: { it: "Scegli il tuo bersaglio e sfida la fortuna. Riuscirai a fare l'upgrade e moltiplicare i tuoi crediti?", en: "Choose your target and push your luck. Will you successfully upgrade and multiply your credits?" },
  tag_cr: { it: "Fino a 1000×", en: "Up to 1000×" },
  card_mn: { it: "Mines", en: "Mines" },
  desc_mn: { it: "Rivela le gemme nascoste ed evita le bombe. Più ne trovi, più il premio cresce. Sfida la fortuna!", en: "Reveal hidden gems and avoid bombs. The more you find, the bigger the prize. Test your luck!" },
  tag_mn: { it: "Fino a 10000×", en: "Up to 10000×" },
  btn_arrow: { it: "Gioca →", en: "Play →" },
  btn_open_arrow: { it: "Apri →", en: "Open →" },


  modal_cs_title: { it: "📦 CASSE PREMI", en: "📦 CRATES" },
  cs_select: { it: "Seleziona una Cassa", en: "Select a Crate" },
  cs_rarities: { it: "Rarità Disponibili", en: "Available Rarities" },
  cs_btn_open: { it: "📦 Apri Cassa", en: "📦 Open Crate" },
  cs_msg: { it: "La cassa si apre...", en: "Opening crate..." },
  cs_win_title: { it: "Hai Ottenuto", en: "You Got" },
  cs_win_sub: { it: "Valore aggiunto al saldo", en: "Value added to balance" },
  cs_btn_again: { it: "Apri Ancora", en: "Open Again" },
  cs_btn_back: { it: "← Cambia Cassa", en: "← Change Crate" },

  modal_bj_title: { it: "🃏 BLACKJACK", en: "🃏 BLACKJACK" },
  bj_dealer: { it: "Mazziere", en: "Dealer" },
  bj_player: { it: "Il Vostro Gioco", en: "Your Hand" },
  bj_msg: { it: "Piazzate la puntata e distribuite", en: "Place your bet and deal" },
  bj_deal: { it: "Distribuisci", en: "Deal" },
  bj_hit: { it: "Carta", en: "Hit" },
  bj_stand: { it: "Stai", en: "Stand" },
  bj_dbl: { it: "Raddoppia", en: "Double" },
  btn_clear: { it: "Azzera", en: "Clear" },

  modal_cr_title: { it: "⬆️ UPGRADE", en: "⬆️ UPGRADE" },
  cr_msg: { it: "Piazza la tua puntata!", en: "Place your bet!" },
  cr_bet: { it: "Puntata:", en: "Bet:" },
  cr_start: { it: "UPGRADE", en: "UPGRADE" },

  modal_mn_title: { it: "💣 MINES", en: "💣 MINES" },
  mn_msg: { it: "Imposta bombe e puntata.", en: "Set bombs and bet." },
  mn_bombs_label: { it: "NUMERO DI BOMBE (1-23)", en: "BOMBS COUNT (1-23)" },
  mn_bet_label: { it: "PUNTATA", en: "BET AMOUNT" },
  mn_bet: { it: "Puntata:", en: "Bet:" },
  mn_next: { it: "Prossima Gemma:", en: "Next Gem:" },
  mn_start: { it: "GIOCA", en: "PLAY" },

  modal_rw_title: { it: "🎡 ROULETTE", en: "🎡 ROULETTE" },
  rw_msg: { it: "Scegliete puntata e numero", en: "Choose bet and number" },
  rw_spin: { it: "Gira la Ruota", en: "Spin Wheel" },

  modal_sl_title: { it: "🎰 SLOT MACHINE", en: "🎰 SLOTS" },
  sl_msg: { it: "Buona fortuna! Gira i rulli.", en: "Good luck! Spin the reels." },
  sl_spin: { it: "▶ GIRA", en: "▶ SPIN" },
  sl_payout_title: { it: "Tabella Pagamenti", en: "Payout Table" },
  sl_anywhere: { it: "☕☕ IN QUALSIASI POSIZIONE", en: "☕☕ ANYWHERE" },

  footer_1: { it: "Solo per divertimento", en: "Just for fun" },
  footer_2: { it: "Nessun denaro reale coinvolto", en: "No real money involved" },
  footer_3: { it: "Gioco responsabile", en: "Responsible gaming" },
  
  // Dynamic Game Messages
  msg_invalid_bet: { it: "Puntata non valida.", en: "Invalid bet amount." },
  msg_no_credit: { it: "Credito insufficiente.", en: "Insufficient balance." },
  
  // Upgrade
  upg_target: { it: "TARGET MULTIPLIER (×)", en: "TARGET MULTIPLIER (×)" },
  upg_win_chance: { it: "Win Chance", en: "Win Chance" },
  upg_choose: { it: "Scegli Target e Puntata!", en: "Choose Target & Bet!" },
  upg_progress: { it: "Upgrading...", en: "Upgrading..." },
  upg_success: { it: "UPGRADE RIUSCITO! Hai vinto {{win}} CFU.", en: "UPGRADE SUCCESSFUL! You won {{win}} CFU." },
  upg_fail: { it: "UPGRADE FALLITO! Hai perso {{bet}} CFU.", en: "UPGRADE FAILED! You lost {{bet}} CFU." },
  
  // Mines
  mn_choose_cell: { it: "Scegli una cella...", en: "Choose a cell..." },
  mn_cashout_btn: { it: "CASH OUT ({{mult}}×)", en: "CASH OUT ({{mult}}×)" },
  mn_win: { it: "Cash out! Hai vinto {{win}} CFU.", en: "Cash out! You won {{win}} CFU." },
  mn_lose: { it: "BOOM! Hai perso la puntata.", en: "BOOM! You lost the bet." }
};

export function t(key, params = {}) {
  const state = getState();
  const lang = state.lang || 'it';
  let text = (dictionary[key] && dictionary[key][lang]) ? dictionary[key][lang] : key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{{${k}}}`, v);
  }
  return text;
}

export function toggleLanguage() {
  const state = getState();
  state.lang = state.lang === 'it' ? 'en' : 'it';
  saveState();
  applyTranslations();
  updateLangButton();
  if (typeof buildCasesUI === 'function') {
    buildCasesUI();
  }
}

export function applyTranslations() {
  const state = getState();
  const currentLang = state.lang || 'it';
  
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dictionary[key] && dictionary[key][currentLang]) {
      // Se è un input con placeholder
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', dictionary[key][currentLang]);
      } else {
        el.innerHTML = dictionary[key][currentLang];
      }
    }
  });
}

export function updateLangButton() {
  const state = getState();
  const currentLang = state.lang || 'it';
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) {
    if (currentLang === 'it') {
      btn.innerHTML = '<img src="https://flagcdn.com/w40/gb.png" width="32" alt="English" style="border-radius:4px">';
      btn.title = 'Switch to English';
    } else {
      btn.innerHTML = '<img src="https://flagcdn.com/w40/it.png" width="32" alt="Italiano" style="border-radius:4px">';
      btn.title = 'Passa all\'Italiano';
    }
  }
}
