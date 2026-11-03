import { useCallback, useEffect, useRef, type RefObject } from "react";

const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Animate only in response to input; CSS owns the ambient loops. */
export function useCinematicMotion(page: RefObject<HTMLElement | null>, disabled: boolean) {
  const entered = useRef(false);
  const playWave = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = page.current;
    if (!root || disabled) return;
    const hero = root.querySelector<HTMLElement>(".cinematic-hero")!;
    const artwork = root.querySelector<HTMLElement>(".disc-visual")!;
    const copy = root.querySelector<HTMLElement>(".hero-copy")!;
    const progress = root.querySelector<HTMLElement>(".reading-progress")!;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const animations = new Set<Animation>();
    const reveals = new Map<Element, Animation>();
    const waves = new Set<Animation>();
    let frame = 0;
    let heroVisible = true;
    let heroTop = 0;
    let heroHeight = 1;
    let scrollRange = 1;
    let x = 0;
    let y = 0;
    let magnet: HTMLElement | null = null;
    let magnetRect: DOMRect | null = null;
    let magnetX = 0;
    let magnetY = 0;

    const animate = (
      element: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const animation = element.animate(keyframes, { easing: ease, fill: "both", ...options });
      animations.add(animation);
      if (document.hidden) animation.pause();
      animation.onfinish = () => {
        animations.delete(animation);
        waves.delete(animation);
        if (reveals.get(element) === animation) reveals.delete(element);
        animation.cancel();
      };
      return animation;
    };

    const measure = () => {
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      heroHeight = hero.offsetHeight;
      scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      schedule();
    };
    const render = () => {
      frame = 0;
      const scroll = window.scrollY;
      progress.style.transform = `scaleX(${clamp(scroll / scrollRange)})`;
      if (heroVisible) {
        const travel = clamp((scroll - heroTop) / heroHeight);
        artwork.style.transform = `perspective(1100px) translate3d(${x * 20}px, ${-travel * 82 + y * 10}px, 0) rotateX(${-y * 7}deg) rotateY(${x * 5}deg) rotateZ(${-travel * 5 + x * 1.5}deg) scale(${1 + travel * 0.23})`;
        copy.style.transform = `translate3d(0, ${-travel * 62}px, 0)`;
        copy.style.opacity = String(1 - travel * 0.72);
      }
      if (magnet) {
        magnet.style.setProperty("--magnet-x", `${magnetX * 7}px`);
        magnet.style.setProperty("--magnet-y", `${magnetY * 5}px`);
      }
    };
    function schedule() {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(render);
    }
    const clearMagnet = () => {
      magnet?.style.removeProperty("--magnet-x");
      magnet?.style.removeProperty("--magnet-y");
      magnet = null;
      magnetRect = null;
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      if (heroVisible && hero.contains(event.target as Node)) {
        x = clamp(event.clientX / window.innerWidth - 0.5, -0.5, 0.5) * 2;
        y = clamp(event.clientY / window.innerHeight - 0.5, -0.5, 0.5) * 2;
      }
      if (magnet && magnetRect) {
        magnetX = clamp((event.clientX - magnetRect.left) / magnetRect.width - 0.5, -0.5, 0.5) * 2;
        magnetY = clamp((event.clientY - magnetRect.top) / magnetRect.height - 0.5, -0.5, 0.5) * 2;
      }
      if (heroVisible || magnet) schedule();
    };
    const over = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      const target = (event.target as Element).closest<HTMLElement>(
        ".liquid-control:not(:disabled)",
      );
      if (target === magnet) return;
      clearMagnet();
      if (target) {
        magnet = target;
        magnetRect = target.getBoundingClientRect();
      }
    };
    const reset = () => {
      x = 0;
      y = 0;
      clearMagnet();
      schedule();
    };
    const leaveHero = () => {
      x = 0;
      y = 0;
      schedule();
    };
    const visibility = () => {
      root.classList.toggle("motion-hidden", document.hidden);
      for (const animation of animations) {
        if (document.hidden) animation.pause();
        else animation.play();
      }
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };

    const sceneObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("motion-offscreen", !entry.isIntersecting);
          if (entry.target === hero) {
            heroVisible = entry.isIntersecting;
            artwork.classList.toggle("motion-offscreen", !heroVisible);
            if (heroVisible) schedule();
          }
        }
      },
      { rootMargin: "60px" },
    );
    root
      .querySelectorAll("[data-motion-scene]")
      .forEach((element) => sceneObserver.observe(element));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          revealObserver.unobserve(element);
          element.classList.remove("reveal-pending");
          element.dataset.revealed = "true";
          const animation = animate(
            element,
            [
              { opacity: 0, transform: "translate3d(0, 48px, 0)" },
              { opacity: 1, transform: "translate3d(0, 0, 0)" },
            ],
            { duration: 1000, delay: Number(element.dataset.reveal || 0) },
          );
          reveals.set(element, animation);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (element.dataset.revealed) return;
      element.classList.add("reveal-pending");
      revealObserver.observe(element);
    });
    // Keyboard navigation must never land on concealed content.
    const focus = (event: FocusEvent) => {
      const element = (event.target as Element).closest<HTMLElement>("[data-reveal]");
      if (!element) return;
      element.classList.remove("reveal-pending");
      element.dataset.revealed = "true";
      revealObserver.unobserve(element);
      const animation = reveals.get(element);
      if (animation) {
        animation.cancel();
        animations.delete(animation);
        reveals.delete(element);
      }
    };

    if (!entered.current && window.scrollY < hero.offsetHeight / 2) {
      entered.current = true;
      root.querySelectorAll<HTMLElement>("[data-enter]").forEach((element) => {
        const isLine = element.classList.contains("title-line-inner");
        animate(
          element,
          [
            {
              opacity: isLine ? 1 : 0,
              transform: `translate3d(0, ${isLine ? "115%" : "26px"}, 0)`,
            },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          { duration: isLine ? 1200 : 950, delay: Number(element.dataset.enter) },
        );
      });
      animate(
        root.querySelector(".disc-arrival")!,
        [
          { opacity: 0, transform: "translate3d(0, 95px, 0) rotate(-7deg) scale(0.78)" },
          { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
        ],
        { duration: 1700, delay: 160 },
      );
    }

    playWave.current = () => {
      if (document.hidden) return;
      // Repeated taps restart three existing layers instead of accumulating particles.
      for (const animation of waves) {
        animation.cancel();
        animations.delete(animation);
      }
      waves.clear();
      root.querySelectorAll(".disc-wave").forEach((element, index) => {
        waves.add(
          animate(
            element,
            [
              { opacity: 0, transform: "translate3d(-50%, -50%, 0) scale(0.42)" },
              { opacity: 0.75, offset: 0.18 },
              { opacity: 0, transform: "translate3d(-50%, -76%, 0) scale(1.48)" },
            ],
            { duration: 1800, delay: index * 180, easing: "cubic-bezier(0.2, 0.65, 0.25, 1)" },
          ),
        );
      });
      waves.add(
        animate(
          root.querySelector(".disc-arrival")!,
          [
            { transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
            { transform: "translate3d(0, -16px, 0) rotate(-2deg) scale(1.035)", offset: 0.3 },
            { transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
          ],
          { duration: 1400 },
        ),
      );
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);
    root.classList.add("motion-enhanced");
    measure();
    visibility();
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerover", over, { passive: true });
    root.addEventListener("pointerleave", reset);
    root.addEventListener("focusin", focus);
    hero.addEventListener("pointerleave", leaveHero);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    finePointer.addEventListener("change", reset);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      playWave.current = null;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      sceneObserver.disconnect();
      revealObserver.disconnect();
      for (const animation of animations) animation.cancel();
      clearMagnet();
      root.classList.remove("motion-enhanced", "motion-hidden");
      root.querySelectorAll(".reveal-pending, .motion-offscreen").forEach((element) => {
        element.classList.remove("reveal-pending", "motion-offscreen");
      });
      artwork.style.removeProperty("transform");
      copy.style.removeProperty("transform");
      copy.style.removeProperty("opacity");
      progress.style.removeProperty("transform");
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", reset);
      root.removeEventListener("focusin", focus);
      hero.removeEventListener("pointerleave", leaveHero);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      finePointer.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [page, disabled]);

  return useCallback(() => playWave.current?.(), []);
}
