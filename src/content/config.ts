import { defineCollection, z } from 'astro:content';

// ── Digest ────────────────────────────────────────────────────────────────────
const digest = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default('Field Notes'),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    canonical: z.string().url().optional(),
    ogImage: z.string().optional(),
    author: z.string().default('Hillary Njuguna'),
    structuredDataType: z.enum(['BlogPosting', 'Article', 'NewsArticle']).default('BlogPosting'),
  }),
});

// ── Research ──────────────────────────────────────────────────────────────────
const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    themes: z.array(z.string()).default([]),
    concepts: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    citations: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    author: z.string().default('Hillary Njuguna'),
  }),
});

// ── Products ──────────────────────────────────────────────────────────────────
const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    productType: z.enum(['guide', 'tool', 'cohort', 'service', 'framework']),
    status: z.enum(['live', 'development', 'waitlist', 'coming-soon']),
    price: z.string().optional(),
    ctaLabel: z.string().default('Learn More'),
    ctaUrl: z.string().optional(),
    waitlistUrl: z.string().optional(),
    platform: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    ogImage: z.string().optional(),
    order: z.number().default(99),
  }),
});

// ── Clauses ───────────────────────────────────────────────────────────────────
const clauses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    clauseText: z.string(),
    sourceContext: z.string().optional(),
    generatedAt: z.coerce.date(),
    status: z.enum(['candidate', 'adopted', 'archived', 'under-review']).default('candidate'),
    tags: z.array(z.string()).default([]),
    linkedContent: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'private']).default('public'),
    notes: z.string().optional(),
  }),
});

// ── Signals ───────────────────────────────────────────────────────────────────
const signals = defineCollection({
  type: 'data',
  schema: z.object({
    currentFocus: z.string(),
    currentIssue: z.string().optional(),
    currentSignal: z.string().optional(),
    currentBuildState: z.string().optional(),
    featuredLinks: z.array(z.object({
      label: z.string(),
      href: z.string(),
      description: z.string().optional(),
    })).default([]),
    metrics: z.object({
      documents: z.string().optional(),
      months: z.string().optional(),
      models: z.string().optional(),
    }).optional(),
    corpusStats: z.object({
      entries: z.number().optional(),
      clauses: z.number().optional(),
      lastSynthesis: z.coerce.date().optional(),
    }).optional(),
    availabilityState: z.enum(['available', 'limited', 'unavailable']).default('available'),
  }),
});

export const collections = { digest, research, products, clauses, signals };
