import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/sobre")({
  component: Sobre,
  head: () => ({ meta: [{ title: "Sobre — Igreja Viva" }, { name: "description", content: "Nossa história, missão e dias de culto." }] }),
});

function Sobre() {
  return (
    <>
      <PageHeader eyebrow="Apresentação" title="Nossa história" description="Há muitos anos servindo, acolhendo e transformando vidas pela graça de Deus." />
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <p className="text-lg leading-relaxed text-foreground/90">
          A Igreja Viva nasceu do desejo de criar um espaço onde toda pessoa pudesse encontrar
          fé, propósito e uma família. Desde o início, caminhamos lado a lado com nossa
          comunidade, levando o Evangelho com amor e ações concretas.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { day: "Quarta", time: "19h30", label: "Estudo bíblico" },
            { day: "Sexta", time: "20h", label: "Culto de oração" },
            { day: "Domingo", time: "10h e 18h", label: "Culto da família" },
          ].map((c) => (
            <div key={c.day} className="rounded-2xl bg-card border border-border p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">{c.day}</div>
              <div className="mt-2 text-2xl font-bold">{c.time}</div>
              <div className="text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
