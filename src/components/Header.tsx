import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Menu, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/grile", label: "Grile" },
  { to: "/profesori", label: "Profesori" },
  { to: "/simulare", label: "Simulări" },
  { to: "/admitere", label: "Subiecte admitere" },
  { to: "/subiecte-bac", label: "BAC" },
  { to: "/scoala-soferi", label: "Școală șoferi" },
  { to: "/tutoriale", label: "Resurse" },
  { to: "/contact", label: "Contact" },
  { to: "/preturi", label: "Prețuri" },
] as const;

export function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-lg [background-image:var(--gradient-hero)] text-white shadow-[var(--shadow-glow)]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-base tracking-tight">GrileAdmitere<span className="text-primary-glow">.ro</span></span>
        </Link>
        <nav className="hidden gap-1 lg:flex text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 bg-accent text-foreground font-semibold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
              <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/autentificare" className="hidden sm:block">
                <Button size="sm" variant="ghost">Conectare</Button>
              </Link>
              <Link to="/autentificare">
                <Button size="sm" className="[background-image:var(--gradient-hero)] shadow-[var(--shadow-glow)] hover:opacity-95">
                  Începe gratuit <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted">
                    {n.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}