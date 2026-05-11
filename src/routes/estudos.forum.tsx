import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MessageCircle, Heart } from "lucide-react";

export const Route = createFileRoute("/estudos/forum")({ component: Forum });

const posts = [
  { user: "Ana Lima", turma: "Full", time: "2h", text: "Que bênção o estudo de hoje sobre Romanos 8! Alguém quer compartilhar o que mais marcou?", likes: 12, comments: 4 },
  { user: "Pedro Souza", turma: "Crazy", time: "5h", text: "Versículo da semana: 'Tudo posso naquele que me fortalece'. Como vocês têm aplicado isso?", likes: 24, comments: 9 },
  { user: "Marina Reis", turma: "Teen", time: "1d", text: "Glória a Deus pela aula de ontem 🙏 Quem foi?", likes: 18, comments: 6 },
];

function Forum() {
  return (
    <>
      <PageHeader eyebrow="Fórum de alunos" title="Conecte, compartilhe, cresça" description="Espaço dos alunos da Escola Bíblica. Crie seu perfil e participe." />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <form className="rounded-2xl border border-border bg-card p-5 mb-6">
          <textarea placeholder="O que você quer compartilhar com a turma?" rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="mt-3 flex justify-end">
            <button className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Publicar</button>
          </div>
        </form>

        <div className="space-y-4">
          {posts.map((p, i) => (
            <article key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[var(--gradient-hero)] flex items-center justify-center text-primary-foreground font-semibold">
                  {p.user[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{p.user} <span className="text-xs text-accent">· {p.turma}</span></div>
                  <div className="text-xs text-muted-foreground">há {p.time}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{p.text}</p>
              <div className="mt-4 flex gap-5 text-sm text-muted-foreground">
                <button className="flex items-center gap-1.5 hover:text-foreground"><Heart className="h-4 w-4" /> {p.likes}</button>
                <button className="flex items-center gap-1.5 hover:text-foreground"><MessageCircle className="h-4 w-4" /> {p.comments}</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
