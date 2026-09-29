# Mishal Hameed

Personal site. AI, software, automation, and digital products.

This repository runs on TanStack Start (React, TypeScript, Tailwind, Vite) because that is the production stack wired for deployment here. Three.js, React Three Fiber, and drei render the 3D scenes. It deploys to Vercel the same way a Next.js app would: push the repo, set environment variables, attach a domain.

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run start
```

`npm run dev` serves the site on port 8080. `npm run build` writes the production output. `npm run start` is provided by the Vite/TanStack production server after build (see the host's start command; on Vercel the framework preset runs the build output).

## Environment

Copy `.env.example` into the host's environment. Do not commit secrets.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SITE_URL` | For real canonical URLs | Absolute origin, no trailing slash |
| `VITE_PLAUSIBLE_DOMAIN` | No | Loads Plausible and sends the events below |
| `RESEND_API_KEY` | For email | Resend API key |
| `CONTACT_FROM_EMAIL` | With Resend | Verified sender |
| `CONTACT_TO_EMAIL` | With Resend | Inbox that receives the form |
| `CONTACT_WEBHOOK_URL` | Alternative to Resend | POST target for the same payload |

If neither Resend nor a webhook is configured, the form still validates. It tells the visitor delivery is not connected and offers a copy of the message. It does not pretend the message was sent.

## Analytics events

`page_view`, `project_view`, `case_study_view`, `contact_start`, `contact_submit`, `email_click`, `github_click`.

Without `VITE_PLAUSIBLE_DOMAIN`, events are only dispatched on `window` as `mh:analytics`.

## Customize

- `src/data/site.ts` — name, description, public email, GitHub
- `src/data/projects.ts` — work, status, case-study copy, links
- `src/data/profile.ts` — about, principles, capabilities, tools, timeline
- `src/data/systems.ts` — the three 3D system diagrams

Do not invent clients, revenue, users, awards, or dates.

## Routes

- `/` home
- `/work` index
- `/work/learnlk`
- `/work/ai-workforce`
- `/work/rewired`
- `/work/ai-automation`
- `/sitemap.xml`
- `/robots.txt`

## Deploy on Vercel

1. Import the repository.
2. Framework preset: the included `vite` / TanStack Start build (`npm run build`).
3. Add the environment variables above. `VITE_` variables are public. `RESEND_API_KEY` stays server-side.
4. Deploy.
5. Add the production domain under Project → Settings → Domains.
6. At the registrar, point the domain at Vercel (CNAME `www` to `cname.vercel-dns.com`, or the A record Vercel shows for the apex).
7. Set `VITE_SITE_URL` to that domain and redeploy so canonical URLs and the sitemap match it.

## Domain

After DNS resolves, open the site on the domain, submit the contact form once, and confirm the Resend dashboard shows the message. Until `VITE_SITE_URL` is set, canonical tags are omitted rather than pointed at a fake domain.
