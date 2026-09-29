import { createFileRoute, Link } from "@tanstack/react-router";
import { projects } from "@/data/projects";
import { canonical } from "@/data/site";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Selected work — Mishal Hameed" },
      {
        name: "description",
        content: "Selected work by Mishal Hameed: LearnLK, AI Workforce, REWIRED, and AI Automation Systems. Status is stated plainly. No client or revenue claims.",
      },
    ],
    links: canonical("/work"),
  }),
  component: WorkIndex,
});

function WorkIndex() {
  return (
    <main className="shell pt-28 pb-24">
      <p className="kicker">Selected work</p>
      <h1 className="type-section mt-4">The studies.</h1>
      <ol className="mt-14 flex flex-col">
        {projects.map((project, index) => (
          <li key={project.slug} className="border-t border-line">
            <Link
              to="/work/$slug"
              params={{ slug: project.slug }}
              className="group flex flex-col gap-3 py-8 md:flex-row md:items-end md:justify-between"
              data-cursor="view"
            >
              <span className="nums text-sm text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-serif text-5xl md:flex-1">{project.title}</span>
              <span className="text-sm text-muted md:text-right">
                {project.category}
                <br />
                {project.status}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
