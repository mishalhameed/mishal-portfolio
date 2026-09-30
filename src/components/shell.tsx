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

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let activeCard: HTMLElement | null = null;
    let activeMagnet: HTMLElement | null = null;

    const resetCard = (element: HTMLElement) => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
      element.style.setProperty("--pointer-x", "50%");
      element.style.setProperty("--pointer-y", "50%");
      element.classList.remove("is-pointed");
    };
    const resetMagnet = (element: HTMLElement) => {
      element.style.setProperty("--magnet-x", "0px");
      element.style.setProperty("--magnet-y", "0px");
    };

    const update = () => {
      frame = 0;
      const target = document.elementFromPoint(pointerX, pointerY);
      const card =
        target?.closest<HTMLElement>(
          ".system-card, .experiment-card, .capability-item, .principles-grid li",
        ) ?? null;
      if (activeCard && activeCard !== card) resetCard(activeCard);
      activeCard = card;

      if (card) {
        const rect = card.getBoundingClientRect();
        const x = (pointerX - rect.left) / rect.width;
        const y = (pointerY - rect.top) / rect.height;
        card.style.setProperty("--pointer-x", `${x * 100}%`);
        card.style.setProperty("--pointer-y", `${y * 100}%`);
        card.style.setProperty("--tilt-x", `${(0.5 - y) * 3.2}deg`);
        card.style.setProperty("--tilt-y", `${(x - 0.5) * 3.2}deg`);
        card.classList.add("is-pointed");
      }

      const magnet =
        target?.closest<HTMLElement>(".button, .header-cta, .contact-email, .text-link") ?? null;
      if (activeMagnet && activeMagnet !== magnet) resetMagnet(activeMagnet);
      activeMagnet = magnet;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const dx = pointerX - (rect.left + rect.width / 2);
        const dy = pointerY - (rect.top + rect.height / 2);
        const nearby = Math.abs(dx) < rect.width * 0.85 && Math.abs(dy) < rect.height * 1.8;
        magnet.style.setProperty("--magnet-x", `${nearby ? dx * 0.1 : 0}px`);
        magnet.style.setProperty("--magnet-y", `${nearby ? dy * 0.12 : 0}px`);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onPointerLeave = () => {
      if (activeCard) resetCard(activeCard);
      if (activeMagnet) resetMagnet(activeMagnet);
      activeCard = null;
      activeMagnet = null;
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
      if (activeCard) resetCard(activeCard);
      if (activeMagnet) resetMagnet(activeMagnet);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      frame = 0;
      document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };
    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
