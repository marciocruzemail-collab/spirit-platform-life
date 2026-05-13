import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Shield, Lock } from "lucide-react";
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
        description="Um espaço seguro para você conversar com nossa equipe. Sem julgamento, sem cobrança."
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
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) { toast.error("É preciso aceitar os termos."); return; }
    if (!name.trim() || !topic.trim()) { toast.error("Preencha nome (pode ser apelido) e o assunto."); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("counseling_sessions")
      .insert({ anonymous_name: name.trim().slice(0, 80), topic: topic.trim().slice(0, 500), terms_accepted: true, created_by: user?.id ?? null })
      .select("id, anonymous_name")
      .single();
    setLoading(false);
    if (error || !data) { toast.error(error?.message ?? "Erro ao iniciar"); return; }
    // first message = topic
    await supabase.from("counseling_messages").insert({ session_id: data.id, sender: "visitor", content: topic.trim() });
    onStart(data);
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="rounded-xl bg-secondary/50 p-4 text-sm space-y-2">
        <div className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4 text-primary" /> Termos de uso e privacidade</div>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Você pode usar um <strong>apelido ou nome anônimo</strong>. Não pedimos documentos.</li>
          <li>As mensagens são <strong>confidenciais</strong> e visíveis apenas à equipe pastoral autorizada.</li>
          <li>Este canal <strong>não substitui atendimento médico, psicológico ou de emergência</strong>. Em caso de risco à vida ligue 192 / 188 (CVV).</li>
          <li>Não compartilhe dados sensíveis (cartões, senhas). Conversas podem ser apagadas a seu pedido.</li>
          <li>Ao continuar você concorda com estes termos para você e para a igreja.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Como podemos te chamar?</label>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Apelido ou nome (pode ser anônimo)"
                 className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="text-sm font-medium">Sobre o que deseja conversar?</label>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} maxLength={500} rows={4}
                    placeholder="Conte brevemente o assunto. Você pode detalhar mais depois no chat."
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" required />
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
          <span>Conversando como <strong>{session.anonymous_name}</strong></span>
        </div>
        <button onClick={() => { if (confirm("Encerrar e apagar esta conversa do seu dispositivo? O histórico continuará disponível à equipe pastoral.")) onReset(); }}
                className="text-xs text-muted-foreground hover:text-destructive">Encerrar</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">Aguarde, em breve um conselheiro responderá.</p>}
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
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Escreva sua mensagem…" maxLength={2000}
               className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm" />
        <button type="submit" disabled={sending || !text.trim()}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-1 disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
