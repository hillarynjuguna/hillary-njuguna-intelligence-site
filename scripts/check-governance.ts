#!/usr/bin/env tsx
/**
 * Check governance coverage: clauses, supporting content, adjacency gaps.
 * Run: npm run check:governance
 */
import { buildContentGraph } from '../src/lib/graph/buildGraph';
import { buildGovernanceIndex } from '../src/lib/graph/governance';
import { checkGovernanceCoverage } from '../src/lib/content/validators';

const graph = buildContentGraph();
const govIndex = buildGovernanceIndex(graph.nodes, graph.edges);
const warnings = checkGovernanceCoverage(graph.nodes, graph.edges);

console.log('\n[check:governance] Governance status\n');
console.log(`Clauses: ${govIndex.clauses.length}`);
for (const c of govIndex.clauses) {
  console.log(`  [${c.clauseStatus.toUpperCase()}] ${c.id} — domain: ${c.governanceDomain} — threshold: ${c.crystallizationThreshold}`);
  console.log(`    Supporting: ${c.supportingContentIds.join(', ') || '(none)'}`);
}

console.log(`\nDomain groups:`);
for (const [domain, ids] of Object.entries(govIndex.byDomain)) {
  console.log(`  ${domain}: ${ids.join(', ')}`);
}

if (warnings.length > 0) {
  console.warn('\nGovernance warnings:');
  for (const w of warnings) {
    console.warn(`  ⚠ [${w.code}] ${w.message}`);
  }
}

console.log('\n');
