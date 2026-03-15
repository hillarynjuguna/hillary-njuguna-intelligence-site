#!/usr/bin/env tsx
/**
 * Check all explicit relations for validity: types, targets, explanations.
 * Run: npm run check:relations
 */
import { loadAllCollections } from '../src/lib/content/loaders';
import { normalizeAll } from '../src/lib/content/normalize';
import { validateRelationInput } from '../src/lib/content/validators';

const raw = loadAllCollections();
const { nodes, explicitRelationsBySource } = normalizeAll(raw);
const allIds = new Set(nodes.map((n) => n.id));

let totalRelations = 0;
let issues = 0;

console.log('\n[check:relations] Scanning explicit relations…\n');

for (const [sourceId, relations] of explicitRelationsBySource) {
  for (const rel of relations) {
    totalRelations++;
    const errors = validateRelationInput(rel, sourceId);

    // Check target exists
    if (rel.targetId && !allIds.has(rel.targetId)) {
      console.error(`  ✗ ${sourceId} → "${rel.targetId}": target does not exist`);
      issues++;
    }

    for (const err of errors) {
      console.error(`  ✗ [${err.code}] ${err.message}`);
      issues++;
    }

    if (errors.length === 0 && allIds.has(rel.targetId)) {
      const target = nodes.find((n) => n.id === rel.targetId);
      console.log(`  ✓ ${sourceId} --[${rel.type}]--> ${rel.targetId} (${rel.confidence}) "${target?.title ?? '?'}"`);
    }
  }
}

console.log(`\n${totalRelations} relations checked. ${issues} issues.\n`);
if (issues > 0) process.exit(1);
