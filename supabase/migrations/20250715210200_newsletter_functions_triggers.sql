-- Fonction pour générer un code de réduction unique
CREATE OR REPLACE FUNCTION public.generate_discount_code()
RETURNS text AS $$
DECLARE
  code text;
  counter integer := 0;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    IF NOT EXISTS (
      SELECT 1 FROM public.newsletter_subscribers 
      WHERE code_reduction = code
    ) THEN
      RETURN code;
    END IF;
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Impossible de générer un code unique après 100 tentatives';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour générer automatiquement un code de réduction
CREATE OR REPLACE FUNCTION public.set_discount_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code_reduction IS NULL THEN
    NEW.code_reduction := public.generate_discount_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_discount_code ON public.newsletter_subscribers;
CREATE TRIGGER trigger_set_discount_code
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE PROCEDURE public.set_discount_code();

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_newsletter_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER trigger_update_newsletter_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Fonction pour désinscrire un abonné
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(email_address text)
RETURNS boolean AS $$
BEGIN
  UPDATE public.newsletter_subscribers 
  SET est_actif = false, date_desinscription = now()
  WHERE email = email_address AND est_actif = true;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 