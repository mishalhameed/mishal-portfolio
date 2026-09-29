import { createFileRoute, notFound } from "@tanstack/react-router";
import { CaseStudy } from "@/components/case-study";
import { getProject } from "@/data/projects";
import { canonical } from "@/data/site";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    return {
      meta: [
        { title: project ? `${project.title} — Mishal Hameed` : "Work — Mishal Hameed" },
        { name: "description", content: project?.summary ?? "Selected work by Mishal Hameed." },
      ],
      links: project ? canonical(`/work/${project.slug}`) : [],
    };
  },
  component: ProjectRoute,
});

function ProjectRoute() {
  const { project } = Route.useLoaderData();
  return <CaseStudy project={project} />;
}
