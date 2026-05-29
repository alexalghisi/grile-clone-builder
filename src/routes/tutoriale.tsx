import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
export const Route = createFileRoute("/tutoriale")({
  head: () => ({
    meta: [
      { title: "Tutoriale Admitere 2026 — Ghiduri Pas cu Pas" },
      { name: "description", content: "Tutoriale și ghiduri pas cu pas pentru admiterea la facultate 2026: matematică, fizică, chimie, biologie, română și informatică." },
      { property: "og:title", content: "Tutoriale Admitere 2026 — Ghiduri Pas cu Pas" },
      { property: "og:description", content: "Ghiduri pas cu pas pentru fiecare materie de la admitere." },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/tutoriale" }],
  }),
  component: () => (
  <div className="min-h-screen bg-background"><Header />
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Tutoriale</h1>
      <p className="mt-2 text-muted-foreground">În curând: ghiduri pas cu pas pentru fiecare materie.</p>
    </main>
  </div>
),
});
