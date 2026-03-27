
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.hash_venue_admin_password()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  IF NEW.admin_password_hash IS NOT NULL 
     AND NEW.admin_password_hash != '' 
     AND LEFT(NEW.admin_password_hash, 4) != '$2a$' THEN
    NEW.admin_password_hash := crypt(NEW.admin_password_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hash_venue_reg_password
  BEFORE INSERT OR UPDATE ON public.venue_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_venue_admin_password();

CREATE TRIGGER hash_venue_password
  BEFORE INSERT OR UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_venue_admin_password();
