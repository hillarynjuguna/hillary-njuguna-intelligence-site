import type { BaseContentFrontmatter } from './base';

export interface SignalFrontmatter extends BaseContentFrontmatter {
  signalType?: 'status' | 'announcement' | 'state';
}
