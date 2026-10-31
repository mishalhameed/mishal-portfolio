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

export function HomePage() {
  const [side, setSide] = useState<"a" | "b">("a");
  const [track, setTrack] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const sideTabs = useRef<(HTMLButtonElement | null)[]>([]);

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
      className={"waiting-room " + (motionOff ? "motion-paused " : "") + "showing-" + side}
    >
      <div className="chrome-backdrop" aria-hidden="true" />
      <div className="page-shell">
        <header className="room-header">
          <a className="identity" href="#content" aria-label="Mishal Hameed, home">
            <span className="identity-mark">
              msh8lx<span>↗</span>
            </span>
            <span className="identity-name">MISHAL HAMEED</span>
          </a>
          <nav className="header-nav" aria-label="Main navigation">
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
              <i aria-hidden="true" /> BEFORE THE FIRST RELEASE
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
                  Big ambition.
                  <br />
                  <span>Something worth the wait.</span>
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
                  Earn the
                  <br />
                  <em>arrival.</em>
                </h1>
                <p>
                  I’m Mishal. I’m exploring ideas for apps and tools that earn a place in everyday
                  life. The first release is ahead. The standard is set: make something worth coming
                  back for.
                </p>
                <span className="intent-signature">
                  First, do the work. <span>— MH</span>
                </span>
              </div>
              <div className="hero-actions">
                <a className="primary-action" href="#contact">
                  Start a conversation <ArrowDown size={17} aria-hidden="true" />
                </a>
                <span className="hero-note">
                  INDEPENDENT MIND.
                  <br />
                  OPEN FUTURE.
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
                <OpticalDisc side={side} />
                <span className="disc-flip-hint">
                  <Rotate3D size={16} aria-hidden="true" /> Flip the disc
                </span>
              </button>
              <figcaption className="disc-caption">
                <span>
                  DVD–RW <span className="disc-caption-slash">/</span> WAI8
                </span>
                <button
                  className="motion-toggle"
                  onClick={toggleMotion}
                  disabled={reducedMotion}
                  aria-pressed={motionOff}
                  aria-label={
                    reducedMotion
                      ? "Motion off: reduced motion preference"
                      : paused
                        ? "Resume disc motion"
                        : "Pause disc motion"
                  }
                >
                  {motionOff ? (
                    <Play size={13} aria-hidden="true" />
                  ) : (
                    <Pause size={13} aria-hidden="true" />
                  )}
                  {reducedMotion ? "Reduced motion" : paused ? "Motion off" : "Motion on"}
                </button>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="notes-section" aria-label="Notes on ambition">
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

        <section id="contact" className="contact-section" aria-labelledby="contact-heading">
          <div className="contact-heading">
            <span className="section-eyebrow">NEXT / GET IN TOUCH</span>
            <h2 id="contact-heading">
              A good conversation
              <br />
              <span>can start something.</span>
            </h2>
          </div>
          <div className="contact-options">
            <article className="contact-option" aria-labelledby="partners-heading">
              <span className="contact-index">01 / CONNECT</span>
              <h3 id="partners-heading">
                For investors <br />
                &amp; partners
              </h3>
              <p>Looking to invest or collaborate on new ventures?</p>
              <a
                className="contact-button"
                href={`mailto:${site.email}?subject=${encodeURIComponent("Investment & partnership — Wai8")}`}
              >
                Let’s connect <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </article>
            <article className="contact-option" aria-labelledby="builders-heading">
              <span className="contact-index">02 / COLLABORATE</span>
              <h3 id="builders-heading">
                Want to build <br />
                for real?
              </h3>
              <p>Got a real idea? Let’s talk about what comes next.</p>
              <a
                className="contact-button"
                href={`mailto:${site.email}?subject=${encodeURIComponent("Let's build — Wai8")}`}
              >
                Let’s talk <ArrowUpRight size={18} aria-hidden="true" />
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
    </main>
  );
}
