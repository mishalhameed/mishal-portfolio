/** Public site settings. Edit this file — do not invent facts elsewhere. */

export const site = {
  name: "Mishal Hameed",
  title: "Mishal Hameed — AI Automation & Software Builder",
  description:
    "Independent AI automation and software builder creating practical systems for lead qualification, customer support, workflow automation and business operations.",
  positioning: "AI Automation & Software Builder",
  /**
   * Production origin used for canonical URLs and the sitemap. A host override
   * can point preview environments at their own canonical domain when needed.
   */
  url: (import.meta.env.VITE_SITE_URL ?? "https://mishal-portfolio-gilt.vercel.app").replace(
    /\/$/,
    "",
  ),
  /** Public email. Leave "" to hide mailto links. */
  email: "mishalhameed317036@icloud.com",
  /** Full profile URLs. Leave "" to hide. */
  github: "https://github.com/mishalhameed",
} as const;

export function canonical(path: string) {
  if (!site.url) return [];
  return [{ rel: "canonical", href: `${site.url}${path.startsWith("/") ? path : `/${path}`}` }];
}
