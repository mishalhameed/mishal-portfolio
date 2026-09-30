export type Project = {
  slug: string;
  title: string;
  category: string;
  group: "system" | "experiment";
  status: string;
  statusNote: string;
  summary: string;
  overview: string;
  problem: string;
  solution: string;
  system: { label: string; detail: string }[];
  workflow: string[];
  features: { title: string; detail: string }[];
  technologies: string[];
  technologyNote: string;
  architecture: string[];
  challenges: string[];
  lessons: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "ai-missed-call-recovery",
    title: "AI Missed-Call Recovery",
    category: "Lead operations",
    group: "system",
    status: "Building / demo",
    statusNote: "Independent workflow demo in progress.",
    summary:
      "A workflow concept for responding to missed calls and carrying a conversation toward a booked appointment.",
    overview:
      "A missed call can be the start of a useful conversation. This workflow explores how to respond quickly and keep the next step clear.",
    problem:
      "Businesses can lose potential customers when a call goes unanswered and nobody follows up promptly.",
    solution:
      "A proposed follow-up flow that starts after a missed call, gathers the essentials and guides a lead toward booking.",
    system: [
      { label: "Missed call", detail: "A call goes unanswered and starts the follow-up workflow." },
      {
        label: "Instant message",
        detail: "Send a timely message that acknowledges the missed call.",
      },
      { label: "AI conversation", detail: "Ask focused questions and collect the lead's needs." },
      {
        label: "Qualification",
        detail: "Organize the details before passing the conversation along.",
      },
      { label: "Booking & CRM", detail: "Offer an appointment and record the lead details." },
    ],
    workflow: ["Missed call", "Instant message", "AI conversation", "Qualify", "Booking + CRM"],
    features: [
      { title: "Fast response", detail: "Give an unanswered caller a clear next step." },
      {
        title: "Useful handoff",
        detail: "Keep the collected context with the appointment or team follow-up.",
      },
    ],
    technologies: [],
    technologyNote:
      "Workflow concept; implementation choices depend on the business's calling, messaging and CRM tools.",
    architecture: [],
    challenges: [
      "Keep the first message helpful and unobtrusive.",
      "Escalate requests that need a person.",
    ],
    lessons: ["The workflow needs to fit the business's real call and booking process."],
    links: [],
  },
  {
    slug: "ai-lead-qualification",
    title: "AI Lead Qualification",
    category: "Lead operations",
    group: "system",
    status: "Building / demo",
    statusNote: "Independent workflow demo in progress.",
    summary: "A workflow concept for sorting incoming leads and routing them with useful context.",
    overview:
      "A structured intake can help a team understand who needs a response and what they need before a person steps in.",
    problem:
      "Manually sorting and responding to every incoming lead takes time and makes consistent follow-up harder.",
    solution:
      "A guided conversation gathers relevant details, produces a simple lead score and routes the result to the right place.",
    system: [
      { label: "New lead", detail: "Receive a lead from a form or another configured source." },
      { label: "AI conversation", detail: "Ask relevant questions and capture answers." },
      { label: "Qualification & score", detail: "Organize the lead against transparent criteria." },
      { label: "Routing", detail: "Send qualified leads to the appropriate next step." },
      { label: "CRM update", detail: "Record the lead and conversation context." },
    ],
    workflow: ["New lead", "Conversation", "Qualify", "Score + route", "CRM"],
    features: [
      { title: "Consistent intake", detail: "Collect the same useful details for each lead." },
      {
        title: "Human review",
        detail: "Keep routing rules clear and allow a person to take over.",
      },
    ],
    technologies: [],
    technologyNote: "Workflow concept; integrations depend on the lead source and CRM in use.",
    architecture: [],
    challenges: [
      "Use criteria the business can explain and update.",
      "Avoid treating a score as a final decision.",
    ],
    lessons: ["Qualification should make a team's next action clearer."],
    links: [],
  },
  {
    slug: "ai-appointment-automation",
    title: "AI Appointment Automation",
    category: "Scheduling",
    group: "system",
    status: "Concept / building",
    statusNote: "Independent system concept.",
    summary:
      "A booking workflow concept connecting lead qualification with availability, reminders and follow-up.",
    overview:
      "A clear appointment flow can reduce the back-and-forth between an interested lead and an available time.",
    problem:
      "Manual scheduling creates repeated coordination and leaves room for missed confirmations or follow-ups.",
    solution:
      "A guided flow checks availability, confirms the booking and sends the next useful reminder or follow-up.",
    system: [
      { label: "Lead", detail: "Start with a request from a prospective customer." },
      { label: "Qualification", detail: "Gather the information needed for the appointment." },
      { label: "Availability", detail: "Offer suitable times from a connected calendar." },
      { label: "Booking", detail: "Confirm the selected appointment." },
      {
        label: "Reminders & follow-up",
        detail: "Send reminders and a relevant follow-up after the appointment.",
      },
    ],
    workflow: ["Lead", "Qualify", "Availability", "Booking", "Reminders + follow-up"],
    features: [
      { title: "Connected scheduling", detail: "Use real availability from the calendar in use." },
      {
        title: "Clear confirmations",
        detail: "Keep appointment details and next steps easy to find.",
      },
    ],
    technologies: [],
    technologyNote:
      "Concept; calendar and messaging integrations would be selected for the business workflow.",
    architecture: [],
    challenges: [
      "Respect real calendar availability.",
      "Handle changes and cancellations clearly.",
    ],
    lessons: ["Good scheduling automation is dependable at the edges, not only on the happy path."],
    links: [],
  },
  {
    slug: "ai-customer-support",
    title: "AI Customer Support",
    category: "Customer operations",
    group: "system",
    status: "Concept / building",
    statusNote: "Independent system concept.",
    summary:
      "A support workflow concept that answers repeated questions and hands off complex requests to a person.",
    overview:
      "A support assistant should use trusted information, answer within its limits and make it easy to reach a human.",
    problem:
      "Teams spend time answering the same questions while customers with unusual requests still need a person.",
    solution:
      "Retrieve an answer from approved knowledge, respond with context and escalate when confidence or policy requires it.",
    system: [
      { label: "Customer question", detail: "Receive a question in the support channel." },
      {
        label: "Knowledge retrieval",
        detail: "Find relevant content in an approved knowledge source.",
      },
      { label: "Answer", detail: "Respond using the retrieved information." },
      { label: "Escalation", detail: "Route uncertain or sensitive cases to a person." },
      { label: "Human handoff", detail: "Pass along the question and conversation context." },
    ],
    workflow: ["Question", "Retrieve", "Answer", "Escalate if needed", "Human handoff"],
    features: [
      {
        title: "Grounded responses",
        detail: "Use the team's approved support material as the source.",
      },
      { title: "Human handoff", detail: "Keep a person in control of complex conversations." },
    ],
    technologies: [],
    technologyNote:
      "Concept; knowledge sources and support channels would be selected for the team.",
    architecture: [],
    challenges: [
      "Keep answers tied to approved information.",
      "Recognize cases that need a human response.",
    ],
    lessons: ["A good support assistant knows when it should not answer."],
    links: [],
  },
  {
    slug: "learnlk",
    title: "LearnLK",
    category: "Education / marketplace / software",
    group: "experiment",
    status: "Concept",
    statusNote: "Independent project.",
    summary:
      "An education marketplace concept connecting students and teachers through lessons and learning resources.",
    overview:
      "A product concept for bringing lessons, live classes, learning resources, assignments and communication into one learning journey.",
    problem:
      "Lessons, classes, resources, assignments and communication can sit in different places for students and teachers.",
    solution:
      "Explore a single marketplace concept where teachers can publish lessons and students can find learning resources.",
    system: [
      { label: "Lessons", detail: "A place for teachers to publish lessons." },
      { label: "Live classes", detail: "Classes connected to the learning experience." },
      { label: "Resources & assignments", detail: "Learning materials kept with the teaching." },
      {
        label: "Communication",
        detail: "Keep student and teacher conversations around the class.",
      },
    ],
    workflow: ["Teacher", "Lessons", "Classes", "Resources", "Student"],
    features: [
      { title: "Learning marketplace", detail: "A product exploration for students and teachers." },
    ],
    technologies: [],
    technologyNote: "Product concept; no technology claims are attached to this exploration.",
    architecture: [],
    challenges: ["Make the needs of students and teachers fit one clear experience."],
    lessons: ["The learning loop matters more than the feature list."],
    links: [],
  },
  {
    slug: "rewired",
    title: "REWIRED",
    category: "Digital product",
    group: "experiment",
    status: "Published",
    statusNote: "Independent project, published and still being iterated.",
    summary:
      "A digital product about procrastination, structured ideas and practical systems for returning to work.",
    overview:
      "A digital product that approaches procrastination through practical systems and behavioral change rather than motivation alone.",
    problem:
      "Procrastination is often framed as a motivation problem, even when the way work is structured can be changed.",
    solution:
      "Organize ideas and practical systems into a digital product people can read and apply.",
    system: [
      { label: "Ideas", detail: "Structured ways of understanding the delay." },
      { label: "Systems", detail: "Practical approaches to returning to the work." },
      { label: "Iteration", detail: "Continue refining the writing and presentation." },
    ],
    workflow: ["Ideas", "Systems", "Practice", "Iteration"],
    features: [
      {
        title: "Digital product",
        detail: "A structured product rather than a loose collection of tips.",
      },
    ],
    technologies: [],
    technologyNote: "No technology claims attached.",
    architecture: [],
    challenges: ["Make the ideas practical and the presentation easy to follow."],
    lessons: ["Published work can still be improved."],
    links: [],
  },
  {
    slug: "ai-workforce",
    title: "AI Workforce",
    category: "AI / automation / business",
    group: "experiment",
    status: "Validation",
    statusNote: "Independent project in validation.",
    summary:
      "A marketplace concept exploring practical AI agents for repetitive operational tasks.",
    overview:
      "An exploration of how a business might find an AI worker by the task it could handle, rather than by the model name.",
    problem:
      "Businesses are asked to adopt AI without a clear path from a repeated task to a useful workflow.",
    solution:
      "Explore a marketplace concept for discovering practical AI workers around defined operational work.",
    system: [
      { label: "Discover", detail: "Find a potential worker by the job it is designed to do." },
      { label: "Workflow", detail: "Describe the business task and its boundaries." },
      { label: "Evaluate", detail: "Consider whether an AI worker can help with the task." },
    ],
    workflow: ["Task", "Discover", "Evaluate", "Workflow"],
    features: [
      {
        title: "Task-led discovery",
        detail: "Explore workflows first instead of browsing model names.",
      },
    ],
    technologies: [],
    technologyNote: "Marketplace concept; no technology claims attached.",
    architecture: [],
    challenges: ["Make deployment and operation understandable for non-technical teams."],
    lessons: ["A useful AI worker starts with a clearly scoped task."],
    links: [],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return index >= 0 ? projects[(index + 1) % projects.length] : undefined;
}
