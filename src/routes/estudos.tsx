import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Baby, Sparkles, Flame, Crown, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/estudos")({ component: Estudos });

const turmas = [
  { icon: Baby, name: "Infantil", age: "4 a 9 anos", desc: "Histórias bíblicas com música e dinâmicas." },
  { icon: Sparkles, name: "Teen", age: "10 a 14 anos", desc: "Identidade, propósito e valores cristãos." },
  { icon: Flame, name: "Crazy", age: "15 a 22 anos", desc: "Jovens vivendo o Evangelho com ousadia." },
  { icon: Crown, name: "Full", age: "Adultos", desc: "Aprofundamento da Palavra e discipulado." },
];

function Estudos() {
  return (
    <>
      <PageHeader eyebrow="Escola Bíblica" title="Estudos para todas as idades" description="Quatro turmas para crescer na fé em comunidade." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {turmas.map(({ icon: Icon, name, age, desc }) => (
            <div key={name} className="rounded-2xl border border-border bg-card p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-lg">{name}</div>
              <div className="text-xs text-accent font-semibold mt-0.5">{age}</div>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <Link
          to="/estudos/forum"
          className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-[var(--gradient-warm)] p-6 hover:shadow-[var(--shadow-warm)] transition"
        >
          <div>
            <div className="text-xs uppercase tracking-wider text-accent font-semibold">Exclusivo para alunos</div>
            <div className="mt-1 text-xl font-semibold">Fórum da Escola Bíblica</div>
            <p className="text-sm text-muted-foreground mt-1">Interaja, compartilhe e crie seu perfil como em uma rede social.</p>
          </div>
          <MessagesSquare className="h-10 w-10 text-primary" />
        </Link>
      </div>
    </>
  );
}
