import type { ContentGraph, GraphNode } from './graph/types';

export type FieldAccent = 'research' | 'digest' | 'products' | 'clauses' | 'field' | 'tools' | 'ops';
export type FieldMode = 'orient' | 'read' | 'trace' | 'query' | 'synthesize' | 'ops';

export interface FieldTypeMeta {
  label: string;
  pluralLabel: string;
  segment: string;
  accent: FieldAccent;
}

export interface FieldPromptLink {
  label: string;
  href: string;
  tone?: 'primary' | 'secondary' | 'ghost';
}

export interface FieldPathway {
  label: string;
  description: string;
  href?: string;
}

export interface FieldPromptSpec {
  mode: FieldMode;
  posture: 'quiet' | 'guiding' | 'explanatory' | 'active' | 'explicit' | 'operational';
  eyebrow: string;
  title: string;
  description: string;
  links: FieldPromptLink[];
  nodeHref: string;
  primaryCorpusHref: string;
}

const FIELD_TYPE_META: Record<string, FieldTypeMeta> = {
  research: {
    label: 'Research',
    pluralLabel: 'Research',
    segment: 'research',
    accent: 'research',
  },
  digest: {
    label: 'Digest',
    pluralLabel: 'Digest',
    segment: 'digest',
    accent: 'digest',
  },
  product: {
    label: 'Product',
    pluralLabel: 'Products',
    segment: 'products',
    accent: 'products',
  },
  products: {
    label: 'Product',
    pluralLabel: 'Products',
    segment: 'products',
    accent: 'products',
  },
  clause: {
    label: 'Clause',
    pluralLabel: 'Clauses',
    segment: 'clauses',
    accent: 'clauses',
  },
  clauses: {
    label: 'Clause',
    pluralLabel: 'Clauses',
    segment: 'clauses',
    accent: 'clauses',
  },
  field: {
    label: 'Field Signal',
    pluralLabel: 'Field Signals',
    segment: 'field',
    accent: 'field',
  },
  'field-signal': {
    label: 'Field Signal',
    pluralLabel: 'Field Signals',
    segment: 'field',
    accent: 'field',
  },
  'field-signals': {
    label: 'Field Signal',
    pluralLabel: 'Field Signals',
    segment: 'field',
    accent: 'field',
  },
  tools: {
    label: 'Instrument',
    pluralLabel: 'Instruments',
    segment: 'tools',
    accent: 'tools',
  },
  ops: {
    label: 'Operations',
    pluralLabel: 'Operations',
    segment: 'internal',
    accent: 'ops',
  },
};

export function getFieldTypeMeta(type?: string): FieldTypeMeta {
  if (!type) {
    return {
      label: 'Node',
      pluralLabel: 'Nodes',
      segment: '',
      accent: 'research',
    };
  }

  return FIELD_TYPE_META[type] ?? {
    label: type.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    pluralLabel: type.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    segment: type,
    accent: 'research',
  };
}

export function getCollectionHref(typeOrCollection: string, slug: string): string {
  const meta = getFieldTypeMeta(typeOrCollection);
  return meta.segment ? `/${meta.segment}/${slug}` : `/${slug}`;
}

export function getNodeHref(node: Pick<GraphNode, 'contentType' | 'slug' | 'sourceCollection'>): string {
  return getCollectionHref(node.sourceCollection || node.contentType, node.slug);
}

export function slugifyFieldTerm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function getTagHref(value: string): string {
  return `/tags/${slugifyFieldTerm(value)}`;
}

