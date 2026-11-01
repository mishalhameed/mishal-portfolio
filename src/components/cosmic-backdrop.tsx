import { useEffect, useRef, type RefObject } from "react";

type Star = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  size: number;
  glint: boolean;
  period: number;
};
type Burst = { x: number; y: number; radius: number; born: number };

/** Decorative, local-only graphics. No animation work runs while paused or hidden. */
export function CosmicBackdrop({
  paused,
  side,
  anchor,
}: {
  paused: boolean;
  side: "a" | "b";
  anchor: RefObject<HTMLButtonElement | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0);
  const requestBurst = useRef(false);
  const previousSide = useRef(side);

  useEffect(() => {
    if (previousSide.current !== side) {
      requestBurst.current = !paused;
      previousSide.current = side;
    }
  }, [side, paused]);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d", { alpha: true });
    if (!surface || !context) return;
    const still = paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let burst: Burst | null = null;
    let frame = 0;
    let last = 0;

    // Paint the glow once; reuse the sprite instead of allocating a gradient per star/frame.
    const flare = document.createElement("canvas");
    flare.width = flare.height = 128;
    const flareContext = flare.getContext("2d");
    if (flareContext) {
      const halo = flareContext.createRadialGradient(64, 64, 0, 64, 64, 64);
      halo.addColorStop(0, "#ffffff");
      halo.addColorStop(0.05, "#edfcff");
      halo.addColorStop(0.14, "#b3ddffb3");
      halo.addColorStop(0.35, "#619cff40");
      halo.addColorStop(1, "#416fff00");
      flareContext.fillStyle = halo;
      flareContext.fillRect(0, 0, 128, 128);
      for (let ray = 0; ray < 8; ray++) {
        flareContext.save();
        flareContext.translate(64, 64);
        flareContext.rotate((ray * Math.PI) / 4);
        const length = ray % 2 === 0 ? 56 : 24;
        const beam = flareContext.createLinearGradient(0, 0, length, 0);
        beam.addColorStop(0, "#ffffff");
        beam.addColorStop(0.22, "#d8efffcc");
        beam.addColorStop(1, "#a2cdff00");
        flareContext.fillStyle = beam;
        flareContext.beginPath();
        flareContext.moveTo(0, -1.8);
        flareContext.lineTo(length, 0);
        flareContext.lineTo(0, 1.8);
        flareContext.fill();
        flareContext.restore();
      }
    }

    const spark = (x: number, y: number, size: number, opacity: number, glint = false) => {
      context.globalAlpha = opacity;
      if (glint && flareContext) {
        const radius = size * 14;
        context.drawImage(flare, x - radius, y - radius, radius * 2, radius * 2);
      }
      context.fillStyle = glint ? "#f4fcff" : "#d9edff";
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    };

    const meteor = (time: number, offset: number, fromRight: boolean) => {
      const phase = (time + offset) % 10.5;
      if (phase > 2.1) return;
      const progress = phase / 2.1;
      const direction = fromRight ? -1 : 1;
      const x = (fromRight ? 0.94 : 0.04) * width + direction * progress * width * 0.48;
      const y = height * (fromRight ? 0.13 : 0.73) + progress * height * 0.18;
      const tail = Math.min(width * 0.26, 225);
      const tx = x - direction * tail;
      const ty = y - tail * 0.4;
      const gradient = context.createLinearGradient(tx, ty, x, y);
      gradient.addColorStop(0, "#4788ff00");
      gradient.addColorStop(0.7, "#80b8ff66");
      gradient.addColorStop(1, "#ecfaff");
      const fade = Math.sin(progress * Math.PI);
      context.globalAlpha = fade * 0.22;
      context.strokeStyle = gradient;
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(tx, ty);
      context.lineTo(x, y);
      context.stroke();
      context.globalAlpha = fade * 0.95;
      context.strokeStyle = gradient;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(tx, ty);
      context.lineTo(x, y);
      context.stroke();
      spark(x, y, 1.6, fade, true);
    };

    const draw = () => {
      const time = clock.current;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      for (const star of stars) {
        const x = star.x * width + Math.sin(time * 0.085 + star.phase) * 13 * star.depth;
        const drift = star.y * height - time * (1 + star.depth * 2);
        const y = ((drift % height) + height) % height;
        // Each star has a different phase and a 3.8–7 second loop: a bright crest,
        // soft afterglow, then a quiet interval instead of synchronized blinking.
        const wave = (Math.sin((time * Math.PI * 2) / star.period + star.phase) + 1) / 2;
        const flash = Math.pow(wave, star.glint ? 9 : 4);
        const alpha = star.glint ? 0.22 + flash * 0.78 : 0.24 + flash * 0.56;
        const size = star.size * (star.glint ? 0.75 + flash * 1.05 : 0.9 + flash * 0.25);
        spark(x, y, size, alpha * (0.65 + star.depth * 0.35), star.glint);
      }
      if (!still) {
        meteor(time, 8, true);
        meteor(time, 1.5, false);
      }
      if (requestBurst.current && !still) {
        requestBurst.current = false;
        const rect = anchor.current?.getBoundingClientRect();
        if (rect && rect.bottom > 0 && rect.top < height) {
          burst = {
            x: rect.x + rect.width / 2 + 20,
            y: rect.y + rect.height / 2 + 20,
            radius: rect.width / 2,
            born: time,
          };
        }
      }
      if (burst) {
        const age = time - burst.born;
        if (age > 1.8) burst = null;
        else {
          const count = width < 740 ? 28 : 44;
          const fade = Math.pow(1 - age / 1.8, 2);
          for (let i = 0; i < count; i++) {
            const angle = i * 2.39996 + age * 0.25;
            const distance = burst.radius + age * (32 + (i % 7) * 12);
            spark(
              burst.x + Math.cos(angle) * distance,
              burst.y + Math.sin(angle) * distance,
              i % 5 === 0 ? 2 : 1,
              fade,
              i % 5 === 0,
            );
          }
          context.globalAlpha = fade * 0.4;
          context.strokeStyle = "#95c8ff";
          context.lineWidth = 0.8;
          context.beginPath();
          context.arc(burst.x, burst.y, burst.radius + age * 85, 0, Math.PI * 2);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    };

    const resize = () => {
      width = window.innerWidth + 40;
      height = window.innerHeight + 40;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      // A stable seed preserves the constellation when pausing/resizing.
      let seed = 8317;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      stars = Array.from({ length: width < 740 ? 96 : 180 }, (_, index) => ({
        x: random(),
        y: random(),
        depth: 0.45 + random() * 0.55,
        phase: random() * Math.PI * 2,
        size: 0.55 + random() * 1.1,
        glint: index % 6 === 0,
        period: 3.8 + random() * 3.2,
      }));
      draw();
    };

    const tick = (now: number) => {
      if (document.hidden || still) {
        frame = 0;
        return;
      }
      if (!last) last = now;
      if (now - last >= 1000 / 30) {
        clock.current += Math.min((now - last) / 1000, 0.1);
        last = now;
        draw();
      }
      frame = window.requestAnimationFrame(tick);
    };
    const visibility = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (!document.hidden && !still) frame = window.requestAnimationFrame(tick);
    };
    if (still) requestBurst.current = false;
    resize();
    visibility();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [paused, anchor]);

  return (
    <div className="cosmic-atmosphere" aria-hidden="true">
      <div className="celestial-haze" />
      <div className="aurora-ribbon" />
      <canvas
        ref={canvas}
        className="starlight-canvas"
        data-motion={paused ? "paused" : "active"}
      />
    </div>
  );
}
