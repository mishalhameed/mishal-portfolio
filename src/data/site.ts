/** Public site settings. Edit this file — do not invent facts elsewhere. */

export const site = {
  name: "Mishal Hameed",
  title: "Wai8 — Mishal Hameed",
  description:
    "Big ambition. The first release is still ahead. A space for what comes next from Mishal Hameed.",
  positioning: "Exploring ideas for apps and tools",
  /**
   * Production origin used for canonical URLs and the sitemap. A host override
   * can point preview environments at their own canonical domain when needed.
   */
  url: (import.meta.env.VITE_SITE_URL ?? "https://msh8lx.tech").replace(/\/$/, ""),
  /** Public email. Leave "" to hide mailto links. */
  email: "mishalhameed317036@icloud.com",
  /** Full profile URLs. Leave "" to hide. */
  github: "https://github.com/mishalhameed",
} as const;

export function canonical(path: string) {
  if (!site.url) return [];
  return [{ rel: "canonical", href: `${site.url}${path.startsWith("/") ? path : `/${path}`}` }];
}
