import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Bus, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/transporte")({ component: Transporte });

const rotas = [
  { dia: "Quarta", saida: "18h45", bairros: ["Centro", "Vila Nova", "Jardim das Flores"] },
  { dia: "Sexta", saida: "19h15", bairros: ["Bela Vista", "São José", "Parque Industrial"] },
  { dia: "Domingo (manhã)", saida: "9h", bairros: ["Centro", "Vila Nova", "Jardim das Flores", "São José"] },
  { dia: "Domingo (noite)", saida: "17h", bairros: ["Bela Vista", "Parque Industrial", "Centro"] },
];

function Transporte() {
  return (
    <>
      <PageHeader eyebrow="Kombi da igreja" title="Transporte gratuito para os cultos" description="Sem custos. É só estar no ponto no horário e nossa equipe te leva e traz com segurança." />
      <div className="mx-auto max-w-5xl px-4 py-12 grid gap-5 md:grid-cols-2">
        {rotas.map((r) => (
          <div key={r.dia} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{r.dia}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Saída {r.saida}</div>
              </div>
            </div>
            <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-2">Bairros atendidos</div>
            <ul className="space-y-1.5">
              {r.bairros.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
