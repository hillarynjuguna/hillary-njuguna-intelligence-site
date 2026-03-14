/**
 * Main graph builder.
 * Loads all content, compiles explicit relations, infers secondary relations,
 * and emits all four JSON artifacts to src/data/generated/.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadAllCollections } from '../content/loaders';
import { normalizeAll } from '../content/normalize';
import { inferRelations } from './inferRelations';
import { buildTaxonomyIndex } from './taxonomy';
import { buildGovernanceIndex } from './governance';
import { runIntegrityChecks } from './integrityChecks';
import type { ContentGraph, GraphEdge, RelationIndex, ContentType } from './types';

const GENERATED_DIR = join(process.cwd(), 'src', 'data', 'generated');

export function buildContentGraph(): ContentGraph {
  const raw = loadAllCollections();
  const { nodes, explicitRelationsBySource } = normalizeAll(raw);

  const edges: GraphEdge[] = [];

  // ── Compile explicit manual relations ─────────────────────────────────────
  for (const [sourceId, relations] of explicitRelationsBySource) {
    for (const rel of relations) {
      edges.push({
        source: sourceId,
        target: rel.targetId,
        type: rel.type,
        confidence: rel.confidence,
        explanation: rel.explanation,
        provenance: rel.provenance ?? [],
        manual: true,
        inferred: false,
      });
    }
  }

  // ── Infer secondary relations ─────────────────────────────────────────────
  const inferred = inferRelations(nodes, edges);
  edges.push(...inferred);

  // ── Build stats ───────────────────────────────────────────────────────────
  const byType = {} as Record<ContentType, number>;
  for (const node of nodes) {
    byType[node.contentType] = (byType[node.contentType] ?? 0) + 1;
  }

  return {
    nodes,
    edges,
    generatedAt: new Date().toISOString(),
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      manualEdges: edges.filter((e) => e.manual).length,
      inferredEdges: edges.filter((e) => e.inferred).length,
      byType,
    },
  };
}

function buildRelationIndex(graph: ContentGraph): RelationIndex {
  const bySource: Record<string, ReturnType<RelationIndex['bySource'][string]['map']>> = {};
  const byTarget: typeof bySource = {};

  for (const edge of graph.edges) {
    if (!bySource[edge.source]) bySource[edge.source] = [];
    (bySource[edge.source] as unknown as RelationIndex['bySource'][string]).push({
      target: edge.target,
      type: edge.type,
      confidence: edge.confidence,
      explanation: edge.explanation,
      manual: edge.manual,
      inferred: edge.inferred,
    });

    if (!byTarget[edge.target]) byTarget[edge.target] = [];
    (byTarget[edge.target] as unknown as RelationIndex['bySource'][string]).push({
      target: edge.source,
      type: edge.type,
      confidence: edge.confidence,
      explanation: edge.explanation,
      manual: edge.manual,
      inferred: edge.inferred,
    });
  }

  return { bySource, byTarget, generatedAt: graph.generatedAt };
}

export function buildAndWriteArtifacts(): void {
  mkdirSync(GENERATED_DIR, { recursive: true });

  const graph = buildContentGraph();
  const relationIndex = buildRelationIndex(graph);
  const taxonomyIndex = buildTaxonomyIndex(graph.nodes);
  const governanceIndex = buildGovernanceIndex(graph.nodes, graph.edges);

  // Integrity check
  const report = runIntegrityChecks(graph.nodes, graph.edges);
  if (!report.passed) {
    console.error('\n[build:graph] INTEGRITY ERRORS:\n');
    for (const err of report.errors) {
      console.error(`  ✗ [${err.code}] ${err.message}`);
    }
  }
  if (report.warnings.length > 0) {
    console.warn('\n[build:graph] WARNINGS:\n');
    for (const warn of report.warnings) {
      console.warn(`  ⚠ [${warn.code}] ${warn.message}`);
    }
  }

  // Write artifacts
  write('content-graph.json', graph);
  write('relation-index.json', relationIndex);
  write('taxonomy-index.json', taxonomyIndex);
  write('governance-index.json', governanceIndex);

  console.log(`\n[build:graph] ${report.summary}`);
  console.log(`[build:graph] Written to src/data/generated/\n`);

  if (!report.passed) {
    process.exit(1);
  }
}

function write(filename: string, data: unknown): void {
  const path = join(GENERATED_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  → ${filename}`);
}
