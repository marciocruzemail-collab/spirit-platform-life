import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { Heart, HandHeart } from "lucide-react";

export const Route = createFileRoute("/doacoes")({ component: Doacoes });

function Doacoes() {
  const [tab, setTab] = useState<"doador" | "receber">("doador");
  return (
    <>
      <PageHeader eyebrow="Doações de alimentos" title="Doe ou receba com amor" description="Cadastre-se como doador ou solicite cestas para você ou alguém que precisa." />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex gap-2 mb-6 rounded-full bg-secondary p-1 w-fit">
          <button onClick={() => setTab("doador")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${tab === "doador" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}>
            <HandHeart className="h-4 w-4" /> Quero doar
          </button>
          <button onClick={() => setTab("receber")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${tab === "receber" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}>
            <Heart className="h-4 w-4" /> Quero receber
          </button>
        </div>

        <form className="grid gap-4 rounded-2xl border border-border bg-card p-6" onSubmit={(e) => { e.preventDefault(); alert("Cadastro recebido! Em breve entraremos em contato."); }}>
          <Field label="Nome completo" name="nome" />
          <Field label="Telefone / WhatsApp" name="tel" />
          <Field label="Endereço" name="end" />
          {tab === "doador" ? (
            <Field label="O que pretende doar" name="itens" textarea />
          ) : (
            <Field label="Quantas pessoas na família" name="fam" />
          )}
          <button className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-95">
            Enviar cadastro
          </button>
        </form>
      </div>
    </>
  );
}

function Field({ label, name, textarea }: { label: string; name: string; textarea?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea name={name} rows={3} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      ) : (
        <input name={name} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      )}
    </label>
  );
}
