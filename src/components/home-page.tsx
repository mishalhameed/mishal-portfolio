import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Pause,
  Play,
  SkipBack,
  SkipForward,
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
      <div className="disc-orbit orbit-one" />
      <div className="disc-orbit orbit-two" />
      <div className="optical-disc">
        <div className="disc-foil" />
        <div className="disc-grooves" />
        <div className="disc-label">
          <span className="disc-label-top">THE FUTURE IS UNWRITTEN</span>
          <span className="disc-label-bottom">MSH8LX / VOL. 000 / WAI8</span>
          <span className="disc-dvd">
            DVD<span>REWRITABLE</span>
          </span>
          <span className="disc-side">SIDE {side.toUpperCase()}</span>
        </div>
        <div className="disc-hub" />
      </div>
      <div className="disc-shadow" />
    </div>
  );
}

export function HomePage() {
  const [side, setSide] = useState<"a" | "b">("a");
  const [track, setTrack] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const motionOff = paused || reducedMotion;
  const current = tracks[track];
  const changeTrack = (direction: number) =>
    setTrack((value) => (value + direction + tracks.length) % tracks.length);

  return (
    <main
      id="content"
      className={"waiting-room " + (motionOff ? "motion-paused " : "") + "showing-" + side}
    >
      <div className="room-texture" aria-hidden="true" />
      <div className="room-glow" aria-hidden="true" />
      <header className="room-header">
        <a className="identity" href="/" aria-label="Mishal Hameed, home">
          <span className="identity-mark">
            msh8lx<span>↗</span>
          </span>
          <span className="identity-name">MISHAL HAMEED</span>
        </a>
        <span className="release-status">
          <i aria-hidden="true" /> BEFORE THE FIRST RELEASE
        </span>
        <a className="hello-link" href={"mailto:" + site.email}>
          Say hello <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>
      <div className="room-topline">
        <span>INDEPENDENT MIND. OPEN FUTURE.</span>
        <span className="edition">
          VOLUME 000 <span>/</span> THE BEGINNING
        </span>
      </div>
      <section className="record-stage" aria-label={side === "a" ? "The wait" : "The intent"}>
        <div className="disc-art">
          <OpticalDisc side={side} />
        </div>
        <div className="side-a-content" hidden={side !== "a"}>
          <h1 className="wai8-title" aria-label="Wai8. Wait.">
            <span aria-hidden="true" className="wai-letters">
              Wai
            </span>
            <EightMark />
          </h1>
          <div className="beginning-copy">
            <span className="small-cross" aria-hidden="true">
              +
            </span>
            <p>
              Big ambition.
              <br />
              <span>The first release is still ahead.</span>
            </p>
          </div>
        </div>
        <div className="side-b-content" hidden={side !== "b"}>
          <p className="intent-eyebrow">
            SIDE B <span>/</span> A NOTE TO THE FUTURE
          </p>
          <h1>
            Earn the
            <br />
            <em>arrival.</em>
          </h1>
          <p className="intent-copy">
            I’m Mishal. This is the beginning. I’m exploring ideas for apps and tools that earn a
            place in everyday life. The first release is ahead. The standard is already set: make
            something worth coming back for.
          </p>
          <p className="intent-signature">
            First, do the work. <span>— MH</span>
          </p>
        </div>
        <div className="disc-caption" aria-hidden="true">
          <span className="caption-line" />
          <div>
            DVD-RW <span>001</span>
            <small>ROOM FOR WHAT COMES NEXT.</small>
          </div>
        </div>
        <span className="stage-index" aria-hidden="true">
          {side === "a" ? "A" : "B"} / 00
        </span>
      </section>
      <div className="room-actions">
        <button
          className="flip-button"
          onClick={() => setSide(side === "a" ? "b" : "a")}
          aria-label={
            side === "a" ? "Flip to side B: read the intent" : "Flip to side A: back to the wait"
          }
        >
          <span className="flip-icon">
            <ArrowDownLeft size={20} aria-hidden="true" />
          </span>
          <span>
            {side === "a" ? "Flip the disc" : "Back to the wait"}
            <small>
              {side === "a" ? "THERE’S AN INTENT BEHIND THE WAIT." : "EVERYTHING STARTS SOMEWHERE."}
            </small>
          </span>
        </button>
        <div className="side-switch" aria-label="Choose a side">
          <button onClick={() => setSide("a")} aria-pressed={side === "a"}>
            <span>01</span> THE WAIT
          </button>
          <span className="side-divider" aria-hidden="true" />
          <button onClick={() => setSide("b")} aria-pressed={side === "b"}>
            <span>02</span> THE INTENT
          </button>
        </div>
      </div>
      <section className="track-player" aria-label="Notes on ambition">
        <div className="track-meta">
          <span className="track-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <div>
            ON REPEAT<small>ORIGINAL NOTES / {String(track + 1).padStart(2, "0")}</small>
          </div>
        </div>
        <div className="track-copy" aria-live="polite" aria-atomic="true">
          <p key={track}>{current.quote}</p>
          <span>{current.title}</span>
        </div>
        <div className="track-controls">
          <button onClick={() => changeTrack(-1)} aria-label="Previous note">
            <SkipBack size={17} aria-hidden="true" />
          </button>
          <span className="track-number">
            {String(track + 1).padStart(2, "0")}
            <span> / {String(tracks.length).padStart(2, "0")}</span>
          </span>
          <button onClick={() => changeTrack(1)} aria-label="Next note">
            <SkipForward size={17} aria-hidden="true" />
          </button>
        </div>
      </section>
      <footer className="room-footer">
        <span>A SPACE FOR WHAT’S NEXT.</span>
        <button
          className="motion-toggle"
          onClick={() => setPaused((value) => !value)}
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
            <Play size={11} aria-hidden="true" />
          ) : (
            <Pause size={11} aria-hidden="true" />
          )}
          {reducedMotion ? "REDUCED MOTION" : paused ? "MOTION OFF" : "MOTION ON"}
        </button>
        <a href={site.github} target="_blank" rel="noreferrer">
          GITHUB <ArrowRight size={12} aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
