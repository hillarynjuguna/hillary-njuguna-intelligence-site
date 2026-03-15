import type { BaseContentFrontmatter } from './base';

export interface ResearchFrontmatter extends BaseContentFrontmatter {
  researchType?: 'essay' | 'framework' | 'methodology' | 'analysis';
  /** Core falsifiable or structural claims the entry makes */
  keyClaims?: string[];
  /** Open questions or unresolved tensions explicitly named */
  unresolvedEdges?: string[];
  /** Concepts from other entries this entry depends on conceptually */
  dependsOnConcepts?: string[];
}
