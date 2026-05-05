export interface AssessmentQuestion {
  id: string;
  text: string;
  options: {
    text: string;
    points: number;
    gapText?: string; // If they pick this, what's the vulnerability identified?
  }[];
}

export const cirQuestions: AssessmentQuestion[] = [
  {
    id: "q1_metrics",
    text: "When evaluating AI governance success, what does your primary dashboard measure?",
    options: [
      { text: "The number of compliance checklists or model cards completed.", points: 0, gapText: "Activity-based metrics (measuring checklists instead of outcomes) is a primary indicator of Governance Theater." },
      { text: "Incidents logged and time-to-resolution.", points: 5, gapText: "Measuring incidents is reactive; the system fails before governance engages." },
      { text: "The number of times a governance gate actively blocked or altered a deployment decision.", points: 10 }
    ]
  },
  {
    id: "q2_evaluations",
    text: "How are your AI models evaluated for safety before deployment?",
    options: [
      { text: "Against standard benchmark suites provided by the vendor or open-source community.", points: 0, gapText: "Standard benchmarks do not cover the specific, adversarial conditions of your unique production environment." },
      { text: "Against a set of expected use cases designed by our engineering team.", points: 5 },
      { text: "Against adversarial conditions that intentionally simulate the edges of the model's competence in our specific workflow.", points: 10 }
    ]
  },
  {
    id: "q3_correction",
    text: "When a failure or incident is acknowledged, what typically happens next?",
    options: [
      { text: "An incident report is filed and added to the audit trail.", points: 0, gapText: "Acknowledgment without structural correction guarantees the failure mode will repeat." },
      { text: "A manual review policy is temporarily instituted.", points: 5 },
      { text: "The system architecture is modified to make that specific failure class computationally impossible.", points: 10 }
    ]
  },
  {
    id: "q4_review",
    text: "What is the primary output of your AI review committee?",
    options: [
      { text: "Paperwork, documentation, and compliance sign-offs.", points: 0, gapText: "Review processes that produce paperwork rather than operational friction are performing theater, not governance." },
      { text: "Recommendations to the engineering team.", points: 5 },
      { text: "Binding Go/No-Go decisions that halt code delivery.", points: 10 }
    ]
  },
  {
    id: "q5_escalation",
    text: "Describe the escalation path for a severe AI behavioral anomaly:",
    options: [
      { text: "It exists on the org chart, but has never been activated.", points: 0, gapText: "An untested escalation path is an architectural dead-end. If it hasn't been used, it doesn't exist." },
      { text: "It requires manual intervention and multiple managerial approvals to halt the system.", points: 5 },
      { text: "It is automated (e.g., a kill switch) and has been successfully tested in production drills.", points: 10 }
    ]
  },
  {
    id: "q6_monitoring",
    text: "Who reads the live telemetry and monitoring dashboards for your AI systems?",
    options: [
      { text: "The data flows into a dashboard, but it is rarely reviewed unless an incident is reported.", points: 0, gapText: "Unmonitored telemetry creates the illusion of oversight while allowing silent failures to accumulate." },
      { text: "The engineering team reviews it during weekly sprints.", points: 5 },
      { text: "An independent monitoring node (human or programmatic) validates the telemetry in real-time.", points: 10 }
    ]
  },
  {
    id: "q7_structure",
    text: "To whom does the AI governance or compliance team report?",
    options: [
      { text: "To the VP of Engineering or the product leader whose deployments they evaluate.", points: 0, gapText: "Structural conflict of interest: governance cannot report to the function it is supposed to govern." },
      { text: "To a general legal or risk department that lacks technical authority.", points: 5 },
      { text: "To an independent authority with the technical capability and mandate to override engineering.", points: 10 }
    ]
  },
  {
    id: "q8_reversibility_class",
    text: "If an AI agent executes a Class 2 action (Operationally Irreversible, e.g., sending an email to a client), what precedes it?",
    options: [
      { text: "A system prompt instructing the agent to 'be careful and polite'.", points: 0, gapText: "Relying on system prompts for irreversible actions is a failure of Bounded Verifiability Latency." },
      { text: "A log entry recording that the action was taken.", points: 5 },
      { text: "A deterministic, non-LLM validation gate (permit) that must clear before execution.", points: 10 }
    ]
  },
  {
    id: "q9_intent",
    text: "How do you verify that the AI system's optimization target aligns with your organizational intent?",
    options: [
      { text: "We rely on the frontier lab's safety training and our initial testing.", points: 0, gapText: "The burden of proof for alignment is on the deployer. Assuming vendor safety is a critical intent gap." },
      { text: "We do periodic audits of the model's outputs.", points: 5 },
      { text: "We have live interpretability access and a documented theory of continuous alignment.", points: 10 }
    ]
  },
  {
    id: "q10_architecture",
    text: "If the model encounters a situation completely outside its training and instructions, what is the system's baseline behavior?",
    options: [
      { text: "It attempts to generate a plausible response based on nearest neighbors.", points: 0, gapText: "A system that guesses when uncertain lacks a sovereign architectural core." },
      { text: "It fails silently or hallucinates.", points: 5 },
      { text: "It throws a sovereign exception and routes the decision to a human (τ-node).", points: 10 }
    ]
  }
];
