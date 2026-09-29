/** Public site settings. Edit this file — do not invent facts elsewhere. */

export const site = {
  name: "Mishal Hameed",
  title: "Mishal Hameed — AI, Software & Automation",
  description:
    "Independent builder and entrepreneur focused on AI automation, software products, and digital businesses. I build practical technology systems, experiment with new products, and turn ideas into working prototypes.",
  positioning: "Independent builder",
  /**
   * Absolute origin used for canonical URLs and the sitemap, e.g. https://yourdomain.com
   * Set VITE_SITE_URL in the host environment. Leave unset until the domain is real.
   */
  url: (import.meta.env.VITE_SITE_URL ?? "").replace(/\/$/, ""),
  /** Public email. Leave "" to hide mailto links. */
  email: "mishalhameed317036@icloud.com",
  /** Full profile URLs. Leave "" to hide. */
  github: "https://github.com/mishalhameed",
} as const;

export function canonical(path: string) {
  if (!site.url) return [];
  return [{ rel: "canonical", href: `${site.url}${path.startsWith("/") ? path : `/${path}`}` }];
}
