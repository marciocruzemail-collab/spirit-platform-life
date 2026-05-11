import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Church } from "lucide-react";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/mural", label: "Mural" },
  { to: "/doacoes", label: "Doações" },
  { to: "/transporte", label: "Transporte" },
  { to: "/estudos", label: "Estudos" },
  { to: "/cursos", label: "Cursos" },
  { to: "/servicos", label: "Serviços" },
  { to: "/equipe", label: "Equipe" },
  { to: "/radio", label: "Rádio" },
] as const;

export function Layout() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Church className="h-6 w-6 text-primary" />
            <span className="text-lg tracking-tight">Igreja Viva</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-md p-2 hover:bg-secondary"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/60 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    path === item.to
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-secondary/40 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Church className="h-5 w-5 text-primary" />
              Igreja Viva
            </div>
            <p className="text-muted-foreground">
              Um lugar de fé, acolhimento e transformação. Venha como você é.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Cultos</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>Quarta — 19h30 (Estudo)</li>
              <li>Sexta — 20h (Oração)</li>
              <li>Domingo — 10h e 18h</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contato</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>contato@igrejaviva.com</li>
              <li>(00) 00000-0000</li>
              <li>Rua da Paz, 100</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Igreja Viva. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
