import { useEffect, useRef, type RefObject } from "react";

type Star = { x: number; y: number; depth: number; phase: number; size: number; glint: boolean };
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

    const spark = (x: number, y: number, size: number, opacity: number, glint = false) => {
      context.globalAlpha = opacity;
      context.fillStyle = "#d9edff";
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
      if (!glint) return;
      const halo = context.createRadialGradient(x, y, 0, x, y, size * 9);
      halo.addColorStop(0, "#eafaffb3");
      halo.addColorStop(0.18, "#80b8ff66");
      halo.addColorStop(1, "#597dff00");
      context.fillStyle = halo;
      context.fillRect(x - size * 9, y - size * 9, size * 18, size * 18);
      context.strokeStyle = "#e4f7ff";
      context.lineWidth = 0.6;
      context.beginPath();
      context.moveTo(x - size * 5, y);
      context.lineTo(x + size * 5, y);
      context.moveTo(x, y - size * 5);
      context.lineTo(x, y + size * 5);
      context.stroke();
    };

    const meteor = (time: number, offset: number, fromRight: boolean) => {
      const phase = (time + offset) % 13;
      if (phase > 1.8) return;
      const progress = phase / 1.8;
      const direction = fromRight ? -1 : 1;
      const x = (fromRight ? 0.94 : 0.04) * width + direction * progress * width * 0.48;
      const y = height * (fromRight ? 0.13 : 0.73) + progress * height * 0.18;
      const tail = Math.min(width * 0.22, 175);
      const tx = x - direction * tail;
      const ty = y - tail * 0.4;
      const gradient = context.createLinearGradient(tx, ty, x, y);
      gradient.addColorStop(0, "#4788ff00");
      gradient.addColorStop(0.7, "#80b8ff66");
      gradient.addColorStop(1, "#ecfaff");
      context.globalAlpha = Math.sin(progress * Math.PI) * 0.8;
      context.strokeStyle = gradient;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(tx, ty);
      context.lineTo(x, y);
      context.stroke();
      spark(x, y, 1.2, Math.sin(progress * Math.PI) * 0.8, true);
    };

    const draw = () => {
      const time = clock.current;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      for (const star of stars) {
        const x = star.x * width + Math.sin(time * 0.055 + star.phase) * 9 * star.depth;
        const drift = star.y * height - time * (0.8 + star.depth * 1.5);
        const y = ((drift % height) + height) % height;
        const alpha = 0.35 + (Math.sin(time * 0.65 + star.phase) + 1) * 0.22;
        spark(x, y, star.size, alpha * star.depth, star.glint);
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
              i % 5 === 0 ? 1.5 : 0.9,
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
      stars = Array.from({ length: width < 740 ? 82 : 150 }, (_, index) => ({
        x: random(),
        y: random(),
        depth: 0.45 + random() * 0.55,
        phase: random() * Math.PI * 2,
        size: 0.4 + random() * 1.05,
        glint: index % 11 === 0,
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
