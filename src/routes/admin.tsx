import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Trash2, Upload, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Painel Administrativo — IEQ.V Ferraz" }] }),
});

type Photo = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_path: string;
  created_at: string;
};

type ServiceTime = { day: string; time: string; label: string };

const CATEGORIES = ["culto", "testemunho", "projeto-social", "evento"];

function Admin() {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/auth" });
  }, [loading, isAdmin, navigate]);

  if (loading) return <div className="p-12 text-center"><Loader2 className="mx-auto animate-spin" /></div>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 text-center px-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Acesso restrito</h2>
        <p className="mt-2 text-muted-foreground">Faça login com a conta de administrador.</p>
        <Link to="/auth" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Entrar</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Administração" title="Painel" description="Gerencie horários de culto e fotos do mural." />
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
        <ServiceTimesEditor />
        <PhotoManager />
      </div>
    </>
  );
}

function ServiceTimesEditor() {
  const [times, setTimes] = useState<ServiceTime[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("church_settings").select("value").eq("key", "service_times").maybeSingle()
      .then(({ data }) => { if (data?.value) setTimes(data.value as ServiceTime[]); });
  }, []);

  const update = (i: number, field: keyof ServiceTime, val: string) => {
    setTimes(t => t.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  };
  const add = () => setTimes(t => [...t, { day: "", time: "", label: "" }]);
  const remove = (i: number) => setTimes(t => t.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("church_settings")
      .upsert({ key: "service_times", value: times as any });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Horários salvos!");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Horários de culto</h2>
      <div className="space-y-3">
        {times.map((t, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_2fr_auto] gap-2">
            <input value={t.day} onChange={e => update(i, "day", e.target.value)} placeholder="Dia" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            <input value={t.time} onChange={e => update(i, "time", e.target.value)} placeholder="19:30" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            <input value={t.label} onChange={e => update(i, "label", e.target.value)} placeholder="Descrição" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={() => remove(i)} className="rounded-md p-2 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={add} className="rounded-full border border-border px-4 py-2 text-sm">+ Adicionar</button>
        <button onClick={save} disabled={saving} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
        </button>
      </div>
    </section>
  );
}

function PhotoManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("culto");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    const { data } = await supabase.from("mural_photos").select("*").order("created_at", { ascending: false });
    setPhotos((data ?? []) as Photo[]);
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file || !title) { toast.error("Foto e título são obrigatórios"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("mural").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insErr } = await supabase.from("mural_photos")
      .insert({ title, description, category, image_path: path, created_by: user?.id });
    setUploading(false);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Foto publicada!");
    setTitle(""); setDescription(""); setFile(null);
    load();
  };

  const remove = async (p: Photo) => {
    if (!confirm("Excluir esta foto?")) return;
    await supabase.storage.from("mural").remove([p.image_path]);
    await supabase.from("mural_photos").delete().eq("id", p.id);
    toast.success("Foto removida");
    load();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Fotos do mural</h2>

      <div className="rounded-xl bg-secondary/40 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título *" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <button onClick={upload} disabled={uploading} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-2 disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publicar foto
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map(p => {
          const url = supabase.storage.from("mural").getPublicUrl(p.image_path).data.publicUrl;
          return (
            <div key={p.id} className="rounded-xl overflow-hidden border border-border bg-background">
              <img src={url} alt={p.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-3">
                <div className="text-xs uppercase tracking-wider text-accent font-semibold">{p.category}</div>
                <div className="font-semibold text-sm">{p.title}</div>
                {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                <button onClick={() => remove(p)} className="mt-2 text-xs text-destructive flex items-center gap-1 hover:underline">
                  <Trash2 className="h-3 w-3" /> Excluir
                </button>
              </div>
            </div>
          );
        })}
        {photos.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Nenhuma foto ainda. Publique a primeira acima.</p>}
      </div>
    </section>
  );
}
