# PoliStrike Casino

L'evoluzione di "LUCKY STRIKE" in un'esperienza mobile-first a tema universitario, pensata per sfide tra amici e classifiche di ateneo.
Progetto sviluppato in **Vanilla JavaScript (ES Modules)**, HTML5 e CSS, **senza alcun build step**. Pronto per essere ospitato gratuitamente su piattaforme statiche.

## Struttura del Progetto

```text
/
├── index.html          # Shell dell'applicazione
├── css/
│   ├── style.css       # Design System
│   └── components.css  # Componenti UI (vuoto di default, estendibile)
├── js/
│   ├── main.js         # Bootstrap e wiring globale
│   ├── config.js       # Configurazione White-label (Ateneo, Valuta, Corsi)
│   ├── state.js        # Gestione del LocalStorage (Stato, Persistenza)
│   ├── economy.js      # Bonus Giornaliero e Prestiti
│   ├── ui.js           # Funzioni DOM e Modali
│   ├── share.js        # Generazione Canvas e Condivisione (Web Share)
│   ├── leaderboard.js  # Gestore Classifiche (Supabase & Mock locale)
│   ├── analytics.js    # Tracker privacy-friendly configurabile
│   ├── responsible.js  # Logica di disincentivo (Avvisi 20 min)
│   └── games/          # Logiche di Gioco (Blackjack, Roulette, Slots, Crates)
├── supabase/
│   └── schema.sql      # Script SQL per Classifiche Online
├── manifest.json       # PWA Manifest
└── sw.js               # Service Worker per offline cache
```

## Configurazione e White-label (`config.js`)

Nel file `js/config.js` puoi modificare il nome dell'ateneo, la valuta (es. da `CFU` a `ECTS`), la lista dei corsi o facoltà, e i testi principali dell'hero. 

## Deploy su Cloudflare Pages (o Netlify / GitHub Pages)

Non avendo build step, il deploy è istantaneo:
1. Carica la cartella su GitHub/GitLab.
2. Vai su **Cloudflare Pages** (o Netlify).
3. Connetti il repository e clicca su **Deploy**. (Non serve nessun comando di build o cartella `dist`).
4. Il sito sarà online con supporto HTTPS e PWA abilitato.

## Configurazione Classifica Globale (Supabase)

Il gioco funziona di base con una classifica fittizia locale per permettere test immediati. Per abilitare la classifica reale multigiocatore:
1. Crea un progetto gratuito su [Supabase](https://supabase.com).
2. Esegui il contenuto di `supabase/schema.sql` nel **SQL Editor** di Supabase per creare la tabella, le funzioni RPC e le policy RLS.
3. Copia l'`URL` del progetto e la chiave `anon/public` nelle impostazioni.
4. Incolla i valori dentro `js/config.js` (sezione `supabase`).
*(Assicurati di **non** esporre la chiave `service_role`)*.

### Limiti Noti (Anti-Cheat Client-Side)
Poiché l'intera logica di gioco è ospitata nel client per non avere costi server, i punteggi della classifica potrebbero essere falsificati da utenti molto esperti modificando il LocalStorage e inviando chiamate REST dirette.
Abbiamo mitigato il problema inserendo una **Policy RLS in Supabase** che blocca punteggi assurdi (es. > 1 miliardo), ma sconsigliamo di utilizzare la classifica per assegnare premi del mondo reale.

## Gioco Responsabile

Questo progetto è strettamente **Solo Per Divertimento (Play Money)**. 
- Nessun pagamento reale, nessuna pubblicità aggressiva.
- Abbiamo implementato dei **Prestiti** per i giocatori a saldo zero (con un cooldown di 6 ore) e un **Bonus Giornaliero** per premiare la fedeltà.
- Un timer in background (`responsible.js`) ricorderà gentilmente agli utenti di andare a studiare dopo 20 minuti ininterrotti di sessione.
- Per supporto al gioco d'azzardo problematico, visitare il sito ufficiale ISS: [Gioca Responsabile (Numero Verde Nazionale 800 558822)](https://numeroverdeazzardo.iss.it/)
