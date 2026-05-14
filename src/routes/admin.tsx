import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Trash2, Upload, Save, ShieldAlert, UserPlus, ShieldCheck } from "lucide-react";
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
      <PageHeader eyebrow="Administração" title="Painel" description="Gerencie horários, fotos, aconselhamentos e estudos." />
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
        <ServiceTimesEditor />
        <PhotoManager />
        <CounselingManager />
        <StudiesManager />
        <AdminsManager />
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

// ===== Counseling Manager =====
type CSession = { id: string; anonymous_name: string; topic: string; status: string; created_at: string };
type CMsg = { id: string; sender: "visitor" | "counselor"; content: string; created_at: string };

function CounselingManager() {
  const [sessions, setSessions] = useState<CSession[]>([]);
  const [active, setActive] = useState<CSession | null>(null);

  const load = async () => {
    const { data } = await supabase.from("counseling_sessions").select("*").order("created_at", { ascending: false });
    setSessions((data ?? []) as CSession[]);
  };
  useEffect(() => { load(); }, []);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Aconselhamentos</h2>
      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {sessions.length === 0 && <p className="text-sm text-muted-foreground">Nenhum atendimento ainda.</p>}
          {sessions.map(s => (
            <button key={s.id} onClick={() => setActive(s)}
                    className={`w-full text-left rounded-lg border border-border p-3 text-sm hover:bg-secondary ${active?.id === s.id ? "bg-secondary" : ""}`}>
              <div className="font-semibold truncate">{s.anonymous_name}</div>
              <div className="text-xs text-muted-foreground truncate">{s.topic}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(s.created_at).toLocaleString("pt-BR")}</div>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-background min-h-[400px]">
          {active ? <CounselingThread session={active} onClosed={load} /> : (
            <p className="p-6 text-sm text-muted-foreground">Selecione um atendimento.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function CounselingThread({ session, onClosed }: { session: CSession; onClosed: () => void }) {
  const [msgs, setMsgs] = useState<CMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("counseling_messages").select("*").eq("session_id", session.id).order("created_at")
      .then(({ data }) => setMsgs((data ?? []) as CMsg[]));
    const ch = supabase.channel(`adm-${session.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "counseling_messages", filter: `session_id=eq.${session.id}` },
        (p) => setMsgs(m => [...m, p.new as CMsg])).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session.id]);

  const send = async () => {
    if (!text.trim()) return;
    // Filtro de segurança: o conselheiro também não pode passar contatos / redes sociais
    const FORBIDDEN = [
      { re: /(\+?\d[\d\s().-]{7,}\d)/, reason: "número de telefone" },
      { re: /[\w.+-]+@[\w-]+\.[\w.-]+/i, reason: "endereço de e-mail" },
      { re: /\b(?:https?:\/\/|www\.)\S+/i, reason: "link/URL" },
      { re: /\b(?:whatsapp|wpp|whats|zap|telegram|signal|instagram|insta|facebook|tiktok|twitter|snap)\b/i, reason: "rede social/mensageiro" },
      { re: /@[a-z0-9._]{3,}/i, reason: "@usuário" },
    ];
    for (const f of FORBIDDEN) {
      if (f.re.test(text)) {
        toast.error(`Mensagem bloqueada: contém ${f.reason}. Por política, atendimento somente por texto neste canal.`);
        return;
      }
    }
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("counseling_messages")
      .insert({ session_id: session.id, sender: "counselor", content: text.trim(), sender_user_id: user?.id });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setText("");
  };

  const close = async () => {
    if (!confirm("Encerrar este atendimento?")) return;
    await supabase.from("counseling_sessions").update({ status: "closed" }).eq("id", session.id);
    toast.success("Atendimento encerrado");
    onClosed();
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="text-sm">
          <strong>{session.anonymous_name}</strong>
          <span className="ml-2 text-xs text-muted-foreground">· {session.status}</span>
        </div>
        <button onClick={close} className="text-xs text-destructive hover:underline">Encerrar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.sender === "counselor" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
              m.sender === "counselor" ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-2 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
               placeholder="Resposta do conselheiro…"
               className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={send} disabled={sending} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
          Enviar
        </button>
      </div>
    </div>
  );
}

// ===== Studies (PDF) Manager =====
type Study = { id: string; title: string; description: string | null; category: string; file_path: string };

function StudiesManager() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("geral");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("pdf_studies").select("*").order("created_at", { ascending: false });
    setStudies((data ?? []) as Study[]);
  };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file || !title) { toast.error("Arquivo e título são obrigatórios"); return; }
    if (file.type !== "application/pdf") { toast.error("Envie um arquivo PDF"); return; }
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("studies").upload(path, file, { contentType: "application/pdf" });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insErr } = await supabase.from("pdf_studies")
      .insert({ title, description, category, file_path: path, created_by: user?.id });
    setUploading(false);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Estudo publicado!");
    setTitle(""); setDescription(""); setFile(null);
    load();
  };

  const remove = async (s: Study) => {
    if (!confirm("Excluir este estudo?")) return;
    await supabase.storage.from("studies").remove([s.file_path]);
    await supabase.from("pdf_studies").delete().eq("id", s.id);
    toast.success("Estudo removido");
    load();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Estudos em PDF</h2>
      <div className="rounded-xl bg-secondary/40 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título *" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria (ex: doutrina)" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" rows={2} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <button onClick={upload} disabled={uploading} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-2 disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publicar PDF
        </button>
      </div>

      <ul className="mt-6 divide-y divide-border">
        {studies.map(s => (
          <li key={s.id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase text-accent font-semibold">{s.category}</div>
              <div className="font-semibold text-sm truncate">{s.title}</div>
              {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
            </div>
            <button onClick={() => remove(s)} className="text-xs text-destructive hover:underline flex items-center gap-1 shrink-0">
              <Trash2 className="h-3 w-3" /> Excluir
            </button>
          </li>
        ))}
        {studies.length === 0 && <p className="text-sm text-muted-foreground py-4">Nenhum PDF publicado ainda.</p>}
      </ul>
    </section>
  );
}

// ===== Admins Manager =====
type AdminRow = { user_id: string; email: string; created_at: string };

function AdminsManager() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.rpc("list_admins");
    if (error) { toast.error(error.message); return; }
    setAdmins((data ?? []) as AdminRow[]);
  };
  useEffect(() => { load(); }, []);

  const grant = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(e)) { toast.error("E-mail inválido"); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("grant_admin_by_email", { _email: e });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res?.ok) { toast.error(res?.error ?? "Erro"); return; }
    toast.success("Administrador adicionado!");
    setEmail("");
    load();
  };

  const revoke = async (mail: string) => {
    if (!confirm(`Remover privilégio de admin de ${mail}?`)) return;
    const { data, error } = await supabase.rpc("revoke_admin_by_email", { _email: mail });
    if (error) { toast.error(error.message); return; }
    const res = data as { ok: boolean; error?: string };
    if (!res?.ok) { toast.error(res?.error ?? "Erro"); return; }
    toast.success("Privilégio removido");
    load();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Administradores</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Para promover alguém, peça primeiro que essa pessoa <strong>crie a conta no site</strong>. Depois informe o e-mail dela aqui.
      </p>

      <div className="rounded-xl bg-secondary/40 p-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email-do-novo-admin@exemplo.com"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button onClick={grant} disabled={busy}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Conceder admin
        </button>
      </div>

      <ul className="mt-6 divide-y divide-border">
        {admins.map(a => (
          <li key={a.user_id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{a.email}</div>
              <div className="text-xs text-muted-foreground">desde {new Date(a.created_at).toLocaleDateString("pt-BR")}</div>
            </div>
            {a.email !== "marciocruzemail@gmail.com" && (
              <button onClick={() => revoke(a.email)} className="text-xs text-destructive hover:underline flex items-center gap-1 shrink-0">
                <Trash2 className="h-3 w-3" /> Remover
              </button>
            )}
            {a.email === "marciocruzemail@gmail.com" && (
              <span className="text-[10px] uppercase tracking-wider text-accent">principal</span>
            )}
          </li>
        ))}
        {admins.length === 0 && <p className="text-sm text-muted-foreground py-4">Nenhum administrador listado.</p>}
      </ul>
    </section>
  );
}
