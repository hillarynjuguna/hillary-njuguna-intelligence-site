/**
 * Content loaders for use in build scripts (outside Astro context).
 * Uses gray-matter + fast-glob to read markdown frontmatter directly.
 * Astro pages should use getCollection() from astro:content instead.
 */
import matter from 'gray-matter';
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { join, basename, extname } from 'path';

export type CollectionName = 'digest' | 'research' | 'products' | 'clauses';

export interface RawEntry {
  collection: CollectionName;
  slug: string;
  filePath: string;
  data: Record<string, unknown>;
  body: string;
}

const CONTENT_ROOT = join(process.cwd(), 'src', 'content');

export function loadCollection(collection: CollectionName): RawEntry[] {
  const dir = join(CONTENT_ROOT, collection);
  const files = fg.sync(`${dir}/**/*.{md,mdx}`, { absolute: true });

  return files.map((filePath) => {
    const raw = readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const filename = basename(filePath, extname(filePath));
    return {
      collection,
      slug: filename,
      filePath,
      data,
      body: content,
    };
  });
}

export function loadAllCollections(): RawEntry[] {
  const collections: CollectionName[] = ['digest', 'research', 'products', 'clauses'];
  return collections.flatMap((c) => loadCollection(c));
}
