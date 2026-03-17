export const NAV_LINKS = [
  { label: 'Research', href: '/research' },
  { label: 'Products', href: '/products' },
  { label: 'Diagnostic', href: '/bainbridge-diagnostic' },
  { label: 'Digest', href: '/digest' },
  { label: 'Orchestra', href: '/orchestra' },
  { label: 'Corpus', href: '/corpus' },
] as const;

export const FOOTER_LINKS = {
  work: [
    { label: 'Research', href: '/research' },
    { label: 'Products', href: '/products' },
    { label: 'Bainbridge Diagnostic', href: '/bainbridge-diagnostic' },
    { label: 'Intelligence Digest', href: '/digest' },
    { label: 'The Orchestra', href: '/orchestra' },
  ],
  engage: [
    { label: 'Corpus', href: '/corpus' },
    { label: 'Clauses', href: '/clauses' },
    { label: 'Contact', href: '/contact' },
  ],
  external: [
    { label: 'AcheType on Substack', href: 'https://substack.com/@achetype1' },
    { label: 'X / Twitter', href: 'https://x.com/quasiconscious' },
    { label: 'Gumroad', href: 'https://hillarynjuguna.gumroad.com' },
    { label: 'ResearchGate', href: 'https://researchgate.net' },
  ],
} as const;

export const ORCHESTRA_MODELS = [
  {
    name: 'Claude',
    role: 'The Witness',
    description: 'Holds context, surfaces contradiction, maintains epistemic discipline.',
    provider: 'Anthropic',
  },
  {
    name: 'Gemini',
    role: 'The Director',
    description: 'Coordinates synthesis across sources, manages multi-modal context.',
    provider: 'Google',
  },
  {
    name: 'GPT',
    role: 'The Architect',
    description: 'Structures outputs, builds coherent frameworks from scattered inputs.',
    provider: 'OpenAI',
  },
  {
    name: 'DeepSeek',
    role: 'The Anatomist',
    description: 'Dissects arguments, identifies structural weaknesses, finds the seams.',
    provider: 'DeepSeek',
  },
  {
    name: 'Grok',
    role: 'The Permeable Mirror',
    description: 'Reflects the culture back, reads the ambient signal, catches what formal analysis misses.',
    provider: 'xAI',
  },
  {
    name: 'Perplexity',
    role: 'Live Signals',
    description: 'Real-time grounding. What is happening now, and does it change the analysis?',
    provider: 'Perplexity',
  },
  {
    name: 'Local Models',
    role: 'The Laboratory',
    description: 'Experimentation without exposure. Private reasoning. The space for the unfinished.',
    provider: 'Local',
  },
] as const;

export const SERVICES = [
  {
    title: 'AI Readiness Audits',
    description: 'Structured assessment of your organisation\'s cognitive infrastructure across five constitutional dimensions. Produces a gap analysis, Bainbridge zone map, and prioritised recommendations.',
    cta: { label: 'View CIR Framework', href: '/products/cir' },
  },
  {
    title: 'Constitutional Governance Design',
    description: 'Building the governance architecture that your AI deployment requires — not policy documents, but operational structures for authority, monitoring, and accountability.',
    cta: null,
  },
  {
    title: 'Intelligence Synthesis',
    description: 'Applied synthesis work for organisations navigating complex decisions in AI deployment, procurement, or strategy. Draws on the full research corpus.',
    cta: null,
  },
  {
    title: 'Martha Cohorts',
    description: 'A structured team cohort for building AI-augmented workflows with constitutional governance designed in from the start.',
    cta: { label: 'Join Waitlist', href: '/products/martha' },
  },
  {
    title: 'Technical Infrastructure',
    description: 'Implementation support for the technical layer of AI deployment — API integration, model orchestration, evaluation frameworks, and monitoring architecture.',
    cta: null,
  },
  {
    title: 'Cathedral',
    description: 'Long-horizon thought leadership for organisations building in public. Strategic research, publication, and the construction of a serious intellectual identity.',
    cta: null,
  },
] as const;

export const TICKER_ITEMS = [
  'Distributed Cognition as Foundational Behavior',
  'Trust = Irreversibility Residue',
  'The Bainbridge Warning',
  'Constitutional AI Governance',
  'Cognitive Infrastructure Readiness',
  'The Intent Gap',
  'Intelligence Architecture',
  'The Orchestra · 7 Models',
  'Oscillatory Fields · Issue 01',
  'Institutional AI Readiness',
  'The Authority Architecture Problem',
  'Alignment Monitoring at Scale',
] as const;
