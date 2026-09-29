import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "h1";
}) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.classList.contains("reduce")) {
      setOn(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={className}>
      {text.split(" ").map((word, index) => (
        <span className={on ? "word on" : "word"} key={`${word}-${index}`}>
          <span style={{ transitionDelay: `${Math.min(index, 16) * 45}ms` }}>{word}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Kicker({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="kicker flex items-center gap-3">
      {index ? <span className="text-accent">{index}</span> : null}
      <span>{children}</span>
    </p>
  );
}

export function Magnet({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const inside = Math.abs(x) < rect.width && Math.abs(y) < rect.height * 1.4;
      el.style.transform = inside ? `translate3d(${x * 0.18}px, ${y * 0.25}px, 0)` : "";
    };
    const leave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className={className} data-cursor="magnet">
      {children}
    </div>
  );
}

export function TextButton({
  children,
  href,
  hash,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  hash?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const className =
    "inline-flex min-h-11 items-center gap-3 border border-line px-5 py-3 text-xs tracking-[0.18em] uppercase text-fg transition-colors hover:border-accent focus-visible:border-accent disabled:opacity-50";

  if (hash) {
    return (
      <a href={`/#${hash}`} className={className} data-cursor="magnet">
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <a href={href} className={className} data-cursor="magnet">
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled} data-cursor="magnet">
      {children}
    </button>
  );
}
