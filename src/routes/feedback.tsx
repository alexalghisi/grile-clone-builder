import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/feedback")({
  component: FeedbackPage,
  head: () => ({
    meta: [
      { property: "og:title", content: "Feedback - GrileAdmitere" },
      { property: "og:description", content: "Trimite-ne feedback, raportează un bug sau propune o îmbunătățire pentru GrileAdmitere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Feedback - GrileAdmitere" },
      { name: "description", content: "Trimite-ne feedback, raportează un bug sau propune o îmbunătățire pentru GrileAdmitere." },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/feedback" }],
  }),
});

function FeedbackPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [grilaId, setGrilaId] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5) {
      toast.error("Mesajul trebuie să aibă cel puțin 5 caractere.");
      return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("feedback").insert({
      category,
      message: message.trim(),
      email: email.trim() || session?.user.email || null,
      grila_id: grilaId.trim() || null,
      page_url: typeof window !== "undefined" ? window.location.href : null,
      user_id: session?.user.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error("Eroare la trimitere. Încearcă din nou.");
      return;
    }
    toast.success("Mulțumim pentru feedback!");
    setMessage(""); setEmail(""); setGrilaId("");
    router.invalidate();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2"><MessageSquare className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-sm text-muted-foreground">Spune-ne ce putem îmbunătăți sau raportează o problemă.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Trimite mesaj</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Categorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug / Eroare</SelectItem>
                  <SelectItem value="UX">Interfață / UX</SelectItem>
                  <SelectItem value="Continut">Greșeală în conținut (grilă)</SelectItem>
                  <SelectItem value="Sugestie">Sugestie</SelectItem>
                  <SelectItem value="Altceva">Altceva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {category === "Continut" && (
              <div>
                <Label>ID grilă (opțional)</Label>
                <Input value={grilaId} onChange={(e) => setGrilaId(e.target.value)} placeholder="ex: 123abc..." />
              </div>
            )}
            <div>
              <Label>Mesaj *</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required minLength={5} maxLength={2000} />
            </div>
            <div>
              <Label>Email (opțional, pentru răspuns)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="adresa@exemplu.ro" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Se trimite..." : "Trimite feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
