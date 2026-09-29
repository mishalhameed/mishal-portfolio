import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import { NotFound } from "@/components/not-found";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mishal Hameed — AI, Software & Automation" },
      { name: "description", content: "Independent builder and entrepreneur focused on AI automation, software products, and digital businesses. I build practical technology systems, experiment with new products, and turn ideas into working prototypes." },
      { name: "theme-color", content: "#08080b" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  shellComponent: RootShell,
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduce')}catch(e){}",
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>{children}</AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
