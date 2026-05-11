import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/equipe")({ component: Equipe });

const lideres = [
  { nome: "Pr. João Silva", cargo: "Pastor presidente", email: "joao@igrejaviva.com", tel: "(00) 00000-0000" },
  { nome: "Pra. Maria Silva", cargo: "Pastora de ensino", email: "maria@igrejaviva.com", tel: "(00) 00000-0000" },
  { nome: "Diác. Carlos Lima", cargo: "Diaconia", email: "carlos@igrejaviva.com", tel: "(00) 00000-0000" },
  { nome: "Ev. Rute Santos", cargo: "Evangelismo", email: "rute@igrejaviva.com", tel: "(00) 00000-0000" },
];

function Equipe() {
  return (
    <>
      <PageHeader eyebrow="Liderança" title="Equipe e contatos" description="Conheça quem caminha conosco no pastoreio da igreja." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {lideres.map((l) => (
          <div key={l.nome} className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-[var(--gradient-hero)] flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {l.nome.split(" ").slice(-2)[0][0]}
            </div>
            <div className="mt-4 font-semibold">{l.nome}</div>
            <div className="text-xs text-accent font-semibold uppercase tracking-wider">{l.cargo}</div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 justify-center"><Mail className="h-3.5 w-3.5" /> {l.email}</div>
              <div className="flex items-center gap-1.5 justify-center"><Phone className="h-3.5 w-3.5" /> {l.tel}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
