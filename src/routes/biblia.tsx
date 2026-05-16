import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Send, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/biblia")({ component: Biblia });

type Msg = { role: "user" | "assistant"; content: string };

const sugestoes = [
  "Explique o contexto de João 3:16",
  "O que são os frutos do Espírito?",
  "Quem foi o profeta Elias?",
  "Resuma o livro de Romanos",
];

function Biblia() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setSaved(false);

    try {
      const resp = await fetch(`/api/biblia-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (resp.status === 429) { alert("Muitas requisições. Aguarde um momento."); setLoading(false); return; }
      if (resp.status === 402) { alert("Créditos de IA esgotados."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Falha no stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") break;
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: acc } : msg));
            }
          } catch {
            buf = line + "\n" + buf; break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar a IA.");
    } finally {
      setLoading(false);
    }
  };

  const saveStudy = async () => {
    if (!user || messages.length === 0) return;
    const firstQ = messages.find((m) => m.role === "user")?.content ?? "Estudo bíblico";
    const title = firstQ.length > 60 ? firstQ.slice(0, 60) + "…" : firstQ;
    const { error } = await supabase.from("bible_studies").insert({
      user_id: user.id, title, content: messages as any,
    });
    if (error) { alert("Erro ao salvar: " + error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <PageHeader eyebrow="Enciclopédia Bíblica · IA" title="Estude a Bíblia com auxílio inteligente" description="Pergunte sobre versículos, contexto histórico, personagens, livros e doutrinas. Você pode salvar seus estudos." />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {!user && (
          <div className="mb-6 rounded-2xl border border-accent/40 bg-accent/10 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm">
              <strong>Quer salvar seus estudos?</strong> Crie uma conta gratuita.
            </div>
            <Link to="/auth" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Entrar / Cadastrar</Link>
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card overflow-hidden flex flex-col h-[70vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gradient-hero)] text-primary-foreground mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">Comece um estudo</h2>
                <p className="text-muted-foreground mt-1 max-w-md">Pergunte qualquer coisa sobre a Bíblia. Experimente:</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 max-w-xl w-full">
                  {sugestoes.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-left rounded-xl border border-border bg-background px-4 py-3 text-sm hover:bg-secondary transition flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-p:my-2">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-3 bg-background">
            {messages.length > 0 && user && (
              <div className="mb-2 flex justify-end">
                <button onClick={saveStudy} className="flex items-center gap-1.5 text-xs rounded-full bg-secondary px-3 py-1.5 hover:bg-accent/20">
                  <Save className="h-3.5 w-3.5" /> {saved ? "Salvo!" : "Salvar estudo"}
                </button>
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Faça sua pergunta sobre a Bíblia…" className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" disabled={loading} />
              <button disabled={loading || !input.trim()} className="rounded-full bg-primary px-4 text-primary-foreground disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
