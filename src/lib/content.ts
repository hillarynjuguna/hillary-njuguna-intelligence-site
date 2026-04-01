import { getCollection, type CollectionEntry } from 'astro:content';

// ── Digest helpers ────────────────────────────────────────────────────────────
export async function getAllDigestEntries() {
  const entries = await getCollection('digest', ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
  );
}

export async function getFeaturedDigestEntries(limit = 3) {
  const all = await getAllDigestEntries();
  const featured = all.filter((e) => e.data.featured);
  return featured.length >= limit ? featured.slice(0, limit) : all.slice(0, limit);
}

// ── Research helpers ──────────────────────────────────────────────────────────
export async function getAllResearchEntries() {
  const entries = await getCollection('research', ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
  );
}

export async function getFeaturedResearch() {
  const all = await getAllResearchEntries();
  return all
    .filter((e) => e.data.featured)
    .sort((a, b) => (a.data.featuredRank ?? 99) - (b.data.featuredRank ?? 99));
}

// ── Product helpers ───────────────────────────────────────────────────────────
export async function getAllProducts() {
  const entries = await getCollection('products', ({ data }) => !data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProducts() {
  const all = await getAllProducts();
  return all
    .filter((p) => p.data.featured)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

// ── Clause helpers ────────────────────────────────────────────────────────────
export async function getAllClauses() {
  const entries = await getCollection('clauses', ({ data }) => data.visibility === 'public');
  return entries.sort(
    (a, b) => b.data.generatedAt.valueOf() - a.data.generatedAt.valueOf()
  );
}

// ── Signal helpers ────────────────────────────────────────────────────────────
export async function getCurrentSignal() {
  const entries = await getCollection('signals');
  return entries[0]?.data ?? null;
}

// ── Related content ───────────────────────────────────────────────────────────
export async function getRelatedContent(
  slugs: string[],
  currentSlug: string
) {
  if (!slugs.length) return [];

  const [digest, research, products] = await Promise.all([
    getCollection('digest', ({ data }) => !data.draft),
    getCollection('research', ({ data }) => !data.draft),
    getCollection('products', ({ data }) => !data.draft),
  ]);

  const all = [...digest, ...research, ...products];
  return all
    .filter((e) => slugs.includes(e.slug) && e.slug !== currentSlug)
    .slice(0, 4);
}

// ── Formatting ────────────────────────────────────────────────────────────────
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Status helpers ────────────────────────────────────────────────────────────
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    live: 'Live',
    development: 'In Development',
    waitlist: 'Waitlist Open',
    'coming-soon': 'Coming Soon',
    candidate: 'Candidate',
    adopted: 'Adopted',
    archived: 'Archived',
    'under-review': 'Under Review',
  };
  return labels[status] ?? status;
}

export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    live: 'badge--live',
    development: 'badge--dev',
    waitlist: 'badge--dev',
    'coming-soon': 'badge--soon',
    candidate: 'badge--soon',
    adopted: 'badge--live',
    archived: 'badge--soon',
    'under-review': 'badge--dev',
  };
  return classes[status] ?? 'badge--soon';
}
