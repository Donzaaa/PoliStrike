import { CONFIG } from './config.js';
import { getState, setProfile } from './state.js';
import { getNetWorth } from './economy.js';

import { getSupabase } from './supabase.js';

// Rimosso l'inizializzazione manuale di Supabase


// Basic profanity filter
const badWords = ['cazzo', 'merda', 'puttana', 'troia', 'fottiti', 'stronzo'];
function isClean(name) {
  const n = name.toLowerCase();
  for (let w of badWords) {
    if (n.includes(w)) return false;
  }
  return true;
}

export function registerProfile(nickname, course, instagram = '') {
  if (!nickname || nickname.length < 3 || nickname.length > 16) {
    return { success: false, reason: "Il nickname deve essere tra 3 e 16 caratteri." };
  }
  if (!isClean(nickname)) {
    return { success: false, reason: "Scegli un nickname più educato." };
  }
  if (!CONFIG.courses.includes(course)) {
    return { success: false, reason: "Devi selezionare un corso di studi dal menu a tendina." };
  }
  
  setProfile(nickname, course, instagram);
  return { success: true };
}

// MOCK ADAPTER
const mockData = [
  { nickname: 'Brambilla', course: 'Ingegneria Informatica', score: 12500 },
  { nickname: 'Secchione99', course: 'Ingegneria Gestionale', score: 9800 },
  { nickname: 'Fuoricorso', course: 'Architettura', score: 8500 },
  { nickname: 'GiuliaD', course: 'Design del Prodotto', score: 15200 },
  { nickname: 'MarioRossi', course: 'Ingegneria Meccanica', score: 4000 }
];

async function getMockLeaderboard() {
  return [...mockData].sort((a,b) => b.score - a.score);
}

// MAIN EXPORTS
export async function submitScore() {
  const state = getState();
  if (state.isGuest) {
    alert("Gli ospiti non possono partecipare alla classifica. Accedi con Google dal menu per abilitare questa funzione.");
    return false;
  }
  
  const { nickname, course, instagram } = state.profile;
  if (!nickname || !course) return false;
  
  const score = getNetWorth();
  const supabase = await getSupabase();
  
  if (supabase) {
    try {
      // Usa l'RPC sicura "Fort Knox"
      const { data, error } = await supabase.rpc('submit_score', {
        p_secret_id: state.secret_id,
        p_nickname: nickname,
        p_course: course,
        p_score: score,
        p_instagram: instagram || null
      });
      
      if (error) throw error;
      return true;
    } catch(e) {
      console.error("Supabase error", e);
      // Mostra alert se c'è un errore di sicurezza (es. spam o identity theft)
      if (e.message) {
         alert("Errore Server: " + e.message);
      }
      return false;
    }
  } else {
    // Mock
    const existing = mockData.find(m => m.nickname === nickname);
    if (existing) { existing.score = score; }
    else { mockData.push({ nickname, course, score }); }
    return true;
  }
}

export async function getGlobalLeaderboard() {
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    } catch(e) {
      console.warn("Falling back to mock", e);
      return getMockLeaderboard();
    }
  }
  return getMockLeaderboard();
}

export async function getCourseLeaderboard() {
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_course_averages');
      if (error) throw error;
      return data.map(d => ({ course: d.course, score: d.avg_score }));
    } catch(e) {
      console.warn("RPC failed, mock fallback");
      return mockCourseLeaderboard();
    }
  }
  return mockCourseLeaderboard();
}

function mockCourseLeaderboard() {
  const courses = {};
  mockData.forEach(m => {
    if(!courses[m.course]) courses[m.course] = [];
    courses[m.course].push(m.score);
  });
  const res = [];
  for (let c in courses) {
    const scores = courses[c].sort((a,b)=>b-a).slice(0,10);
    const avg = scores.reduce((a,b)=>a+b,0) / scores.length;
    res.push({ course: c, score: Math.round(avg) });
  }
  return res.sort((a,b) => b.score - a.score);
}

// UI RENDERING LOGIC
export async function renderLeaderboardTab(tab) {
  const listEl = document.getElementById('leaderboard-list');
  const tabGlob = document.getElementById('tab-global');
  const tabCourse = document.getElementById('tab-course');
  
  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--muted)">Caricamento classifica...</div>';
  
  // Update Tab UI
  if (tabGlob && tabCourse) {
    if (tab === 'global') {
      tabGlob.classList.add('active');
      tabCourse.classList.remove('active');
    } else {
      tabCourse.classList.add('active');
      tabGlob.classList.remove('active');
    }
  }
  
  let data = [];
  if (tab === 'global') {
    data = await getGlobalLeaderboard();
  } else {
    data = await getCourseLeaderboard();
  }
  
  // Safe DOM creation
  listEl.innerHTML = '';
  
  if (!data || data.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--muted)">Nessun punteggio trovato. Diventa il primo!</div>';
    return;
  }
  
  data.forEach((row, index) => {
    const r = index + 1;
    const item = document.createElement('div');
    item.className = 'lb-row';
    
    // Rank
    const rankEl = document.createElement('div');
    rankEl.className = 'lb-rank';
    if (r === 1) item.classList.add('rank-gold');
    if (r === 2) item.classList.add('rank-silver');
    if (r === 3) item.classList.add('rank-bronze');
    rankEl.textContent = '#' + r;
    
    // Details
    const detailsEl = document.createElement('div');
    detailsEl.className = 'lb-details';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'lb-name';
    nameEl.style.display = 'flex';
    nameEl.style.alignItems = 'center';
    nameEl.style.gap = '0.5rem';
    
    const nameText = document.createElement('span');
    nameText.textContent = tab === 'global' ? row.nickname : row.course;
    nameEl.appendChild(nameText);
    
    // Instagram Icon se presente
    if (tab === 'global' && row.instagram) {
      const igLink = document.createElement('a');
      igLink.href = `https://instagram.com/${row.instagram}`;
      igLink.target = '_blank';
      igLink.style.color = '#E1306C';
      igLink.style.display = 'flex';
      igLink.style.alignItems = 'center';
      igLink.style.textDecoration = 'none';
      igLink.style.transition = 'transform 0.2s';
      igLink.onmouseover = () => igLink.style.transform = 'scale(1.1)';
      igLink.onmouseout = () => igLink.style.transform = 'scale(1)';
      
      // Minimalist Instagram SVG
      igLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
      nameEl.appendChild(igLink);
    }
    
    const subEl = document.createElement('div');
    subEl.className = 'lb-course';
    if (tab === 'global') {
      subEl.textContent = row.course || '';
    }
    
    detailsEl.appendChild(nameEl);
    if (tab === 'global') detailsEl.appendChild(subEl);
    
    // Score
    const scoreEl = document.createElement('div');
    scoreEl.className = 'lb-score';
    scoreEl.textContent = (row.score || 0).toLocaleString('it-IT') + ' ' + CONFIG.currencySymbol;
    
    item.appendChild(rankEl);
    item.appendChild(detailsEl);
    item.appendChild(scoreEl);
    
    listEl.appendChild(item);
  });
}
