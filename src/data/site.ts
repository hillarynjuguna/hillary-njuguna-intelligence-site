export const SITE = {
  name: 'Hillary Njuguna',
  tagline: 'AI governance architecture for institutions that can\'t afford to get it wrong.',
  description:
    'Hillary Njuguna provides AI Governance architecture and structural diagnostics for institutions. Specialized in constitutional AI governance frameworks, AI risk readiness assessments, and building durable cognitive infrastructure for agentic AI systems.',
  url: 'https://hillarynjuguna.vercel.app',
  author: {
    name: 'Hillary Njuguna',
    handle: '@quasiconscious',
    email: 'hillarynjuguna@protonmail.com',
    bio: 'AI governance architect. Researcher and practitioner building the structural diagnostics and readiness frameworks that make AI deployment failures visible before they become catastrophic.',
    origin: 'Nairobi → Kuala Lumpur → everywhere',
    social: {
      x: 'https://x.com/quasiconscious',
      substack: 'https://substack.com/@achetype1',
      gumroad: 'https://hillarynjuguna.gumroad.com',
      researchgate: 'https://researchgate.net',
    },
  },
  publication: {
    name: 'Hillary Njuguna',
    issue: 'Issue 01',
    date: 'February 2026',
    substack: 'https://substack.com/@achetype1',
  },
  defaultOgImage: '/og/default.png',
  twitterCard: 'summary_large_image',
} as const;

export type SiteConfig = typeof SITE;
