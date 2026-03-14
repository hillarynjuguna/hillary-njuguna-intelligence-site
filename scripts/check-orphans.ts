#!/usr/bin/env tsx
/**
 * Find orphan nodes — published content with no edges in either direction.
 * Run: npm run check:orphans
 */
import { buildContentGraph } from '../src/lib/graph/buildGraph';

const graph = buildContentGraph();
const connected = new Set([
  ...graph.edges.map((e) => e.source),
  ...graph.edges.map((e) => e.target),
]);

const orphans = graph.nodes.filter((n) => n.status === 'published' && !connected.has(n.id));

if (orphans.length === 0) {
  console.log(`\n✓ No orphan nodes. All published content has at least one edge.\n`);
} else {
  console.warn(`\n⚠ ${orphans.length} orphan node(s):\n`);
  for (const n of orphans) {
    console.warn(`  ${n.id} (${n.contentType}) — "${n.title}"`);
  }
  console.warn(`\nConsider adding explicit relations or lineage markers.\n`);
}
