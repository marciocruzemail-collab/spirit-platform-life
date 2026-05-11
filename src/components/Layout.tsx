import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Church, BookOpenCheck, LogOut, User, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/mural", label: "Mural" },
  { to: "/doacoes", label: "Doações" },
  { to: "/transporte", label: "Transporte" },
  { to: "/estudos", label: "Estudos" },
  { to: "/cursos", label: "Cursos" },
  { to: "/biblia", label: "Bíblia IA" },
  { to: "/servicos", label: "Serviços" },
  { to: "/equipe", label: "Equipe" },
  { to: "/radio", label: "Rádio" },
] as const;

export function Layout() {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold shrink-0">
            <Church className="h-6 w-6 text-primary" />
            <div className="leading-tight">
              <div className="text-base">IEQ.V Ferraz</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Campos do Jordão · SP</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
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

          <div className="hidden md:flex items-center gap-2">
            {userEmail ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-sm hover:bg-accent/30">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <Link to="/meus-estudos" className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm hover:bg-accent/20">
                  <User className="h-4 w-4" /> {userEmail.split("@")[0]}
                </Link>
                <button onClick={logout} className="rounded-full p-2 hover:bg-secondary" aria-label="Sair">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                Entrar
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="xl:hidden rounded-md p-2 hover:bg-secondary"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="xl:hidden border-t border-border/60 bg-background">
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
              {userEmail ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="col-span-2 rounded-lg bg-accent/30 px-3 py-2 text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Painel Admin
                    </Link>
                  )}
                  <Link to="/meus-estudos" onClick={() => setOpen(false)} className="col-span-2 rounded-lg bg-accent/20 px-3 py-2 text-sm flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4" /> Meus estudos
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm">
                    Sair ({userEmail})
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="col-span-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm text-center font-medium">
                  Entrar / Cadastrar
                </Link>
              )}
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
              IEQ.V Ferraz
            </div>
            <p className="text-muted-foreground">
              Igreja do Evangelho Quadrangular — Vila Ferraz, Campos do Jordão · SP.
              Um lugar de fé, acolhimento e transformação.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Cultos</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>Quarta — 19h30</li>
              <li>Sexta — 19h00</li>
              <li>Domingo — 19h00</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Endereço</div>
            <p className="text-muted-foreground">
              Rua João Rodrigues da Silva, 247<br />
              Vila Ferraz — Campos do Jordão · SP
            </p>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} IEQ.V Ferraz · Campos do Jordão.
        </div>
      </footer>
    </div>
  );
}
