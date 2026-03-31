import { defineCollection, z } from 'astro:content';

const normalizeArray = () => z.array(z.string()).transform(arr => arr.map(str => str.toLowerCase().replace(/\s+/g, '-'))).default([]);

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
  domains: normalizeArray(),
  crystallization: z.enum(['emergent', 'developing', 'crystallized']).default('developing'),
  governanceRelevance: z.enum(['none', 'adjacent', 'direct']).default('none'),
  lineage: normalizeArray(),
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
    tags: normalizeArray(),
    category: z.string().default('Field Notes'),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    related: normalizeArray(),
    canonical: z.string().url().optional(),
    ogImage: z.string().optional(),
    author: z.string().default('Hillary Njuguna'),
    structuredDataType: z.enum(['BlogPosting', 'Article', 'NewsArticle']).default('BlogPosting'),
    // Digest-specific topology
    digestType: z.enum(['update', 'note', 'dispatch', 'field-notes', 'practitioner-brief']).optional(),
    references: normalizeArray(),
    derivedFrom: normalizeArray(),
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
    tags: normalizeArray(),
    themes: normalizeArray(),
    concepts: normalizeArray(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    related: normalizeArray(),
    citations: normalizeArray(),
    ogImage: z.string().optional(),
    author: z.string().default('Hillary Njuguna'),
    structuredDataType: z.enum(['Article', 'ScholarlyArticle', 'TechArticle']).default('Article'),
    // Research-specific topology
    researchType: z.enum(['essay', 'framework', 'methodology', 'analysis', 'theoretical-framework']).optional(),
    keyClaims: normalizeArray(),
    unresolvedEdges: normalizeArray(),
    dependsOnConcepts: normalizeArray(),
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
    related: normalizeArray(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    ogImage: z.string().optional(),
    order: z.number().default(99),
    // Product-specific topology
    productKind: z.enum(['service', 'tool', 'offering', 'guide', 'cohort']).optional(),
    relatedResearch: normalizeArray(),
    governanceNotes: normalizeArray(),
    ...topologyFields,
  }),
});

// ── Clauses ───────────────────────────────────────────────────────────────────
const clauses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    clauseText: z.string().optional(),
    sourceContext: z.string().optional(),
    generatedAt: z.coerce.date().optional(),
    publishedAt: z.coerce.date().optional(),
    // Legacy status field kept for backward compatibility
    status: z.enum(['candidate', 'adopted', 'archived', 'under-review']).default('candidate'),
    tags: normalizeArray(),
    linkedContent: normalizeArray(),
    visibility: z.enum(['public', 'private']).default('public'),
    notes: z.string().optional(),
    // Clause-specific governance fields
    clauseStatus: z.enum(['candidate', 'provisional', 'active', 'retired', 'crystallized']).default('candidate'),
    governanceDomain: z.enum([
      'retrieval', 'synthesis', 'publishing', 'agentic-behavior',
      'user-consent', 'lineage', 'epistemic-safety', 'verification', 'epistemic-integrity',
    ]).optional(),
    crystallizationThreshold: z.number().min(0).max(1).default(0.5),
    supportingContentIds: normalizeArray(),
    objections: normalizeArray(),
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
