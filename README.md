# Wai8 — Mishal Hameed

A one-page holding site for the period before the first app or tool launches. Matte charcoal, an electric-blue and ice-white DVD, and an elongated figure-eight mark inspired by Mishal’s sketch.

- Side A: the waiting screen.
- Side B: a short statement of intent.
- Four original notes with previous/next controls.
- Disc animation can be paused; reduced-motion preferences are respected.
- Email and GitHub links use the existing public profile details.
- Previous `/work` URLs temporarily redirect home. Archived project data remains in the repository, but it is not presented as launched work.

## Run

```sh
npm ci
npm run dev
npm run typecheck
npm run build
```

The existing TanStack Start / React / Vite deployment to Vercel is retained. No new dependencies, database, or subscription service are needed for the holding page. The dev server explicitly allows `terminal.local` for the managed preview.

## Content

- `src/components/home-page.tsx`: page, original notes, and disc controls.
- `src/styles.css`: responsive layout and DVD finish.
- `public/images/wai8-blue-disc.webp`: optimized DVD artwork isolated from the supplied visual reference using the built-in image-generation tool. Prompt: preserve the frontal blue/white disc, grain and hub; remove phone controls and background; reconstruct the obscured edge; output a transparent cutout.
- `src/data/site.ts`: identity, public links, and canonical origin.
- `src/lib/og/site.json`: generated sharing metadata.

`VITE_SITE_URL` can override the default canonical origin, `https://msh8lx.tech`. Do not invent products, launches, customers, revenue, awards, or a release date. The page intentionally has no countdown or signup form.