export function truncateFieldText(value: string | undefined, limit = 140): string {
  if (!value) return '';
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trimEnd()}...`;
}

export function getLineageLabel(key: string): string {
  const labels: Record<string, string> = {
    'dcfb-core': 'DCFB Core',
    'constitutional-ai': 'Constitutional AI',
    'bainbridge-core': 'Bainbridge',
    'trust-theory': 'Trust Theory',
    'cir-framework': 'CIR Framework',
  };

  return labels[key] ?? key.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function findGraphNode(
  graph: ContentGraph,
  options: {
    id?: string;
    slug?: string;
    sourceCollection?: string;
  },
): GraphNode | undefined {
  const { id, slug, sourceCollection } = options;

  return graph.nodes.find((node) => {
    if (id && node.id === id) return true;
    if (slug && sourceCollection && node.slug === slug && node.sourceCollection === sourceCollection) return true;
    return false;
  });
}

export function countNodeNeighbors(graph: ContentGraph, nodeId?: string): number {
  if (!nodeId) return 0;
  return graph.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
}

export function getNeighborLabel(count: number, fallback = 'Entry point'): string {
  return count > 0 ? `${count} linked nodes` : fallback;
}

export function buildFieldPrompt(
  mode: FieldMode,
  options: {
    title: string;
    nodeHref?: string;
    primaryCorpusHref?: string;
  },
): FieldPromptSpec {
  const nodeHref = options.nodeHref ?? '/corpus';
  const primaryCorpusHref = options.primaryCorpusHref ?? '/corpus';

  const filterCurrentNode = (links: FieldPromptLink[]): FieldPromptLink[] =>
    links.filter((link, index, source) =>
      link.href !== nodeHref &&
      source.findIndex((candidate) => candidate.href === link.href && candidate.label === link.label) === index,
    );

  const defaults: Record<FieldMode, FieldPromptSpec> = {
    orient: {
      mode,
      posture: 'guiding',
      eyebrow: 'Orient',
      title: 'Place this node in the field',
      description:
        'Use the corpus view to see where this document sits, which lineages feed it, and which nearby nodes carry the next move.',
      links: filterCurrentNode([
        { label: 'Open corpus', href: primaryCorpusHref, tone: 'primary' },
        { label: 'Browse taxonomy', href: '/tags', tone: 'secondary' },
        { label: 'Ask the field', href: '/orchestra-operation', tone: 'ghost' },
      ]),
      nodeHref,
      primaryCorpusHref,
    },
    read: {
      mode,
      posture: 'quiet',
      eyebrow: 'Read',
      title: 'Keep the text stable, widen the field when needed',
      description:
        'Stay with the authored argument here. When you need expansion, move into the local neighborhood or ask the corpus to trace the surrounding structure.',
      links: filterCurrentNode([
        { label: 'Trace in corpus', href: primaryCorpusHref, tone: 'primary' },
        { label: 'Ask the field', href: '/orchestra-operation', tone: 'secondary' },
        { label: 'Browse taxonomy', href: '/tags', tone: 'ghost' },
      ]),
      nodeHref,
      primaryCorpusHref,
    },
    trace: {
      mode,
      posture: 'explanatory',
      eyebrow: 'Trace',
      title: 'Follow the relation, not just the route',
      description:
        'Each adjacent node expresses a different kind of continuation: lineage, governance relevance, semantic overlap, or applied translation.',
      links: filterCurrentNode([
        { label: 'Open corpus graph', href: primaryCorpusHref, tone: 'primary' },
        { label: 'Browse taxonomy', href: '/tags', tone: 'secondary' },
        { label: 'Ask the field', href: '/orchestra-operation', tone: 'ghost' },
      ]),
      nodeHref,
      primaryCorpusHref,
    },
    query: {
      mode,
      posture: 'active',
      eyebrow: 'Query',
      title: 'Treat questions as entry points into neighborhoods',
      description:
        'Use the explicit tools when you need structured retrieval or diagnosis, but keep the current node as the anchor for what the question is really about.',
      links: filterCurrentNode([
        { label: 'Ask the Orchestra', href: '/orchestra-operation', tone: 'primary' },
        { label: 'Run CIR', href: '/cir-assessment', tone: 'secondary' },
        { label: 'Run Bainbridge', href: '/bainbridge-diagnostic', tone: 'secondary' },
        { label: 'Open corpus', href: primaryCorpusHref, tone: 'ghost' },
      ]),
      nodeHref,
      primaryCorpusHref,
    },
    synthesize: {
      mode,
      posture: 'explicit',
      eyebrow: 'Synthesize',
      title: 'Move from one node to a governed source set',
      description:
        'Synthesis is strongest when it stays grounded in authored nodes, visible relations, and explicit provenance rather than free-floating generation.',
      links: filterCurrentNode([
        { label: 'Ask the Orchestra', href: '/orchestra-operation', tone: 'primary' },
        { label: 'Open corpus graph', href: primaryCorpusHref, tone: 'secondary' },
        { label: 'Read doctrine', href: '/research', tone: 'ghost' },
      ]),
      nodeHref,
      primaryCorpusHref,
    },
    ops: {
      mode,
      posture: 'operational',
      eyebrow: 'Operate',
      title: 'Separate public field behavior from local control',
      description:
        'Operational surfaces can inspect, launch, or bridge systems, but they should still stay legible as support infrastructure around the corpus.',
      links: filterCurrentNode([
        { label: 'Return to corpus', href: '/corpus', tone: 'secondary' },
        { label: 'Open research', href: '/research', tone: 'ghost' },
        { label: 'Browse taxonomy', href: '/tags', tone: 'ghost' },
      ]),
      nodeHref,
      primaryCorpusHref,
    },
  };

  return defaults[mode];
}

export function getAccentFromType(type?: string): FieldAccent {
  return getFieldTypeMeta(type).accent;
}
