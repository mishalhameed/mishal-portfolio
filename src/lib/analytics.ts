export type AnalyticsEvent =
  | "page_view"
  | "project_view"
  | "case_study_view"
  | "contact_start"
  | "contact_submit"
  | "email_click"
  | "github_click";

type Plausible = {
  (event: string, options?: { props?: Record<string, string> }): void;
  q?: unknown[];
};

declare global {
  interface Window {
    plausible?: Plausible;
  }
}

export function track(event: AnalyticsEvent, props?: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mh:analytics", { detail: { event, props } }));
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) return;
  window.plausible =
    window.plausible ||
    ((...args: unknown[]) => {
      const fn = window.plausible as Plausible;
      fn.q = fn.q || [];
      fn.q.push(args);
    });
  window.plausible(event, props ? { props } : undefined);
}
