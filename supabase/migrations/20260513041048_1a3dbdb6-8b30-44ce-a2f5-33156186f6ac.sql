
-- Counseling sessions
CREATE TABLE public.counseling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  access_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can create a session
CREATE POLICY "anyone create counseling" ON public.counseling_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (terms_accepted = true);

-- Owners (by created_by) and admins can read; anonymous reads via token handled in app
CREATE POLICY "owner or admin read counseling" ON public.counseling_sessions
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update counseling" ON public.counseling_sessions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Counseling messages
CREATE TABLE public.counseling_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.counseling_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('visitor','counselor')),
  content TEXT NOT NULL,
  sender_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.counseling_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_counseling_messages_session ON public.counseling_messages(session_id, created_at);

-- Visitor (anon or auth) can insert message into a session if they know the session id (controlled in app via token)
CREATE POLICY "insert visitor message" ON public.counseling_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (sender = 'visitor');

CREATE POLICY "admin insert counselor message" ON public.counseling_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender = 'counselor' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read messages owner or admin" ON public.counseling_messages
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.counseling_sessions s WHERE s.id = session_id AND s.created_by = auth.uid())
  );

-- Allow anon read by session (no token check at DB level — app uses access_token in localStorage to know session)
CREATE POLICY "read messages anon by session" ON public.counseling_messages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "read sessions anon" ON public.counseling_sessions
  FOR SELECT TO anon
  USING (true);

-- PDF studies
CREATE TABLE public.pdf_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  file_path TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pdf_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studies public read" ON public.pdf_studies
  FOR SELECT USING (true);

CREATE POLICY "studies admin insert" ON public.pdf_studies
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "studies admin update" ON public.pdf_studies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "studies admin delete" ON public.pdf_studies
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_studies_updated BEFORE UPDATE ON public.pdf_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_counseling_sessions_updated BEFORE UPDATE ON public.counseling_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for studies (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('studies', 'studies', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can read PDF files
CREATE POLICY "studies authenticated read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'studies');

CREATE POLICY "studies admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'studies' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "studies admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'studies' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "studies admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'studies' AND public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.counseling_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.counseling_sessions;
