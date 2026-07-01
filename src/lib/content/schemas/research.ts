import type { BaseContentFrontmatter } from './base';

export interface ResearchFrontmatter extends BaseContentFrontmatter {
  researchType?: 'essay' | 'framework' | 'methodology' | 'analysis';
  /** Core falsifiable or structural claims the entry makes */
  keyClaims?: string[];
  /** Open questions or unresolved tensions explicitly named */
  unresolvedEdges?: string[];
  /** Concepts from other entries this entry depends on conceptually */
  dependsOnConcepts?: string[];
  /** Semantic version string e.g. "1.2", "2.0" */
  version?: string;
  /** Changelog entries for version history */
  changelog?: Array<{ version: string; date: string; summary: string }>;
}
