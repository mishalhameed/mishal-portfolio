export type SystemNode = {
  id: string;
  label: string;
  detail: string;
  position: [number, number, number];
};

/** The process path follows a shallow arc through near and far planes. */
export const buildSteps: SystemNode[] = [
  {
    id: "problem",
    label: "Understand",
    detail: "Find the actual bottleneck before choosing technology.",
    position: [-1, 0.04, -0.95],
  },
  {
    id: "idea",
    label: "Map",
    detail: "Turn the business process into a clear workflow.",
    position: [-0.5, -0.06, 0.25],
  },
  {
    id: "system",
    label: "Build",
    detail: "Implement the workflow with tools, APIs and AI models.",
    position: [0, 0.06, -0.55],
  },
  {
    id: "product",
    label: "Integrate",
    detail: "Connect the system to the tools the business already uses.",
    position: [0.5, -0.06, 0.3],
  },
  {
    id: "user",
    label: "Improve",
    detail: "Measure what happens and refine the workflow.",
    position: [1, 0.04, -1.05],
  },
];

/** Same diagram, updated labels. Not a client deployment. */
export const labSteps: SystemNode[] = [
  {
    id: "miss",
    label: "Problem",
    detail: "Start with a real problem.",
    position: [-2.35, 0.7, 0],
  },
  {
    id: "detect",
    label: "Real work",
    detail: "Name the repeated task before naming a tool.",
    position: [-1.35, -0.35, 0.35],
  },
  {
    id: "reply",
    label: "System",
    detail: "Build the simplest useful system.",
    position: [-0.25, 0.55, -0.15],
  },
  {
    id: "qualify",
    label: "Simplest",
    detail: "Leave out anything that does not serve the task.",
    position: [0.85, -0.25, 0.25],
  },
  {
    id: "book",
    label: "Measure",
    detail: "Measure the result, not the activity.",
    position: [1.75, 0.65, -0.05],
  },
  {
    id: "crm",
    label: "Outcome",
    detail: "A useful outcome is the point of the system.",
    position: [2.55, -0.15, 0.2],
  },
];

/** Same diagram, updated labels. Not a claim of infrastructure. */
export const aiSteps: SystemNode[] = [
  {
    id: "input",
    label: "Idea",
    detail: "The concept, before the build.",
    position: [-2.2, 0.15, 0.2],
  },
  {
    id: "model",
    label: "Concept",
    detail: "What it is, said plainly.",
    position: [-1.15, 0.7, -0.1],
  },
  {
    id: "tools",
    label: "Prototype",
    detail: "A version that can be tried.",
    position: [-0.1, -0.45, 0.3],
  },
  {
    id: "memory",
    label: "Working",
    detail: "Something that runs, not only a description.",
    position: [1.0, 0.45, -0.2],
  },
  {
    id: "workflow",
    label: "Product",
    detail: "Move from the prototype toward a product.",
    position: [1.9, -0.2, 0.15],
  },
  {
    id: "output",
    label: "Use",
    detail: "Something people can actually use.",
    position: [2.7, 0.55, 0],
  },
];
