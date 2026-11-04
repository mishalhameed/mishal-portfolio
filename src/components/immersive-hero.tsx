import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, X } from "lucide-react";
import { site } from "@/data/site";

type HeroProps = {
  motionOff: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onToggleMotion: () => void;
};

export function ImmersiveHero({ motionOff, paused, reducedMotion, onToggleMotion }: HeroProps) {
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const [filmOpen, setFilmOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = video.current;
    const viewport = stage.current;
    if (!element || !viewport || motionOff || filmOpen) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;
    const mobile = window.matchMedia("(max-width: 700px)");
    let visible = false;
    const update = () => {
      if (visible && !document.hidden)
        void element.play().catch(() => {
          /* The poster remains available. */
        });
      else element.pause();
    };
    const source = () => {
      if (!visible) return;
      const desired = mobile.matches ? "/films/wai8-orbit-mobile.mp4" : "/films/wai8-orbit.mp4";
      if (element.getAttribute("src") !== desired) {
        element.src = desired;
        element.load();
      }
      update();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // Assign the source only when this scene is visible.
        if (visible) source();
        else update();
      },
      { threshold: 0.01 },
    );
    observer.observe(viewport);
    mobile.addEventListener("change", source);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", source);
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [motionOff, filmOpen]);

  useEffect(() => {
    const element = dialog.current;
    if (!element || !filmOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const player = film.current;
    element.showModal();
    document.body.style.overflow = "hidden";
    if (!motionOff) void player?.play().catch(() => {});
    return () => {
      player?.pause();
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [filmOpen, motionOff]);

  return (
    <section
      id="overview"
      className="cinematic-hero immersive-hero"
      data-motion-scene
      aria-labelledby="hero-heading"
    >
      <div className="hero-stage" ref={stage}>
        <div className={`hero-media${ready ? " film-ready" : ""}`} aria-hidden="true">
          <picture>
            <source media="(max-width: 700px)" srcSet="/films/wai8-orbit-mobile-poster.jpg" />
            <img
              src="/films/wai8-orbit-poster.jpg"
              alt=""
              width="1440"
              height="1080"
              fetchPriority="high"
            />
          </picture>
          <video
            ref={video}
            className="ambient-film"
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            onLoadedData={() => setReady(true)}
            onError={() => setReady(false)}
          />
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-topline scene-width">
          <span>
            {site.name}
            <span className="hero-topline-divider">/</span>Wai8
          </span>
          <span className="film-index">
            <i /> In motion — 01
          </span>
        </div>
        <div className="hero-copy scene-width">
          <p className="hero-name" data-enter="0">
            Ideas are only the beginning.
          </p>
          <h1 id="hero-heading">
            <span className="title-line">
              <span className="title-line-inner" data-enter="100">
                Build what’s
              </span>
            </span>{" "}
            <span className="title-line">
              <span className="title-line-inner" data-enter="240">
                next<span className="hero-period">.</span>
              </span>
            </span>
          </h1>
          <div className="hero-bottom-copy" data-enter="400">
            <a href="#intent" className="hero-explore">
              Explore the intent <ArrowUpRight size={20} aria-hidden="true" />
            </a>
            <p className="hero-description">
              Businesses. Brands.
              <br />
              Long-term value.
            </p>
          </div>
        </div>
        <div className="hero-next scene-width" aria-hidden="true">
          <span className="hero-next-label">A wider perspective.</span>
          <p>
            Think bigger.
            <br />
            <span>Build further.</span>
          </p>
        </div>
        <div className="hero-bottomline scene-width">
          <a className="scroll-prompt" href="#intent">
            <ArrowDown size={14} aria-hidden="true" /> Scroll to explore
          </a>
          <div className="hero-film-controls">
            <a
              className="film-open liquid-control"
              href="/films/wai8-orbit.mp4"
              aria-haspopup="dialog"
              onClick={(event) => {
                event.preventDefault();
                setFilmOpen(true);
              }}
            >
              <Play size={13} fill="currentColor" aria-hidden="true" /> Watch the film
            </a>
            <button
              className="liquid-control motion-control"
              type="button"
              onClick={onToggleMotion}
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
                <Play size={15} aria-hidden="true" />
              ) : (
                <Pause size={15} aria-hidden="true" />
              )}
              <span>{reducedMotion ? "Reduced motion" : paused ? "Motion off" : "Motion on"}</span>
            </button>
          </div>
        </div>
        <div className="hero-chapter-track" aria-hidden="true">
          <span />
          <span />
          <b />
        </div>
      </div>
      <dialog
        className="film-dialog"
        ref={dialog}
        onCancel={() => setFilmOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setFilmOpen(false);
        }}
        aria-labelledby="film-title"
      >
        {filmOpen && (
          <div className="film-dialog-shell">
            <div className="film-dialog-header">
              <div>
                <p id="film-title">Wai8. In motion.</p>
                <span>An original motion study · 12 seconds · Silent film</span>
              </div>
              <button
                type="button"
                className="liquid-control film-close"
                onClick={() => setFilmOpen(false)}
                aria-label="Close film"
                autoFocus
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <video
              ref={film}
              src="/films/wai8-orbit.mp4"
              poster="/films/wai8-orbit-poster.jpg"
              controls
              playsInline
              loop
              muted
              preload="auto"
              aria-label="Wai8 motion film: chrome and blue orbital forms rotating in space"
            />
          </div>
        )}
      </dialog>
    </section>
  );
}
