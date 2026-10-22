import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  redirect,
  useRouterState,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AdScript } from "@/components/AdSlot";
import { Toaster } from "@/components/ui/sonner";
import { ClientErrorReporter, reportClientError } from "@/components/ClientErrorReporter";

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

function ErrorComponent({ error: rawError, reset }: { error: unknown; reset: () => void }) {
  const error = rawError as Error;
  console.error(error);
  const router = useRouter();
  if (typeof window !== "undefined") {
    reportClientError(error?.message || "Route error", { stack: error?.stack });
  }

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
  beforeLoad: ({ location }): void => {
    // Legacy/typo URLs like /grile-ubb -> /grile/ubb
    const m = location.pathname.match(/^\/grile-([^/]+)\/?$/);
    if (m) {
      throw redirect({
        to: "/grile/$uniSlug",
        params: { uniSlug: m[1] },
        replace: true,
      });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#3B82F6" },
      { name: "google-site-verification", content: "BAV_3T4OOQ8TgVARB2zxs7EoZ4avHrMvPc6o0qzTMSI" },
      { title: "Grile Admitere 2026 Rezolvate Gratis | GrileAdmitere" },
      { name: "description", content: "Grile admitere 2026 rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități. Explicații detaliate, simulări BAC gratuite. Începe acum!" },
      { name: "author", content: "GrileAdmitere.ro" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "language", content: "Romanian" },
      { name: "geo.region", content: "RO" },
      { name: "geo.placename", content: "Romania" },
      { property: "og:title", content: "Grile Admitere 2026 Rezolvate Gratis | GrileAdmitere" },
      { property: "og:description", content: "Grile admitere 2026 rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități. Explicații detaliate, simulări BAC gratuite. Începe acum!" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GrileAdmitere.ro" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:image", content: "https://grileadmitere.ro/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://grileadmitere.ro/og-image.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
      },
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
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "GrileAdmitere.ro",
          url: "https://grileadmitere.ro",
          inLanguage: "ro-RO",
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
      <div className="pb-6">
        <Outlet />
      </div>
      <Toaster />
      <ClientErrorReporter />
    </QueryClientProvider>
  );
}
