import { Link } from "@tanstack/react-router";
export function NotFound() {
  return (
    <main id="content" className="missing-page">
      <p>404 / UNRECORDED</p>
      <h1>This side is blank.</h1>
      <Link to="/">Back to Wai8 ↗</Link>
    </main>
  );
}
