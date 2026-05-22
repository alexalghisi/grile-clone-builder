import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message);
    if (result.redirected) return;
    nav({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-md px-4 py-12">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">{mode === "signin" ? "Autentificare" : "Cont nou"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Salvează-ți progresul și scorurile.</p>
          <Button variant="outline" className="w-full mt-4 gap-2" onClick={google}>
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41.4 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
            </svg>
            Continuă cu Google
          </Button>
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
