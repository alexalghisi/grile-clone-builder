import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AdScript, StickyBottomAd } from "@/components/AdSlot";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#3B82F6" },
      { title: "Grile Admitere 2026 Rezolvate - Medicină, UPB, UBB | Gratis" },
      { name: "description", content: "Grile admitere 2026 rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități. Explicații detaliate, simulări BAC gratuite. Începe acum!" },
      { name: "author", content: "GrileAdmitere.ro" },
      { name: "keywords", content: "admitere facultate, grile admitere, pregătire admitere, UPB, UBB, ASE, Medicină, teste admitere, România" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "language", content: "Romanian" },
      { name: "geo.region", content: "RO" },
      { name: "geo.placename", content: "Romania" },
      { property: "og:title", content: "Grile Admitere 2026 Rezolvate - Medicină, UPB, UBB | Gratis" },
      { property: "og:description", content: "Grile admitere 2026 rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități. Explicații detaliate, simulări BAC gratuite. Începe acum!" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grileadmitere.ro/" },
      { property: "og:site_name", content: "GrileAdmitere.ro" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary" },
      { property: "og:locale", content: "ro_RO" },
      { name: "twitter:title", content: "Grile Admitere 2026 Rezolvate - Medicină, UPB, UBB | Gratis" },
      { name: "twitter:description", content: "Grile admitere 2026 rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități. Explicații detaliate, simulări BAC gratuite. Începe acum!" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/83c63369-cbf9-4437-ad9f-4f41926f2eac/id-preview-5022c68a--55f0cd08-eee4-4482-98ba-9f1422bac10e.lovable.app-1778656224108.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/83c63369-cbf9-4437-ad9f-4f41926f2eac/id-preview-5022c68a--55f0cd08-eee4-4482-98ba-9f1422bac10e.lovable.app-1778656224108.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: "https://grileadmitere.ro/" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "GrileAdmitere.ro",
          url: "https://grileadmitere.ro",
          logo: "https://grileadmitere.ro/logo.png",
          description:
            "Platformă gratuită de pregătire pentru admiterea la facultate cu grile rezolvate pas cu pas.",
          address: { "@type": "PostalAddress", addressCountry: "RO" },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "10000",
            bestRating: "5",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "GrileAdmitere.ro",
          url: "https://grileadmitere.ro",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://grileadmitere.ro/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Cum mă pregătesc pentru admiterea la facultate 2026?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Pe GrileAdmitere.ro găsești 74.000+ grile rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități, complet gratuit.",
              },
            },
            {
              "@type": "Question",
              name: "Grilele de admitere sunt gratuite?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Da, toate grilele de admitere și simulările BAC de pe GrileAdmitere.ro sunt 100% gratuite.",
              },
            },
            {
              "@type": "Question",
              name: "Pentru ce universități am grile?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Avem grile pentru UMF (București, Cluj, Iași, Timișoara), UPB, UBB, ASE, UAIC, UTCN și 100+ universități din România.",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <HeadContent />
        <AdScript />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="pb-[64px] md:pb-[100px]">
        <Outlet />
      </div>
      <StickyBottomAd />
      <Toaster />
    </QueryClientProvider>
  );
}
