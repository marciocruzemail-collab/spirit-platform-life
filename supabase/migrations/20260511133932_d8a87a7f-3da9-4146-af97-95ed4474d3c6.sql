
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles viewable by self or admin" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to the church owner's email
CREATE OR REPLACE FUNCTION public.grant_admin_if_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'marciocruzemail@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_if_owner();

-- If owner already exists, grant now
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'marciocruzemail@gmail.com'
ON CONFLICT DO NOTHING;

-- Mural photos
CREATE TABLE public.mural_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'culto',
  image_path TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.mural_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mural public read" ON public.mural_photos FOR SELECT USING (true);
CREATE POLICY "mural admin insert" ON public.mural_photos FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mural admin update" ON public.mural_photos FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mural admin delete" ON public.mural_photos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mural_photos_updated_at BEFORE UPDATE ON public.mural_photos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Church settings (key/value)
CREATE TABLE public.church_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings public read" ON public.church_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.church_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER church_settings_updated_at BEFORE UPDATE ON public.church_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.church_settings (key, value) VALUES
  ('service_times', '[
    {"day":"Quarta-feira","time":"19:30","label":"Culto de Ensino"},
    {"day":"Sexta-feira","time":"19:00","label":"Culto de Libertação"},
    {"day":"Domingo","time":"19:00","label":"Culto da Família"}
  ]'::jsonb);

-- Storage bucket for mural photos
INSERT INTO storage.buckets (id, name, public) VALUES ('mural', 'mural', true);

CREATE POLICY "mural images public read" ON storage.objects FOR SELECT
USING (bucket_id = 'mural');

CREATE POLICY "mural images admin upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mural' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "mural images admin update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'mural' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "mural images admin delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'mural' AND public.has_role(auth.uid(), 'admin'));
