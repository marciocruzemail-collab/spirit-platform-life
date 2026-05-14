import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Shield, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/aconselhamento")({
  component: Counseling,
  head: () => ({
    meta: [
      { title: "Aconselhamento — IEQ.V Ferraz" },
      { name: "description", content: "Converse de forma confidencial com nossa equipe pastoral. Atendimento anônimo e seguro." },
    ],
  }),
});

type Msg = { id: string; sender: "visitor" | "counselor"; content: string; created_at: string };

const STORAGE_KEY = "ieq_counseling_session";

// Filtro de segurança: bloqueia compartilhamento de contatos, redes sociais, links.
// Aplicado a ambos os lados (visitante e conselheiro) para proteger todos.
const FORBIDDEN_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /(\+?\d[\d\s().-]{7,}\d)/g, reason: "número de telefone" },
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/gi, reason: "endereço de e-mail" },
  { re: /\b(?:https?:\/\/|www\.)\S+/gi, reason: "link/URL" },
  { re: /\b(?:whatsapp|wpp|whats|zap|telegram|signal|instagram|insta|facebook|fb|tiktok|twitter|snap|snapchat)\b/gi, reason: "rede social/mensageiro" },
  { re: /@[a-z0-9._]{3,}/gi, reason: "@usuário de rede social" },
];

function checkForbidden(text: string): string | null {
  for (const p of FORBIDDEN_PATTERNS) {
    if (p.re.test(text)) return p.reason;
  }
  return null;
}

function Counseling() {
  const [session, setSession] = useState<{ id: string; anonymous_name: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setSession(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Confidencial"
        title="Aconselhamento Pastoral"
        description="Um espaço seguro, anônimo e exclusivamente por texto para conversar com nosso Conselheiro."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {!session ? (
          <StartForm onStart={(s) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); setSession(s); }} />
        ) : (
          <Chat session={session} onReset={reset} />
        )}
      </div>
    </>
  );
}

