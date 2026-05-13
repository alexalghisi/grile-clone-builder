import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";

export function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>GrileAdmitere</span>
        </Link>
        <nav className="hidden gap-5 md:flex text-sm">
          <Link to="/grile" className="text-muted-foreground hover:text-foreground">Grile</Link>
          <Link to="/simulare" className="text-muted-foreground hover:text-foreground">Simulare</Link>
          <Link to="/tutoriale" className="text-muted-foreground hover:text-foreground">Tutoriale</Link>
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
            <Link to="/autentificare">
              <Button size="sm">Autentificare</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}