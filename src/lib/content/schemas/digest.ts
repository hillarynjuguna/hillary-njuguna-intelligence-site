import type { BaseContentFrontmatter } from './base';

export interface DigestFrontmatter extends BaseContentFrontmatter {
  digestType?: 'update' | 'note' | 'dispatch';
  /** External sources referenced in this entry */
  references?: string[];
  /** Content IDs this entry was synthesised from or reacts to */
  derivedFrom?: string[];
}
