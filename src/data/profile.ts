export const capabilities = [
  {
    number: "01",
    title: "AI lead automation",
    text: "Capture, qualify, route and follow up with leads automatically.",
  },
  {
    number: "02",
    title: "Missed-call recovery",
    text: "Respond to missed calls, qualify the lead and move them toward booking.",
  },
  {
    number: "03",
    title: "AI customer support",
    text: "Answer repetitive questions and route complex conversations to people.",
  },
  {
    number: "04",
    title: "Appointment automation",
    text: "Automate booking, confirmations, reminders and follow-ups.",
  },
  {
    number: "05",
    title: "CRM & workflow automation",
    text: "Connect forms, CRMs, email, calendars, messaging and internal systems.",
  },
  {
    number: "06",
    title: "Internal AI assistants",
    text: "Help teams search information, process documents and complete repetitive tasks.",
  },
] as const;

export const principles = [
  { title: "Practical", text: "Solve the business problem before adding AI." },
  { title: "Fast", text: "Prototype a workflow, then improve it through use." },
  { title: "Integrated", text: "Connect automation to the tools a team already uses." },
  { title: "Transparent", text: "Keep systems understandable and describe results honestly." },
] as const;

export const toolGroups = [
  { category: "AI", items: ["ChatGPT", "Grok", "Ollama"] },
  { category: "Automation", items: ["n8n", "APIs", "Webhooks"] },
  { category: "Software", items: ["React", "TypeScript", "TanStack Start", "Three.js"] },
  { category: "Data", items: ["PGlite", "SQL"] },
  { category: "Infrastructure", items: ["Vercel", "GitHub", "Vite"] },
] as const;

export const tools = toolGroups.flatMap((group) =>
  group.items.map((label, index) => {
    const related = group.items.filter((_, relatedIndex) => relatedIndex !== index);
    return {
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      related: related.map((item) => item.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    };
  }),
);

export const processSteps = [
  {
    number: "01",
    title: "Understand",
    text: "Find the actual bottleneck before choosing technology.",
  },
  { number: "02", title: "Map", text: "Turn the business process into a clear workflow." },
  {
    number: "03",
    title: "Build",
    text: "Implement the automation with tools, APIs and AI models.",
  },
  {
    number: "04",
    title: "Integrate",
    text: "Connect the system to the tools the business already uses.",
  },
  { number: "05", title: "Improve", text: "Measure what happens and refine the workflow." },
] as const;
