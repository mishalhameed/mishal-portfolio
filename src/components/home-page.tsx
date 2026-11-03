import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Pause, Play } from "lucide-react";
import { site } from "@/data/site";

const notes = [
  { title: "The ambition", quote: "Make something worth waiting for." },
  { title: "The standard", quote: "Let the work make the introduction." },
  { title: "The discipline", quote: "Earn the future. One move at a time." },
  { title: "The beginning", quote: "Start at zero. Think beyond it." },
];

export function HomePage() {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [note, setNote] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const page = useRef<HTMLElement>(null);
  const hero = useRef<HTMLElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const motionOff = !motionReady || paused || reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    try {
      setPaused(localStorage.getItem("wai8-motion") === "paused");
    } catch {
      /* Storage is optional. */
    }
    setMotionReady(true);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = page.current;
    const scene = hero.current;
    const artwork = disc.current;
    if (!element || !scene || !artwork || motionOff) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let inView = true;
    const render = () => {
      frame = 0;
      artwork.style.transform = `translate3d(${x * 5}px, ${y * 3}px, 0)`;
    };
    const schedule = () => {
      if (!frame && !document.hidden && inView) frame = window.requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      x = event.clientX / window.innerWidth - 0.5;
      y = event.clientY / window.innerHeight - 0.5;
      schedule();
    };
    const reset = () => {
      x = 0;
      y = 0;
      schedule();
    };
    const visibility = () => {
      element.classList.toggle("motion-hidden", document.hidden);
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        artwork.classList.toggle("motion-offscreen", !inView);
        if (!inView) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(artwork);
    visibility();
    scene.addEventListener("pointermove", move, { passive: true });
    scene.addEventListener("pointerleave", reset);
    finePointer.addEventListener("change", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerleave", reset);
      finePointer.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", visibility);
      element.classList.remove("motion-hidden");
      artwork.classList.remove("motion-offscreen");
      artwork.style.removeProperty("transform");
    };
  }, [motionOff]);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 3500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const toggleMotion = () => {
    const next = !paused;
    setPaused(next);
    try {
      localStorage.setItem("wai8-motion", next ? "paused" : "playing");
    } catch {
      /* Storage is optional. */
    }
  };
  const copyEmail = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(site.email);
      } else {
        const previousFocus = document.activeElement as HTMLElement | null;
        const field = document.createElement("textarea");
        field.value = site.email;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.append(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        previousFocus?.focus({ preventScroll: true });
        if (!copied) throw new Error("Copy unavailable");
      }
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };
  const changeNote = (direction: number) =>
    setNote((value) => (value + direction + notes.length) % notes.length);

  return (
    <main id="content" ref={page} className={`cinematic-home${motionOff ? " motion-paused" : ""}`}>
      <header className="global-header">
        <nav className="content-width global-navigation" aria-label="Main navigation">
          <a className="wordmark" href="#content" aria-label="Mishal Hameed, home">
            msh8lx
          </a>
          <div className="global-links">
            <a href="#overview">Overview</a>
            <a href="#intent">The intent</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </header>
      <div className="local-navigation liquid-bar">
        <nav className="content-width local-navigation-inner" aria-label="Wai8 navigation">
          <a href="#overview" className="local-wordmark" aria-label="Wai8 overview">
            Wai8
          </a>
          <a href="#contact" className="liquid-control liquid-blue connect-button">
            Connect
          </a>
        </nav>
      </div>
      <section id="overview" ref={hero} className="cinematic-hero" aria-labelledby="hero-heading">
        <div className="hero-copy content-width">
          <p className="hero-name">{site.name}</p>
          <h1 id="hero-heading">
            Make something
            <br />
            worth building.
          </h1>
          <p className="hero-description">Businesses. Brands. Long-term value.</p>
          <div className="hero-links">
            <a href="#intent" className="text-link">
              Explore the intent <ChevronRight aria-hidden="true" />
            </a>
            <a href="#contact" className="text-link">
              Get in touch <ChevronRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <figure className="hero-artwork">
          <div className="disc-visual" ref={disc}>
            <img
              className="cinematic-disc"
              src="/images/wai8-cinematic-disc.webp"
              srcSet="/images/wai8-cinematic-disc-small.webp 960w, /images/wai8-cinematic-disc.webp 2172w"
              sizes="(max-width: 700px) 110vw, (max-width: 1440px) 100vw, 1440px"
              alt="The Wai8 disc, polished silver with a quiet blue reflection."
              width="2172"
              height="724"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </div>
          <figcaption className="content-width artwork-caption">
            <span>
              WAI8 <span aria-hidden="true">/</span> A SPACE FOR WHAT’S NEXT.
            </span>
            <button
              className="liquid-control motion-control"
              type="button"
              onClick={toggleMotion}
              disabled={reducedMotion}
              aria-pressed={motionOff}
              aria-label={
                reducedMotion
                  ? "Motion off: reduced motion preference"
                  : paused
                    ? "Resume all motion"
                    : "Pause all motion"
              }
              title={reducedMotion ? "Follows your reduced motion setting" : "Toggle animation"}
            >
              {motionOff ? (
                <Play size={14} aria-hidden="true" />
              ) : (
                <Pause size={14} aria-hidden="true" />
              )}
              <span>{reducedMotion ? "Reduced motion" : paused ? "Motion off" : "Motion on"}</span>
            </button>
          </figcaption>
        </figure>
      </section>
      <section
        id="intent"
        className="intent-section light-section"
        aria-labelledby="intent-heading"
      >
        <div className="content-width intent-layout">
          <h2 id="intent-heading">
            A long-term
            <br /> mindset.
          </h2>
          <div>
            <p className="intent-statement">
              Find the opportunity.
              <br />
              Shape the idea.
              <br />
              Build lasting value.
            </p>
            <a className="text-link" href="#about">
              More about Mishal <ChevronRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section id="about" className="about-section light-section" aria-labelledby="about-heading">
        <div className="content-width">
          <p className="section-label">The intent behind the work</p>
          <h2 id="about-heading">
            The idea is the start.
            <br />
            <span>The work is what matters.</span>
          </h2>
          <p className="about-copy">
            I’m Mishal. I build and scale businesses. My focus is on finding opportunities, shaping
            brands, creating products and growing lasting value. Apps and technology are part of
            that wider ambition.
          </p>
          <div className="principles">
            <article>
              <span className="principle-number" aria-hidden="true">
                01
              </span>
              <h3>Business.</h3>
              <p>Find the opportunity. Build with a clear purpose and a long-term view.</p>
            </article>
            <article>
              <span className="principle-number" aria-hidden="true">
                02
              </span>
              <h3>Brand.</h3>
              <p>Shape the idea into something people can understand, connect with and remember.</p>
            </article>
            <article>
              <span className="principle-number" aria-hidden="true">
                03
              </span>
              <h3>Growth.</h3>
              <p>Keep learning, keep refining, and turn ambition into lasting value.</p>
            </article>
          </div>
        </div>
      </section>
      <section id="notes" className="notes-section light-section" aria-label="Notes on ambition">
        <div className="content-width notes-inner">
          <p className="section-label">Notes to build by.</p>
          <div className="note-copy" aria-live="polite" aria-atomic="true">
            <blockquote>“{notes[note].quote}”</blockquote>
            <p>{notes[note].title}</p>
          </div>
          <div className="note-controls">
            <button
              className="liquid-control liquid-light circle-control"
              type="button"
              onClick={() => changeNote(-1)}
              aria-label="Previous note"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span aria-label={`Note ${note + 1} of ${notes.length}`}>
              {String(note + 1).padStart(2, "0")} <span>/ 04</span>
            </span>
            <button
              className="liquid-control liquid-light circle-control"
              type="button"
              onClick={() => changeNote(1)}
              aria-label="Next note"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
      <section id="contact" className="contact-section" aria-labelledby="contact-heading">
        <div className="content-width">
          <p className="section-label">Something in mind?</p>
          <h2 id="contact-heading">
            Let’s build
            <br />
            what’s next.
          </h2>
          <p className="contact-intro">A business opportunity. A partnership. A good idea.</p>
          <div className="contact-options">
            <article>
              <h3>For investors &amp; partners.</h3>
              <p>Let’s talk business opportunities, partnerships and the next venture.</p>
              <a
                className="text-link"
                href={`mailto:${site.email}?subject=${encodeURIComponent("Investment & partnership — Wai8")}`}
              >
                Let’s connect <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
            <article>
              <h3>For builders &amp; collaborators.</h3>
              <p>Have a business idea, brand or growth opportunity? Let’s explore it.</p>
              <a
                className="text-link"
                href={`mailto:${site.email}?subject=${encodeURIComponent("Business & growth — Wai8")}`}
              >
                Let’s talk growth <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
          </div>
          <div className="direct-contact">
            <p>Or reach out directly.</p>
            <div className="email-row">
              <a className="email-address" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <button
                type="button"
                className="liquid-control copy-control"
                onClick={copyEmail}
                aria-label={copyState === "copied" ? "Email copied" : "Copy email"}
              >
                {copyState === "copied" ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
                <span>{copyState === "copied" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="copy-status" role="status">
              {copyState === "failed"
                ? "Copy unavailable. Select the address, or tap it to open your mail app."
                : copyState === "copied"
                  ? "Email copied to clipboard."
                  : ""}
            </p>
          </div>
        </div>
      </section>
      <footer className="site-footer light-section">
        <div className="content-width footer-inner">
          <span>
            Mishal Hameed <span aria-hidden="true">/</span> Wai8
          </span>
          <div>
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={12} aria-hidden="true" />
            </a>
            <a href="#content">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