function StartForm({ onStart }: { onStart: (s: { id: string; anonymous_name: string }) => void }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) { toast.error("É preciso aceitar os termos."); return; }
    if (!name.trim() || !topic.trim() || !q1.trim() || !q2.trim()) {
      toast.error("Preencha todos os campos para iniciarmos com segurança."); return;
    }
    // Filtro de segurança no formulário inicial
    const all = `${name} ${topic} ${q1} ${q2}`;
    const bad = checkForbidden(all);
    if (bad) {
      toast.error(`Por segurança, não inclua ${bad} no formulário. Use apelido e descreva o assunto sem dados de contato.`);
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const fullTopic = `${topic.trim()}\n\n• Há quanto tempo você convive com essa situação? ${q1.trim()}\n• Você está em risco imediato (você ou alguém)? ${q2.trim()}`;
    const { data, error } = await supabase
      .from("counseling_sessions")
      .insert({
        anonymous_name: name.trim().slice(0, 80),
        topic: fullTopic.slice(0, 1500),
        terms_accepted: true,
        created_by: user?.id ?? null,
      })
      .select("id, anonymous_name")
      .single();
    setLoading(false);
    if (error || !data) { toast.error(error?.message ?? "Erro ao iniciar"); return; }
    await supabase.from("counseling_messages").insert({ session_id: data.id, sender: "visitor", content: fullTopic.slice(0, 2000) });
    onStart(data);
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="rounded-xl bg-secondary/50 p-4 text-sm space-y-2">
        <div className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4 text-primary" /> Termos de uso, privacidade e segurança</div>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Você usa um <strong>apelido</strong>. Não pedimos documentos, foto ou localização (LGPD - Lei 13.709/2018).</li>
          <li>O atendimento é <strong>exclusivamente por texto</strong> dentro deste site. Não trocamos telefones, redes sociais ou links externos — mensagens com esse conteúdo são bloqueadas para sua proteção e do conselheiro.</li>
          <li>Conversas são <strong>confidenciais</strong> e visíveis apenas ao Conselheiro autorizado pela igreja.</li>
          <li>Este canal <strong>não é emergência</strong> e não substitui atendimento médico, psicológico ou policial. Em risco à vida ligue <strong>192 (SAMU)</strong>, <strong>190 (Polícia)</strong> ou <strong>188 (CVV - prevenção ao suicídio, 24h)</strong>.</li>
          <li>Casos com indício de <strong>violência contra criança/adolescente, idoso ou risco grave</strong> serão orientados às autoridades competentes (ECA - Lei 8.069/1990; Estatuto do Idoso).</li>
          <li>Você pode encerrar a qualquer momento. Ao continuar você concorda com estes termos.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Como podemos te chamar? (apelido)</label>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Ex.: Visitante, João, Maria"
                 className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="text-sm font-medium">Sobre o que deseja conversar?</label>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} maxLength={500} rows={3}
                    placeholder="Descreva brevemente. Não inclua telefones, e-mails ou redes sociais."
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" required />
        </div>

        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-3">
          <div className="text-sm font-semibold">Duas perguntas de triagem</div>
          <div>
            <label className="text-sm">1. Há quanto tempo você convive com essa situação?</label>
            <input value={q1} onChange={e => setQ1(e.target.value)} maxLength={200} placeholder="Ex.: alguns dias, meses, anos…"
                   className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="text-sm">2. Há risco imediato a você ou alguém? (Sim / Não — explique brevemente)</label>
            <input value={q2} onChange={e => setQ2(e.target.value)} maxLength={200} placeholder="Sim / Não"
                   className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" required />
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
            Se houver <strong>risco imediato</strong>, ligue agora para 192 / 190 / 188. Este canal não é emergência.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1" />
          <span>Li e aceito os termos acima.</span>
        </label>
      </div>

      <button type="submit" disabled={loading} className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground flex items-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        Iniciar conversa segura
      </button>
    </form>
  );
}

function Chat({ session, onReset }: { session: { id: string; anonymous_name: string }; onReset: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("counseling_messages").select("*").eq("session_id", session.id).order("created_at")
      .then(({ data }) => setMessages((data ?? []) as Msg[]));

    const channel = supabase.channel(`counseling-${session.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "counseling_messages", filter: `session_id=eq.${session.id}` },
        (payload) => setMessages(m => [...m, payload.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const bad = checkForbidden(text);
    if (bad) {
      toast.error(`Mensagem bloqueada: contém ${bad}. Por segurança, conversamos somente por aqui, sem dados de contato.`);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("counseling_messages")
      .insert({ session_id: session.id, sender: "visitor", content: text.trim().slice(0, 2000) });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setText("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[70vh]">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-secondary/30">
        <div className="flex items-center gap-2 text-sm">
          <Lock className="h-4 w-4 text-primary" />
          <span>Conversando como <strong>{session.anonymous_name}</strong> com o <strong>Conselheiro</strong></span>
        </div>
        <button onClick={() => { if (confirm("Encerrar e apagar esta conversa do seu dispositivo? O histórico continuará disponível à equipe pastoral.")) onReset(); }}
                className="text-xs text-muted-foreground hover:text-destructive">Encerrar</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="rounded-lg bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-muted-foreground">
          🔒 Apenas texto. Não compartilhe telefones, e-mails, redes sociais ou links — mensagens com esse conteúdo são bloqueadas automaticamente.
        </div>
        {messages.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">Aguarde, em breve o Conselheiro responderá.</p>}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "visitor" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
              m.sender === "visitor" ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}>
              {m.sender === "counselor" && <div className="text-[10px] uppercase opacity-70 mb-0.5">Conselheiro</div>}
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Escreva sua mensagem (somente texto)…" maxLength={2000}
               className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm" />
        <button type="submit" disabled={sending || !text.trim()}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-1 disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
