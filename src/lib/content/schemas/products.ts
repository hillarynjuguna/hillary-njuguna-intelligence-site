import type { BaseContentFrontmatter } from './base';

export interface ProductFrontmatter extends BaseContentFrontmatter {
  productKind?: 'service' | 'tool' | 'offering';
  /** IDs of research entries this product operationalises */
  relatedResearch?: string[];
  /** Governance-relevant notes specific to this product's deployment */
  governanceNotes?: string[];
}
