export function initResponsibleGaming() {
  const SESSION_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
  
  if (sessionStorage.getItem('poliStrike_rg_silenced') === 'true') {
    return;
  }
  
  setTimeout(() => {
    if (sessionStorage.getItem('poliStrike_rg_silenced') === 'true') return;
    
    const wantsToSilence = confirm("Hai giocato per 20 minuti continui. Sicuro di non voler ripassare un po' per il prossimo esame? 📚\n\nClicca OK per continuare a giocare in silenzio, o Annulla per chiudere il gioco.");
    
    if (wantsToSilence) {
      sessionStorage.setItem('poliStrike_rg_silenced', 'true');
    } else {
      window.location.href = "https://it.wikipedia.org/wiki/Speciale:PaginaCasuale"; // Redirect to studying
    }
  }, SESSION_LIMIT_MS);
}
