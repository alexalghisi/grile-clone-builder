import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Sparkles, Crown } from "lucide-react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/preturi")({
  head: () => ({
    meta: [
      { title: "Prețuri Premium — GrileAdmitere.ro" },
      { name: "description", content: "Planuri pentru admiterea 2026: Gratuit pentru pregătire de bază, Premium 50 RON/lună pentru acces complet la simulări și rezolvări video." },
    ],
  }),
  component: PricingPage,
});

const PREMIUM_PRICE_ID = "premium_monthly_ron";

function PricingPage() {
  const navigate = useNavigate();
  const { isActive, userId } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
  }, []);

  const features = {
    free: [
      { t: "Grile pe materii cu explicații", in: true },
      { t: "Câteva simulări demo", in: true },
      { t: "Salvare progres", in: true },
      { t: "Toate simulările cronometrate", in: false },
      { t: "Rezolvări video pas cu pas", in: false },
      { t: "Capitole tematice premium", in: false },
      { t: "Plan personalizat de pregătire", in: false },
    ],
    premium: [
      { t: "Tot din planul Gratuit", in: true },
      { t: "Toate simulările cronometrate (UPB, UB, UMF…)", in: true },
      { t: "Rezolvări video pas cu pas", in: true },
      { t: "Capitole tematice premium", in: true },
      { t: "Plan personalizat de pregătire", in: true },
      { t: "Anulează oricând", in: true },
    ],
  };

  function startCheckout() {
    if (!userId) {
      navigate({ to: "/autentificare", search: { redirect: "/preturi" } as any });
      return;
    }
    setCheckoutOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3"><Sparkles className="mr-1 h-3 w-3" /> Planuri simple, fără surprize</Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Alege planul pentru admitere 2026</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Începe gratuit. Treci la Premium când vrei toate simulările și rezolvările complete.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free */}
          <Card className="p-7">
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gratuit</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold">0 RON</span>
              <span className="text-muted-foreground">/lună</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Pentru cei care încep pregătirea.</p>
            <Button variant="outline" className="mt-5 w-full h-11" onClick={() => navigate({ to: "/grile" })}>
              Începe gratuit
            </Button>
            <ul className="mt-6 space-y-2.5 text-sm">
              {features.free.map((f) => (
                <li key={f.t} className={`flex items-start gap-2 ${f.in ? "" : "text-muted-foreground line-through"}`}>
                  {f.in ? <Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
                  {f.t}
                </li>
              ))}
            </ul>
          </Card>

          {/* Premium */}
          <Card className="relative p-7 border-primary/40 shadow-[var(--shadow-elegant)]">
            <Badge className="absolute -top-3 right-6 [background-image:var(--gradient-hero)] text-white shadow-[var(--shadow-glow)]">
              <Crown className="mr-1 h-3 w-3" /> Popular
            </Badge>
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">Premium</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold">50 RON</span>
              <span className="text-muted-foreground">/lună</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Acces complet, anulare oricând.</p>
            {isActive ? (
              <Button className="mt-5 w-full h-11" disabled>Ești deja Premium ✓</Button>
            ) : (
              <Button
                className="mt-5 w-full h-11 [background-image:var(--gradient-hero)] shadow-[var(--shadow-glow)] hover:opacity-95"
                onClick={startCheckout}
              >
                Devino Premium
              </Button>
            )}
            <ul className="mt-6 space-y-2.5 text-sm">
              {features.premium.map((f) => (
                <li key={f.t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> {f.t}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Sau plătește unic <strong className="text-foreground">30 RON</strong> pentru o singură simulare premium — din pagina simulării.
        </p>

        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>Finalizează abonamentul Premium</DialogTitle>
            </DialogHeader>
            <div className="p-2">
              {checkoutOpen && userId && (
                <StripeEmbeddedCheckout
                  priceId={PREMIUM_PRICE_ID}
                  userId={userId}
                  customerEmail={email}
                  returnUrl={`${window.location.origin}/profil?checkout=success`}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}