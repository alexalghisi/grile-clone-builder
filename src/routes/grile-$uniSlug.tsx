import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect old/typo form `/grile-<slug>` -> canonical `/grile/<slug>`
export const Route = createFileRoute("/grile-$uniSlug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/grile/$uniSlug",
      params: { uniSlug: params.uniSlug },
      replace: true,
    });
  },
});