import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CanvasSlot } from "@/components/3d/slot";
import { Kicker, Reveal, ScrollReveal } from "@/components/ui";
import { capabilities, principles, processSteps, toolGroups, tools } from "@/data/profile";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { submitContact } from "@/lib/contact.functions";
import { track } from "@/lib/analytics";
import { useProgress } from "@/lib/use-progress";

const featuredSystems = projects.filter((project) => project.group === "system");
const experiments = projects.filter((project) => project.group === "experiment");

export function HomePage() {
  const heroProgress = useProgress<HTMLElement>(false);
  const processProgress = useProgress<HTMLElement>(false);
  const [formState, setFormState] = useState<
    "idle" | "sending" | "sent" | "unconfigured" | "error"
  >("idle");
  const [formError, setFormError] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setFormState("sending");
    setFormError("");
    try {
      const result = await submitContact({
        data: {
          name: String(values.get("name") ?? ""),
          email: String(values.get("email") ?? ""),
          organization: String(values.get("organization") ?? ""),
          website: String(values.get("website") ?? ""),
          building: String(values.get("building") ?? ""),
          message: String(values.get("message") ?? ""),
          budget: String(values.get("budget") ?? ""),
          company_url: String(values.get("company_url") ?? ""),
          startedAt: Number(values.get("startedAt")),
        },
      });
      if (result.ok) {
        setFormState("sent");
        track("contact_submit");
        form.reset();
      } else if (result.code === "UNCONFIGURED") {
        setFormState("unconfigured");
      } else {
        setFormState("error");
        setFormError(
          result.code === "INVALID"
            ? "Please check the required fields and try again."
            : "The message could not be delivered. Please email me directly.",
        );
      }
    } catch {
      setFormState("error");
      setFormError("The message could not be delivered. Please email me directly.");
    }
  }

  return (
    <main>
      <section
        id="top"
        ref={heroProgress.ref}
        className="hero-section"
        aria-labelledby="hero-title"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.name,
              jobTitle: site.positioning,
              description: site.description,
              url: site.url,
              email: site.email,
              sameAs: [site.github],
            }),
          }}
        />
        <div className="hero-art" aria-hidden="true">
          <CanvasSlot
            scene="core"
            variant="system"
            progressRef={heroProgress.progressRef}
            priority
            className="hero-canvas"
          />
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="shell hero-content">
          <Kicker>
            Mishal Hameed <span className="kicker-dot">·</span> Independent builder
          </Kicker>
          <h1 id="hero-title" className="hero-title">
            AI automation
            <br />
            <span>&amp; software builder</span>
          </h1>
          <p className="hero-copy">
            I build practical AI automation systems that eliminate repetitive work, capture missed
            opportunities, and help businesses operate more efficiently.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="#contact"
              onClick={() => track("contact_start")}
            >
              Work with me <ArrowUpRight aria-hidden="true" size={16} />
            </a>
            <a className="button button-secondary" href="#systems">
              Explore my systems <ArrowDown aria-hidden="true" size={15} />
            </a>
          </div>
          <p className="hero-tagline">An idea, held still. Then a system.</p>
        </div>
        <span className="hero-index" aria-hidden="true">
          01 / 06
        </span>
      </section>

      <section className="intro-section section-pad" aria-labelledby="intro-title">
        <div className="shell intro-grid">
          <Kicker>Problem → System → Outcome</Kicker>
          <div>
            <Reveal
              as="h2"
              text="I don’t start with AI. I start with the problem."
              className="display-heading"
            />
            <p id="intro-title" className="intro-copy">
              I look for repetitive work, missed opportunities and inefficient workflows first. Then
              I design the simplest system that can reliably improve them.
            </p>
          </div>
        </div>
        <div className="shell principle-strip">
          <span>Automate what repeats.</span>
          <span>Integrate what already works.</span>
          <span>Measure what changes.</span>
          <span>Keep humans in control.</span>
        </div>
      </section>

      <section
        id="capabilities"
        className="capabilities-section section-pad"
        aria-labelledby="capabilities-title"
      >
        <div className="shell section-heading-row">
          <div>
            <Kicker>What I build</Kicker>
            <h2 id="capabilities-title" className="section-title">
              Useful systems for real work.
            </h2>
          </div>
          <p className="section-aside">
            Practical automations shaped around the way a business already operates.
          </p>
        </div>
        <ol className="shell capability-grid">
          {capabilities.map((item) => (
            <ScrollReveal
              as="li"
              key={item.number}
              className="capability-item"
              delay={Number(item.number) * 35}
            >
              <span className="number">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <span className="capability-mark" aria-hidden="true">
                ↗
              </span>
            </ScrollReveal>
          ))}
        </ol>
      </section>

      <section id="systems" className="systems-section section-pad" aria-labelledby="systems-title">
        <div className="shell section-heading-row systems-heading">
          <div>
            <Kicker>Selected systems</Kicker>
            <h2 id="systems-title" className="section-title">
              Workflows with a job to do.
            </h2>
          </div>
          <p className="section-aside">
            Practical automation systems and software experiments. Each status tells you where the
            work stands.
          </p>
        </div>
        <div className="shell system-list">
          {featuredSystems.map((project, index) => (
            <ScrollReveal
              as="article"
              className="system-card"
              key={project.slug}
              delay={index * 70}
            >
              <div className="system-card-top">
                <span className="number">0{index + 1}</span>
                <span className="status-label">
                  <i aria-hidden="true" />
                  {project.status}
                </span>
              </div>
              <div className="system-card-main">
                <div className="system-title-area">
                  <p className="kicker">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
                <div className="workflow-block">
                  <span className="workflow-label">Workflow</span>
                  <ol className="workflow" aria-label={`${project.title} workflow`}>
                    {project.workflow.map((step, stepIndex) => (
                      <li key={step}>
                        <span className="workflow-step">{step}</span>
                        {stepIndex < project.workflow.length - 1 ? (
                          <span className="workflow-arrow" aria-hidden="true">
                            →
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                  <Link className="text-link" to="/work/$slug" params={{ slug: project.slug }}>
                    View workflow <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="systems-note section-pad" aria-labelledby="systems-note-title">
        <div className="shell workflow-visual">
          <div className="workflow-copy">
            <Kicker>From friction to function</Kicker>
            <h2 id="systems-note-title" className="section-title">
              Problem.
              <br />
              Workflow.
              <br />
              Automation.
              <br />
              <span>Outcome.</span>
            </h2>
            <p>
              Make the work clearer, connect the steps, and check whether the system made a
              difference.
            </p>
          </div>
          <div className="workflow-art">
            <CanvasSlot scene="lab" variant="system" className="workflow-canvas" />
            <div className="flow-steps" aria-label="Problem to outcome">
              <span>Problem</span>
              <i aria-hidden="true" />
              <span>Workflow</span>
              <i aria-hidden="true" />
              <span>Automation</span>
              <i aria-hidden="true" />
              <span>Outcome</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="work"
        className="experiments-section section-pad"
        aria-labelledby="experiments-title"
      >
        <div className="shell section-heading-row">
          <div>
            <Kicker>Independent work</Kicker>
            <h2 id="experiments-title" className="section-title">
              Experiments &amp; products.
            </h2>
          </div>
          <p className="section-aside">
            Separate explorations, each with its current status stated plainly.
          </p>
        </div>
        <div className="shell experiment-grid">
          {experiments.map((project, index) => (
            <ScrollReveal
              as="article"
              className="experiment-card"
              key={project.slug}
              delay={index * 75}
            >
              <div className="experiment-meta">
                <span className="number">0{index + 1}</span>
                <span>{project.status}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <Link to="/work/$slug" params={{ slug: project.slug }} className="text-link">
                Explore project <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <div className="shell all-work">
          <Link to="/work" className="text-link">
            View all systems and projects <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        id="process"
        ref={processProgress.ref}
        className="process-section section-pad"
        aria-labelledby="process-title"
      >
        <div className="shell process-heading">
          <Kicker>How I work</Kicker>
          <h2 id="process-title" className="section-title">
            A useful system starts
            <br />
            with a useful question.
          </h2>
          <p>
            Understand the process before choosing the tools. Build around the work. Improve from
            what happens.
          </p>
        </div>
        <div className="shell process-layout">
          <div className="process-visual">
            <CanvasSlot
              scene="path"
              variant="system"
              progressRef={processProgress.progressRef}
              className="process-canvas"
            />
            <span className="process-caption">Understand · Map · Build · Integrate · Improve</span>
          </div>
          <ol className="process-list">
            {processSteps.map((step) => (
              <ScrollReveal as="li" key={step.number} delay={Number(step.number) * 55}>
                <span className="number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="principles-section section-pad" aria-labelledby="principles-title">
        <div className="shell section-heading-row">
          <div>
            <Kicker>Why work with me</Kicker>
            <h2 id="principles-title" className="section-title">
              Clear work. Honest claims.
            </h2>
          </div>
          <p className="section-aside">
            An independent builder focused on systems people can understand and use.
          </p>
        </div>
        <ul className="shell principles-grid">
          {principles.map((item, index) => (
            <ScrollReveal as="li" key={item.title} delay={index * 65}>
              <span className="number">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </ScrollReveal>
          ))}
        </ul>
      </section>

      <section className="tools-section section-pad" aria-labelledby="tools-title">
        <div className="shell tools-layout">
          <div>
            <Kicker>Tools I work with</Kicker>
            <h2 id="tools-title" className="section-title">
              Tools in service
              <br />
              of the workflow.
            </h2>
            <p>
              A working set from my projects and current build setup. Select a tool to see its
              connections.
            </p>
            <div className="tool-scene">
              <CanvasSlot
                scene="constellation"
                variant="system"
                selected={selectedTool}
                onSelect={setSelectedTool}
                className="tool-canvas"
              />
            </div>
            <p className="tool-selection" aria-live="polite">
              {tools.find((tool) => tool.id === selectedTool)?.label ??
                "Select a tool. Related tools light up."}
            </p>
          </div>
          <div className="tool-groups">
            {toolGroups.map((group, index) => (
              <ScrollReveal as="div" className="tool-group" key={group.category} delay={index * 55}>
                <h3>{group.category}</h3>
                <ul>
                  {group.items.map((label) => {
                    const tool = tools.find((entry) => entry.label === label);
                    return (
                      <li key={label}>
                        <button
                          type="button"
                          className={
                            tool?.id === selectedTool ? "tool-button selected" : "tool-button"
                          }
                          aria-pressed={tool?.id === selectedTool}
                          onClick={() => setSelectedTool(tool?.id ?? null)}
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section section-pad" aria-labelledby="about-title">
        <div className="shell about-layout">
          <div>
            <Kicker>About</Kicker>
            <h2 id="about-title" className="section-title">
              Independent by design.
            </h2>
          </div>
          <div className="about-copy">
            <ScrollReveal as="p" delay={80}>
              I’m an independent builder focused on AI automation, software and digital systems.
            </ScrollReveal>
            <ScrollReveal as="p" delay={145}>
              I take repetitive or inefficient processes, break them into workflows, and turn them
              into practical systems using AI, APIs and automation.
            </ScrollReveal>
            <div className="about-signoff">
              <span>Find the problem.</span>
              <span>Design the system.</span>
              <span>Build it.</span>
              <span>Measure what changes.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section section-pad" aria-labelledby="contact-title">
        <div className="shell contact-layout">
          <div className="contact-copy">
            <Kicker>Start a conversation</Kicker>
            <h2 id="contact-title" className="contact-title">
              Have a process
              <br />
              worth automating?
            </h2>
            <p>
              Tell me what currently takes too much time, requires too much manual work, or causes
              missed opportunities. I’ll help identify where automation can actually make sense.
            </p>
            <a
              className="contact-email"
              href={`mailto:${site.email}`}
              onClick={() => track("email_click")}
            >
              {site.email} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="text-link contact-github"
              href={site.github}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("github_click")}
            >
              GitHub <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
          <form
            className="contact-form"
            onSubmit={handleSubmit}
            onFocus={() => track("contact_start")}
          >
            <div className="form-row">
              <label>
                Name
                <input
                  className="field"
                  name="name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>
              <label>
                Email
                <input
                  className="field"
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={160}
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Company / project <span>(optional)</span>
                <input
                  className="field"
                  name="organization"
                  autoComplete="organization"
                  maxLength={120}
                />
              </label>
              <label>
                Website <span>(optional)</span>
                <input
                  className="field"
                  type="url"
                  name="website"
                  placeholder="https://"
                  maxLength={200}
                />
              </label>
            </div>
            <label>
              What would you like to automate?
              <input className="field" name="building" minLength={3} maxLength={200} required />
            </label>
            <label>
              How does the process work today?
              <textarea
                className="field field-textarea"
                name="message"
                rows={3}
                minLength={10}
                maxLength={4000}
                required
              />
            </label>
            <label>
              Budget <span>(optional)</span>
              <input className="field" name="budget" maxLength={80} />
            </label>
            <label className="honeypot" aria-hidden="true">
              Company URL
              <input tabIndex={-1} autoComplete="off" name="company_url" />
            </label>
            <input type="hidden" name="startedAt" value={Date.now()} />
            <button
              className="button button-primary form-submit"
              type="submit"
              disabled={formState === "sending"}
            >
              {formState === "sending" ? "Sending…" : "Start a conversation"}
              <ArrowUpRight aria-hidden="true" size={16} />
            </button>
            <div aria-live="polite" className="form-feedback">
              {formState === "sent" ? (
                <p className="success-message">Your message was sent. I’ll be in touch.</p>
              ) : null}
              {formState === "unconfigured" ? (
                <p>
                  The contact form isn’t connected to delivery yet. Please{" "}
                  <a href={`mailto:${site.email}`}>email me directly</a>.
                </p>
              ) : null}
              {formState === "error" ? (
                <p role="alert">
                  {formError} <a href={`mailto:${site.email}`}>Email me directly.</a>
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
