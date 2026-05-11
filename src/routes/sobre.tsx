import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sobre")({
  component: Sobre,
  head: () => ({ meta: [{ title: "Sobre — IEQ.V Ferraz" }, { name: "description", content: "Nossa história, missão e dias de culto." }] }),
});

type ServiceTime = { day: string; time: string; label: string };

function Sobre() {
  const [times, setTimes] = useState<ServiceTime[]>([]);

  useEffect(() => {
    supabase.from("church_settings").select("value").eq("key", "service_times").maybeSingle()
      .then(({ data }) => { if (data?.value) setTimes(data.value as ServiceTime[]); });
  }, []);

  return (
    <>
      <PageHeader eyebrow="IEQ.V Ferraz" title="Nossa história" description="Igreja do Evangelho Quadrangular — Vila Ferraz, Campos do Jordão · SP. Servindo, acolhendo e transformando vidas pela graça de Deus." />
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <p className="text-lg leading-relaxed text-foreground/90">
          A IEQ.V Ferraz nasceu do desejo de criar um espaço onde toda pessoa pudesse encontrar
          fé, propósito e uma família em Cristo. Caminhamos lado a lado com nossa comunidade
          em Campos do Jordão, levando o Evangelho com amor e ações concretas.
        </p>
        <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
          <strong>Endereço:</strong> Rua João Rodrigues da Silva, 247 — Vila Ferraz, Campos do Jordão · SP
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {times.map((c, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-6">
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
