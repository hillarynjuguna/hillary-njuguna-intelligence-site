import { defineCollection, z } from 'astro:content';

// ── Shared relation sub-schema ────────────────────────────────────────────────
const relationInputSchema = z.object({
  targetId: z.string(),
  type: z.enum([
    'extends', 'derives_from', 'responds_to', 'tensions_with', 'clarifies',
    'depends_on', 'governance_relevant_to', 'prototype_for', 'example_of',
    'contraindicates', 'crystallizes', 'remains_emergent_with',
  ]),
  confidence: z.enum(['low', 'medium', 'high']),
  explanation: z.string(),
  provenance: z.array(z.string()).optional(),
  manual: z.boolean().optional(),
});

// ── Shared topology fields added to all content collections ──────────────────
const topologyFields = {
  id: z.string().optional(),
  description: z.string().optional(),
  publishStatus: z.enum(['draft', 'published', 'archived']).default('published'),
  domains: z.array(z.string()).default([]),
  crystallization: z.enum(['emergent', 'developing', 'crystallized']).default('developing'),
  governanceRelevance: z.enum(['none', 'adjacent', 'direct']).default('none'),
  lineage: z.array(z.string()).default([]),
  explicitRelations: z.array(relationInputSchema).optional(),
};

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
    // Digest-specific topology
    digestType: z.enum(['update', 'note', 'dispatch', 'field-notes', 'practitioner-brief']).optional(),
    references: z.array(z.string()).default([]),
    derivedFrom: z.array(z.string()).default([]),
    ...topologyFields,
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
    // Research-specific topology
    researchType: z.enum(['essay', 'framework', 'methodology', 'analysis']).optional(),
    keyClaims: z.array(z.string()).default([]),
    unresolvedEdges: z.array(z.string()).default([]),
    dependsOnConcepts: z.array(z.string()).default([]),
    ...topologyFields,
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
    // Product-specific topology
    productKind: z.enum(['service', 'tool', 'offering', 'guide', 'cohort']).optional(),
    relatedResearch: z.array(z.string()).default([]),
    governanceNotes: z.array(z.string()).default([]),
    ...topologyFields,
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
    publishedAt: z.coerce.date().optional(),
    // Legacy status field kept for backward compatibility
    status: z.enum(['candidate', 'adopted', 'archived', 'under-review']).default('candidate'),
    tags: z.array(z.string()).default([]),
    linkedContent: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'private']).default('public'),
    notes: z.string().optional(),
    // Clause-specific governance fields
    clauseStatus: z.enum(['candidate', 'provisional', 'active', 'retired']).default('candidate'),
    governanceDomain: z.enum([
      'retrieval', 'synthesis', 'publishing', 'agentic-behavior',
      'user-consent', 'lineage', 'epistemic-safety',
    ]).optional(),
    crystallizationThreshold: z.number().min(0).max(1).default(0.5),
    supportingContentIds: z.array(z.string()).default([]),
    objections: z.array(z.string()).default([]),
    applicability: z.string().optional(),
    reviewCadence: z.enum(['weekly', 'monthly', 'quarterly', 'event-driven']).optional(),
    ...topologyFields,
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
