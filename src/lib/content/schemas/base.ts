// ── Base content frontmatter types ───────────────────────────────────────────
// These are TypeScript interfaces — the canonical type definitions.
// Astro Zod schemas in src/content/config.ts mirror these.

import type { RelationInput } from './relations';

export type CrystallizationState =
  | 'emergent'      // Working hypothesis, no specimen validation yet
  | 'developing'    // Active, being refined against evidence
  | 'crystallized'  // Stable, supported by multiple specimens
  | 'canonical'     // Externally verified or cited — stable for institutional reference
  | 'deprecated';   // Retired, superseded, or structurally invalidated
export type GovernanceRelevance = 'none' | 'adjacent' | 'direct';
export type ContentType = 'research' | 'digest' | 'product' | 'clause' | 'field' | 'signal';
export type PublishStatus = 'draft' | 'published' | 'archived';

export interface BaseContentFrontmatter {
  /** Stable cross-collection identifier. Convention: {collection}-{slug-fragment} */
  id: string;
  title: string;
  /** One-sentence description used in graph nodes, SEO, and relation explanations */
  description: string;
  /** Publication status of the content itself */
  status: PublishStatus;
  publishedAt?: string;
  updatedAt?: string;
  tags?: string[];
  /** Conceptual domains — broader than tags, should be one of a controlled set */
  domains?: string[];
  themes?: string[];
  /** How settled is the conceptual work in this entry */
  crystallization: CrystallizationState;
  /** Degree to which this content has direct governance implications */
  governanceRelevance?: GovernanceRelevance;
  /** Lineage markers — which intellectual threads does this belong to */
  lineage?: string[];
  /** Explicit typed relations authored in frontmatter — always outrank inference */
  explicitRelations?: RelationInput[];
}
