import { useEffect, useRef, type RefObject } from "react";

const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Animate only in response to input; CSS owns the ambient loops. */
export function useCinematicMotion(page: RefObject<HTMLElement | null>, disabled: boolean) {
  const entered = useRef(false);

  useEffect(() => {
    const root = page.current;
    if (!root || disabled) return;
    const hero = root.querySelector<HTMLElement>(".cinematic-hero")!;
    const artwork = root.querySelector<HTMLElement>(".hero-media")!;
    const stage = root.querySelector<HTMLElement>(".hero-stage")!;
    const next = root.querySelector<HTMLElement>(".hero-next")!;
    const chapter = root.querySelector<HTMLElement>(".hero-chapter-track b")!;
    const copy = root.querySelector<HTMLElement>(".hero-copy")!;
    const progress = root.querySelector<HTMLElement>(".reading-progress")!;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const animations = new Set<Animation>();
    const reveals = new Map<Element, Animation>();
    let frame = 0;
    let heroVisible = true;
    let heroTop = 0;
    let heroHeight = 1;
    let navHeight = 80;
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
        if (reveals.get(element) === animation) reveals.delete(element);
        animation.cancel();
      };
      return animation;
    };

    const measure = () => {
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      heroHeight = Math.max(1, hero.offsetHeight - stage.offsetHeight);
      navHeight = root.querySelector<HTMLElement>(".local-navigation")?.offsetHeight || 80;
      scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      schedule();
    };
    const render = () => {
      frame = 0;
      const scroll = window.scrollY;
      progress.style.transform = `scaleX(${clamp(scroll / scrollRange)})`;
      if (heroVisible) {
        const travel = clamp((scroll - heroTop + navHeight) / heroHeight);
        const second = clamp((travel - 0.32) / 0.34);
        artwork.style.transform = `translate3d(${x * 14}px, ${y * 10 - travel * 26}px, 0) scale(${1.03 + travel * 0.28}) rotate(${-travel * 3}deg)`;
        copy.style.transform = `translate3d(0, ${-travel * 120}px, 0)`;
        copy.style.opacity = String(1 - clamp(travel / 0.4));
        copy.inert = travel > 0.4;
        next.style.transform = `translate3d(0, ${(1 - second) * 80}px, 0)`;
        next.style.opacity = String(second);
        chapter.style.transform = `scaleX(${travel})`;
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
    }

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
      copy.inert = false;
      next.style.removeProperty("transform");
      next.style.removeProperty("opacity");
      chapter.style.removeProperty("transform");
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
}
