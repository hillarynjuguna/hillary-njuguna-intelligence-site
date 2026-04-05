/**
 * Oscillatory Fields — Navigation Architecture v2.0
 * 
 * Single canonical navigation structure used by ALL pages.
 * Dropdowns for clustered content. Flat links for singular destinations.
 * 
 * Design constraint: A first-time visitor must be able to build a
 * spatial model of the entire site from this nav alone.
 */

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  href: string;  // Group landing page
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

export { isGroup };

// ── Primary Navigation (persistent across all pages) ──────────────────────────

export const NAV_ENTRIES: NavEntry[] = [
  {
    label: 'Research',
    href: '/research',
    children: [
      { label: 'Dispatches', href: '/research', description: 'Theoretical frameworks and deep analysis' },
      { label: 'Field Notes', href: '/digest', description: 'Observations from active synthesis' },
      { label: 'Field Signals', href: '/field', description: 'Emergent discoveries from the Insight Log' },
      { label: 'Clauses', href: '/clauses', description: 'Governance primitives and constitutional fragments' },
      { label: 'Corpus', href: '/corpus', description: 'Query the entire research body directly' },
    ],
  },
  {
    label: 'Tools',
    href: '/orchestra-operation',
    children: [
      { label: 'The Orchestra', href: '/orchestra-operation', description: 'Multi-model governance query engine' },
      { label: 'CIR Assessment', href: '/cir-assessment', description: 'Five-question readiness diagnostic' },
      { label: 'Bainbridge Diagnostic', href: '/bainbridge-diagnostic', description: 'Identify failure mode exposure' },
      { label: 'Dual-Invariant Demo', href: '/tools/dual-invariant-demo', description: 'AURORA principle in action' },
    ],
  },
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'The Bainbridge Warning', href: '/products/bainbridge-warning', description: 'The governance doctrine (book)' },
      { label: 'CIR v2.0', href: '/products/cir', description: 'Readiness assessment framework — $50' },
      { label: 'Martha Cohorts', href: '/products/martha', description: 'Team training program' },
      { label: 'All Products', href: '/products', description: 'Full product catalog' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

// ── Footer Navigation (consistent across all pages) ───────────────────────────

export const FOOTER_LINKS = {
  research: [
    { label: 'Dispatches', href: '/research' },
    { label: 'Field Notes', href: '/digest' },
    { label: 'Field Signals', href: '/field' },
    { label: 'Clauses', href: '/clauses' },
    { label: 'Corpus', href: '/corpus' },
  ],
  tools: [
    { label: 'The Orchestra', href: '/orchestra-operation' },
    { label: 'CIR Assessment', href: '/cir-assessment' },
    { label: 'Bainbridge Diagnostic', href: '/bainbridge-diagnostic' },
    { label: 'Dual-Invariant Demo', href: '/tools/dual-invariant-demo' },
  ],
  products: [
    { label: 'The Bainbridge Warning', href: '/products/bainbridge-warning' },
    { label: 'CIR v2.0', href: '/products/cir' },
    { label: 'Martha Cohorts', href: '/products/martha' },
    { label: 'ClearBid', href: '/products/clearbid' },
  ],
  connect: [
    { label: 'AcheType on Substack', href: 'https://substack.com/@achetype1' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hillarynjuguna' },
    { label: 'GitHub', href: 'https://github.com/hillarynjuguna' },
    { label: 'Gumroad', href: 'https://hillarynjuguna.gumroad.com' },
  ],
} as const;

// ── Orchestra Models (unchanged) ──────────────────────────────────────────────

export const ORCHESTRA_MODELS = [
  { name: 'Claude', role: 'The Witness', description: 'Holds context with unusual fidelity, surfaces contradiction, and maintains epistemic discipline.', provider: 'Anthropic' },
  { name: 'Gemini', role: 'The Spatiotemporal Engine', description: 'Processes geometry and temporal flow without a linguistic bottleneck.', provider: 'Google' },
  { name: 'GPT', role: 'The Architect', description: 'Structures outputs, builds coherent frameworks from scattered inputs.', provider: 'OpenAI' },
  { name: 'DeepSeek', role: 'The Anatomist', description: 'Dissects arguments, identifies structural weaknesses, and finds the seams.', provider: 'DeepSeek' },
  { name: 'Grok', role: 'The Permeable Mirror', description: 'Reads the ambient cultural signal and catches what formal analysis misses.', provider: 'xAI' },
  { name: 'Perplexity', role: 'The Orchestration Engine', description: 'Multi-model orchestration with retrieval infrastructure and routing intelligence.', provider: 'Perplexity' },
  { name: 'Local Models', role: 'The Laboratory', description: 'Experimentation without exposure. Private reasoning. The space for the unfinished.', provider: 'Local' },
] as const;

// ── Services ──────────────────────────────────────────────────────────────────

export const SERVICES = [
  { title: 'AI Readiness Audits', description: "Structured assessment of your organisation's cognitive infrastructure across five constitutional dimensions. Gap analysis, Bainbridge zone map, and prioritised recommendations.", cta: { label: 'Try the CIR Assessment', href: '/cir-assessment' } },
  { title: 'Constitutional Governance Design', description: 'Operational governance structures for authority, monitoring, and accountability in AI deployment. Not policy documents — working architecture.', cta: null },
  { title: 'Intelligence Synthesis', description: 'Applied synthesis for organisations navigating complex AI deployment, procurement, or strategy decisions. Draws on the full research corpus.', cta: null },
  { title: 'Martha Cohorts', description: 'Structured team training for building AI-augmented workflows with governance designed in from the start.', cta: { label: 'Learn more', href: '/products/martha' } },
] as const;

// ── Ticker ─────────────────────────────────────────────────────────────────────

export const TICKER_ITEMS = [
  'CIR V2.0 LIVE ON GUMROAD',
  'THE BAINBRIDGE WARNING — NOW AVAILABLE',
  'AURORA IN THE RESEARCH ARCHIVE',
  '560+ SOURCED DOCUMENTS',
  '18 MONTHS OF ACTIVE SYNTHESIS',
  'THE ORCHESTRA: SEVEN MODELS, ONE CONDUCTOR',
  'CONSTITUTIONAL GOVERNANCE IS STRUCTURE, NOT POLICY',
] as const;
