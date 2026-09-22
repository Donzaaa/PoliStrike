import { CONFIG } from './config.js';

let supabaseInstance = null;

export async function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  if (CONFIG.supabase.url && CONFIG.supabase.anonKey) {
    try {
      const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      supabaseInstance = module.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
      return supabaseInstance;
    } catch(e) {
      console.error("Supabase import failed", e);
      return null;
    }
  }
  return null;
}
