import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/autentificare")({
  head: () => ({
    meta: [
      { title: "Autentificare — GrileAdmitere.ro" },
      { name: "description", content: "Autentifică-te pe GrileAdmitere.ro pentru a-ți salva progresul la grilele de admitere și simulările BAC 2026." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/autentificare" }],
  }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (mode === "signup") return toast.success("Verifică email-ul pentru confirmare.");
    nav({ to: "/" });
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-md px-4 py-12">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">{mode === "signin" ? "Autentificare" : "Cont nou"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Salvează-ți progresul și scorurile.</p>
          <Button variant="outline" className="w-full mt-4" onClick={google}>Continuă cu Google</Button>
          <div className="my-4 text-center text-xs text-muted-foreground">sau</div>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Parolă</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{mode === "signin" ? "Intră" : "Creează cont"}</Button>
          </form>
          <button type="button" className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Nu ai cont? Înregistrează-te" : "Ai deja cont? Autentifică-te"}
          </button>
        </Card>
      </main>
    </div>
  );
}
