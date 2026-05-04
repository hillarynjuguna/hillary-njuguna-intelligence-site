export const SITE = {
  name: 'Hillary Njuguna',
  tagline: 'AI governance architecture for institutions that can\'t afford to get it wrong.',
  description:
    'Hillary Njuguna diagnoses the structural conditions that make AI governance fail before it looks like failure, then builds the architecture that makes those failures visible. Research-backed frameworks, readiness assessments, and applied governance design.',
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
    name: 'Oscillatory Fields',
    issue: 'Issue 01',
    date: 'February 2026',
    substack: 'https://substack.com/@achetype1',
  },
  defaultOgImage: '/og/default.png',
  twitterCard: 'summary_large_image',
} as const;

export type SiteConfig = typeof SITE;
