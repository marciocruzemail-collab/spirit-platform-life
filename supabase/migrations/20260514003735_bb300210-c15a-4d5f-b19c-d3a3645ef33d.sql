ALTER TABLE public.mural_photos
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

ALTER TABLE public.mural_photos
  DROP CONSTRAINT IF EXISTS mural_photos_media_type_check;

ALTER TABLE public.mural_photos
  ADD CONSTRAINT mural_photos_media_type_check
  CHECK (media_type IN ('image', 'video'));