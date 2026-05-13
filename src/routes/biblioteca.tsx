import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/biblioteca")({
  component: Library,
  head: () => ({
    meta: [
      { title: "Biblioteca de Estudos PDF — IEQ.V Ferraz" },
      { name: "description", content: "Baixe estudos bíblicos em PDF. Acesso gratuito para membros cadastrados." },
    ],
  }),
});

type Study = { id: string; title: string; description: string | null; category: string; file_path: string; created_at: string };

function Library() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("pdf_studies").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setStudies((data ?? []) as Study[]); setLoading(false); });
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const download = async (s: Study) => {
    setDownloading(s.id);
    const { data, error } = await supabase.storage.from("studies").createSignedUrl(s.file_path, 300);
    setDownloading(null);
    if (error || !data) { toast.error("Não foi possível gerar o link de download."); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Estudos em PDF"
        description="Conteúdo gratuito para aprofundar sua caminhada com Cristo. O download é liberado para visitantes cadastrados."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        {!userEmail && (
          <div className="rounded-2xl border border-border bg-secondary/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold">Cadastre-se para baixar</div>
                <p className="text-sm text-muted-foreground">É rápido e gratuito. Você também ganha acesso aos seus estudos da Bíblia IA.</p>
              </div>
            </div>
            <Link to="/auth" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shrink-0">Criar conta / Entrar</Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="mx-auto animate-spin" /></div>
        ) : studies.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Em breve novos materiais serão publicados.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studies.map(s => (
              <article key={s.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
                <FileText className="h-8 w-8 text-primary" />
                <div className="mt-3 text-xs uppercase tracking-wider text-accent font-semibold">{s.category}</div>
                <h3 className="font-semibold mt-1">{s.title}</h3>
                {s.description && <p className="text-sm text-muted-foreground mt-1 flex-1">{s.description}</p>}
                <button
                  onClick={() => userEmail ? download(s) : toast.error("Faça login para baixar")}
                  disabled={downloading === s.id}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
                >
                  {downloading === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {userEmail ? "Baixar PDF" : "Cadastre-se para baixar"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
