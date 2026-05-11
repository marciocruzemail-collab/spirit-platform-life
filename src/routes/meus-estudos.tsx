import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import ReactMarkdown from "react-markdown";
import { Trash2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/meus-estudos")({ component: MeusEstudos });

type Study = { id: string; title: string; verse: string | null; content: any; created_at: string };

function MeusEstudos() {
  const [studies, setStudies] = useState<Study[] | null>(null);
  const [open, setOpen] = useState<Study | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate({ to: "/auth" }); return; }
    const { data } = await supabase.from("bible_studies").select("*").order("created_at", { ascending: false });
    setStudies((data as any) ?? []);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Apagar este estudo?")) return;
    await supabase.from("bible_studies").delete().eq("id", id);
    setStudies((s) => s?.filter((x) => x.id !== id) ?? null);
    if (open?.id === id) setOpen(null);
  };

  return (
    <>
      <PageHeader eyebrow="Sua biblioteca" title="Meus estudos bíblicos" description="Tudo que você salvou da Enciclopédia Bíblica." />
      <div className="mx-auto max-w-5xl px-4 py-10">
        {studies === null ? (
          <div className="text-muted-foreground">Carregando…</div>
        ) : studies.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Você ainda não salvou nenhum estudo.</p>
            <Link to="/biblia" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Começar um estudo</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {studies.map((s) => (
              <article key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setOpen(s)} className="text-left flex-1">
                    <h3 className="font-semibold">{s.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleString("pt-BR")}</div>
                  </button>
                  <button onClick={() => remove(s.id)} className="rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">{open.title}</h2>
            <div className="space-y-4">
              {(open.content as any[]).map((m, i) => (
                <div key={i} className={`rounded-xl p-4 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{m.role === "user" ? "Você" : "IA"}</div>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setOpen(null)} className="mt-6 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground">Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
