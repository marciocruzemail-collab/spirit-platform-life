CREATE OR REPLACE FUNCTION public.grant_admin_by_email(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem promover outros usuários';
  END IF;

  SELECT id INTO _target_id FROM auth.users WHERE email = lower(trim(_email)) LIMIT 1;

  IF _target_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Usuário não encontrado. Peça que ele se cadastre no site primeiro.');
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'user_id', _target_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_admin_by_email(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem remover privilégios';
  END IF;

  IF lower(trim(_email)) = 'marciocruzemail@gmail.com' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'O administrador principal não pode ser removido.');
  END IF;

  SELECT id INTO _target_id FROM auth.users WHERE email = lower(trim(_email)) LIMIT 1;
  IF _target_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Usuário não encontrado.');
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _target_id AND role = 'admin'::app_role;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Add unique constraint if missing (so ON CONFLICT works)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- View for admins to list current admins (with email)
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores';
  END IF;
  RETURN QUERY
    SELECT ur.user_id, u.email::text, ur.created_at
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'::app_role
    ORDER BY ur.created_at;
END;
$$;