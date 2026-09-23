import { getSupabase } from './supabase.js';
import { setGuestMode } from './state.js';

export async function checkSession(onGuestCallback, onLoggedCallback, onShowLoginCallback) {
  const isGuest = localStorage.getItem('ls_isGuest') === 'true';
  if (isGuest) {
    setGuestMode(true);
    if (onGuestCallback) onGuestCallback();
    return;
  }
  
  const supabase = await getSupabase();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setGuestMode(false);
      if (onLoggedCallback) onLoggedCallback(session.user);
      return;
    }
  }
  
  // Need to show login modal
  if (onShowLoginCallback) onShowLoginCallback();
}

export async function loginWithGoogle() {
  const supabase = await getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) {
      alert("Errore login Google: " + error.message);
    }
  } else {
    alert("Supabase non configurato. Impossibile accedere con Google.");
  }
}

export function loginAsGuest(onGuestCallback) {
  setGuestMode(true);
  localStorage.setItem('ls_isGuest', 'true');
  if (onGuestCallback) onGuestCallback();
}

export async function logout() {
  const supabase = await getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('ls_isGuest');
  window.location.reload();
}

export async function deleteAccount() {
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
      alert("Errore durante l'eliminazione dell'account: " + e.message);
      return;
    }
  }
  localStorage.removeItem('ls_isGuest');
  localStorage.removeItem('polistrike_state');
  window.location.reload();
}
