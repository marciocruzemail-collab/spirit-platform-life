import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { GraduationCap, Droplets, Footprints, Scale, Wheat } from "lucide-react";

export const Route = createFileRoute("/cursos")({ component: Cursos });

const cursos = [
  { icon: Droplets, title: "Curso de Batismo", desc: "Prepare-se para o batismo nas águas, online no seu ritmo." },
  { icon: Footprints, title: "Primeiros Passos com Cristo", desc: "Para quem começou agora a jornada de fé." },
  { icon: Scale, title: "Convencido da Justiça", desc: "Entenda a justiça da fé e viva nela." },
  { icon: Wheat, title: "Parábola do Semeador", desc: "Estudo profundo sobre frutos, terreno e Reino." },
];

function Cursos() {
  return (
    <>
      <PageHeader eyebrow="Cursos online" title="Aprenda no seu tempo" description="Quatro cursos gratuitos para fortalecer sua caminhada com Cristo." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-5 sm:grid-cols-2">
        {cursos.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group rounded-2xl border border-border bg-card p-6 flex gap-5 items-start hover:shadow-[var(--shadow-warm)] transition">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gradient-hero)] text-primary-foreground shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <GraduationCap className="h-4 w-4" /> Começar curso
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
