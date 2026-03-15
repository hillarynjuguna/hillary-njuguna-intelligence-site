import type { GraphNode, GraphEdge } from './types';
import { validateNode, validateGraph, checkOrphans, checkGovernanceCoverage } from '../content/validators';
import type { ValidationError } from '../content/validators';

export type { ValidationError };

export interface IntegrityReport {
  errors: ValidationError[];
  warnings: ValidationError[];
  passed: boolean;
  summary: string;
}

export function runIntegrityChecks(
  nodes: GraphNode[],
  edges: GraphEdge[],
): IntegrityReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Per-node validation
  for (const node of nodes) {
    const issues = validateNode(node);
    errors.push(...issues.filter((i) => i.level === 'error'));
    warnings.push(...issues.filter((i) => i.level === 'warn'));
  }

  // Graph-level validation
  const graphIssues = validateGraph(nodes, edges);
  errors.push(...graphIssues.filter((i) => i.level === 'error'));
  warnings.push(...graphIssues.filter((i) => i.level === 'warn'));

  // Orphan checks
  const orphanWarnings = checkOrphans(nodes, edges);
  warnings.push(...orphanWarnings);

  // Governance coverage
  const govWarnings = checkGovernanceCoverage(nodes, edges);
  warnings.push(...govWarnings);

  // Inferred vs manual ratio check
  const manualCount = edges.filter((e) => e.manual).length;
  const inferredCount = edges.filter((e) => e.inferred).length;
  if (inferredCount > manualCount * 3) {
    warnings.push({
      level: 'warn',
      code: 'HIGH_INFERENCE_RATIO',
      message: `${inferredCount} inferred edges vs ${manualCount} manual — add more explicit relations.`,
    });
  }

  const passed = errors.length === 0;
  const summary = passed
    ? `✓ ${nodes.length} nodes, ${edges.length} edges — no errors. ${warnings.length} warnings.`
    : `✗ ${errors.length} errors, ${warnings.length} warnings across ${nodes.length} nodes.`;

  return { errors, warnings, passed, summary };
}
