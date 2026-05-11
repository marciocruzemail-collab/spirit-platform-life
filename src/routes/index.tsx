import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Users, BookOpen, Bus, Radio, Calendar } from "lucide-react";
import heroImg from "@/assets/hero-church.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

const highlights = [
  { to: "/doacoes", icon: Heart, title: "Doações", desc: "Doe ou receba alimentos com carinho." },
  { to: "/transporte", icon: Bus, title: "Transporte gratuito", desc: "Nossa Kombi passa no seu bairro." },
  { to: "/estudos", icon: BookOpen, title: "Estudos bíblicos", desc: "Infantil, Teen, Crazy e Full." },
  { to: "/cursos", icon: Users, title: "Cursos online", desc: "Batismo, Primeiros Passos e mais." },
  { to: "/radio", icon: Radio, title: "Rádio ao vivo", desc: "Pregações, vídeos e entrevistas." },
  { to: "/mural", icon: Calendar, title: "Mural", desc: "Testemunhos, cultos e projetos sociais." },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Interior acolhedor da igreja"
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4">
              Bem-vindo
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Um lugar de fé, esperança e acolhimento.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Cultos às quartas, sextas e domingos. Venha conhecer nossa comunidade e os
              projetos que transformam vidas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/sobre"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition"
              >
                Nossa história
              </Link>
              <Link
                to="/transporte"
                className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-secondary transition"
              >
                Pegar a Kombi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">
            Explore
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Tudo o que vivemos juntos</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:shadow-[var(--shadow-warm)] hover:-translate-y-0.5"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-lg">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 grid gap-6 md:grid-cols-3 text-center">
          {[
            { day: "Quarta", time: "19h30", label: "Estudo bíblico" },
            { day: "Sexta", time: "20h", label: "Culto de oração" },
            { day: "Domingo", time: "10h e 18h", label: "Culto da família" },
          ].map((c) => (
            <div key={c.day} className="rounded-2xl bg-card border border-border p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                {c.day}
              </div>
              <div className="mt-2 text-3xl font-bold">{c.time}</div>
              <div className="mt-1 text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
