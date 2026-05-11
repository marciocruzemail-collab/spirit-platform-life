import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/mural")({ component: Mural });

const items = [
  { tag: "Testemunho", title: "Encontrei paz", text: "Deus restaurou minha família depois de anos." },
  { tag: "Culto", title: "Domingo de adoração", text: "Mais de 300 irmãos louvando juntos." },
  { tag: "Projeto social", title: "Cestas básicas", text: "120 famílias atendidas neste mês." },
  { tag: "Testemunho", title: "Cura e libertação", text: "Voltei a sorrir depois de muito tempo." },
  { tag: "Culto", title: "Vigília de oração", text: "Uma noite inesquecível na presença de Deus." },
  { tag: "Projeto social", title: "Sopa nas ruas", text: "Servimos 200 refeições no centro." },
];

function Mural() {
  return (
    <>
      <PageHeader eyebrow="Mural" title="Testemunhos, cultos e projetos" description="Momentos vividos pela nossa comunidade." />
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <article key={i} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-warm)] transition">
            <div className="aspect-[4/3] bg-[var(--gradient-warm)]" />
            <div className="p-5">
              <div className="text-xs uppercase tracking-wider text-accent font-semibold">{it.tag}</div>
              <h3 className="mt-1 text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
