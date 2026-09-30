import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CanvasSlot } from "@/components/3d/slot";
import type { SceneName } from "@/components/3d/stage";
import { getNextProject, type Project } from "@/data/projects";
import { track } from "@/lib/analytics";

const still = { current: 0.45 };

function sceneFor(slug: string): SceneName {
  if (slug === "learnlk") return "learn";
  if (slug === "rewired") return "book";
  if (slug === "ai-automation") return "system";
  return "lab";
}

export function CaseStudy({ project }: { project: Project }) {
  const next = getNextProject(project.slug);

  useEffect(() => {
    track("case_study_view", { project: project.slug });
  }, [project.slug]);

  return (
    <main>
      <article className="shell pt-28 pb-24">
        <Link to="/work" className="kicker hover:text-fg">
          All work
        </Link>
        <p className="kicker mt-8">{project.category}</p>
        <h1 className="type-section mt-4">{project.title}</h1>
        <p className="measure mt-6 text-lg text-muted">{project.overview}</p>
        <p className="mt-4 text-sm text-accent">STATUS · {project.status}</p>
        <div className="case-study-visual">
          <CanvasSlot
            scene={sceneFor(project.slug)}
            progressRef={still}
            className="case-study-canvas"
          />
        </div>

        <Section title="Problem" text={project.problem} />
        <Section title="System" text={project.solution} />

        <div className="mt-16">
          <h2 className="kicker">Workflow</h2>
          <ol className="mt-6 flex flex-col">
            {project.system.map((part, index) => (
              <li key={part.label} className="grid gap-3 border-t border-line py-5 md:grid-cols-12">
                <span className="nums text-accent md:col-span-2">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-10">
                  <h3 className="text-xl">{part.label}</h3>
                  <p className="mt-2 text-muted">{part.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16">
          <h2 className="kicker">Features</h2>
          <ul className="mt-6 grid gap-8 md:grid-cols-2">
            {project.features.map((feature) => (
              <li key={feature.title}>
                <h3 className="text-xl">{feature.title}</h3>
                <p className="mt-2 text-muted">{feature.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        {project.technologies.length > 0 ? (
          <div className="mt-16">
            <h2 className="kicker">Technology</h2>
            <p className="mt-4 text-lg">{project.technologies.join(" · ")}</p>
            <p className="mt-3 max-w-xl text-muted">{project.technologyNote}</p>
            <ul className="mt-6 flex flex-col gap-2">
              {project.architecture.map((item) => (
                <li key={item} className="border-t border-line py-3 text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Split title="Challenges" items={project.challenges} />
        <div className="mt-16">
          <h2 className="kicker">Current status</h2>
          <p className="mt-4 font-serif text-4xl">{project.status}</p>
          <p className="mt-3 text-muted">{project.statusNote}</p>
          {project.links.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {project.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Split title="Lessons" items={project.lessons} />
      </article>
      {next ? (
        <div className="border-t border-line">
          <div className="shell py-16">
            <p className="kicker">Next</p>
            <Link
              to="/work/$slug"
              params={{ slug: next.slug }}
              data-cursor="view"
              className="arrow-link mt-4 inline-flex items-center gap-3"
            >
              <span className="type-section">{next.title}</span>
              <ArrowUpRight className="arrow size-6" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="kicker">{title}</h2>
      <p className="mt-4 text-2xl leading-snug">{text}</p>
    </section>
  );
}

function Split({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-16">
      <h2 className="kicker">{title}</h2>
      <ul className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="max-w-2xl border-t border-line pt-4 text-lg">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
