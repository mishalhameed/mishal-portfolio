import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { canonical, site } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: site.title },
      { name: "description", content: site.description },
      { name: "author", content: site.name },
    ],
    links: canonical("/"),
  }),
  component: HomePage,
});
