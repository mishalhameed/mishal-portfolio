import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Rotate3D,
  Copy,
  Check,
  Disc3,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { site } from "@/data/site";

const tracks = [
  { title: "The ambition", quote: "Make something worth waiting for." },
  { title: "The standard", quote: "Let the work make the introduction." },
  { title: "The discipline", quote: "Earn the future. One move at a time." },
  { title: "The beginning", quote: "Start at zero. Think beyond it." },
];

function EightMark() {
  return (
    <svg className="eight-mark" viewBox="0 0 250 570" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="eight-silver"
          x1="40"
          y1="20"
          x2="210"
          y2="550"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#a8bff8" />
          <stop offset="0.52" stopColor="#ffffff" />
          <stop offset="0.76" stopColor="#c6d7ff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path
        d="M113 20C57 7 25 40 28 108C30 173 74 222 131 276C187 330 231 384 224 455C217 521 173 551 117 547C51 543 14 509 20 441C25 370 83 317 137 262C188 210 218 175 214 111C210 53 173 22 113 20Z"
        stroke="url(#eight-silver)"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OpticalDisc({ side }: { side: "a" | "b" }) {
  return (
    <div className={"disc-perspective side-" + side} aria-hidden="true">
      <div className="optical-disc">
        <img
          src="/images/wai8-blue-disc.webp"
          alt=""
          width="1254"
          height="1254"
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}

function MotionControl({
  paused,
  reducedMotion,
  onToggle,
}: {
  paused: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
}) {
  const off = paused || reducedMotion;
  return (
    <button
      className="motion-toggle"
      onClick={onToggle}
      disabled={reducedMotion}
      aria-pressed={off}
      aria-label={
        reducedMotion
          ? "Motion off: reduced motion preference"
          : paused
            ? "Resume all motion"
            : "Pause all motion"
      }
    >
      {off ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      <span>{reducedMotion ? "Reduced motion" : paused ? "Motion off" : "Motion on"}</span>
    </button>
  );
}

export function HomePage() {
  const [side, setSide] = useState<"a" | "b">("a");
  const [track, setTrack] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [contactVisible, setContactVisible] = useState(false);
  const sideTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const room = useRef<HTMLElement>(null);
  const contact = useRef<HTMLElement>(null);

  useEffect(() => {
    const readSide = () => {
      if (window.location.hash === "#intent") setSide("b");
      if (window.location.hash === "#content") setSide("a");
    };
    readSide();
    window.addEventListener("hashchange", readSide);
    return () => window.removeEventListener("hashchange", readSide);
  }, []);

  useEffect(() => {
    if (!contact.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setContactVisible(entry.isIntersecting),
      {
        rootMargin: "-15% 0px -35% 0px",
      },
    );
    observer.observe(contact.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    try {
      setPaused(localStorage.getItem("wai8-motion") === "paused");
    } catch {
      /* Storage is optional. */
    }
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 3500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const motionOff = paused || reducedMotion;
  useEffect(() => {
    const element = room.current;
    if (!element || motionOff) return;
    const finePointer = window.matchMedia(
      "(min-width: 701px) and (hover: hover) and (pointer: fine)",
    );
    let frame = 0;
    let x = 0;
    let y = 0;
    const render = () => {
      frame = 0;
      element.style.setProperty("--tilt-x", `${-y * 7}deg`);
      element.style.setProperty("--tilt-y", `${x * 9}deg`);
      element.style.setProperty("--light-x", `${50 + x * 30}%`);
      element.style.setProperty("--light-y", `${35 + y * 25}%`);
      element.style.setProperty("--scroll-shift", `${Math.min(window.scrollY * 0.08, 110)}px`);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      x = (event.clientX / window.innerWidth - 0.5) * 2;
      y = (event.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    };
    const reset = () => {
      x = 0;
      y = 0;
      schedule();
    };
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    if (finePointer.matches) window.addEventListener("scroll", schedule, { passive: true });
    schedule();

    // Content stays visible without JavaScript, or when motion is disabled.
    const revealElements = element.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    revealElements.forEach((item) => {
      if (window.innerWidth > 700 && item.getBoundingClientRect().top > window.innerHeight) {
        item.classList.add("reveal-pending");
        observer.observe(item);
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
      revealElements.forEach((item) => item.classList.remove("reveal-pending"));
      ["--tilt-x", "--tilt-y", "--light-x", "--light-y", "--scroll-shift"].forEach((key) =>
        element.style.removeProperty(key),
      );
    };
  }, [motionOff]);

  const current = tracks[track];
  const flip = () => setSide((value) => (value === "a" ? "b" : "a"));
  const changeTrack = (direction: number) =>
    setTrack((value) => (value + direction + tracks.length) % tracks.length);
  const toggleMotion = () => {
    const next = !paused;
    setPaused(next);
    try {
      localStorage.setItem("wai8-motion", next ? "paused" : "playing");
    } catch {
      /* The control still works without storage. */
    }
  };
  const handleSideKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "a" : event.key === "End" ? "b" : side === "a" ? "b" : "a";
    setSide(next);
    sideTabs.current[next === "a" ? 0 : 1]?.focus();
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

  return (
    <main
      id="content"
      ref={room}
      className={"waiting-room " + (motionOff ? "motion-paused " : "") + "showing-" + side}
    >
      <div className="chrome-backdrop" aria-hidden="true">
        <div className="chrome-sculpture" />
        <div className="chrome-light" />
        <div className="edge-radiance" />
        <svg className="edge-light-loop" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect
            className="edge-loop-glow"
            x="0.4"
            y="0.4"
            width="99.2"
            height="99.2"
            rx="2"
            pathLength="100"
          />
          <rect
            className="edge-loop-core"
            x="0.4"
            y="0.4"
            width="99.2"
            height="99.2"
            rx="2"
            pathLength="100"
          />
        </svg>
        <div className="ambient-glow" />
        <div className="light-trails">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="page-shell">
        <header className="room-header">
          <a
            className="identity"
            href="#content"
            onClick={() => setSide("a")}
            aria-label="Mishal Hameed, home"
          >
            <span className="identity-mark">
              msh8lx
              <span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </span>
            <span className="identity-name">MISHAL HAMEED</span>
          </a>
          <nav className="header-nav" aria-label="Main navigation">
            <div className="mobile-motion">
              <MotionControl
                paused={paused}
                reducedMotion={reducedMotion}
                onToggle={toggleMotion}
              />
            </div>
            <a className="intent-link" href="#intent" onClick={() => setSide("b")}>
              The intent
            </a>
            <a className="header-contact" href="#contact">
              Get in touch <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </nav>
        </header>

        <section id="intent" className="hero-region" aria-label="Wai8 — the beginning">
          <div className="room-topline">
            <span className="release-status">
              <i aria-hidden="true" />{" "}
              <span className="release-desktop">BUSINESSES. BRANDS. WHAT’S NEXT.</span>
              <span className="release-mobile">BUILDING WHAT COMES NEXT</span>
            </span>
            <span>
              VOL. 000 <span className="topline-slash">/</span> THE BEGINNING
            </span>
          </div>
          <div className="record-stage">
            <div className="hero-content">
              <div className="side-tabs" role="tablist" aria-label="Explore Wai8">
                <button
                  id="side-a-tab"
                  role="tab"
                  ref={(el) => {
                    sideTabs.current[0] = el;
                  }}
                  aria-controls="side-a-panel"
                  aria-selected={side === "a"}
                  tabIndex={side === "a" ? 0 : -1}
                  onKeyDown={handleSideKey}
                  onClick={() => setSide("a")}
                >
                  <span>01</span> The wait
                </button>
                <button
                  id="side-b-tab"
                  role="tab"
                  ref={(el) => {
                    sideTabs.current[1] = el;
                  }}
                  aria-controls="side-b-panel"
                  aria-selected={side === "b"}
                  tabIndex={side === "b" ? 0 : -1}
                  onKeyDown={handleSideKey}
                  onClick={() => setSide("b")}
                >
                  <span>02</span> The intent
                </button>
              </div>
              <div
                id="side-a-panel"
                className="hero-panel"
                role="tabpanel"
                aria-labelledby="side-a-tab"
                tabIndex={0}
                hidden={side !== "a"}
              >
                <h1 className="wai8-title" aria-label="Wai8. Wait.">
                  <span className="wai-letters" aria-hidden="true">
                    Wai
                  </span>
                  <EightMark />
                </h1>
                <p className="hero-statement">
                  I build &amp; scale businesses.
                  <br />
                  <span>Ideas. Brands. Long-term value.</span>
                </p>
              </div>
              <div
                id="side-b-panel"
                className="hero-panel intent-panel"
                role="tabpanel"
                aria-labelledby="side-b-tab"
                tabIndex={0}
                hidden={side !== "b"}
              >
                <h1>
                  Build with
                  <br />
                  <em>ambition.</em>
                </h1>
                <p>
                  I’m Mishal. I build and scale businesses. My focus is on finding opportunities,
                  shaping brands, creating products and growing lasting value. Apps and technology
                  are part of that wider ambition.
                </p>
                <span className="intent-signature">
                  Build with intent. Think at scale. <span>— MH</span>
                </span>
              </div>
              <div className="hero-actions">
                <a className="primary-action" href="#contact">
                  Start a conversation <ArrowDown size={17} aria-hidden="true" />
                </a>
                <span className="hero-note">
                  ENTREPRENEURIAL MIND.
                  <br />
                  LONG-TERM VISION.
                </span>
              </div>
            </div>
            <figure className="disc-stage">
              <div className="disc-stage-top">
                <span>THE FUTURE IS UNWRITTEN</span>
                <span className="disc-side-label">SIDE {side.toUpperCase()}</span>
              </div>
              <button
                className="disc-button"
                onClick={flip}
                aria-label={
                  side === "a" ? "Flip disc to read the intent" : "Flip disc back to the wait"
                }
              >
                <span className="disc-aura" aria-hidden="true" />
                <span className="disc-light-loop" aria-hidden="true" />
                <span className="disc-orbit orbit-one" aria-hidden="true" />
                <span className="disc-orbit orbit-two" aria-hidden="true" />
                <span className="disc-glint glint-one" aria-hidden="true" />
                <span className="disc-glint glint-two" aria-hidden="true" />
                <span className="disc-pulse" key={side} aria-hidden="true" />
                <div className="disc-float">
                  <div className="disc-tilt">
                    <OpticalDisc side={side} />
                  </div>
                </div>
                <span className="disc-flip-hint">
                  <Rotate3D size={16} aria-hidden="true" />{" "}
                  <span className="flip-desktop">Flip the disc</span>
                  <span className="flip-mobile">
                    {side === "a" ? "Tap to explore" : "Back to the wait"}
                  </span>
                </span>
              </button>
              <figcaption className="disc-caption">
                <span>
                  DVD–RW <span className="disc-caption-slash">/</span> WAI8
                </span>
                <MotionControl
                  paused={paused}
                  reducedMotion={reducedMotion}
                  onToggle={toggleMotion}
                />
              </figcaption>
            </figure>
          </div>
          <a className="mobile-scroll-cue" href="#notes">
            A note to build by <ArrowDown size={14} aria-hidden="true" />
          </a>
        </section>

        <section id="notes" className="notes-section" aria-label="Notes on ambition" data-reveal>
          <div className="notes-label">
            <span className="section-eyebrow">ON REPEAT</span>
            <span>Notes to build by.</span>
          </div>
          <div className="note-content" aria-live="polite" aria-atomic="true">
            <p key={track}>“{current.quote}”</p>
            <span>{current.title}</span>
          </div>
          <div className="note-controls">
            <button onClick={() => changeTrack(-1)} aria-label="Previous note">
              <ChevronLeft size={19} aria-hidden="true" />
            </button>
            <span>
              {String(track + 1).padStart(2, "0")} <span>/ 04</span>
            </span>
            <button onClick={() => changeTrack(1)} aria-label="Next note">
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section
          id="contact"
          ref={contact}
          className="contact-section"
          aria-labelledby="contact-heading"
        >
          <div className="contact-heading" data-reveal>
            <span className="section-eyebrow">NEXT / GET IN TOUCH</span>
            <h2 id="contact-heading">
              Let’s build
              <br />
              <span>and grow.</span>
            </h2>
          </div>
          <div className="contact-options">
            <article className="contact-option" aria-labelledby="partners-heading" data-reveal>
              <span className="contact-index">01 / CONNECT</span>
              <h3 id="partners-heading">
                For investors <br />
                &amp; partners
              </h3>
              <p>Let’s talk business opportunities, partnerships and the next venture.</p>
              <a
                className="contact-button"
                href={`mailto:${site.email}?subject=${encodeURIComponent("Investment & partnership — Wai8")}`}
              >
                Let’s connect <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </article>
            <article className="contact-option" aria-labelledby="builders-heading" data-reveal>
              <span className="contact-index">02 / COLLABORATE</span>
              <h3 id="builders-heading">
                Ready to build <br />
                &amp; grow?
              </h3>
              <p>Have a business idea, brand or growth opportunity? Let’s explore it.</p>
              <a
                className="contact-button"
                href={`mailto:${site.email}?subject=${encodeURIComponent("Business & growth — Wai8")}`}
              >
                Let’s talk growth <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </article>
          </div>
          <div className="direct-email">
            <div>
              <span>Prefer a direct email?</span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
            <button className="copy-email" onClick={copyEmail}>
              {copyState === "copied" ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
              {copyState === "copied" ? "Copied" : "Copy email"}
            </button>
            <p className="copy-status" role="status">
              {copyState === "failed"
                ? "Copy unavailable. You can select the email address or tap it to open your mail app."
                : copyState === "copied"
                  ? "Email copied to clipboard."
                  : ""}
            </p>
          </div>
        </section>
        <footer className="room-footer">
          <span>
            MISHAL HAMEED <span>/</span> A SPACE FOR WHAT’S NEXT.
          </span>
          <a href={site.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href="#content" className="back-top">
            Back to top <ArrowRight size={14} aria-hidden="true" />
          </a>
        </footer>
      </div>
      <nav className="mobile-dock" aria-label="Quick navigation">
        <a
          href="#content"
          onClick={() => setSide("a")}
          aria-current={!contactVisible && side === "a" ? "page" : undefined}
        >
          <Disc3 size={18} aria-hidden="true" /> <span>The wait</span>
        </a>
        <a
          href="#intent"
          onClick={() => setSide("b")}
          aria-current={!contactVisible && side === "b" ? "page" : undefined}
        >
          <Sparkles size={18} aria-hidden="true" /> <span>The intent</span>
        </a>
        <a
          className="dock-contact"
          href="#contact-heading"
          aria-current={contactVisible ? "location" : undefined}
        >
          <MessageCircle size={18} aria-hidden="true" /> <span>Contact</span>
        </a>
      </nav>
    </main>
  );
}
