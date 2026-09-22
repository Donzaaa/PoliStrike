-- Script da eseguire nella SQL Editor di Supabase per permettere l'eliminazione dell'account

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Elimina i dati pubblici dell'utente dalla classifica
  DELETE FROM public.leaderboard WHERE id = auth.uid();
  
  -- 2. Elimina fisicamente l'utente dal sistema di autenticazione
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
