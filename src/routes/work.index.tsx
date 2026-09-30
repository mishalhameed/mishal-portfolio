import { createFileRoute, Link } from "@tanstack/react-router";
import { projects } from "@/data/projects";
import { canonical, site } from "@/data/site";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Selected systems & projects — Mishal Hameed" },
      {
        name: "description",
        content:
          "Practical automation workflows and independent software experiments by Mishal Hameed, AI Automation & Software Builder.",
      },
      ...(site.url ? [{ property: "og:url", content: `${site.url}/work` }] : []),
    ],
    links: canonical("/work"),
  }),
  component: WorkIndex,
});

function WorkIndex() {
  const systems = projects.filter((project) => project.group === "system");
  const experiments = projects.filter((project) => project.group === "experiment");
  return (
    <main className="shell pt-28 pb-24">
      <p className="kicker">Selected systems</p>
      <h1 className="type-section mt-4">
        Practical automation,
        <br />
        built around real work.
      </h1>
      <p className="measure mt-6 text-lg text-muted">
        Workflow systems and independent product experiments. Each project shows its current status
        and the process it explores.
      </p>
      <ProjectGroup title="Automation systems" projects={systems} />
      <ProjectGroup title="Experiments & products" projects={experiments} />
    </main>
  );
}

function ProjectGroup({ title, projects: group }: { title: string; projects: typeof projects }) {
  return (
    <section className="mt-16">
      <h2 className="kicker">{title}</h2>
      <ol className="mt-6 flex flex-col">
        {group.map((project, index) => (
          <li key={project.slug} className="border-t border-line">
            <Link
              to="/work/$slug"
              params={{ slug: project.slug }}
              className="group flex flex-col gap-3 py-8 md:flex-row md:items-end md:justify-between"
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
    </section>
  );
}
