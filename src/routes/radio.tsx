import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Play, Mic, Video, Radio as RadioIcon } from "lucide-react";

export const Route = createFileRoute("/radio")({ component: Radio });

const conteudos = [
  { icon: Mic, tipo: "Entrevista", titulo: "Histórias de fé — Episódio 12" },
  { icon: Video, tipo: "Vídeo", titulo: "Pregação: O poder da gratidão" },
  { icon: Mic, tipo: "Entrevista", titulo: "Conversa com missionários da África" },
  { icon: Video, tipo: "Vídeo", titulo: "Culto da família — ao vivo" },
];

function Radio() {
  return (
    <>
      <PageHeader eyebrow="Rádio Igreja Viva" title="Pregações ao vivo, vídeos e entrevistas" description="Conteúdo completo e ao vivo, 24 horas por dia." />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-[var(--gradient-hero)] p-8 md:p-12 text-primary-foreground shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] opacity-80">
            <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" /> Ao vivo agora
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-bold">Culto de oração — Pr. João Silva</div>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-card text-foreground px-6 py-3 font-medium hover:opacity-95">
            <Play className="h-5 w-5" /> Ouvir agora
          </button>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <RadioIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Conteúdo recente</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {conteudos.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-[var(--shadow-warm)] transition">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-accent font-semibold">{c.tipo}</div>
                  <div className="font-medium">{c.titulo}</div>
                </div>
                <button className="rounded-full bg-primary p-2.5 text-primary-foreground"><Play className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
