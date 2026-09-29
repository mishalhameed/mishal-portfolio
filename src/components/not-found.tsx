import { Link } from "@tanstack/react-router";
import { CanvasSlot } from "@/components/3d/slot";

const progress = { current: 0.55 };

export function NotFound() {
  return (
    <main className="shell flex min-h-[80vh] flex-col justify-center py-28">
      <p className="kicker">404</p>
      <h1 className="type-section mt-4 max-w-3xl">This page doesn't exist.</h1>
      <p className="mt-5 max-w-md text-muted">The link may be wrong, or the page was never here.</p>
      <CanvasSlot scene="core" variant="system" progressRef={progress} className="mt-10 h-72 w-full max-w-xl" />
      <Link to="/" className="mt-8 inline-flex min-h-11 items-center text-xs tracking-[0.18em] uppercase">
        Back home
      </Link>
    </main>
  );
}
