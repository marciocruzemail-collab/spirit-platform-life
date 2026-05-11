import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Briefcase, Laptop, Building2 } from "lucide-react";

export const Route = createFileRoute("/servicos")({ component: Servicos });

const vagas = [
  { tipo: "CLT", icon: Briefcase, titulo: "Auxiliar de cozinha", local: "Restaurante Sabor Bom", contato: "(00) 00000-0000" },
  { tipo: "Freelancer", icon: Laptop, titulo: "Designer gráfico", local: "Remoto", contato: "(00) 00000-0000" },
  { tipo: "Diária", icon: Building2, titulo: "Pedreiro / pintura", local: "Centro", contato: "(00) 00000-0000" },
  { tipo: "CLT", icon: Briefcase, titulo: "Atendente de loja", local: "Vila Nova", contato: "(00) 00000-0000" },
];

function Servicos() {
  return (
    <>
      <PageHeader eyebrow="Serviços" title="Vagas, freelas e contratantes" description="Conectando irmãos a oportunidades e empregadores que confiam em quem confia." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vagas.map((v, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <span className="text-xs uppercase tracking-wider text-accent font-semibold">{v.tipo}</span>
              </div>
              <div className="font-semibold">{v.titulo}</div>
              <div className="text-sm text-muted-foreground">{v.local}</div>
              <div className="mt-4 text-sm">Contato: <span className="font-medium">{v.contato}</span></div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-[var(--gradient-warm)] p-6 text-center">
          <div className="font-semibold text-lg">É contratante ou tem um trabalho extra?</div>
          <p className="text-sm text-muted-foreground mt-1">Anuncie aqui e ajude alguém da nossa comunidade.</p>
          <button className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">Anunciar vaga</button>
        </div>
      </div>
    </>
  );
}
