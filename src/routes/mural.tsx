import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mural")({ component: Mural });

type Photo = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_path: string;
};

function Mural() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("mural_photos").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setPhotos((data ?? []) as Photo[]); setLoading(false); });
  }, []);

  return (
    <>
      <PageHeader eyebrow="Mural" title="Testemunhos, cultos e projetos" description="Momentos vividos pela nossa comunidade." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : photos.length === 0 ? (
          <p className="text-center text-muted-foreground">Em breve novas fotos serão publicadas aqui.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => {
              const url = supabase.storage.from("mural").getPublicUrl(p.image_path).data.publicUrl;
              return (
                <article key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-warm)] transition">
                  <img src={url} alt={p.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-wider text-accent font-semibold">{p.category}</div>
                    <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                    {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
