export const SITE = {
  name: 'Oscillatory Fields',
  tagline: 'Intelligence architecture for institutions that can\'t afford to get it wrong.',
  description:
    'Research and applied intelligence architecture by Hillary Njuguna. We build the governance layers—from distributed cognition theory (DCFB) to institutional readiness (CIR)—that make AI failures visible before they occur.',
  url: 'https://hillary-site.vercel.app',
  author: {
    name: 'Hillary Njuguna',
    handle: '@quasiconscious',
    email: 'hillarynjuguna@protonmail.com',
    bio: 'Intelligence architect. Constitutional AI governance researcher. Builder of cognitive infrastructure frameworks.',
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
