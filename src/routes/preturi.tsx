import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/preturi")({
  head: () => ({
    meta: [
      { title: "Coming Soon — GrileAdmitere.ro" },
      { name: "description", content: "Abonamentele Premium vor fi disponibile în curând. Până atunci, toate simulările sunt gratuite!" },
    ],
  }),
  component: ComingSoonPage,
});

function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary/10">
          <Clock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">În curând</h1>
        <p className="mt-4 text-muted-foreground">
          Abonamentele Premium vor fi disponibile în curând. Până atunci, toate simulările și grilele sunt complet gratuite — bucură-te de ele!
        </p>
      </main>
    </div>
  );
}
