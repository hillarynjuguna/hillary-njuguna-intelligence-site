import type { BaseContentFrontmatter } from './base';

export type ClauseStatus = 'candidate' | 'provisional' | 'active' | 'retired';

export type GovernanceDomain =
  | 'retrieval'
  | 'synthesis'
  | 'publishing'
  | 'agentic-behavior'
  | 'user-consent'
  | 'lineage'
  | 'epistemic-safety';

export const ALL_GOVERNANCE_DOMAINS: GovernanceDomain[] = [
  'retrieval',
  'synthesis',
  'publishing',
  'agentic-behavior',
  'user-consent',
  'lineage',
  'epistemic-safety',
];

export const ALL_CLAUSE_STATUSES: ClauseStatus[] = [
  'candidate',
  'provisional',
  'active',
  'retired',
];

export interface ClauseFrontmatter extends BaseContentFrontmatter {
  clauseStatus: ClauseStatus;
  governanceDomain: GovernanceDomain;
  /**
   * 0.0–1.0. Proportion of supporting content that must reach 'crystallized'
   * state before this clause can be promoted to 'active'.
   */
  crystallizationThreshold: number;
  /** IDs of content entries that provide evidential or theoretical support */
  supportingContentIds: string[];
  /** Known objections or limitations — must be named, not suppressed */
  objections?: string[];
  /** Scope of applicability — what contexts this clause governs */
  applicability?: string;
  reviewCadence?: 'weekly' | 'monthly' | 'quarterly' | 'event-driven';
}
