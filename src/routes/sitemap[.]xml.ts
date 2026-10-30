import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/data/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = site.url || new URL(request.url).origin;
        const paths = ["/"];
        const urls = paths
          .map((path) => `<url><loc>${origin}${path}</loc><changefreq>monthly</changefreq></url>`)
          .join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
