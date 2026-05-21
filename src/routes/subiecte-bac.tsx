import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/subiecte-bac")({
  head: () => ({
    meta: [
      { title: "Subiecte BAC 2026 — GrileAdmitere.ro" },
      { name: "description", content: "Subiecte și grile pentru BAC 2026: matematică, română, biologie, chimie, fizică, istorie." },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/subiecte-bac" }],
  }),
  component: Page,
});

const SUBJECTS = [
  { slug: "matematica", icon: "📐", name: "Matematică", desc: "Subiecte BAC matematică M1, M2, pedagogic" },
  { slug: "romana", icon: "📖", name: "Limba Română", desc: "Subiecte BAC limba și literatura română" },
  { slug: "biologie", icon: "🧬", name: "Biologie", desc: "Subiecte BAC biologie clasa a XI-a și a XII-a" },
  { slug: "chimie", icon: "⚗️", name: "Chimie", desc: "Subiecte BAC chimie organică și anorganică" },
  { slug: "fizica", icon: "⚛️", name: "Fizică", desc: "Subiecte BAC mecanică, electricitate, optică" },
  { slug: "engleza", icon: "🌍", name: "Limba Engleză", desc: "Subiecte BAC limba engleză" },
];

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Subiecte BAC 2026</h1>
        <p className="mt-2 text-muted-foreground">Pregătește-te pentru bacalaureat cu grile pe materii</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link key={s.slug} to="/quiz/$slug" params={{ slug: s.slug }}>
              <Card className="h-full p-6 transition hover:border-primary/40 hover:shadow-md">
                <div className="text-3xl">{s.icon}</div>
                <h2 className="mt-3 text-lg font-semibold">{s.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                <Button variant="outline" size="sm" className="mt-4">Începe Quiz <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}