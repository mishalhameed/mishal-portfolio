import { useEffect, useState, type ReactNode } from "react";
import { site } from "@/data/site";

const navigation = [
  { label: "Home", href: "/#top" },
  { label: "Systems", href: "/#systems" },
  { label: "About", href: "/#about" },
  { label: "Process", href: "/#process" },
  { label: "Contact", href: "/#contact" },
];

export function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <a href="/#top" className="brand" aria-label="Mishal Hameed, home">
            MH
          </a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <a key={item.label} className="nav-link" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="header-cta" href="/#contact">
            Work with me <span aria-hidden="true">↗</span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        ) : null}
      </header>
      <div id="content">{children}</div>
      <footer className="site-footer">
        <div className="shell footer-main">
          <div>
            <p className="footer-name">{site.name}</p>
            <p className="footer-role">AI Automation &amp; Software Builder</p>
          </div>
          <div className="footer-links">
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href={`mailto:${site.email}`}>
              Email <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>Problem → System → Outcome</span>
          <span>© {new Date().getFullYear()} Mishal Hameed</span>
        </div>
      </footer>
    </>
  );
}
