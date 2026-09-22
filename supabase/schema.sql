-- Supabase Schema per PoliStrike (Classifica)
-- Non inserire chiavi o token segreti in questo repository.

-- Tabella Leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname varchar(16) NOT NULL,
  course varchar(100) NOT NULL,
  score bigint NOT NULL DEFAULT 0,
  instagram varchar(30),
  last_updated timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT nickname_length CHECK (char_length(nickname) >= 3 AND char_length(nickname) <= 16),
  CONSTRAINT score_positive CHECK (score >= 0)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON public.leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_course ON public.leaderboard (course);

-- Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy per la lettura (Tutti possono leggere la classifica in modo sicuro, ma non serve grazie all'RPC)
CREATE POLICY "Public Read Access" 
  ON public.leaderboard 
  FOR SELECT 
  USING (true);

-- RIMOSSA LA POLICY DI INSERT/UPDATE PUBBLICA!
-- Ora la tabella è blindata. Si può scrivere solo tramite l'RPC `submit_score`.
DROP POLICY IF EXISTS "Public Insert/Update Access" ON public.leaderboard;

-- Funzione RPC per classifica settimanale (Stagione)
-- Ritorna i migliori 50
CREATE OR REPLACE FUNCTION get_top_50_weekly()
RETURNS TABLE(nickname varchar, course varchar, score bigint, instagram varchar, last_updated timestamptz)
LANGUAGE sql
STABLE
AS $$
  SELECT nickname, course, score, instagram, last_updated
  FROM public.leaderboard
  WHERE last_updated >= date_trunc('week', current_date)
  ORDER BY score DESC
  LIMIT 50;
$$;

-- 3. FORT KNOX: Sicurezza Server-Side
-- Creiamo una funzione che controllerà ogni aggiornamento
CREATE OR REPLACE FUNCTION check_leaderboard_abuse()
RETURNS TRIGGER AS $$
BEGIN
  -- Regola 1: Anti-Spam (Rate Limiting)
  -- Non permettere più di 1 aggiornamento al minuto per utente
  IF (now() - OLD.last_updated) < interval '1 minute' THEN
    RAISE EXCEPTION 'Rate limit superato. Attendi un minuto prima di inviare un nuovo punteggio.';
  END IF;

  -- Regola 2: Anti-Cheat (Crescita Impossibile)
  -- Nessuno può guadagnare più di 500,000 CFU in un solo aggiornamento
  IF (NEW.score - OLD.score) > 500000 THEN
    RAISE EXCEPTION 'Crescita anomala rilevata. Punteggio scartato dal server.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Assegniamo il "buttafuori" alla tabella
DROP TRIGGER IF EXISTS trg_check_abuse ON public.leaderboard;
CREATE TRIGGER trg_check_abuse
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION check_leaderboard_abuse();

-- 4. FORT KNOX: RPC per l'invio sicuro del punteggio
-- Questa funzione impedisce a chiunque di sovrascrivere un punteggio se non possiede il secret_id (UUID)
CREATE OR REPLACE FUNCTION submit_score(p_secret_id uuid, p_nickname varchar, p_course varchar, p_score bigint, p_instagram varchar)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id uuid;
BEGIN
  -- Cerchiamo se esiste già il nickname
  SELECT id INTO v_existing_id FROM public.leaderboard WHERE nickname = p_nickname;
  
  IF FOUND THEN
    -- Esiste. Il secret_id fornito combacia?
    IF v_existing_id != p_secret_id THEN
      RAISE EXCEPTION 'Identity Theft: Nome utente già registrato su un altro dispositivo.';
    END IF;
    -- Combacia, aggiorniamo (il trigger controllerà spam e crescita anomala)
    UPDATE public.leaderboard 
    SET score = p_score, course = p_course, instagram = p_instagram, last_updated = now()
    WHERE id = p_secret_id;
  ELSE
    -- Non esiste, inseriamo nuovo
    INSERT INTO public.leaderboard (id, nickname, course, score, instagram, last_updated)
    VALUES (p_secret_id, p_nickname, p_course, p_score, p_instagram, now());
  END IF;
  
  RETURN true;
END;
$$;

-- Funzione RPC per media migliori 10 per corso
CREATE OR REPLACE FUNCTION get_course_averages()
RETURNS TABLE(course varchar, avg_score numeric)
LANGUAGE sql
STABLE
AS $$
  WITH top_10_per_course AS (
    SELECT course, score,
           row_number() OVER (PARTITION BY course ORDER BY score DESC) as rn
    FROM public.leaderboard
  )
  SELECT course, ROUND(AVG(score), 0) as avg_score
  FROM top_10_per_course
  WHERE rn <= 10
  GROUP BY course
  ORDER BY avg_score DESC;
$$;
