import { CONFIG } from './config.js';

export function initAnalytics() {
  // Controlla la scelta precedente
  const cookieConsent = localStorage.getItem('ps_cookie_consent');
  
  window.acceptCookies = () => {
    localStorage.setItem('ps_cookie_consent', 'accepted');
    document.getElementById('cookie-banner').style.display = 'none';
    // Avvia tracciamento se accettato
    if (window.trackEvent) window.trackEvent('page_view');
  };
  
  window.rejectCookies = () => {
    localStorage.setItem('ps_cookie_consent', 'rejected');
    document.getElementById('cookie-banner').style.display = 'none';
  };
  
  if (!cookieConsent) {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
    return; // Non inizializza finché non c'è consenso
  } else if (cookieConsent === 'rejected') {
    return; // Tracciamento negato
  }

  if (!CONFIG.analytics.enabled || !CONFIG.analytics.id) return;
  
  // Example for Plausible / Umami. They usually rely on a script tag, 
  // but we can manually trigger events if we want, or just append the script tag dynamically.
  
  // Here we use a generic manual event tracker
  window.trackEvent = (eventName, props = {}) => {
    if (!CONFIG.analytics.enabled) return;
    
    // Plausible
    if (window.plausible) {
      window.plausible(eventName, { props });
    }
    // Umami
    else if (window.umami) {
      window.umami.track(eventName, props);
    }
    else {
      console.log(`[Analytics] ${eventName}`, props);
    }
  };
  
  // Track game open
  window.trackEvent('page_view');
}
