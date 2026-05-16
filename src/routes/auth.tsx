import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Church } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/biblioteca" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setInfo("Cadastro feito! Verifique seu e-mail para confirmar a conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/biblioteca" });
      }
    } catch (err: any) {
      setError(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Acesso" title={mode === "login" ? "Entrar na sua conta" : "Criar uma conta"} description="Acesse a Enciclopédia Bíblica com IA e salve seus estudos." />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex justify-center mb-6">
            <Church className="h-10 w-10 text-primary" />
          </div>
          <div className="flex gap-2 mb-6 rounded-full bg-secondary p-1">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-full py-2 text-sm font-medium transition ${mode === m ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}>
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Input label="Nome" value={name} onChange={setName} />
            )}
            <Input label="E-mail" type="email" value={email} onChange={setEmail} required />
            <Input label="Senha" type="password" value={password} onChange={setPassword} required minLength={6} />
            {error && <div className="text-sm text-destructive">{error}</div>}
            {info && <div className="text-sm text-accent-foreground bg-accent/20 p-3 rounded-lg">{info}</div>}
            <button disabled={loading} className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Input({ label, value, onChange, type = "text", required, minLength }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; minLength?: number }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} minLength={minLength} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}
