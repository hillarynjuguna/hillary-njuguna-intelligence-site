#!/usr/bin/env tsx
/**
 * Validate all content files: schemas, IDs, explicit relations, clauses.
 * Hard fails on errors; prints warnings.
 * Run: npm run validate:content
 */
import { loadAllCollections } from '../src/lib/content/loaders';
import { normalizeAll } from '../src/lib/content/normalize';
import { validateNode } from '../src/lib/content/validators';
import { validateRelationInput } from '../src/lib/content/validators';
import type { ValidationError } from '../src/lib/content/validators';
import { ALL_RELATION_TYPES, ALL_CONFIDENCE_VALUES } from '../src/lib/content/schemas/relations';

const raw = loadAllCollections();
const { nodes, explicitRelationsBySource } = normalizeAll(raw);

const errors: ValidationError[] = [];
const warnings: ValidationError[] = [];

// Validate each node
for (const node of nodes) {
  const issues = validateNode(node);
  errors.push(...issues.filter((i) => i.level === 'error'));
  warnings.push(...issues.filter((i) => i.level === 'warn'));
}

// Check for duplicate IDs
const seen = new Set<string>();
for (const node of nodes) {
  if (seen.has(node.id)) {
    errors.push({ level: 'error', code: 'DUPLICATE_ID', nodeId: node.id, message: `Duplicate id: ${node.id}` });
  }
  seen.add(node.id);
}

// Validate explicit relations
const allIds = new Set(nodes.map((n) => n.id));
for (const [sourceId, relations] of explicitRelationsBySource) {
  for (const rel of relations) {
    const relErrors = validateRelationInput(rel, sourceId);
    errors.push(...relErrors);
    if (rel.targetId && !allIds.has(rel.targetId)) {
      errors.push({
        level: 'error',
        code: 'DANGLING_RELATION_TARGET',
        nodeId: sourceId,
        message: `${sourceId}: relation targetId "${rel.targetId}" does not match any known content id`,
      });
    }
  }
}

// Summary
if (warnings.length > 0) {
  console.warn('\nWarnings:');
  for (const w of warnings) console.warn(`  ⚠ [${w.code}] ${w.message}`);
}

if (errors.length > 0) {
  console.error('\nErrors:');
  for (const e of errors) console.error(`  ✗ [${e.code}] ${e.message}`);
  console.error(`\n${errors.length} error(s) found. Fix before publishing.\n`);
  process.exit(1);
} else {
  console.log(`\n✓ ${nodes.length} entries validated. ${warnings.length} warnings.\n`);
}
