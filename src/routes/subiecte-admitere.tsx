import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/subiecte-admitere")({
  head: () => ({
    meta: [
      { title: "Subiecte de Admitere — GrileAdmitere.ro" },
      { name: "description", content: "Grile pe materii pentru admitere: biologie, chimie, fizică, matematică, română, engleză." },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/subiecte-admitere" }],
  }),
  component: Page,
});

const SUBJECTS = [
  { slug: "biologie", icon: "🧬", name: "Biologie", desc: "Teste de biologie pentru admitere la facultate" },
  { slug: "chimie", icon: "⚗️", name: "Chimie", desc: "Teste de chimie pentru admitere la facultate" },
  { slug: "fizica", icon: "⚛️", name: "Fizică", desc: "Teste de fizică pentru admitere la facultate" },
  { slug: "matematica", icon: "📐", name: "Matematică", desc: "Teste de matematică pentru admitere la facultate" },
  { slug: "romana", icon: "📖", name: "Limba Română", desc: "Teste de limba română pentru admitere la facultate" },
  { slug: "engleza", icon: "🌍", name: "Limba Engleză", desc: "Teste de limba engleză pentru admitere la facultate" },
];

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Subiecte de Admitere</h1>
        <p className="mt-2 text-muted-foreground">Alege un subiect și testează-te cu grile de admitere reale</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link key={s.slug} to="/quiz/$slug" params={{ slug: s.slug }} className="block">
              <Card className="h-full p-6 transition hover:border-primary/40 hover:shadow-md">
                <div className="text-3xl">{s.icon}</div>
                <h2 className="mt-3 text-lg font-semibold">{s.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                <span className="mt-4 inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">Începe Quiz <ArrowRight className="ml-1 h-3 w-3" /></span>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-12 p-6 sm:p-8">
          <h3 className="text-xl font-semibold">Pregătire Completă</h3>
          <p className="mt-2 text-sm text-muted-foreground">Accesează grile de admitere după universitate și subiecte specifice</p>
          <Link to="/grile" className="mt-4 inline-flex"><Button>Navighează la Grile</Button></Link>
        </Card>
      </main>
    </div>
  );
}